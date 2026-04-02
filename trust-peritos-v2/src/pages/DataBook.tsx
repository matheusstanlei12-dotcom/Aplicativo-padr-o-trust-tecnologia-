import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
  Video,
  X,
  FolderOpen,
  Calendar,
  Hash,
  User as UserIcon,
  Eye,
  Camera,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

interface DataBookFolder {
  id: string;
  name: string;
  cliente?: string;
  os_interna?: string;
  os_externa?: string;
  data_entrega?: string;
  pedido_compra?: string;
  nota_fiscal?: string;
  responsavel?: string;
  empresa_id?: string;
  created_at: string;
  is_peritagem?: boolean;
  peritagem_id?: string;
}

interface DataBookItem {
  id: string;
  file_data: string;
  description: string;
  file_type: string;
  created_at: string;
  processo?: string;
}

const PROCESSES = ['Peritagem', 'Montagem', 'Pintura', 'Liberação', 'Info. Complementares'];

const DataBook: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [folders, setFolders] = useState<DataBookFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DataBookFolder | null>(null);
  const [items, setItems] = useState<DataBookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('Peritagem');
  const [selectedItem, setSelectedItem] = useState<DataBookItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '',
    os_interna: '',
    os_externa: '',
    data_entrega: '',
    pedido_compra: '',
    nota_fiscal: '',
    responsavel: '',
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (currentFolder) {
      fetchItems(currentFolder.id);
    } else {
      setItems([]);
    }
  }, [currentFolder]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('databook_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching databooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (folderId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('databook_items')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !formData.cliente) return;

    try {
      setLoading(true);
      const folderName = `Data Book - ${formData.cliente} - ${formData.os_interna || 'S/OS'}`;

      const { data, error } = await supabase
        .from('databook_folders')
        .insert([{
          name: folderName,
          cliente: formData.cliente,
          os_interna: formData.os_interna,
          os_externa: formData.os_externa,
          data_entrega: formData.data_entrega || null,
          pedido_compra: formData.pedido_compra,
          nota_fiscal: formData.nota_fiscal,
          responsavel: formData.responsavel,
        }])
        .select()
        .single();

      if (error) throw error;

      setFolders([data, ...folders]);
      setFormData({ cliente: '', os_interna: '', os_externa: '', data_entrega: '', pedido_compra: '', nota_fiscal: '', responsavel: '' });
      setIsCreateModalOpen(false);
      setCurrentFolder(data);
    } catch (error) {
      console.error('Error creating databook:', error);
      alert('Erro ao criar Data Book.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFolder || !e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const base64 = await fileToBase64(file);
        const isVideo = file.type.includes('video');
        const fileType = isVideo ? 'video' : (file.type.includes('image') ? 'image' : 'other');

        const { error } = await supabase
          .from('databook_items')
          .insert([{
            folder_id: currentFolder.id,
            file_data: base64,
            description: file.name,
            file_type: fileType,
            processo: selectedProcess === 'Info. Complementares' ? 'Informações Complementares' : selectedProcess
          }]);

        if (error) throw error;
      }
      fetchItems(currentFolder.id);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Erro ao enviar arquivos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este Data Book e todos os seus arquivos?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('databook_folders').delete().eq('id', folderId);
      if (error) throw error;
      setFolders(folders.filter(f => f.id !== folderId));
      if (currentFolder?.id === folderId) setCurrentFolder(null);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este arquivo?')) return;

    try {
      const { error } = await supabase.from('databook_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(items.filter(i => i.id !== itemId));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredFolders = folders.filter(f =>
    f.os_interna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const processItems = items.filter(item => {
    const proc = selectedProcess === 'Info. Complementares' ? 'Informações Complementares' : selectedProcess;
    return item.processo === proc || (!item.processo && proc === 'Peritagem');
  });

  const canManage = role === 'gestor' || role === 'pcp' || role === 'perito';

  // ── FOLDER LIST VIEW ──
  if (!currentFolder) {
    return (
      <div className="prime-container" style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <header className="prime-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>DATABOOK</h1>
              <p style={{ fontSize: '8px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Documentação Técnica</p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'var(--prime-yellow)',
                color: 'var(--prime-blue)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              <Plus size={20} />
            </button>
          )}
        </header>

        <main style={{ padding: '20px 16px' }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            marginBottom: '20px',
          }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--prime-text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por O.S ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 40px',
                borderRadius: '14px',
                border: '1px solid var(--prime-border)',
                background: 'white',
                fontSize: '14px',
                color: 'var(--prime-text)',
                outline: 'none',
                fontWeight: 500,
              }}
            />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--prime-blue) 0%, #2d3f7a 100%)',
              borderRadius: '14px',
              padding: '16px',
              color: 'white',
            }}>
              <p style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{folders.length}</p>
              <p style={{ fontSize: '9px', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Databooks</p>
            </div>
            <div style={{
              flex: 1,
              background: 'white',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid var(--prime-border)',
            }}>
              <p style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'var(--prime-blue)' }}>{filteredFolders.length}</p>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--prime-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Resultados</p>
            </div>
          </div>

          {/* Folder List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading && filteredFolders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '40px', height: '40px', border: '3px solid var(--prime-border)',
                  borderTopColor: 'var(--prime-yellow)', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', margin: '0 auto 12px',
                }} />
                <p style={{ fontSize: '12px', color: 'var(--prime-text-muted)', fontWeight: 600 }}>Carregando...</p>
              </div>
            )}

            {!loading && filteredFolders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FolderOpen size={48} color="var(--prime-border)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: 'var(--prime-text-muted)', fontWeight: 600 }}>Nenhum databook encontrado.</p>
              </div>
            )}

            {filteredFolders.map((folder, index) => (
              <motion.button
                key={folder.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setCurrentFolder(folder)}
                className="prime-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: '1px solid var(--prime-border)',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '16px',
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: 'var(--prime-yellow)',
                }} />
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--prime-bg)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--prime-border)',
                  flexShrink: 0,
                }}>
                  <Book size={22} color="var(--prime-blue)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 900, margin: 0, color: 'var(--prime-blue)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    {folder.os_interna || 'S/OS'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--prime-text-muted)', margin: '2px 0 0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {folder.cliente}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--prime-text-muted)', margin: '2px 0 0', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {folder.created_at ? new Date(folder.created_at).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canManage && (
                    <button
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', opacity: 0.4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <ChevronRight size={16} color="var(--prime-border)" />
                </div>
              </motion.button>
            ))}
          </div>
        </main>

        {/* Create Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              }}
              onClick={() => setIsCreateModalOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '90vh',
                  borderRadius: '24px 24px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Modal Header */}
                <div style={{
                  padding: '20px 24px',
                  background: 'var(--prime-blue)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '10px' }}>
                      <Book size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0 }}>NOVO DATABOOK</h3>
                      <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Preencha os dados do documento</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                    {[
                      { label: 'Cliente *', key: 'cliente', placeholder: 'Nome do cliente', required: true, icon: UserIcon },
                      { label: 'OS Interna', key: 'os_interna', placeholder: 'Ex: OS-1234', icon: Hash },
                      { label: 'OS Externa', key: 'os_externa', placeholder: 'Ex: OS-EXT-5678', icon: Hash },
                      { label: 'Pedido de Compra', key: 'pedido_compra', placeholder: 'Número do pedido', icon: FileText },
                      { label: 'Nota Fiscal', key: 'nota_fiscal', placeholder: 'Número da NF', icon: FileText },
                      { label: 'Responsável', key: 'responsavel', placeholder: 'Nome do responsável', icon: UserIcon },
                    ].map(field => (
                      <div key={field.key} style={{ marginBottom: '14px' }}>
                        <label style={{
                          display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--prime-text-muted)',
                          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
                        }}>
                          {field.label}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <field.icon size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--prime-text-muted)', opacity: 0.5 }} />
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={(formData as any)[field.key]}
                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                            required={field.required}
                            style={{
                              width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px',
                              border: '1px solid var(--prime-border)', background: 'var(--prime-bg)',
                              fontSize: '14px', color: 'var(--prime-text)', outline: 'none', fontWeight: 500,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{
                        display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--prime-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
                      }}>
                        Data de Entrega
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--prime-text-muted)', opacity: 0.5 }} />
                        <input
                          type="date"
                          value={formData.data_entrega}
                          onChange={e => setFormData({ ...formData, data_entrega: e.target.value })}
                          style={{
                            width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px',
                            border: '1px solid var(--prime-border)', background: 'var(--prime-bg)',
                            fontSize: '14px', color: 'var(--prime-text)', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div style={{ padding: '16px 24px', borderTop: '1px solid var(--prime-border)', background: 'var(--prime-bg)' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="prime-btn-primary"
                      style={{ width: '100%', border: 'none', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px' }}
                    >
                      {loading ? 'SALVANDO...' : 'CRIAR DATABOOK'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    );
  }

  // ── FOLDER DETAIL VIEW ──
  return (
    <div className="prime-container" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <header className="prime-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCurrentFolder(null)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{currentFolder.os_interna || 'DATABOOK'}</h1>
            <p style={{ fontSize: '8px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>{currentFolder.cliente}</p>
          </div>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleUploadToFolder}
              style={{ display: 'none' }}
              id="upload-input"
            />
            <button
              onClick={() => document.getElementById('upload-input')?.click()}
              disabled={uploading}
              style={{
                background: 'var(--prime-yellow)',
                color: 'var(--prime-blue)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              {uploading ? <div style={{ width: '16px', height: '16px', border: '2px solid var(--prime-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Camera size={18} />}
            </button>
          </div>
        )}
      </header>

      <main style={{ padding: '16px' }}>
        {/* Folder Info Card */}
        <div className="prime-card" style={{ marginBottom: '16px', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'O.S Interna', value: currentFolder.os_interna },
              { label: 'O.S Externa', value: currentFolder.os_externa },
              { label: 'Pedido', value: currentFolder.pedido_compra },
              { label: 'NF', value: currentFolder.nota_fiscal },
              { label: 'Responsável', value: currentFolder.responsavel },
              { label: 'Registro', value: currentFolder.created_at ? new Date(currentFolder.created_at).toLocaleDateString('pt-BR') : null },
            ].filter(d => d.value).map(d => (
              <div key={d.label}>
                <p style={{ fontSize: '9px', fontWeight: 800, color: 'var(--prime-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>{d.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--prime-text)', margin: 0 }}>{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '16px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {PROCESSES.map(proc => (
            <button
              key={proc}
              onClick={() => setSelectedProcess(proc)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                background: selectedProcess === proc ? 'var(--prime-blue)' : 'white',
                color: selectedProcess === proc ? 'white' : 'var(--prime-text-muted)',
                border: selectedProcess === proc ? 'none' : '1px solid var(--prime-border)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                flexShrink: 0,
              }}
            >
              {proc}
            </button>
          ))}
        </div>

        {/* Items Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '3px', height: '16px', background: 'var(--prime-yellow)', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--prime-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedProcess}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--prime-text-muted)', background: 'var(--prime-bg)', padding: '2px 8px', borderRadius: '6px' }}>
            {processItems.length} {processItems.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {/* Items Grid */}
        {processItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <ImageIcon size={40} color="var(--prime-border)" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '13px', color: 'var(--prime-text-muted)', fontWeight: 600 }}>Nenhum arquivo em {selectedProcess}.</p>
            {canManage && (
              <button
                onClick={() => document.getElementById('upload-input')?.click()}
                style={{
                  marginTop: '12px',
                  background: 'var(--prime-bg)',
                  border: '2px dashed var(--prime-border)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--prime-blue)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Upload size={16} /> ANEXAR ARQUIVOS
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {processItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid var(--prime-border)',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {item.file_type === 'image' || (item.file_type === 'other' && item.file_data?.startsWith('data:image')) ? (
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', background: 'var(--prime-bg)' }}>
                    <img
                      src={item.file_data}
                      alt={item.description}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--prime-bg)',
                  }}>
                    {item.file_type === 'video' ? <Video size={32} color="var(--prime-blue-light)" /> :
                      item.file_type === 'pdf' ? <FileText size={32} color="#ef4444" /> :
                        <Book size={32} color="var(--prime-blue-light)" />}
                  </div>
                )}
                <div style={{ padding: '8px 10px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: 700, color: 'var(--prime-text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0,
                  }}>
                    {item.description}
                  </p>
                </div>

                {/* Quick actions overlay */}
                <div style={{
                  position: 'absolute', top: '6px', right: '6px',
                  display: 'flex', gap: '4px',
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                    style={{
                      background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Eye size={12} color="var(--prime-blue)" />
                  </button>
                  {canManage && (
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      style={{
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px',
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Trash2 size={12} color="#ef4444" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Item Viewer */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 9999,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                width: '44px', height: '44px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10,
              }}
            >
              <X size={20} />
            </button>

            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {selectedItem.file_type === 'pdf' ? (
                <iframe src={selectedItem.file_data} title={selectedItem.description} style={{ width: '90vw', height: '75vh', border: 'none', borderRadius: '12px' }} />
              ) : selectedItem.file_type === 'video' ? (
                <video src={selectedItem.file_data} controls style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: '12px' }} />
              ) : (
                <img src={selectedItem.file_data} alt={selectedItem.description} style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }} />
              )}

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <a
                  href={selectedItem.file_data}
                  download={selectedItem.description}
                  style={{
                    background: 'var(--prime-yellow)',
                    color: 'var(--prime-blue)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <Download size={16} /> Baixar
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />

      {/* Spin animation keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DataBook;
