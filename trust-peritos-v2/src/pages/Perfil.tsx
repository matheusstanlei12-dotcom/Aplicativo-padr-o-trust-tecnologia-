import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Shield, Info, Settings, LogOut, ChevronRight } from 'lucide-react';

const Perfil: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Meu Perfil</h1>
        </div>
      </header>

      <main className="px-6 py-10">
        <section className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 rounded-full bg-prime-blue/5 border-2 border-prime-border p-1 mb-4">
            <div className="w-full h-full rounded-full bg-prime-blue flex items-center justify-center">
              <User className="w-12 h-12 text-prime-yellow" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-prime-blue tracking-tight">Matheus Stanley</h2>
          <p className="text-prime-text-muted text-[10px] uppercase font-black tracking-widest mt-1">Perito Credenciado • Alpha-01</p>
        </section>

        <div className="space-y-4">
          <div className="prime-card flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-prime-blue/5 flex items-center justify-center border border-prime-border">
              <Shield className="w-6 h-6 text-prime-blue" />
            </div>
            <div>
              <p className="text-prime-blue font-black text-sm uppercase">Credenciais Trust</p>
              <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-wider">Acesso Master</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/alterar-senha')}
            className="prime-card w-full flex items-center gap-5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-prime-blue/5 flex items-center justify-center border border-prime-border group-hover:bg-prime-blue transition-colors">
              <Settings className="w-6 h-6 text-prime-blue group-hover:text-prime-yellow transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-prime-blue font-black text-sm uppercase">Segurança</p>
              <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-wider">Alterar senha de acesso</p>
            </div>
            <ChevronRight className="w-5 h-5 text-prime-border transition-colors group-hover:text-prime-blue" />
          </button>

          <div className="prime-card flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-prime-blue/5 flex items-center justify-center border border-prime-border">
              <Info className="w-6 h-6 text-prime-blue" />
            </div>
            <div>
              <p className="text-prime-blue font-black text-sm uppercase">Versão do Sistema</p>
              <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-wider">v13.0.0 Prime Delivery</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="w-full mt-12 py-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Encerrar Sessão
        </button>
      </main>
    </div>
  );
};

export default Perfil;
