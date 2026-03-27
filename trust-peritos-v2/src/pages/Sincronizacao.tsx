import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, Cloud, Database, CheckCircle2 } from 'lucide-react';

const Sincronizacao: React.FC = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startSync = () => {
    setSyncing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Sincronização</h1>
        </div>
      </header>

      <main className="px-6 py-10 flex flex-col items-center">
        <div className="w-full prime-card flex flex-col items-center mb-10 py-12">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${syncing ? 'bg-prime-blue/5' : progress === 100 ? 'bg-emerald-50' : 'bg-prime-blue/5'}`}>
              {syncing ? (
                <RefreshCw className="w-12 h-12 text-prime-blue-light animate-spin" />
              ) : progress === 100 ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              ) : (
                <Cloud className="w-12 h-12 text-prime-blue" />
              )}
           </div>
           
           <h2 className="text-2xl font-black text-prime-blue mb-2">
             {syncing ? 'SINCRO' : progress === 100 ? 'CONCLUÍDO' : 'PRONTO'}
           </h2>
           <p className="text-prime-text-muted text-center text-[10px] font-bold uppercase tracking-widest px-10">
             {syncing ? 'Conectando aos servidores da Trust Tecnologia' : 'Base de dados local está atualizada.'}
           </p>

           {syncing && (
             <div className="w-full mt-12 px-4 space-y-3">
               <div className="flex justify-between text-[9px] font-black text-prime-blue-light uppercase tracking-[0.2em]">
                 <span>Progresso</span>
                 <span>{progress}%</span>
               </div>
               <div className="w-full h-1.5 bg-prime-bg rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-prime-blue-light shadow-lg"
                 />
               </div>
             </div>
           )}
        </div>

        <div className="w-full space-y-4">
           <div className="prime-card flex items-center gap-5">
              <Database className="w-6 h-6 text-indigo-500" />
              <div className="flex-1">
                <p className="text-prime-blue font-black text-sm uppercase">Buffer Local</p>
                <p className="text-prime-text-muted text-[9px] font-bold uppercase tracking-widest">12 Arquivos pendentes</p>
              </div>
           </div>
        </div>

        <button
          onClick={startSync}
          disabled={syncing}
          className="prime-btn-primary w-full mt-10"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'SINCRONIZAR AGORA'}
        </button>
      </main>
    </div>
  );
};

export default Sincronizacao;
