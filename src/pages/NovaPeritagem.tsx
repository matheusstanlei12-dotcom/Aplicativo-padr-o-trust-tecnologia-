import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Camera, Image as ImageIcon, X, CheckCircle, AlertCircle, Save, Info } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { USIMINAS_ITEMS } from '../constants/usiminasItems';
import { STANDARD_ITEMS } from '../constants/standardItems';
import { REDUTOR_ITEMS } from '../constants/redutorItems';
import { MOTOR_ITEMS } from '../constants/motorItems';
import { compressImage } from '../lib/imageUtils';
import { DIMENSIONAL_ANOMALIES_SERVICES } from '../constants/dimensionalItems';
import { syncPhotosToGallery } from '../lib/photoSync';
import type { SyncPhoto } from '../lib/photoSync';
import { ImageEditor } from '../components/ImageEditor';
import { QUICK_TAGS } from '../constants/peritagemStandard';
import './NovaPeritagem.css';

type StatusColor = 'vermelho' | 'amarelo' | 'verde' | 'azul' | 'cinza';

interface ChecklistItem {
    id: string;
    text: string;
    status: StatusColor;
    conformidade: 'conforme' | 'não conforme' | 'n/a' | null;
    anomalia: string;
    solucao: string;
    fotos: string[];
    // Suporte a múltiplas anomalias/soluções
    anomaliasSet?: { value: string; isCustom: boolean }[];
    solucoesSet?: { value: string; isCustom: boolean }[];

    dimensoes?: string;
    qtd?: string;
    tipo?: 'componente' | 'vedação';
    unidade?: string;
    observacao?: string;
    diametro_encontrado?: string;
    diametro_ideal?: string;
    material_faltante?: string;
    // Novos campos dimensionais padronizados
    diametro_externo_encontrado?: string;
    diametro_externo_especificado?: string;
    desvio_externo?: string;
    diametro_interno_encontrado?: string;
    diametro_interno_especificado?: string;
    desvio_interno?: string;
    comprimento_encontrado?: string;
    comprimento_especificado?: string;
    desvio_comprimento?: string;
    isCustom?: boolean;
    isManualInput?: boolean;
    isCustomAnomaly?: boolean;
    isCustomSolucao?: boolean;
    criticidade?: 'baixa' | 'média' | 'alta' | 'crítica';
    parecer_item?: string;
    nao_aplicavel?: boolean;
}



