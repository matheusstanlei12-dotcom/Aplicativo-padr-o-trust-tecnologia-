import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Info, Map } from 'lucide-react';
import './FluxoProcesso.css';

interface Step {
    title: string;
    description: string;
    dependency?: string;
}

const STEPS: Step[] = [
    {
        title: "1. Nova Peritagem",
        description: "Tudo começa aqui! Quando o equipamento ou peça chega, o Perito recebe e cadastra no sistema. Ele faz a desmontagem, análise dimensional, visual e registra fotos de todas as anomalias encontradas. Se precisar de mais informações, ele pode salvar como 'Aguardando' para completar depois.",
    },
    {
        title: "2. Aprovação Interna (PCP)",
        description: "Com a peritagem finalizada, ela cai na área do PCP ou Gestor. Aqui, o time interno revisa tecnicamente tudo que o Perito apontou, define o que precisará ser feito e constrói o orçamento. Também é possível gerar uma prévia do relatório em PDF para enviar ao cliente.",
        dependency: "Depende da 'Nova Peritagem' ser enviada pelo Perito."
    },
    {
        title: "3. Envio ao Cliente",
        description: "O sistema disponibiliza o Relatório e Orçamento para o cliente aprovar. Ele pode acessar o portal exclusivo dele para validar fotos, anomalias e o custo.",
        dependency: "Só acontece depois do PCP finalizar a aprovação interna e fazer o contato comercial."
    },
    {
        title: "4. Liberação do Pedido",
        description: "Orçamento aprovado pelo cliente? Que maravilha! Agora o setor Comercial ou PCP marca que o pedido foi liberado. A partir deste ponto, as peças começam a ser separadas e encomendadas para a manutenção iniciar de verdade.",
        dependency: "Aguardando o 'OK' (Aprovação de Orçamento) do Cliente."
    },
    {
        title: "5. Componente em Manutenção",
        description: "Hora de pôr a mão na massa! O componente vai para usinagem, solda ou montagem. O técnico responsável (Montador) pega o tablet ou celular, olha a Ordem de Serviço (OS) e vai dando 'check' em todos os serviços realizados, garantindo a qualidade técnica da recuperação.",
        dependency: "Depende da 'Liberação de Pedido' onde as peças já foram providenciadas."
    },
    {
        title: "6. Conferência Final (Qualidade)",
        description: "Peça montada! Agora vai para a banca de teste (Inspetor da Qualidade). Lá eles fazem o teste hidrostático (pressão), validam as dimensões finais e a pintura. Tudo sendo fotografado e aprovado em check-list rigoroso para liberar pro envio.",
        dependency: "Requer que o Montador finalize os checks de 'Componente em Manutenção'."
    },
    {
        title: "7. O Databook",
        description: "Esse é o grande final com chave de ouro! Depois do fim da Conferência Final, o sistema reúne TODAS as fotos, laudos, relatórios do perito e certificados de testes num PDF gigante e incrível chamado Databook. Fica automaticamente disponível na aba do cliente!",
        dependency: "Liberado apenas após a 'Conferência Final' confirmar qualidade 100%."
    },
    {
        title: "8. A Magia do QR Code (Rastreabilidade)",
        description: "Durante todo esse processo, lembra que o Gestor ou PCP imprimiu uma etiqueta de QR Code na peça lá no início? Com esse QR Code, qualquer funcionário pode apontar a câmera na fábrica e saber exatamente em qual desses passos passados a peça está no momento. Incrível, né?",
    }
];

export const FluxoProcesso: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fluxo-container">
            <div className="fluxo-header">
                <h1>Fluxo do Processo</h1>
                <p>O Assistente Trust ensina passo-a-passo como nosso sistema e fluxo de manutenção conversam!</p>
            </div>

            {/* BARRA DE PROGRESSO */}
            <div className="progress-container">
                <div className="progress-track">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
                <div className="step-indicators">
                    {STEPS.map((_, index) => (
                        <div 
                            key={index}
                            className={`step-dot ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                            onClick={() => setCurrentStep(index)}
                            title={`Ir para etapa ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* CENA INTERATIVA COM AVATAR */}
            <div className="scene-container">
                <div className="scene-bg-decorator" />
                
                <div className="avatar-section">
                    <div className="avatar-glow" />
                    <div className="trusty-avatar talking">
                        <img src="/logo.png" alt="Trust Assistente" />
                    </div>
                </div>

                <div className="speech-bubble-container">
                    {/* KEY para forçar re-render da bolha e reiniciar a animação ao trocar de passo */}
                    <div className="speech-bubble" key={currentStep}>
                        <div className="speech-title">
                            <Map size={24} color="var(--primary)" />
                            {STEPS[currentStep].title}
                        </div>
                        
                        <p className="speech-text">
                            {STEPS[currentStep].description}
                        </p>

                        {STEPS[currentStep].dependency && (
                            <div className="speech-dependency">
                                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span><strong>Pré-requisito:</strong> {STEPS[currentStep].dependency}</span>
                            </div>
                        )}

                        <div className="flow-controls">
                            <button 
                                className="btn-nav btn-prev" 
                                onClick={handlePrev} 
                                disabled={currentStep === 0}
                            >
                                <ArrowLeft size={18} /> Anterior
                            </button>
                            <button 
                                className="btn-nav btn-next" 
                                onClick={handleNext} 
                                disabled={currentStep === STEPS.length - 1}
                            >
                                Próximo <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
