
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './AdminUsers.css';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    empresa_id: string | null;
}

interface Empresa {
    id: string;
    nome: string;
}

export const AdminUsers: React.FC = () => {
    const { role, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);

    if (authLoading) return <div className="loading-spinner-container">Carregando permissões...</div>;

    // Trava de segurança extra: Apenas Gestor pode acessar
    if (role !== 'gestor') {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        fetchInitialData();

        // 🟢 Assinatura em Tempo Real para Novos Cadastros/Alterações
        const channel = supabase.channel('profiles_admin_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'profiles' 
            }, () => {
                console.log('🔄 Mudança detectada nos perfis, atualizando lista...');
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchUsers(), fetchEmpresas()]);
        } catch (err) {
            console.error('Erro no carregamento inicial:', err);
        } finally {
            setLoading(false);
        }
    };

    const HIDDEN_EMAILS = ['matheus.stanley12@gmail.com'];

    const fetchEmpresas = async () => {
        try {
            const { data, error } = await supabase
                .from('empresas')
                .select('id, nome')
                .eq('ativo', true)
                .order('nome');

            if (error) throw error;
            setEmpresas(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar empresas:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filtra usuários ocultos
            const visibleUsers = (data || []).filter(u => !HIDDEN_EMAILS.includes(u.email));
            setUsers(visibleUsers);
        } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);
            alert(`Não foi possível carregar os usuários: ${error.message || 'Erro desconhecido'}`);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        // Se estiver aprovando um cliente, deve ter empresa_id selecionado
        if (newStatus === 'APROVADO' && user.role === 'cliente' && !user.empresa_id) {
            alert('Atenção: Para aprovar um CLIENTE, você deve primeiro selecionar a EMPRESA na coluna correspondente.');
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

            if (newStatus === 'APROVADO') {
                const empresaNome = empresas.find(e => e.id === user.empresa_id)?.nome;
                const msg = user.role === 'cliente'
                    ? `Cliente ${user.full_name} aprovado e vinculado à ${empresaNome || 'empresa'}!`
                    : `Usuário ${user.full_name || user.email} aprovado com sucesso!`;
                alert(msg);
            }
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error);
            alert(`Erro ao atualizar status: ${error.message || 'Verifique as permissões de administrador (RLS).'}`);
        }
    };

    const handleUpdateRole = async (id: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole.toLowerCase() })
                .eq('id', id);

            if (error) throw error;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (error: any) {
            console.error('Erro ao atualizar função:', error);
            alert(`Erro ao atualizar função: ${error.message}`);
        }
    };

    const handleUpdateEmpresa = async (id: string, empresaId: string | null) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ empresa_id: empresaId })
                .eq('id', id);

            if (error) throw error;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, empresa_id: empresaId } : u));
        } catch (error: any) {
            console.error('Erro ao atualizar empresa:', error);
            alert(`Erro ao atualizar empresa: ${error.message}`);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`AVISO: Tem certeza que deseja excluir o usuário ${name || 'este usuário'}?`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== id));
            alert('Usuário excluído com sucesso!');
        } catch (error: any) {
            console.error('Erro ao excluir usuário:', error);
            alert(`Erro ao excluir usuário: ${error.message || 'Esta ação pode ser restrita por políticas de segurança.'}`);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: users.length,
        pendentes: users.filter(u => u.status === 'PENDENTE' || !u.status).length,
        clientes: users.filter(u => u.role === 'cliente').length
    };

    return (
        <div className="admin-users-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Gestão de Usuários</h1>
                    <p className="page-subtitle">Gerencie permissões, aprove novos acessos e vincule clientes.</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total de Usuários</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Pendentes de Aprovação</span>
                    <span className="stat-value" style={{ color: stats.pendentes > 0 ? '#dd6b20' : '#1e293b' }}>
                        {stats.pendentes}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Clientes Vinculados</span>
                    <span className="stat-value">{stats.clientes}</span>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Carregando base de usuários...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="users-list-card">
                    <div className="empty-state">
                        <h3>Nenhum usuário encontrado</h3>
                        <p>Novas solicitações aparecerão aqui automaticamente.</p>
                    </div>
                </div>
            ) : (
                <div className="users-list-card">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Nível de Acesso</th>
                                <th>Empresa Vinculada</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const initials = (user.full_name || user.email || 'U').substring(0, 2).toUpperCase();
                                const empresaAtual = empresas.find(e => e.id === user.empresa_id);
                                
                                return (
                                    <tr key={user.id}>
                                        <td data-label="Usuário">
                                            <div className="user-id-cell">
                                                <div className="user-avatar">{initials}</div>
                                                <div className="user-name-wrapper">
                                                    <span className="user-full-name">{user.full_name || 'Sem nome'}</span>
                                                    <span className="user-email-small">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Role">
                                            <select
                                                value={user.role || 'perito'}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="perito">Perito</option>
                                                <option value="pcp">PCP</option>
                                                <option value="montagem">Montagem</option>
                                                <option value="qualidade">Qualidade</option>
                                                <option value="comercial">Comercial</option>
                                                <option value="gestor">Gestor</option>
                                                <option value="cliente">Cliente</option>
                                            </select>
                                        </td>
                                        <td data-label="Empresa">
                                            {user.role === 'cliente' ? (
                                                <select
                                                    value={user.empresa_id || ''}
                                                    onChange={(e) => handleUpdateEmpresa(user.id, e.target.value || null)}
                                                    className="role-select"
                                                    style={{ width: '100%', maxWidth: '200px' }}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {empresas.map(e => (
                                                        <option key={e.id} value={e.id}>{e.nome}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span style={{ color: empresaAtual ? '#1e293b' : '#94a3b8', fontSize: '0.85rem' }}>
                                                    {empresaAtual ? empresaAtual.nome : 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${user.status?.toLowerCase() || 'pendente'}`}>
                                                {user.status || 'PENDENTE'}
                                            </span>
                                        </td>
                                        <td data-label="Ações">
                                            <div className="action-buttons">
                                                {user.status !== 'APROVADO' && (
                                                    <button 
                                                        className="btn-action btn-approve" 
                                                        onClick={() => handleUpdateStatus(user.id, 'APROVADO')} 
                                                        title="Aprovar Usuário"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                    title="Remover Usuário"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
