import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, PlayCircle, AlertCircle } from 'lucide-react';

const AguardandoPeritagem: React.FC = () => {
  const navigate = useNavigate();

  const pending = [
    { id: 1, car: 'BMW X5', plate: 'TST-1234', time: '15 min atrás', priority: 'Alta' },
    { id: 2, car: 'Audi A3', plate: 'NXX-5500', time: '1 hora atrás', priority: 'Média' },
  ];

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Pendentes</h1>
        </div>
      </header>

      <main className="px-6 py-8">
        {pending.length > 0 ? (
          <div className="space-y-6">
            {pending.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="prime-card"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-prime-blue rounded-2xl flex items-center justify-center shadow-lg">
                     <Camera className="w-7 h-7 text-prime-yellow" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.priority === 'Alta' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    Prioridade {item.priority}
                  </div>
                </div>
                
                <h3 className="text-prime-blue font-black text-xl uppercase tracking-tighter mb-1">{item.car}</h3>
                <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-8">{item.plate} • {item.time}</p>

                <button 
                  onClick={() => navigate('/nova-peritagem')}
                  className="prime-btn-primary w-full py-4 text-sm"
                >
                  <PlayCircle className="w-5 h-5" />
                  REVALIDAR PERITAGEM
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <AlertCircle className="w-16 h-16 mb-4 text-prime-blue" />
            <p className="font-black uppercase tracking-widest text-xs">Vazio</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AguardandoPeritagem;
