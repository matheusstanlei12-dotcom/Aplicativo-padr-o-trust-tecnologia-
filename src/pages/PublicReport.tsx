import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, FileDown } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import './PublicReport.css';

import { DatabookPDF } from '../components/DatabookPDFTemplate';
import type { PeritagemData, AnaliseItem } from '../components/DatabookPDFTemplate';

export const PublicReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [peritagem, setPeritagem] = useState<PeritagemData | null>(null);
    const [itens, setItens] = useState<AnaliseItem[]>([]);
    const [downloading, setDownloading] = useState(false);
    const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

    useEffect(() => {
        if (id) {
            fetchReportData(id);
        }
    }, [id]);

    useEffect(() => {
        if (!loading && peritagem && !autoDownloadStarted) {
            setAutoDownloadStarted(true);
            setTimeout(() => {
                handleDownloadDatabook();
            }, 1000);
        }
    }, [loading, peritagem, autoDownloadStarted]);

    const handleDownloadDatabook = async () => {
        if (!peritagem || !itens.length) return;
        setDownloading(true);
        try {
            const blob = await pdf(<DatabookPDF peritagem={peritagem} itens={itens} />).toBlob();
            const url = URL.createObjectURL(blob);

            window.location.href = url;

            setTimeout(() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = `DATABOOK_${peritagem.os_interna || peritagem.tag}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 1000);

        } catch (error) {
            console.error('Erro ao gerar databook:', error);
        } finally {
            setDownloading(false);
        }
    };

    const fetchReportData = async (reportId: string) => {
        try {
            console.log('🔍 Iniciando busca de relatório ID:', reportId);
            setLoading(true);
            const { data: pData, error: pError } = await supabase
                .from('peritagens')
                .select('*')
                .eq('id', reportId)
                .maybeSingle();

            if (pError) {
                console.error('❌ Erro Supabase ao buscar peritagem:', pError);
                throw pError;
            }

            // Se não encontrou por ID, tenta uma busca de contingência por parâmetros de busca (tag ou os)
            let peritagemData = pData;
            if (!peritagemData) {
                const queryParams = new URLSearchParams(window.location.search);
                const tag = queryParams.get('tag');
                const os = queryParams.get('os');

                if (tag || os) {
                    console.log(`🔍 Tentando busca de contingência (Tag: ${tag}, OS: ${os})...`);
                    const cleanTag = (tag || '').replace(/["']/g, '');
                    const cleanOs = (os || '').replace(/["']/g, '');
                    
                    const { data: fallbackData } = await supabase
                        .from('peritagens')
                        .select('*')
                        .or(`tag.eq.${cleanTag},os_interna.eq.${cleanOs}`)
                        .maybeSingle();
                    
                    if (fallbackData) {
                        console.log('✅ Relatório encontrado por busca de contingência!');
                        peritagemData = fallbackData;
                    }
                }
            }

            if (!peritagemData) {
                console.warn('⚠️ Relatório não encontrado ou acesso bloqueado por RLS.');
                throw new Error('RELATORIO_NAO_ENCONTRADO');
            }

            setPeritagem(peritagemData as any);
            const finalId = peritagemData.id; // Garante que itens usem o ID correto do registro encontrado

            const { data: aData, error: aError } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', finalId);

            if (aError) throw aError;

            const compItems = aData ? aData.filter(i => i.tipo === 'componente' || !i.tipo) : [];
            setItens(compItems);

        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="report-loading">
                <Loader2 className="animate-spin" size={48} color="#1a2e63" />
                <p>Carregando Relatório Técnico...</p>
            </div>
        );
    }

    if (!peritagem && !loading) {
        return (
            <div className="report-error">
                <AlertCircle size={64} color="#ef4444" />
                <h1>Relatório não encontrado</h1>
                <p>O link acessado pode estar expirado ou o ID é inválido.</p>
                <div style={{ marginTop: '20px', padding: '15px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b', maxWidth: '400px' }}>
                    <strong>Nota para o Administrador:</strong> Verifique se a peritagem existe no banco e se a política de <strong>Acesso Público (RLS)</strong> foi ativada nas tabelas 'peritagens' e 'peritagem_analise_tecnica' no painel do Supabase.
                </div>
                <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#1a2e63', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="public-report-container download-mode">
            <div className="download-center">
                <div className="brand-logo">
                    <img src="/logo.png" alt="Trust Tecnologia" />
                </div>

                <div className="status-container">
                    <Loader2 className="animate-spin" size={48} color="#1a2e63" />
                    <h2>Baixando Relatório Digital</h2>
                    <p>O seu Databook está sendo gerado e o download iniciará automaticamente em instantes.</p>
                </div>

                {!downloading && autoDownloadStarted && (
                    <div className="manual-download-box">
                        <p>O download não iniciou automaticamente?</p>
                        <button className="btn-manual" onClick={handleDownloadDatabook}>
                            <FileDown size={20} /> CLIQUE AQUI PARA BAIXAR
                        </button>
                    </div>
                )}

                <footer className="simple-footer">
                    <p>Tecnologia Trust Tecnologia</p>
                    <p className="footer-url">www.trusttecnologia.com.br</p>
                </footer>
            </div>
        </div>
    );
};
