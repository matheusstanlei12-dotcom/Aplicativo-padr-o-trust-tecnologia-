import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Car, 
  ClipboardCheck
} from 'lucide-react';

const NovaPeritagem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else navigate('/');
  };

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">Nova Peritagem</h1>
            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">Passo {step} de {totalSteps}</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 flex flex-col min-h-[calc(100vh-var(--prime-header-height))]">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-prime-border rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-prime-yellow shadow-lg"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="prime-card">
                  <div className="w-14 h-14 bg-prime-blue rounded-2xl flex items-center justify-center shadow-lg mb-6">
                    <Car className="w-7 h-7 text-prime-yellow" />
                  </div>
                  <h2 className="text-2xl font-black text-prime-blue uppercase tracking-tighter mb-2">Identificação</h2>
                  <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-widest mb-10">Dados de registro do veículo.</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/40 ml-1">Placa do Veículo</label>
                        <input 
                        type="text" 
                        placeholder="ABC-1234" 
                        className="w-full bg-prime-bg border border-prime-border rounded-xl py-5 px-6 text-prime-blue font-bold focus:border-prime-blue-light focus:bg-white outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/40 ml-1">Modelo / Marca</label>
                        <input 
                        type="text" 
                        placeholder="Ex: Toyota Corolla" 
                        className="w-full bg-prime-bg border border-prime-border rounded-xl py-5 px-6 text-prime-blue font-bold focus:border-prime-blue-light focus:bg-white outline-none"
                        />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="prime-card">
                  <div className="w-14 h-14 bg-prime-blue rounded-2xl flex items-center justify-center shadow-lg mb-6">
                    <Camera className="w-7 h-7 text-prime-yellow" />
                  </div>
                  <h2 className="text-2xl font-black text-prime-blue uppercase tracking-tighter mb-2">Evidências</h2>
                  <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-widest mb-10">Capture fotos nítidas para o laudo.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                      <button key={i} className="aspect-square rounded-2xl bg-prime-bg border-2 border-dashed border-prime-border flex flex-col items-center justify-center group active:bg-white active:border-prime-blue-light transition-all">
                        <Camera className="w-8 h-8 text-prime-blue/20 group-hover:text-prime-blue-light" />
                        <span className="text-[9px] text-prime-blue/30 mt-2 font-black uppercase tracking-widest">Foto {i}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="prime-card flex flex-col items-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mb-8">
                    <ClipboardCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-prime-blue uppercase tracking-tighter mb-2">Resumo Final</h2>
                  <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-widest mb-12">Todas as informações foram validadas.</p>
                  
                  <div className="w-full prime-bg border border-prime-border p-6 rounded-2xl flex items-center justify-between">
                       <span className="text-prime-blue/40 font-black uppercase text-[10px] tracking-widest">Status da Inspeção</span>
                       <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">Apto para Envio</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={nextStep}
          className="prime-btn-primary w-full mt-10"
        >
          {step === totalSteps ? 'FINALIZAR E ENVIAR' : 'PRÓXIMO PASSO'}
          <ChevronRight className="w-6 h-6" />
        </button>
      </main>
    </div>
  );
};

export default NovaPeritagem;