export const NovaPeritagem: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const fromWaitlist = searchParams.get('from_waitlist') === 'true';
    const idWaitlist = searchParams.get('id_waitlist');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Seleção, 1: Formulário
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const camInputRef = React.useRef<HTMLInputElement>(null);
    const galleryInputRef = React.useRef<HTMLInputElement>(null);

    // Pergunta Inicial
    const [cylinderType, setCylinderType] = useState<'Cilindros' | 'Redutores' | 'Motores' | 'CilindrosHidraulicos' | null>(null);

    // Campos Fixos
    const [fixedData, setFixedData] = useState({
        tag: '',
        local_equipamento: '',
        data_inspecao: new Date().toISOString().split('T')[0],
        responsavel_tecnico: '',
        cliente: '',
        numero_os: '',
        ni: '',
        pedido: '',
        ordem: '',
        nota_fiscal: '',
        // Novos campos conforme imagem do formulário
        desenho_conjunto: '',
        tipo_modelo: '',
        fabricante: '',
        lubrificante: '',
        volume: '',
        acoplamento_polia: '',
        sistema_lubrificacao: '',

        outros_especificar: '',
        observacoes_gerais: '',
        area: '',
        linha: '',
        os_interna: '' // Novo campo interno
    });

    const [motivoRejeicao, setMotivoRejeicao] = useState<string | null>(null);





    // Dimensões
    const [dimensions, setDimensions] = useState({
        diametroInterno: '',
        diametroHaste: '',
        curso: '',
        comprimentoTotal: '',
        diametroExterno: '',
        comprimentoHaste: '',
        montagem: '',
        pressaoNominal: '',
        fabricanteModelo: ''
    });
    const [fotoFrontal, setFotoFrontal] = useState<string>('');

    const frontalCameraRef = React.useRef<HTMLInputElement>(null);
    const frontalGalleryRef = React.useRef<HTMLInputElement>(null);

    // Checklist
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [vedacoes, setVedacoes] = useState<ChecklistItem[]>([]);

    // Estados para o Editor de Imagem
    const [editorOpen, setEditorOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState('');
    const [editorTarget, setEditorTarget] = useState<'item' | 'frontal' | null>(null);

    useEffect(() => {
        if (!editId) {
            const osUrl = searchParams.get('os_interna');
            const clienteUrl = searchParams.get('cliente');
            const obsUrl = searchParams.get('obs');

            if (osUrl || clienteUrl) {
                setFixedData(prev => ({
                    ...prev,
                    os_interna: osUrl || prev.os_interna,
                    cliente: clienteUrl || prev.cliente,
                    observacoes_gerais: obsUrl || prev.observacoes_gerais
                }));
            }

            if (idWaitlist) {
                loadFromWaitlist(idWaitlist);
            }
        }
    }, [searchParams, editId, idWaitlist]);

    const loadFromWaitlist = async (id: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('aguardando_peritagem')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFixedData({
                    tag: data.tag || '',
                    local_equipamento: data.local_equipamento || '',
                    data_inspecao: new Date().toISOString().split('T')[0],
                    responsavel_tecnico: data.responsavel_tecnico || '',
                    cliente: data.cliente || '',
                    numero_os: data.os_interna || '',
                    ni: data.ni || '',
                    pedido: data.numero_pedido || '',
                    ordem: data.numero_ordem || '',
                    nota_fiscal: data.nf || '',
                    desenho_conjunto: data.desenho_conjunto || '',
                    tipo_modelo: data.tipo_modelo || '',
                    fabricante: data.fabricante || '',
                    lubrificante: data.lubrificante || '',
                    volume: data.volume || '',
                    acoplamento_polia: data.acoplamento_polia || '',
                    sistema_lubrificacao: data.sistema_lubrificacao || '',
                    outros_especificar: data.outros_especificar || '',
                    observacoes_gerais: data.descricao_equipamento || '',
                    area: data.area || '',
                    linha: data.linha || '',
                    os_interna: data.os_interna || ''
                });
                
                // Tenta inferir o tipo pela descrição
                if (data.descricao_equipamento?.toLowerCase().includes('redutor')) {
                    setCylinderType('Redutores');
                } else if (data.descricao_equipamento?.toLowerCase().includes('motor')) {
                    setCylinderType('Motores');
                } else {
                    setCylinderType('Cilindros');
                }
                setStep(1);
            }
        } catch (err) {
            console.error('Erro ao carregar dados da lista de espera:', err);
            alert('Não foi possível carregar os dados pré-preenchidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (editId) {
            loadPeritagem(editId);
        }
    }, [editId]);

    const loadPeritagem = async (id: string) => {
        setLoading(true);
        try {
            // 1. Fetch Peritagem Data
            const { data: pData, error: pError } = await supabase
                .from('peritagens')
                .select('*')
                .eq('id', id)
                .single();

            if (pError) throw pError;

            if (pData.motivo_rejeicao) {
                setMotivoRejeicao(pData.motivo_rejeicao);
            }

            // 2. Fetch Analyses
            const { data: aData, error: aError } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', id);

            if (aError) throw aError;

            // Populate States
            setCylinderType(pData.tipo_cilindro || 'Cilindros');
            setStep(1);
            setCylinderType(pData.tipo_cilindro || 'Cilindros');
            setFotoFrontal(pData.foto_frontal || '');

            // Validação de Segurança para Perito
            if (role === 'perito' && pData.status === 'APROVADO') {
                alert('Esta peritagem já foi aprovada pelo PCP e não pode ser editada.');
                // Redireciona para visualização ou lista
                navigate('/peritagens');
                return;
            }

            setFixedData({
                tag: pData.tag || '',
                local_equipamento: pData.local_equipamento || '',
                data_inspecao: pData.created_at ? pData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                responsavel_tecnico: pData.responsavel_tecnico || '',
                cliente: pData.cliente || '',
                numero_os: pData.os || '',
                ni: pData.ni || '',
                pedido: pData.numero_pedido || '',
                ordem: pData.ordem || '',
                nota_fiscal: pData.nota_fiscal || '',
                desenho_conjunto: pData.desenho_conjunto || '',
                tipo_modelo: pData.tipo_modelo || '',
                fabricante: pData.fabricante || '',
                lubrificante: pData.lubrificante || '',
                volume: pData.volume || '',
                acoplamento_polia: pData.acoplamento_polia || '',
                sistema_lubrificacao: pData.sistema_lubrificacao || '',
                outros_especificar: pData.outros_especificar || '',
                observacoes_gerais: pData.observacoes_gerais || '',
                area: pData.area || '',
                linha: pData.linha || '',
                os_interna: pData.os_interna || ''
            });



            setDimensions({
                diametroInterno: pData.camisa_int || '',
                diametroHaste: pData.haste_diam || '',
                curso: pData.curso || '',
                comprimentoTotal: pData.camisa_comp || '',
                diametroExterno: pData.camisa_ext || '',
                comprimentoHaste: pData.haste_comp || '',
                montagem: pData.montagem || '',
                pressaoNominal: pData.pressao_nominal || '',
                fabricanteModelo: pData.fabricante_modelo || ''
            });

            // Map Analyses to Checklist/Vedacoes
            // First, re-initialize list based on client to preserve order and structure
            let list = [];
            if (pData.cliente === 'USIMINAS') {
                list = USIMINAS_ITEMS;
            } else if (pData.tipo_cilindro === 'Redutores') {
                list = REDUTOR_ITEMS;
            } else if (pData.tipo_cilindro === 'Motores' || pData.tipo_cilindro === 'CilindrosHidraulicos') {
                list = MOTOR_ITEMS;
            } else {
                list = STANDARD_ITEMS;
            }

            const mappedChecklist = list.map(text => {
                // Try to find existing analysis
                const existing = aData?.find((a: any) => a.componente === text && a.tipo !== 'vedação');
                if (existing) {
                    return {
                        id: crypto.randomUUID(),
                        text,
                        status: 'azul' as StatusColor,
                        conformidade: existing.conformidade,
                        anomalia: existing.anomalias || '',
                        anomaliasSet: existing.anomalias
                            ? existing.anomalias.split('\n').map((t: string) => ({ value: t, isCustom: false }))
                            : [{ value: '', isCustom: false }],
                        solucao: existing.solucao || '',
                        solucoesSet: existing.solucao
                            ? existing.solucao.split('\n').map((t: string) => ({ value: t, isCustom: false }))
                            : [{ value: '', isCustom: false }],
                        fotos: existing.fotos || [],
                        dimensoes: existing.dimensoes || '',
                        qtd: existing.qtd || '',
                        tipo: 'componente' as 'componente',
                        diametro_encontrado: existing.diametro_encontrado || '',
                        diametro_ideal: existing.diametro_ideal || '',
                        material_faltante: existing.material_faltante || '',
                        diametro_externo_encontrado: existing.diametro_externo_encontrado,
                        diametro_externo_especificado: existing.diametro_externo_especificado,
                        desvio_externo: existing.desvio_externo,
                        diametro_interno_encontrado: existing.diametro_interno_encontrado,
                        diametro_interno_especificado: existing.diametro_interno_especificado,
                        desvio_interno: existing.desvio_interno,
                        comprimento_encontrado: existing.comprimento_encontrado,
                        comprimento_especificado: existing.comprimento_especificado,
                        desvio_comprimento: existing.desvio_comprimento
                    };
                }
                return {
                    id: crypto.randomUUID(),
                    text,
                    status: 'vermelho' as StatusColor,
                    conformidade: null as any,
                    anomalia: '',
                    anomaliasSet: [{ value: '', isCustom: false }],
                    solucao: '',
                    solucoesSet: [{ value: '', isCustom: false }],
                    fotos: [],
                    dimensoes: '',
                    qtd: '',
                    tipo: 'componente' as 'componente'
                };
            });
            setChecklistItems(mappedChecklist);

            // Vedacoes
            const vedacoesData = aData?.filter((a: any) => a.tipo === 'vedação') || [];
            if (vedacoesData.length > 0) {
                setVedacoes(vedacoesData.map((v: any) => ({
                    id: crypto.randomUUID(),
                    text: v.componente || '',
                    qtd: v.qtd || '',
                    unidade: v.dimensoes || 'PC', // Reusing dimensions field for Unit/Dim
                    status: 'azul' as StatusColor,
                    conformidade: 'não conforme' as 'não conforme',
                    anomalia: '',
                    solucao: '',
                    fotos: [],
                    observacao: v.anomalias || '', // Mapping anomalias to observacao for vedacao
                    tipo: 'vedação' as 'vedação'
                })));
            } else if (pData.cliente !== 'USIMINAS') {
                const emptyVedacoes = Array.from({ length: 10 }).map(() => ({
                    id: crypto.randomUUID(),
                    text: '',
                    qtd: '',
                    unidade: 'PC',
                    status: 'azul' as StatusColor,
                    conformidade: 'não conforme' as 'não conforme',
                    anomalia: '',
                    solucao: '',
                    fotos: [],
                    observacao: '',
                    tipo: 'vedação' as 'vedação'
                }));
                // Only set if we didn't find any (which is weird for edit, but ok)
                setVedacoes(emptyVedacoes);
            } else {
                setVedacoes([]);
            }

        } catch (err) {
            console.error(err);
            alert('Erro ao carregar peritagem.');
            navigate('/peritagens');
        } finally {
            setLoading(false);
        }
    }


    // Quando mudar o tipo de cilindro, inicializa o checklist APENAS SE NÃO ESTIVER EDITANDO
    useEffect(() => {
        if (cylinderType && !editId) {
            let list = [];
            if (fixedData.cliente === 'USIMINAS') {
                list = USIMINAS_ITEMS;
            } else if (cylinderType === 'Redutores') {
                list = REDUTOR_ITEMS;
            } else if (cylinderType === 'Motores' || cylinderType === 'CilindrosHidraulicos') {
                list = MOTOR_ITEMS;
            } else {
                list = STANDARD_ITEMS;
            }

            setChecklistItems(list.map((text) => {
                return {
                    id: crypto.randomUUID(),
                    text,
                    status: 'vermelho',
                    conformidade: null,
                    anomalia: '',
                    anomaliasSet: [{ value: '', isCustom: false }],
                    solucao: '',
                    solucoesSet: [{ value: '', isCustom: false }],
                    fotos: [],
                    dimensoes: '',
                    qtd: '',
                    tipo: 'componente'
                };
            }));

            // Inicializa 10 linhas de vedações para padrão e Usiminas
            const emptyVedacoes = Array.from({ length: 10 }).map(() => ({
                id: crypto.randomUUID(),
                text: '',
                qtd: '',
                unidade: 'PC',
                status: 'azul' as StatusColor,
                conformidade: 'não conforme' as 'não conforme',
                anomalia: '',
                solucao: '',
                fotos: [],
                observacao: '',
                tipo: 'vedação' as 'vedação'
            }));
            setVedacoes(emptyVedacoes);
        }
    }, [cylinderType, fixedData.cliente, editId]);

    // Lógica de Autoload por TAG
    useEffect(() => {
        const fetchLastTagData = async () => {
            if (fixedData.tag.length >= 3) {
                const { data, error } = await supabase
                    .from('peritagens')
                    .select('*')
                    .eq('tag', fixedData.tag)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && !error) {
                    setDimensions({
                        diametroInterno: data.camisa_int || '',
                        diametroHaste: data.haste_diam || '',
                        curso: data.curso || '',
                        comprimentoTotal: data.camisa_comp || '',
                        diametroExterno: data.camisa_ext || '',
                        comprimentoHaste: data.haste_comp || '',
                        montagem: data.montagem || '',
                        pressaoNominal: data.pressao_nominal || '',
                        fabricanteModelo: data.fabricante_modelo || ''
                    });
                    setFixedData(prev => ({ ...prev, local_equipamento: data.local_equipamento || prev.local_equipamento, cliente: data.cliente || prev.cliente }));
                } else if (fixedData.tag.length > 0) {
                }
            }
        };
        fetchLastTagData();
    }, [fixedData.tag]);

    const handleChecklistItemClick = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Se ainda for vermelho, vira amarelo (clicou mas não respondeu)
                const newStatus = item.status === 'vermelho' ? 'amarelo' : item.status;
                return { ...item, status: newStatus };
            }
            return item;
        }));
    };

    const handleResponse = (itemId: string, response: 'conforme' | 'não conforme' | 'n/a') => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newStatus = response === 'conforme' ? 'verde' : response === 'n/a' ? 'cinza' : 'vermelho';
                return { 
                    ...item, 
                    conformidade: response === 'n/a' ? null : response as any, 
                    status: newStatus,
                    nao_aplicavel: response === 'n/a'
                };
            }
            return item;
        }));
    };

    const handleResetItem = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, conformidade: null, status: 'vermelho' };
            }
            return item;
        }));
    };

    const updateItemDetails = (itemId: string, field: 'anomalia' | 'solucao' | 'fotos' | 'text' | 'dimensoes' | 'qtd' | 'diametro_encontrado' | 'diametro_ideal' | 'material_faltante' | 'diametro_externo_encontrado' | 'diametro_externo_especificado' | 'desvio_externo' | 'diametro_interno_encontrado' | 'diametro_interno_especificado' | 'desvio_interno' | 'comprimento_encontrado' | 'comprimento_especificado' | 'desvio_comprimento' | 'isCustomAnomaly' | 'isCustomSolucao' | 'isManualInput' | 'criticidade' | 'parecer_item' | 'nao_aplicavel', value: any) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Se estiver alterando o texto de um componente novo, vira amarelo
                const newStatus = field === 'text' && item.status === 'vermelho' ? 'amarelo' : item.status;

                // Resetar Anomalia, Solução e Flags se o Componente mudar
                if (field === 'text') {
                    return {
                        ...item,
                        [field]: value,
                        status: newStatus,
                        anomalia: '',
                        solucao: '',
                        isCustomAnomaly: false,
                        isCustomSolucao: false
                    };
                }

                // Resetar Solução e Flag de Solução se a Anomalia mudar
                if (field === 'anomalia') {
                    return {
                        ...item,
                        [field]: value,
                        status: newStatus,
                        solucao: '',
                        isCustomSolucao: false
                    };
                }

                if (field === 'isManualInput') {
                    return { ...item, isManualInput: value, text: value ? '' : item.text };
                }

                return { ...item, [field]: value, status: newStatus };
            }
            return item;
        }));
    };

    // Helpers para Sets de Anomalia/Solução
    const updateAnomalySet = (itemId: string, index: number, value: string, isCustom: boolean) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.anomaliasSet ? [...item.anomaliasSet] : [{ value: item.anomalia || '', isCustom: false }];
                while (newSet.length <= index) newSet.push({ value: '', isCustom: false });
                newSet[index] = { value, isCustom };
                const joined = newSet.map(x => x.value).filter(x => x && x.trim() !== '').join('\n');
                return { ...item, anomaliasSet: newSet, anomalia: joined, status: 'amarelo' };
            }
            return item;
        }));
    };

    const addAnomaly = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.anomaliasSet ? [...item.anomaliasSet] : [{ value: item.anomalia || '', isCustom: false }];
                newSet.push({ value: '', isCustom: false });
                return { ...item, anomaliasSet: newSet, status: 'amarelo' };
            }
            return item;
        }));
    };

    const removeAnomaly = (itemId: string, index: number) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.anomaliasSet ? [...item.anomaliasSet] : [{ value: item.anomalia || '', isCustom: false }];
                if (newSet.length > 1) {
                    newSet.splice(index, 1);
                } else {
                    newSet[0] = { value: '', isCustom: false };
                }
                const joined = newSet.map(x => x.value).filter(x => x && x.trim() !== '').join('\n');
                return { ...item, anomaliasSet: newSet, anomalia: joined, status: 'amarelo' };
            }
            return item;
        }));
    };

    const updateSolucaoSet = (itemId: string, index: number, value: string, isCustom: boolean) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.solucoesSet ? [...item.solucoesSet] : [{ value: item.solucao || '', isCustom: false }];
                while (newSet.length <= index) newSet.push({ value: '', isCustom: false });
                newSet[index] = { value, isCustom };
                const joined = newSet.map(x => x.value).filter(x => x && x.trim() !== '').join('\n');
                return { ...item, solucoesSet: newSet, solucao: joined, status: 'amarelo' };
            }
            return item;
        }));
    };

    const addSolucao = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.solucoesSet ? [...item.solucoesSet] : [{ value: item.solucao || '', isCustom: false }];
                newSet.push({ value: '', isCustom: false });
                return { ...item, solucoesSet: newSet, status: 'amarelo' };
            }
            return item;
        }));
    };

    const removeSolucao = (itemId: string, index: number) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newSet = item.solucoesSet ? [...item.solucoesSet] : [{ value: item.solucao || '', isCustom: false }];
                if (newSet.length > 1) {
                    newSet.splice(index, 1);
                } else {
                    newSet[0] = { value: '', isCustom: false };
                }
                const joined = newSet.map(x => x.value).filter(x => x && x.trim() !== '').join('\n');
                return { ...item, solucoesSet: newSet, solucao: joined, status: 'amarelo' };
            }
            return item;
        }));
    };

    const handlePhotoUpload = (itemId: string, mode: 'cam' | 'gallery') => {

        setEditingItemId(itemId);
        if (mode === 'cam') camInputRef.current?.click();
        else galleryInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingItemId) {
            try {
                const compressed = await compressImage(file, 1024, 1024, 0.7);
                setImageToEdit(compressed);
                setEditorTarget('item');
                setEditorOpen(true);
            } catch (error) {
                console.error('Erro ao comprimir imagem:', error);
                alert('Erro ao processar foto.');
            }
        }
        // Reset input
        e.target.value = '';
    };

    const handleSaveEditedImage = (editedImage: string) => {
        if (editorTarget === 'item' && editingItemId) {
            const currentItem = checklistItems.find(i => i.id === editingItemId);
            if (currentItem) {
                const newPhotos = [...currentItem.fotos, editedImage];
                updateItemDetails(editingItemId, 'fotos', newPhotos);
            }
        } else if (editorTarget === 'frontal') {
            setFotoFrontal(editedImage);
        }
        setEditorOpen(false);
        setImageToEdit('');
        setEditorTarget(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (loading) return;
        setLoading(true);

        if (!fotoFrontal && !fromWaitlist) {
            alert('A foto frontal do equipamento é obrigatória!');
            setLoading(false);
            return;
        }

        // Validação removida a pedido
        /*
        if (!fixedData.cliente || !fixedData.numero_os || !fixedData.tag) {
            alert('Por favor, preencha os campos obrigatórios (*): Cliente, O.S e TAG.');
            setLoading(false);
            return;
        }
        */

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                alert('Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente.');
                navigate('/login');
                return;
            }

            if (fromWaitlist) {
                try {
                    const { error } = await supabase
                        .from('aguardando_peritagem')
                        .insert([{
                            os_interna: fixedData.os_interna,
                            cliente: fixedData.cliente,
                            tag: fixedData.tag,
                            numero_ordem: fixedData.ordem,
                            ni: fixedData.ni,
                            nf: fixedData.nota_fiscal,
                            local_equipamento: fixedData.local_equipamento,
                            responsavel_tecnico: fixedData.responsavel_tecnico,
                            numero_pedido: fixedData.pedido,
                            desenho_conjunto: fixedData.desenho_conjunto,
                            tipo_modelo: fixedData.tipo_modelo,
                            fabricante: fixedData.fabricante,
                            lubrificante: fixedData.lubrificante,
                            volume: fixedData.volume,
                            acoplamento_polia: fixedData.acoplamento_polia,
                            sistema_lubrificacao: fixedData.sistema_lubrificacao,
                            outros_especificar: fixedData.outros_especificar,
                            descricao_equipamento: fixedData.observacoes_gerais,
                            area: fixedData.area,
                            linha: fixedData.linha,
                            status: 'AGUARDANDO APROVAÇÃO DO PCP',
                            empresa_id: user.user_metadata?.empresa_id
                        }]);

                    if (error) throw error;
                    alert('Item registrado na lista de espera!');
                    navigate('/pcp/aguardando');
                    return;
                } catch (err: any) {
                    console.error('Erro ao salvar na lista de espera:', err);
                    alert('Erro ao salvar: ' + err.message);
                    return;
                } finally {
                    setLoading(false);
                }
            }

            // Se não tiver OS, gera um ID único temporário para não dar erro de duplicidade
            let numeroPeritagem = fixedData.numero_os ? fixedData.numero_os.toUpperCase() : `S/OS-${Date.now()}`;

            // 1. Salvar ou Atualizar Peritagem
            let peritagemId = editId;
            const empresa_id = null;

            if (editId) {
                // UPDATE
                const { error: uError } = await supabase
                    .from('peritagens')
                    .update({
                        empresa_id,
                        tag: fixedData.tag,
                        cliente: fixedData.cliente,
                        local_equipamento: fixedData.local_equipamento,
                        responsavel_tecnico: fixedData.responsavel_tecnico,
                        tipo_cilindro: cylinderType,
                        ni: fixedData.ni,
                        numero_pedido: fixedData.pedido,
                        ordem: fixedData.ordem,
                        nota_fiscal: fixedData.nota_fiscal,
                        camisa_int: dimensions.diametroInterno,
                        camisa_ext: dimensions.diametroExterno,
                        haste_diam: dimensions.diametroHaste,
                        haste_comp: dimensions.comprimentoHaste,
                        curso: dimensions.curso,
                        camisa_comp: dimensions.comprimentoTotal,
                        montagem: dimensions.montagem,
                        pressao_nominal: dimensions.pressaoNominal,
                        fabricante_modelo: dimensions.fabricanteModelo,
                        foto_frontal: fotoFrontal,
                        status: 'AGUARDANDO APROVAÇÃO DO PCP', // Reseta status ao editar
                        desenho_conjunto: fixedData.desenho_conjunto,
                        lubrificante: fixedData.lubrificante,
                        volume: fixedData.volume,
                        acoplamento_polia: fixedData.acoplamento_polia,
                        sistema_lubrificacao: fixedData.sistema_lubrificacao,
                        outros_especificar: fixedData.outros_especificar,
                        observacoes_gerais: fixedData.observacoes_gerais,
                        fabricante: fixedData.fabricante,
                        tipo_modelo: fixedData.tipo_modelo,
                        area: fixedData.area,
                        linha: fixedData.linha,
                        os_interna: fixedData.os_interna,
                        etapa_atual: 'peritagem',
                        databook_pronto: false,
                        motivo_rejeicao: null // Limpa o motivo de rejeição ao reenviar
                    })
                    .eq('id', editId);

                if (uError) throw uError;

                // Deletar análises antigas para recriar (estratégia simples)
                await supabase.from('peritagem_analise_tecnica').delete().eq('peritagem_id', editId);

            } else {
                // INSERT - Antes de inserir, verificar se já existe (Prevenir clique duplo ou OS duplicada de verdade)
                // Só checa duplicata se o usuário digitou um número de OS manualmente
                if (fixedData.numero_os) {
                    const { data: existingPeritagem } = await supabase
                        .from('peritagens')
                        .select('id')
                        .eq('os', numeroPeritagem)
                        .maybeSingle();
                    
                    if (existingPeritagem) {
                        alert('Já existe um registro com esta O.S/Referência. Por favor, verifique se o relatório já foi salvo ou use uma numeração diferente.');
                        setLoading(false);
                        return;
                    }
                }

                const { data: peritagem, error: pError } = await supabase
                    .from('peritagens')
                    .insert([{
                        empresa_id,
                        numero_peritagem: numeroPeritagem,
                        os: numeroPeritagem,
                        tag: fixedData.tag,
                        cliente: fixedData.cliente,
                        local_equipamento: fixedData.local_equipamento,
                        responsavel_tecnico: fixedData.responsavel_tecnico,
                        tipo_cilindro: cylinderType,
                        ni: fixedData.ni,
                        numero_pedido: fixedData.pedido,
                        ordem: fixedData.ordem,
                        nota_fiscal: fixedData.nota_fiscal,
                        camisa_int: dimensions.diametroInterno,
                        camisa_ext: dimensions.diametroExterno,
                        haste_diam: dimensions.diametroHaste,
                        haste_comp: dimensions.comprimentoHaste,
                        curso: dimensions.curso,
                        camisa_comp: dimensions.comprimentoTotal,
                        montagem: dimensions.montagem,
                        pressao_nominal: dimensions.pressaoNominal,
                        fabricante_modelo: dimensions.fabricanteModelo,
                        foto_frontal: fotoFrontal,
                        status: 'AGUARDANDO APROVAÇÃO DO PCP',
                        desenho_conjunto: fixedData.desenho_conjunto,
                        lubrificante: fixedData.lubrificante,
                        volume: fixedData.volume,
                        acoplamento_polia: fixedData.acoplamento_polia,
                        sistema_lubrificacao: fixedData.sistema_lubrificacao,
                        outros_especificar: fixedData.outros_especificar,
                        observacoes_gerais: fixedData.observacoes_gerais,
                        fabricante: fixedData.fabricante,
                        tipo_modelo: fixedData.tipo_modelo,
                        area: fixedData.area,
                        linha: fixedData.linha,
                        os_interna: fixedData.os_interna,
                        etapa_atual: 'peritagem',
                        databook_pronto: false
                    }])
                    .select()
                    .single();

                if (pError) throw pError;
                peritagemId = peritagem.id;
            }


            // 2. Salvar Itens do Checklist
            const analyses = checklistItems
                .filter(item =>
                    item.conformidade !== null ||
                    item.nao_aplicavel ||
                    (item.anomalia && item.anomalia.trim() !== '') ||
                    (item.solucao && item.solucao.trim() !== '')
                )
                .map(item => ({
                    peritagem_id: peritagemId,
                    componente: item.text,
                    conformidade: item.conformidade ||
                        ((item.anomalia && item.anomalia.trim() !== '') || (item.solucao && item.solucao.trim() !== '') ? 'não conforme' : null),
                    anomalias: item.anomalia,
                    solucao: item.solucao,
                    fotos: item.fotos,
                    dimensoes: item.dimensoes,
                    qtd: item.qtd,
                    diametro_encontrado: item.diametro_encontrado,
                    diametro_ideal: item.diametro_ideal,
                    material_faltante: item.material_faltante,
                    // Novos campos dimensionais
                    diametro_externo_encontrado: item.diametro_externo_encontrado,
                    diametro_externo_especificado: item.diametro_externo_especificado,
                    desvio_externo: item.desvio_externo,
                    diametro_interno_encontrado: item.diametro_interno_encontrado,
                    diametro_interno_especificado: item.diametro_interno_especificado,
                    desvio_interno: item.desvio_interno,
                    comprimento_encontrado: item.comprimento_encontrado,
                    comprimento_especificado: item.comprimento_especificado,
                    desvio_comprimento: item.desvio_comprimento,
                    tipo: item.tipo || 'componente',
                    // NOVOS CAMPOS PROFISSIONAIS
                    criticidade: item.criticidade,
                    parecer_item: item.parecer_item,
                    nao_aplicavel: item.nao_aplicavel
                }));

            const analysesVedacoes = vedacoes
                .filter(item => item.text && item.text.trim() !== '')
                .map(item => ({
                    peritagem_id: peritagemId,
                    componente: item.text,
                    conformidade: 'não conforme',
                    anomalias: item.observacao || '',
                    solucao: '',
                    fotos: [],
                    dimensoes: item.unidade || '',
                    qtd: item.qtd,
                    tipo: 'vedação'
                }));

            const allAnalyses = [...analyses, ...analysesVedacoes];

            if (allAnalyses.length > 0) {
                const { error: aError } = await supabase
                    .from('peritagem_analise_tecnica')
                    .insert(allAnalyses);
                if (aError) throw aError;
            }

            // Atualizar status local para azul
            setChecklistItems(prev => prev.map(item => ({ ...item, status: 'azul' })));

            // 3. Atualizar status na tabela 'aguardando_peritagem' se existir
            if (idWaitlist || fixedData.os_interna) {
                const query = supabase.from('aguardando_peritagem').update({ status: 'PERITADO' });
                
                if (idWaitlist) {
                    await query.eq('id', idWaitlist);
                } else {
                    await query.eq('os_interna', fixedData.os_interna);
                }
            }

            // 3. Sincronizar Fotos com o Arquivo Geral
            const allPhotosForGallery: SyncPhoto[] = [];

            if (fotoFrontal) {
                allPhotosForGallery.push({ data: fotoFrontal, description: 'Foto Frontal Equipamento' });
            }

            checklistItems.forEach(item => {
                if (item.fotos && item.fotos.length > 0) {
                    item.fotos.forEach((f, idx) => {
                        allPhotosForGallery.push({
                            data: f,
                            description: `Foto ${idx + 1} - ${item.text}`
                        });
                    });
                }
            });

            if (allPhotosForGallery.length > 0) {
                // Não aguardamos o sync para não travar o usuário, mas disparamos
                syncPhotosToGallery(
                    fixedData.os_interna || numeroPeritagem,
                    fixedData.cliente,
                    allPhotosForGallery
                );
            }

            alert('Peritagem salva e registrada no histórico!');
            navigate('/peritagens');
        } catch (err: any) {
            console.error('❌ Erro detalhado ao salvar:', err);
            console.error('Código do erro:', err.code);
            console.error('Detalhes:', err.details);
            console.error('Hint:', err.hint);
            // Só mostra mensagem de OS duplicada se o erro for especificamente na coluna 'os'
            if (err.code === '23505' && (err.details?.includes('os') || err.message?.includes('"os"'))) {
                alert('Já existe uma peritagem com este número de OS/Laudo. Por favor, verifique ou use um número diferente.');
            } else if (err.code === '23505') {
                alert('Erro de duplicidade ao salvar: ' + (err.details || err.message || 'Verifique os dados e tente novamente.'));
            } else {
                alert('Erro ao salvar peritagem: ' + (err.message || 'Erro interno'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClearForm = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os dados deste formulário?')) {
            setFixedData({
                tag: '',
                local_equipamento: '',
                data_inspecao: new Date().toISOString().split('T')[0],
                responsavel_tecnico: '',
                cliente: '',
                numero_os: '',
                ni: '',
                pedido: '',
                ordem: '',
                nota_fiscal: '',
                desenho_conjunto: '',
                tipo_modelo: '',
                fabricante: '',
                lubrificante: '',
                volume: '',
                acoplamento_polia: '',
                sistema_lubrificacao: '',
                outros_especificar: '',
                observacoes_gerais: '',
                area: '',
                linha: '',
                os_interna: ''
            });
            setDimensions({
                diametroInterno: '',
                diametroHaste: '',
                curso: '',
                comprimentoTotal: '',
                diametroExterno: '',
                comprimentoHaste: '',
                montagem: '',
                pressaoNominal: '',
                fabricanteModelo: ''
            });
            setFotoFrontal('');
            // Re-inicializa o checklist baseado no tipo atual
            let list = [];
            if (fixedData.cliente === 'USIMINAS') {
                list = USIMINAS_ITEMS;
            } else if (cylinderType === 'Redutores') {
                list = REDUTOR_ITEMS;
            } else if (cylinderType === 'Motores' || cylinderType === 'CilindrosHidraulicos') {
                list = MOTOR_ITEMS;
            } else {
                list = STANDARD_ITEMS;
            }

            setChecklistItems(list.map((text) => ({
                id: crypto.randomUUID(),
                text,
                status: 'vermelho',
                conformidade: null,
                anomalia: '',
                anomaliasSet: [{ value: '', isCustom: false }],
                solucao: '',
                solucoesSet: [{ value: '', isCustom: false }],
                fotos: [],
                dimensoes: '',
                qtd: '',
                tipo: 'componente'
            })));
        }
    };


    if (step === 0) {
        if (loading) {
            return (
                <div className="nova-peritagem-container start-screen" style={{ flexDirection: 'column', gap: '20px' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#666', fontWeight: 600 }}>Carregando dados da peritagem...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            );
        }

        return (
            <div className="nova-peritagem-container start-screen">
                <div className="selection-card">
                    <h2>Selecione o formulario para continuar</h2>
                    <p>Inicie o formulário de peritagem escolhendo a tecnologia do equipamento.</p>
                    <div className="type-options" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        <button 
                            className={`type-btn ${cylinderType === 'Motores' ? 'active' : ''}`} 
                            onClick={() => setCylinderType('Motores')}
                            style={{ padding: '20px', fontSize: '1.1rem', fontWeight: '800' }}
                        >
                            Relatório Motor Diesel
                        </button>
                        <button 
                            className={`type-btn ${cylinderType === 'CilindrosHidraulicos' ? 'active' : ''}`} 
                            onClick={() => setCylinderType('CilindrosHidraulicos')}
                            style={{ padding: '20px', fontSize: '1.1rem', fontWeight: '800' }}
                        >
                            Cilindros Hidráulicos
                        </button>
                    </div>
                    {motivoRejeicao && (
                        <div style={{
                            padding: '20px',
                            margin: '20px',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderLeft: '5px solid #ef4444',
                            borderRadius: '12px',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <h3 style={{ color: '#991b1b', fontSize: '1rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <X size={18} /> REPROVADA PELO PCP
                            </h3>
                            <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: 0 }}>
                                <strong>Motivo:</strong> {motivoRejeicao}
                            </p>
                        </div>
                    )}

                    {cylinderType === null ? (
                        <button className="btn-start" onClick={() => setStep(1)}>
                            Avançar para Formulário
                        </button>
                    ) : (
                        <button className="btn-start" onClick={() => setStep(1)}>
                            Avançar para Formulário
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="nova-peritagem-container">
            <header className="header-sticky">
                <div className="header-content">
                    <button className="btn-back-circle" onClick={() => setStep(0)}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="title-group">
                        <h1 className="page-title">Peritagem - {cylinderType}</h1>
                        <span className="subtitle">Preencha os dados técnicos abaixo</span>
                    </div>
                </div>
                <div className="header-actions-top">
                    <button type="button" className="btn-save-top" style={{ backgroundColor: '#718096' }} onClick={handleClearForm}>
                        <ArrowLeft size={20} />
                        Limpar Dados
                    </button>
                    <button type="button" className="btn-save-top" onClick={handleSubmit} disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Salvando...' : fromWaitlist ? 'Salvar na Lista' : 'Salvar Peritagem'}
                    </button>
                </div>
            </header>

            <form className="peritagem-dynamic-form" onSubmit={(e) => e.preventDefault()}>
                {/* FOTO FRONTAL OBRIGATÓRIA */}
                <section className="form-card frontal-photo-section">
                    <div className="card-header">
                        <Camera size={20} color="#2980b9" />
                        <h3>Foto Frontal do Equipamento *</h3>
                    </div>
                    <div className="frontal-photo-upload" style={{ cursor: 'default' }}>
                        {fotoFrontal ? (
                            <div className="frontal-preview">
                                <img src={fotoFrontal} alt="Foto Frontal" />
                                <div className="change-photo-actions">
                                    <button type="button" className="btn-photo-action" onClick={() => frontalCameraRef.current?.click()}>
                                        <Camera size={20} />
                                        <span>Câmera</span>
                                    </button>
                                    <button type="button" className="btn-photo-action" onClick={() => frontalGalleryRef.current?.click()}>
                                        <ImageIcon size={20} />
                                        <span>Galeria</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="frontal-placeholder">
                                <p style={{ marginBottom: '1rem' }}>Selecione uma opção:</p>
                                <div className="photo-selection-buttons">
                                    <button type="button" className="btn-photo-select" onClick={() => frontalCameraRef.current?.click()}>
                                        <Camera size={32} />
                                        <span>Tirar Foto</span>
                                    </button>
                                    <button type="button" className="btn-photo-select" onClick={() => frontalGalleryRef.current?.click()}>
                                        <ImageIcon size={32} />
                                        <span>Galeria</span>
                                    </button>
                                </div>
                                <span style={{ marginTop: '1rem', display: 'block' }}>(Obrigatório)</span>
                            </div>
                        )}

                        {/* Input Câmera */}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={frontalCameraRef}
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const compressed = await compressImage(file, 1024, 1024, 0.7);
                                        setImageToEdit(compressed);
                                        setEditorTarget('frontal');
                                        setEditorOpen(true);
                                    } catch (error) {
                                        console.error('Erro ao comprimir foto frontal:', error);
                                        alert('Erro ao processar foto frontal.');
                                    }
                                }
                                e.target.value = '';
                            }}
                        />

                        {/* Input Galeria */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={frontalGalleryRef}
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const compressed = await compressImage(file, 1024, 1024, 0.7);
                                        setImageToEdit(compressed);
                                        setEditorTarget('frontal');
                                        setEditorOpen(true);
                                    } catch (error) {
                                        console.error('Erro ao comprimir foto frontal:', error);
                                        alert('Erro ao processar foto frontal.');
                                    }
                                }
                                e.target.value = '';
                            }}
                        />
                    </div>
                </section>

                <section className="form-card">
                    <div className="card-header main-card-header">
                        <CheckCircle className="header-icon-blue" />
                        <div className="header-titles">
                            <h3>FORMULÁRIO DE PERITAGEM</h3>
                        </div>
                    </div>
                    <div className="grid-form">
                        {/* CAMPOS INTERNOS (TELA APENAS) */}
                        <div className="form-group full-row" style={{ marginBottom: '20px', borderBottom: '2px dashed #eee', paddingBottom: '15px' }}>
                            <div className="grid-responsive-2">
                                <div>
                                    <label style={{ fontWeight: 'bold', color: '#e67e22' }}>ORDEM DE SERVIÇO INTERNA (USO INTERNO)</label>
                                    <input
                                        placeholder="OS Interna"
                                        value={fixedData.os_interna}
                                        onChange={e => setFixedData({ ...fixedData, os_interna: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #e67e22', borderRadius: 0, padding: '5px', backgroundColor: '#fff8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', color: '#e67e22' }}>NOME DO CLIENTE</label>
                                    <input
                                        required
                                        placeholder="Digite o Nome do Cliente"
                                        value={fixedData.cliente}
                                        onChange={e => setFixedData({ ...fixedData, cliente: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #e67e22', borderRadius: 0, padding: '5px', backgroundColor: '#fff8f0' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {fixedData.cliente === 'USIMINAS' ? (
                            <div className="grid-responsive-3">


                                {/* LINHA 1: NOTA/LAUDO | PROCESSO | DATA */}
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>NOTA / LAUDO</label>
                                    <input
                                        placeholder="NF"
                                        value={fixedData.nota_fiscal}
                                        onChange={e => setFixedData({ ...fixedData, nota_fiscal: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>PROCESSO / OFICINAS</label>
                                    <input
                                        placeholder="Pedido"
                                        value={fixedData.pedido}
                                        onChange={e => setFixedData({ ...fixedData, pedido: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>DATA</label>
                                    <input
                                        type="date"
                                        value={fixedData.data_inspecao}
                                        onChange={e => setFixedData({ ...fixedData, data_inspecao: e.target.value })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>

                                {/* LINHA 2: ÁREA | LINHA | EQUIPAMENTO */}
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>ÁREA</label>
                                    <input
                                        placeholder="Área"
                                        value={fixedData.area}
                                        onChange={e => setFixedData({ ...fixedData, area: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>LINHA</label>
                                    <input
                                        placeholder="Linha"
                                        value={fixedData.linha}
                                        onChange={e => setFixedData({ ...fixedData, linha: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>EQUIPAMENTO</label>
                                    <input
                                        placeholder="Local / Equipamento"
                                        value={fixedData.local_equipamento}
                                        onChange={e => setFixedData({ ...fixedData, local_equipamento: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>

                                {/* LINHA 3: TIPO | TAG | MATERIAL/NI */}
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>TIPO DE EQUIPAMENTO</label>
                                    <input
                                        placeholder="Tipo/Modelo"
                                        value={fixedData.tipo_modelo}
                                        onChange={e => setFixedData({ ...fixedData, tipo_modelo: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>TAG DO EQUIPAMENTO</label>
                                    <input
                                        placeholder="TAG"
                                        value={fixedData.tag}
                                        onChange={e => setFixedData({ ...fixedData, tag: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>MATERIAL / NI</label>
                                    <input
                                        placeholder="NI"
                                        value={fixedData.ni}
                                        onChange={e => setFixedData({ ...fixedData, ni: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>

                                {/* LINHA 4: DESENHO */}
                                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                    <label style={{ fontWeight: 'bold' }}>DESENHO</label>
                                    <input
                                        placeholder="Nº Desenho"
                                        value={fixedData.desenho_conjunto}
                                        onChange={e => setFixedData({ ...fixedData, desenho_conjunto: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '5px' }}
                                    />
                                </div>
                            </div>
                        ) : cylinderType === 'Motores' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0', width: '100%' }}>

                                {/* SECAO 1: IDENTIFICACAO */}
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        📋 Identificação
                                    </div>
                                    <div className="grid-responsive-2" style={{ gap: '12px' }}>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>ORDEM DE SERVIÇO *</label>
                                            <input
                                                required
                                                placeholder="Ex: OS-1234"
                                                value={fixedData.numero_os}
                                                onChange={e => setFixedData({ ...fixedData, numero_os: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '2px solid #e53e3e', borderRadius: 0, padding: '8px 5px', fontWeight: '700' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>NOTA FISCAL (NF)</label>
                                            <input
                                                placeholder="Ex: 9012"
                                                value={fixedData.nota_fiscal}
                                                onChange={e => setFixedData({ ...fixedData, nota_fiscal: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>DATA DA INSPEÇÃO</label>
                                            <input
                                                type="date"
                                                value={fixedData.data_inspecao}
                                                onChange={e => setFixedData({ ...fixedData, data_inspecao: e.target.value })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>RESPONSÁVEL TÉCNICO</label>
                                            <input
                                                placeholder="Nome do inspetor..."
                                                value={fixedData.responsavel_tecnico}
                                                onChange={e => setFixedData({ ...fixedData, responsavel_tecnico: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>TAG DO MOTOR</label>
                                            <input
                                                placeholder="Ex: MTR-001"
                                                value={fixedData.tag}
                                                onChange={e => setFixedData({ ...fixedData, tag: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>LOCAL / EQUIPAMENTO</label>
                                            <input
                                                placeholder="Ex: Planta Norte - Bomba #3"
                                                value={fixedData.local_equipamento}
                                                onChange={e => setFixedData({ ...fixedData, local_equipamento: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECAO 2: DADOS TECNICOS */}
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        ⚙️ Dados Técnicos do Motor
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>MARCA / FABRICANTE</label>
                                            <input
                                                placeholder="Ex: Cummins, Caterpillar, MWM..."
                                                value={fixedData.fabricante}
                                                onChange={e => setFixedData({ ...fixedData, fabricante: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>MODELO DO MOTOR</label>
                                            <input
                                                placeholder="Ex: QSB6.7, C7.1, D229-4..."
                                                value={fixedData.tipo_modelo}
                                                onChange={e => setFixedData({ ...fixedData, tipo_modelo: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>NÚMERO DE SÉRIE</label>
                                            <input
                                                placeholder="Nº gravado no bloco..."
                                                value={fixedData.ni}
                                                onChange={e => setFixedData({ ...fixedData, ni: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>POTÊNCIA / RPM NOMINAIS</label>
                                            <input
                                                placeholder="Ex: 250 CV / 2200 RPM"
                                                value={fixedData.volume}
                                                onChange={e => setFixedData({ ...fixedData, volume: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>HORÍMETRO (horas)</label>
                                            <input
                                                placeholder="Ex: 12.450 h"
                                                value={fixedData.lubrificante}
                                                onChange={e => setFixedData({ ...fixedData, lubrificante: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>APLICAÇÃO</label>
                                            <input
                                                placeholder="Ex: Gerador, Veicular, Industrial..."
                                                value={fixedData.desenho_conjunto}
                                                onChange={e => setFixedData({ ...fixedData, desenho_conjunto: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECAO 3: SISTEMAS */}
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#276749', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        🔧 Sistemas do Motor
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>ASPIRAÇÃO</label>
                                            <select
                                                value={fixedData.outros_especificar}
                                                onChange={e => setFixedData({ ...fixedData, outros_especificar: e.target.value })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '8px 5px', fontSize: '0.95rem', background: 'transparent' }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="NATURAL">NATURAL</option>
                                                <option value="TURBO">TURBO</option>
                                                <option value="TURBO INTERCOOLER">TURBO INTERCOOLER</option>
                                                <option value="TURBO COMPOUND">TURBO COMPOUND</option>
                                                <option value="OUTROS">OUTROS</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>ARREFECIMENTO</label>
                                            <select
                                                value={fixedData.acoplamento_polia}
                                                onChange={e => setFixedData({ ...fixedData, acoplamento_polia: e.target.value })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '8px 5px', fontSize: '0.95rem', background: 'transparent' }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="ÁGUA (FECHADO)">ÁGUA (FECHADO)</option>
                                                <option value="ÁGUA (ABERTO)">ÁGUA (ABERTO)</option>
                                                <option value="AR FORÇADO">AR FORÇADO</option>
                                                <option value="OIL COOLING">OIL COOLING</option>
                                                <option value="OUTROS">OUTROS</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>SISTEMA DE INJEÇÃO</label>
                                            <select
                                                value={fixedData.sistema_lubrificacao}
                                                onChange={e => setFixedData({ ...fixedData, sistema_lubrificacao: e.target.value })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '8px 5px', fontSize: '0.95rem', background: 'transparent' }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="BOMBA LINHA (MECÂNICO)">BOMBA LINHA (MECÂNICO)</option>
                                                <option value="BOMBA DISTRIBUIDORA (ROTATIVA)">BOMBA DISTRIBUIDORA (ROTATIVA)</option>
                                                <option value="COMMON RAIL (ELETRÔNICO)">COMMON RAIL (ELETRÔNICO)</option>
                                                <option value="UNIDADE BOMBEADORA (ELETRÔNICO)">UNIDADE BOMBEADORA (ELETRÔNICO)</option>
                                                <option value="OUTROS">OUTROS</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>TIPO DE COMBUSTÍVEL</label>
                                            <select
                                                value={fixedData.pedido}
                                                onChange={e => setFixedData({ ...fixedData, pedido: e.target.value })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '8px 5px', fontSize: '0.95rem', background: 'transparent' }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="DIESEL S10">DIESEL S10</option>
                                                <option value="DIESEL S500">DIESEL S500</option>
                                                <option value="GAS NATURAL">GAS NATURAL</option>
                                                <option value="BIODIESEL">BIODIESEL</option>
                                                <option value="OUTROS">OUTROS</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>ÁREA / SETOR</label>
                                            <input
                                                placeholder="Ex: Manutenção, Produção..."
                                                value={fixedData.area}
                                                onChange={e => setFixedData({ ...fixedData, area: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>LINHA</label>
                                            <input
                                                placeholder="Ex: Linha 01..."
                                                value={fixedData.linha}
                                                onChange={e => setFixedData({ ...fixedData, linha: e.target.value.toUpperCase() })}
                                                style={{ width: '100%', borderBottom: '1px solid #cbd5e0', borderRadius: 0, padding: '8px 5px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECAO 4: CONDICOES DE RECEBIMENTO */}
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#b7791f', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        📦 Condições de Recebimento
                                    </div>
                                    <div className="grid-responsive-2">
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>MOTOR RECEBIDO COMPLETO?</label>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                                                {['SIM', 'NÃO', 'PARCIAL'].map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                        <input type="radio" name="motor_completo_r" value={opt}
                                                            checked={fixedData.ordem === opt}
                                                            onChange={e => setFixedData({ ...fixedData, ordem: e.target.value })}
                                                            style={{ width: '16px', height: '16px' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontWeight: 'bold', fontSize: '11px' }}>CONDIÇÃO DE ENTREGA</label>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                                                {['LIMPO', 'SUJO', 'DANIFICADO'].map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                        <input type="radio" name="cond_entrega_r" value={opt}
                                                            checked={fixedData.desenho_conjunto === `COND:${opt}`}
                                                            onChange={() => setFixedData({ ...fixedData, desenho_conjunto: `COND:${opt}` })}
                                                            style={{ width: '16px', height: '16px' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECAO 5: OBSERVACOES */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#553c9a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        📝 Observações Gerais / Queixa do Cliente
                                    </div>
                                    <textarea
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem' }}
                                        placeholder="Descreva aqui a condição geral do motor, queixa do cliente, histórico de falhas e qualquer informação relevante para a inspeção..."
                                        value={fixedData.observacoes_gerais}
                                        onChange={e => setFixedData({ ...fixedData, observacoes_gerais: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid-responsive-1" style={{ gap: '20px' }}>
                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>ORDEM DE SERVIÇO</label>
                                    <input
                                        required
                                        placeholder="Ex: 1234"
                                        value={fixedData.numero_os}
                                        onChange={e => setFixedData({ ...fixedData, numero_os: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>NF</label>
                                    <input
                                        placeholder="Ex: 9012"
                                        value={fixedData.nota_fiscal}
                                        onChange={e => setFixedData({ ...fixedData, nota_fiscal: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>NI</label>
                                    <input
                                        placeholder="Ex: NI-99"
                                        value={fixedData.ni}
                                        onChange={e => setFixedData({ ...fixedData, ni: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>DESENHO</label>
                                    <input
                                        placeholder="Referência do desenho..."
                                        value={fixedData.desenho_conjunto}
                                        onChange={e => setFixedData({ ...fixedData, desenho_conjunto: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>TIPO/ MODELO</label>
                                    <input
                                        placeholder="Ex: H-123"
                                        value={fixedData.tipo_modelo}
                                        onChange={e => setFixedData({ ...fixedData, tipo_modelo: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>FABRICANTE</label>
                                    <input
                                        placeholder="Fabricante..."
                                        value={fixedData.fabricante}
                                        onChange={e => setFixedData({ ...fixedData, fabricante: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>LUBRIFICANTE</label>
                                    <input
                                        placeholder="Óleo, Graxa..."
                                        value={fixedData.lubrificante}
                                        onChange={e => setFixedData({ ...fixedData, lubrificante: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>VOLUME</label>
                                    <input
                                        placeholder="Volume..."
                                        value={fixedData.volume}
                                        onChange={e => setFixedData({ ...fixedData, volume: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>RECEBIDO COM ACOPLAMENTO OU POLIA?</label>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="acoplamento" value="SIM" checked={fixedData.acoplamento_polia === 'SIM'} onChange={e => setFixedData({ ...fixedData, acoplamento_polia: e.target.value })} style={{ width: '20px', height: '20px' }} />
                                            Sim
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="acoplamento" value="NÃO" checked={fixedData.acoplamento_polia === 'NÃO'} onChange={e => setFixedData({ ...fixedData, acoplamento_polia: e.target.value })} style={{ width: '20px', height: '20px' }} />
                                            Não
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>RECEBIDO COM SISTEMA DE LUBRIFICAÇÃO?</label>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="sistema_lub" value="SIM" checked={fixedData.sistema_lubrificacao === 'SIM'} onChange={e => setFixedData({ ...fixedData, sistema_lubrificacao: e.target.value })} style={{ width: '20px', height: '20px' }} />
                                            Sim
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="sistema_lub" value="NÃO" checked={fixedData.sistema_lubrificacao === 'NÃO'} onChange={e => setFixedData({ ...fixedData, sistema_lubrificacao: e.target.value })} style={{ width: '20px', height: '20px' }} />
                                            Não
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>OUTROS ( ESPECIFICAR ):</label>
                                    <input
                                        placeholder="Outros detalhes..."
                                        value={fixedData.outros_especificar}
                                        onChange={e => setFixedData({ ...fixedData, outros_especificar: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>OUTRAS OBSERVAÇÕES:</label>
                                    <textarea
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '2px solid #f1f3f5' }}
                                        placeholder="Observações complementares..."
                                        value={fixedData.observacoes_gerais}
                                        onChange={e => setFixedData({ ...fixedData, observacoes_gerais: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>


                {/* CHECKLIST TÉCNICO */}
                <section className="form-card">
                    <div className="card-header">
                        <AlertCircle size={20} color="#f39c12" />
                        <h3>Checklist Técnico de Inspeção</h3>
                    </div>
                    <div className="checklist-items">
                        <div className="checklist-header-row">
                            <span className="cl-col-num">N°</span>
                            <span className="cl-desc">DESCRIÇÃO DE PEÇAS / SERVIÇOS</span>
                            <span className="cl-col-x"></span>
                        </div>
                        {checklistItems.map((item, index) => (
                            <div key={item.id} className="checklist-row" onClick={() => handleChecklistItemClick(item.id)}>
                                <div className="row-main">
                                    <div className="item-info">
                                        <div className="cl-col-num-row">
                                            <div className={`status-dot-animated ${item.conformidade ? 'verde' : 'vermelho'}`} />
                                            <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{index + 1}</span>
                                        </div>
                                        <div className="cl-col-desc-row">
                                            {item.isCustom || item.text === 'Selecione o componente...' || item.isManualInput ? (
                                                <>
                                                    {!item.isManualInput ? (
                                                        <select
                                                            value={item.text === 'Selecione o componente...' ? '' : item.text}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (val === '__CUSTOM__') {
                                                                    updateItemDetails(item.id, 'isManualInput', true);
                                                                    updateItemDetails(item.id, 'text', '');
                                                                } else {
                                                                    updateItemDetails(item.id, 'isManualInput', false);
                                                                    updateItemDetails(item.id, 'text', val);
                                                                }
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                            className="cl-select-custom"
                                                        >
                                                            <option value="" disabled>Selecione o componente...</option>
                                                            {Object.keys(DIMENSIONAL_ANOMALIES_SERVICES).map(comp => (
                                                                <option key={comp} value={comp}>{comp}</option>
                                                            ))}
                                                            <option value="__CUSTOM__">Outros (Digitar manual)</option>
                                                        </select>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%' }}>
                                                            <input
                                                                autoFocus
                                                                placeholder="Digite o nome do componente..."
                                                                value={item.text}
                                                                onChange={e => updateItemDetails(item.id, 'text', e.target.value.toUpperCase())}
                                                                onClick={e => e.stopPropagation()}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #cbd5e0'
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemDetails(item.id, 'isManualInput', false);
                                                                    updateItemDetails(item.id, 'text', 'Selecione o componente...');
                                                                }}
                                                                title="Voltar para lista"
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    color: '#e53e3e'
                                                                }}
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span>{item.text}</span>
                                            )}
                                        </div>

                                        {/* Coluna X - Spacer oculto no mobile */}
                                        <div className="cl-col-x-row" />

                                        {/* Coluna QTD */}
                                    </div>


                                    <div className="performance-status-strip">
                                        <button
                                            type="button"
                                            className={`status-btn-v3 conforme ${item.conformidade === 'conforme' ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleResponse(item.id, 'conforme'); }}
                                        >
                                            <div className="btn-icon-v3">✓</div>
                                            <span>CONFORME</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`status-btn-v3 nao-conforme ${item.conformidade === 'não conforme' ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleResponse(item.id, 'não conforme'); }}
                                        >
                                            <div className="btn-icon-v3">✕</div>
                                            <span>NÃO CONFORME</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`status-btn-v3 na ${item.nao_aplicavel ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleResponse(item.id, 'n/a'); }}
                                        >
                                            <div className="btn-icon-v3">/</div>
                                            <span>N/A</span>
                                        </button>
                                    </div>
                                    {item.conformidade && (
                                        <button
                                            type="button"
                                            className="clear-item-btn"
                                            onClick={(e) => { e.stopPropagation(); handleResetItem(item.id); }}
                                            title="Limpar resposta"
                                        >
                                            <X size={20} color="#000" />
                                        </button>
                                    )}
                                </div>

                                {
                                    item.conformidade === 'não conforme' && (
                                        <div className="non-conformity-block slide-in" onClick={(e) => e.stopPropagation()}>
                                            {/* FOTOS EM PRIMEIRO - Conforme solicitado pelo usuário */}
                                            <div className="photo-section" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Evidências Fotográficas (Componente)</label>
                                                <div className="photo-grid">
                                                    {item.fotos.map((foto, idx) => (
                                                        <div key={idx} className="photo-preview">
                                                            <img src={foto} alt={`Anomalia ${idx}`} />
                                                            <button type="button" className="btn-remove-photo" onClick={() => {
                                                                const newPhotos = item.fotos.filter((_, i) => i !== idx);
                                                                updateItemDetails(item.id, 'fotos', newPhotos);
                                                            }}><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <div className="photo-upload-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-action-photo camera"
                                                            onClick={(e) => { e.stopPropagation(); handlePhotoUpload(item.id, 'cam'); }}
                                                        >
                                                            <Camera size={20} />
                                                            <span>Câmera</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-photo gallery"
                                                            onClick={(e) => { e.stopPropagation(); handlePhotoUpload(item.id, 'gallery'); }}
                                                        >
                                                            <Plus size={20} />
                                                            <span>Galeria</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="item-detail-premium">
                                                {/* Criticidade */}
                                                <div className="premium-field-group">
                                                    <label className="premium-label">Criticidade da Falha</label>
                                                    <div className="criticidade-selector">
                                                        {['baixa', 'média', 'alta', 'crítica'].map(level => (
                                                            <button
                                                                key={level}
                                                                type="button"
                                                                className={`critic-btn ${level} ${item.criticidade === level ? 'active' : ''}`}
                                                                onClick={() => updateItemDetails(item.id, 'criticidade', level)}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Anomalias Quick Selection */}
                                                <div className="premium-field-group" style={{ marginTop: '1.5rem' }}>
                                                    <label className="premium-label">Anomalias (Seleção Rápida)</label>
                                                    <div className="quick-tags-container">
                                                        {(QUICK_TAGS[cylinderType as keyof typeof QUICK_TAGS]?.anomalies || []).map(tag => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                className={`tag-btn ${item.anomalia?.includes(tag) ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    const current = item.anomalia || '';
                                                                    const newVal = current.includes(tag) 
                                                                        ? current.replace(new RegExp(`\\s*${tag}\\s*`, 'g'), '').trim()
                                                                        : `${current} ${tag}`.trim();
                                                                    updateItemDetails(item.id, 'anomalia', newVal);
                                                                }}
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea 
                                                        placeholder="Detalhes adicionais da anomalia..."
                                                        value={item.anomalia}
                                                        onChange={e => updateItemDetails(item.id, 'anomalia', e.target.value)}
                                                        className="premium-textarea"
                                                        style={{ marginTop: '10px' }}
                                                    />
                                                </div>

                                                {/* Serviços Quick Selection */}
                                                <div className="premium-field-group" style={{ marginTop: '1.5rem' }}>
                                                    <label className="premium-label">Serviços / Soluções (Seleção Rápida)</label>
                                                    <div className="quick-tags-container">
                                                        {(QUICK_TAGS[cylinderType as keyof typeof QUICK_TAGS]?.services || []).map(tag => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                className={`tag-btn ${item.solucao?.includes(tag) ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    const current = item.solucao || '';
                                                                    const newVal = current.includes(tag) 
                                                                        ? current.replace(new RegExp(`\\s*${tag}\\s*`, 'g'), '').trim()
                                                                        : `${current} ${tag}`.trim();
                                                                    updateItemDetails(item.id, 'solucao', newVal);
                                                                }}
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea 
                                                        placeholder="Detalhes adicionais da solução..."
                                                        value={item.solucao}
                                                        onChange={e => updateItemDetails(item.id, 'solucao', e.target.value)}
                                                        className="premium-textarea"
                                                        style={{ marginTop: '10px' }}
                                                    />
                                                </div>

                                                {/* Parecer Técnico */}
                                                <div className="premium-field-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                                    <label className="premium-label">Parecer Técnico do Item</label>
                                                    <textarea 
                                                        placeholder="Escreva aqui sua análise técnica detalhada sobre este componente..."
                                                        value={item.parecer_item}
                                                        onChange={e => updateItemDetails(item.id, 'parecer_item', e.target.value)}
                                                        className="premium-textarea"
                                                        style={{ minHeight: '100px' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="usiminas-item-fields" style={{ marginBottom: '1rem', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                                <div className="input-field" style={{ flex: '0 0 100px' }}>
                                                    <label>Qtd Peças</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Qtd"
                                                        value={item.qtd}
                                                        onChange={e => updateItemDetails(item.id, 'qtd', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="analysis-inputs">
                                                {(() => {
                                                    // Determinar qual é o componente para filtrar as listas
                                                    // Para itens customizados, o texto é exatamente o componente (pois agora é um select)
                                                    // Para itens padrão, tentamos encontrar a chave correspondente no texto
                                                    const availableComponents = Object.keys(DIMENSIONAL_ANOMALIES_SERVICES);

                                                    // Mapeamento manual para casos onde o texto padrão não bate exatamente com a chave
                                                    // Mapeamento manual para casos onde o texto padrão não bate exatamente com a chave
                                                    // As chaves são partes do texto do item ou o nome exato que queremos mapear para o Componente oficial
                                                    // Mapeamento manual otimizado para padrões Usiminas
                                                    // ORDEM IMPORTA: Termos mais específicos devem vir antes
                                                    const manualMapping: Record<string, string> = {
                                                        "Tirante": "Tirantes",
                                                        "Kit Vedação": "Kit de Vedação",
                                                        "Vedação": "Kit de Vedação",
                                                        "Sanfonada": "Proteção Sanfonada",
                                                        "Bucha olhal": "Olhais",
                                                        "Olhal": "Olhais",
                                                        "Rótula": "Olhais",
                                                        "Sobreposta": "Sobrepostas",
                                                        "Sede Amortecedor": "Buchas Amortecedoras",
                                                        "Amortecedor": "Buchas Amortecedoras",
                                                        "Fixação por Munhão": "Munhão",
                                                        "Munhão": "Munhão",
                                                        "Parafusos": "Fixadores",
                                                        "Aleta": "Flanges",
                                                        "Base": "Flanges",
                                                        "Fix.": "Flanges", // Assume Fix. (Aleta/Base) como Flanges/Estrutural
                                                        "Embolo": "Êmbolo",
                                                        "Êmbolo": "Êmbolo",
                                                        "Bucha Guia": "Bucha Guia",
                                                        "Cabeçote Dianteiro": "Cabeçote Dianteiro",
                                                        "Cabeçote Traseiro": "Cabeçote Traseiro",
                                                        "Camisa": "Camisa",
                                                        "Haste": "Haste"
                                                    };

                                                    let detectedComponent = availableComponents.find(c => item.text === c);

                                                    if (!detectedComponent) {
                                                        // Tenta achar via includes (case insensitive)
                                                        detectedComponent = availableComponents.find(c => (item.text || '').toLowerCase().includes(c.toLowerCase()));
                                                    }

                                                    if (!detectedComponent) {
                                                        // Tenta mapeamento manual
                                                        for (const [key, val] of Object.entries(manualMapping)) {
                                                            if ((item.text || '').includes(key)) {
                                                                detectedComponent = val;
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    const anomaliesList = (detectedComponent && DIMENSIONAL_ANOMALIES_SERVICES[detectedComponent]) ? DIMENSIONAL_ANOMALIES_SERVICES[detectedComponent].anomalies : [];
                                                    const servicesList = (detectedComponent && DIMENSIONAL_ANOMALIES_SERVICES[detectedComponent]) ? DIMENSIONAL_ANOMALIES_SERVICES[detectedComponent].services : [];

                                                    const hasDropdowns = anomaliesList.length > 0;


                                                    const activeAnomalies = item.anomaliasSet || [{ value: item.anomalia || '', isCustom: false }];
                                                    const activeSolucoes = item.solucoesSet || [{ value: item.solucao || '', isCustom: false }];

                                                    return (
                                                        <>
                                                            <div className="input-field">
                                                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    Anomalia Encontrada
                                                                </label>
                                                                <div className="multi-list-container">
                                                                    {activeAnomalies.map((anomItem, idx) => {
                                                                        // Check custom status logic per item
                                                                        const isCustomSelected = anomItem.isCustom || (anomItem.value && !anomaliesList.includes(anomItem.value));
                                                                        const dropdownValue = isCustomSelected ? '__CUSTOM__' : (anomItem.value || '');

                                                                        return (
                                                                            <div key={idx} className="multi-list-item" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #eee' }}>
                                                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                                                                                    <div style={{ flex: 1 }}>
                                                                                        {hasDropdowns ? (
                                                                                            <>
                                                                                                <select
                                                                                                    value={dropdownValue}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        if (val === '__CUSTOM__') {
                                                                                                            updateAnomalySet(item.id, idx, '', true);
                                                                                                        } else {
                                                                                                            updateAnomalySet(item.id, idx, val, false);
                                                                                                        }
                                                                                                    }}
                                                                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', backgroundColor: '#fff', marginBottom: dropdownValue === '__CUSTOM__' ? '8px' : '0' }}
                                                                                                >
                                                                                                    <option value="">Selecione a anomalia...</option>
                                                                                                    {anomaliesList.map((anom, i) => (
                                                                                                        <option key={i} value={anom}>{anom}</option>
                                                                                                    ))}
                                                                                                    <option value="__CUSTOM__">Outros</option>
                                                                                                </select>
                                                                                                {dropdownValue === '__CUSTOM__' && (
                                                                                                    <textarea
                                                                                                        placeholder="Descreva a anomalia..."
                                                                                                        value={anomItem.value}
                                                                                                        onChange={(e) => updateAnomalySet(item.id, idx, e.target.value, true)}
                                                                                                        style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <textarea
                                                                                                placeholder="Descreva o defeito..."
                                                                                                value={anomItem.value}
                                                                                                onChange={(e) => updateAnomalySet(item.id, idx, e.target.value, true)}
                                                                                                style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    {activeAnomalies.length > 1 && (
                                                                                        <button type="button" onClick={() => removeAnomaly(item.id, idx)} style={{ color: '#e74c3c', background: 'none', border: 'none', padding: '5px' }}>
                                                                                            <X size={18} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addAnomaly(item.id)}
                                                                        style={{ fontSize: '12px', color: '#2980b9', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}
                                                                    >
                                                                        <Plus size={14} /> Adicionar Anomalia
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="input-field">
                                                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    Solução Recomendada
                                                                </label>
                                                                <div className="multi-list-container">
                                                                    {activeSolucoes.map((solItem, idx) => {
                                                                        const isCustomSelected = solItem.isCustom || (solItem.value && !servicesList.includes(solItem.value));
                                                                        const dropdownValue = isCustomSelected ? '__CUSTOM__' : (solItem.value || '');

                                                                        return (
                                                                            <div key={idx} className="multi-list-item" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #eee' }}>
                                                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                                                                                    <div style={{ flex: 1 }}>
                                                                                        {hasDropdowns ? (
                                                                                            <>
                                                                                                <select
                                                                                                    value={dropdownValue}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        if (val === '__CUSTOM__') {
                                                                                                            updateSolucaoSet(item.id, idx, '', true);
                                                                                                        } else {
                                                                                                            updateSolucaoSet(item.id, idx, val, false);
                                                                                                        }
                                                                                                    }}
                                                                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', backgroundColor: '#fff', marginBottom: dropdownValue === '__CUSTOM__' ? '8px' : '0' }}
                                                                                                >
                                                                                                    <option value="">Selecione a solução...</option>
                                                                                                    {servicesList.map((serv, i) => (
                                                                                                        <option key={i} value={serv}>{serv}</option>
                                                                                                    ))}
                                                                                                    <option value="__CUSTOM__">Outros</option>
                                                                                                </select>
                                                                                                {dropdownValue === '__CUSTOM__' && (
                                                                                                    <textarea
                                                                                                        placeholder="Descreva a solução..."
                                                                                                        value={solItem.value}
                                                                                                        onChange={(e) => updateSolucaoSet(item.id, idx, e.target.value, true)}
                                                                                                        style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <textarea
                                                                                                placeholder="O que deve ser feito?"
                                                                                                value={solItem.value}
                                                                                                onChange={(e) => updateSolucaoSet(item.id, idx, e.target.value, true)}
                                                                                                style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    {activeSolucoes.length > 1 && (
                                                                                        <button type="button" onClick={() => removeSolucao(item.id, idx)} style={{ color: '#e74c3c', background: 'none', border: 'none', padding: '5px' }}>
                                                                                            <X size={18} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addSolucao(item.id)}
                                                                        style={{ fontSize: '12px', color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}
                                                                    >
                                                                        <Plus size={14} /> Adicionar Solução
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </section>

                {/* ITENS INSPECIONÁVEIS ADICIONAIS */}
                <section className="form-card">
                    <div className="card-header">
                        <Info size={20} color="#7f8c8d" />
                        <h3>Análise por Componente</h3>
                    </div>
                    <p className="section-instruction">Selecione componentes específicos para detalhamento adicional.</p>
                    <button type="button" className="btn-add-comp" onClick={() => {
                        const newItem: ChecklistItem = {
                            id: crypto.randomUUID(),
                            text: '',
                            isCustom: true,
                            status: 'vermelho',
                            conformidade: null,
                            anomalia: '',
                            solucao: '',
                            fotos: [],
                            tipo: 'componente'
                        };
                        setChecklistItems([...checklistItems, newItem]);
                    }}>
                        <Plus size={18} /> Adicionar Componente
                    </button>
                </section>

                <section className="form-card">
                    <div className="card-header">
                        <Info size={20} color="#7f8c8d" />
                        <h3>Material</h3>
                    </div>
                    <div className="vedacoes-list">
                        <div className="vedacao-row header vedacao-header-row">
                            <span className="v-col-num">N°</span>
                            <span className="v-col-desc">DESCRIÇÃO DO MATERIAL</span>
                            <span className="v-col-qtd">QTD</span>
                            <span className="v-col-un">UN.</span>
                            <span className="v-col-obs">OBSERVAÇÃO</span>
                            <span className="v-col-x"></span>
                        </div>
                        {vedacoes.map((item, index) => (
                            <div key={item.id} className="vedacao-row">
                                <div className="v-col-num" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className={`status-dot-animated ${item.text.trim() !== '' ? 'verde' : 'vermelho'}`} />
                                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{index + 1}</span>
                                </div>
                                <div className="v-col-desc">
                                    <label className="mobile-label">Descrição</label>
                                    <input
                                        placeholder="Descrição do material..."
                                        value={item.text}
                                        onChange={e => {
                                            const newVedacoes = [...vedacoes];
                                            newVedacoes[index].text = e.target.value;
                                            setVedacoes(newVedacoes);
                                        }}
                                        className="vedacao-input"
                                    />
                                </div>
                                <div className="v-col-qtd">
                                    <label className="mobile-label">QTD</label>
                                    <input
                                        placeholder="Qtd"
                                        value={item.qtd}
                                        onChange={e => {
                                            const newVedacoes = [...vedacoes];
                                            newVedacoes[index].qtd = e.target.value;
                                            setVedacoes(newVedacoes);
                                        }}
                                        className="vedacao-input text-center"
                                    />
                                </div>
                                <div className="v-col-un">
                                    <label className="mobile-label">UN</label>
                                    <input
                                        placeholder="UN"
                                        value={item.unidade}
                                        onChange={e => {
                                            const newVedacoes = [...vedacoes];
                                            newVedacoes[index].unidade = e.target.value;
                                            setVedacoes(newVedacoes);
                                        }}
                                        className="vedacao-input text-center"
                                    />
                                </div>
                                <div className="v-col-obs">
                                    <label className="mobile-label">OBS</label>
                                    <input
                                        placeholder="Obs..."
                                        value={item.observacao}
                                        onChange={e => {
                                            const newVedacoes = [...vedacoes];
                                            newVedacoes[index].observacao = e.target.value;
                                            setVedacoes(newVedacoes);
                                        }}
                                        className="vedacao-input"
                                    />
                                </div>
                                <div className="v-col-x">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newVedacoes = vedacoes.filter((_, i) => i !== index);
                                            setVedacoes(newVedacoes);
                                        }}
                                        className="btn-remove-vedacao"
                                        title="Remover vedação"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" className="btn-add-comp" style={{ marginTop: '1.5rem' }} onClick={() => {
                        setVedacoes([...vedacoes, {
                            id: crypto.randomUUID(),
                            text: '',
                            qtd: '1',
                            unidade: 'PC',
                            status: 'azul',
                            conformidade: 'não conforme',
                            anomalia: '',
                            solucao: '',
                            fotos: [],
                            observacao: '',
                            tipo: 'vedação'
                        }]);
                    }}>
                        <Plus size={18} /> Adicionar Material
                    </button>
                </section>

                <div className="footer-actions">
                    <button type="button" className="btn-finalize" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Processando...' : fromWaitlist ? 'Registrar na Lista de Espera' : 'Finalizar e Registrar Peritagem'}
                    </button>
                </div>
            </form>

            {/* Inputs de arquivo invisíveis */}
            <input
                type="file"
                ref={camInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
            />
            <input
                type="file"
                ref={galleryInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={onFileChange}
            />

            {editorOpen && (
                <ImageEditor 
                    src={imageToEdit} 
                    onSave={handleSaveEditedImage}
                    onCancel={() => {
                        setEditorOpen(false);
                        setImageToEdit('');
                        setEditorTarget(null);
                    }}
                />
            )}
        </div >
    );
};
