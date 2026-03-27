import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Key, CheckCircle, ShieldCheck } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/perfil'), 2000);
    }, 1500);
  };

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/perfil')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Segurança</h1>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="prime-card relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-prime-blue/5 rounded-2xl flex items-center justify-center mb-4 border border-prime-border">
              <Lock className="w-8 h-8 text-prime-blue" />
            </div>
            <h2 className="text-xl font-black text-prime-blue text-center uppercase tracking-tight">Alterar Senha</h2>
            <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-widest text-center mt-1">Crie uma nova chave de acesso</p>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/30 ml-1">Senha Atual</label>
                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-prime-blue/20" />
                    <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-prime-bg border border-prime-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-prime-blue focus:border-prime-blue-light outline-none transition-all"
                    />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/30 ml-1">Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-prime-blue/20" />
                    <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-prime-bg border border-prime-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-prime-blue focus:border-prime-blue-light outline-none transition-all"
                    />
                </div>
             </div>

             <button
               onClick={handleUpdate}
               disabled={loading || success}
               className="prime-btn-primary w-full mt-4"
             >
               {loading ? 'PROCESSANDO...' : success ? 'CONCLUÍDO' : 'ATUALIZAR CHAVE'}
               {success && <CheckCircle className="w-5 h-5" />}
             </button>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 justify-center opacity-20">
          <ShieldCheck className="w-4 h-4 text-prime-blue" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-prime-blue">Criptografia Ativa</span>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
