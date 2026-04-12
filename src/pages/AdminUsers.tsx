
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
    const { role, isProgrammer, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<{ count: number, error: string | null }>({ count: 0, error: null });

    useEffect(() => {
        if (authLoading) return;
        
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
    }, [authLoading]);

    if (authLoading) return <div className="loading-spinner-container">Carregando permissões...</div>;

    // Trava de segurança extra: Apenas Gestor ou Programador pode acessar
    if (role !== 'gestor' && role !== 'programador') {
        return <Navigate to="/dashboard" replace />;
    }

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchUsers(), fetchEmpresas()]);
        } catch (err: any) {
            console.error('Erro no carregamento inicial:', err);
            setDebugInfo(prev => ({ ...prev, error: err.message }));
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
                .select('*');

            if (error) {
                console.error('❌ Erro Supabase ao buscar usuários:', error);
                setDebugInfo({ count: 0, error: error.message });
                throw error;
            }

            console.log('📊 Dados brutos recebidos:', data?.length, data);
            
            // Diagnóstico de RLS: Se o retorno for nulo e não for erro, provavelmente é RLS
            if (!data || data.length === 0) {
                setDebugInfo({ count: 0, error: 'LISTA_VAZIA_OU_RLS' });
            } else {
                setDebugInfo({ count: data.length, error: null });
            }

            // Filtra usuários ocultos
            const visibleUsers = (data || []).filter(u => !HIDDEN_EMAILS.includes(u.email));
            setUsers(visibleUsers);
        } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);
            alert(`Erro: ${error.message || 'Não foi possível carregar os usuários.'}`);
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
            alert(`Erro ao atualizar status: ${error.message || 'Esta ação é exclusiva do Programador.'}`);
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

            {/* Painel de Diagnóstico Temporário */}
            <div style={{ 
                background: debugInfo.error ? '#fee2e2' : '#f0f9ff', 
                border: `1px solid ${debugInfo.error ? '#f87171' : '#bae6fd'}`,
                padding: '12px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <strong style={{ color: debugInfo.error ? '#991b1b' : '#0369a1' }}>🔍 Diagnóstico de Dados:</strong>
                    <span style={{ marginLeft: '8px', color: '#475569' }}>
                        {debugInfo.error 
                            ? `Erro do Banco: ${debugInfo.error}` 
                            : `Total bruto no banco: ${debugInfo.count} perfis encontrados.`}
                    </span>
                </div>
                <button 
                    onClick={() => fetchUsers()} 
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                    Atualizar Agora
                </button>
            </div>

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
                        {debugInfo.error === 'LISTA_VAZIA_OU_RLS' ? (
                            <div style={{ marginTop: '16px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', color: '#92400e', fontSize: '0.85rem' }}>
                                <p><strong>Nota:</strong> Se você sabe que existem usuários cadastrados, a lista pode estar oculta por falta de permissão no banco (RLS). Siga os passos SQL para liberar a visão do Gestor.</p>
                            </div>
                        ) : (
                            <p>Novas solicitações aparecerão aqui automaticamente.</p>
                        )}
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
                                                disabled={!isProgrammer}
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
                                                    disabled={!isProgrammer}
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
                                                        className={`btn-action btn-approve ${!isProgrammer ? 'disabled' : ''}`} 
                                                        onClick={() => isProgrammer && handleUpdateStatus(user.id, 'APROVADO')} 
                                                        title={isProgrammer ? "Aprovar Usuário" : "Apenas o programador pode aprovar"}
                                                        disabled={!isProgrammer}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    className={`btn-action btn-delete ${!isProgrammer ? 'disabled' : ''}`}
                                                    onClick={() => isProgrammer && handleDeleteUser(user.id, user.full_name)}
                                                    title={isProgrammer ? "Remover Usuário" : "Apenas o programador pode remover"}
                                                    disabled={!isProgrammer}
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
