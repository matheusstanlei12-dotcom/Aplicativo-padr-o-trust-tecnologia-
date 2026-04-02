import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Clock, 
  History, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  Book,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'new', title: 'Nova Peritagem', subtitle: 'Iniciar nova vistoria', icon: FilePlus, color: 'text-prime-blue-light', path: '/nova-peritagem' },
    { id: 'pending', title: 'Aguardando', subtitle: '3 peritagens pendentes', icon: Clock, color: 'text-amber-500', path: '/aguardando' },
    { id: 'history', title: 'Histórico', subtitle: 'Vistorias finalizadas', icon: History, color: 'text-emerald-500', path: '/historico' },
    { id: 'databook', title: 'Databook', subtitle: 'Documentos técnicos', icon: Book, color: 'text-prime-blue-light', path: '/databook' },
    { id: 'sync', title: 'Sincronizar', subtitle: 'Nuvem Trust Tecnologia', icon: RefreshCw, color: 'text-indigo-500', path: '/sincronizacao' },
    { id: 'profile', title: 'Meu Perfil', subtitle: 'Matheus Stanley', icon: User, color: 'text-slate-500', path: '/perfil' },
  ];

  return (
    <div className="prime-container pb-10">
      {/* Prime Header */}
      <header className="prime-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-6 h-6 text-prime-yellow" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">TRUST</h1>
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Tecnologia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 opacity-60">
           <Signal className="w-4 h-4" />
           <Wifi className="w-4 h-4" />
           <Battery className="w-4 h-4" />
        </div>
      </header>

      <main className="px-6 pt-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-prime-text-muted text-[10px] font-black uppercase tracking-[0.2em]">Bem-vindo,</p>
              <h2 className="text-2xl font-black text-prime-blue tracking-tight">Matheus Stanley</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-prime-blue/5 border border-prime-border flex items-center justify-center">
               <User className="w-6 h-6 text-prime-blue/30" />
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-prime-yellow to-transparent rounded-full" />
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="prime-card flex items-center gap-5 group active:scale-[0.98] relative overflow-hidden"
            >
              <div className={`w-14 h-14 bg-prime-bg rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors border border-prime-border`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-prime-blue font-black text-base uppercase tracking-tight">{item.title}</h3>
                <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-wider">{item.subtitle}</p>
              </div>

              <ChevronRight className="w-5 h-5 text-prime-border group-hover:text-prime-blue-light transition-colors" />
              
              {/* Highlight bar for 'new' */}
              {item.id === 'new' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-prime-yellow" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Terminal Info */}
        <div className="mt-12 flex flex-col items-center opacity-30">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Conectado ao Servidor Trust</span>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-widest leading-none">V13.0.0 Prime • Terminal Ativo</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
