import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ChevronRight, Fingerprint } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-prime-blue flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-prime-blue-light rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-prime-blue-light rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-prime-blue rounded-2xl flex items-center justify-center mb-6 shadow-xl">
             <ShieldCheck className="w-10 h-10 text-prime-yellow" />
          </div>
          <h1 className="text-3xl font-black text-prime-blue tracking-tight text-center leading-none">TRUST</h1>
          <p className="text-sm font-bold text-prime-blue/60 tracking-[0.3em] uppercase mt-1">TECNOLOGIA</p>
          <div className="w-12 h-1 bg-prime-yellow mt-4 rounded-full" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/40 ml-1">Identificador</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-prime-blue/30 group-focus-within:text-prime-blue-light transition-colors" />
              <input 
                type="text" 
                placeholder="E-mail ou ID" 
                className="w-full bg-prime-bg border border-prime-border rounded-xl py-4 pl-12 pr-4 text-prime-blue font-semibold placeholder:text-prime-blue/20 focus:border-prime-blue-light focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-prime-blue/40 ml-1">Chave de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-prime-blue/30 group-focus-within:text-prime-blue-light transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-prime-bg border border-prime-border rounded-xl py-4 pl-12 pr-4 text-prime-blue font-semibold placeholder:text-prime-blue/20 focus:border-prime-blue-light focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="prime-btn-primary w-full mt-2"
          >
            {loading ? 'Sincronizando...' : 'ACESSAR SISTEMA'}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-prime-border flex flex-col items-center gap-6">
           <button className="flex items-center gap-2 text-prime-blue/40 text-[10px] font-bold uppercase tracking-widest hover:text-prime-blue-light transition-colors">
             <Fingerprint className="w-4 h-4" />
             Acesso Biométrico
           </button>
           
           <p className="text-[9px] font-bold text-prime-blue/30 uppercase tracking-[0.2em]">Conectando o seu negócio</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
