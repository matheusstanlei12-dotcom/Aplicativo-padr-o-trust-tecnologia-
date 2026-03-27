import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, ChevronRight } from 'lucide-react';

const HistoricoPeritagem: React.FC = () => {
  const navigate = useNavigate();

  const history = [
    { id: 1, car: 'Toyota Corolla', plate: 'BRA-2E19', date: '21 Mar, 2024', status: 'Finalizado' },
    { id: 2, car: 'Honda Civic', plate: 'TRU-0X88', date: '20 Mar, 2024', status: 'Finalizado' },
    { id: 3, car: 'Jeep Compass', plate: 'NEX-9021', date: '19 Mar, 2024', status: 'Sincronizado' },
  ];

  return (
    <div className="prime-container">
      <header className="prime-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Histórico</h1>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-4">
          {history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="prime-card flex items-center gap-5 group active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-prime-bg rounded-2xl flex items-center justify-center border border-prime-border">
                <FileText className="w-7 h-7 text-prime-blue" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-prime-blue font-black text-base uppercase tracking-tight">{item.car}</h3>
                  <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
                    {item.status}
                  </span>
                </div>
                <p className="text-prime-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">
                  {item.plate} • {item.date}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-prime-border group-hover:text-prime-blue transition-colors" />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HistoricoPeritagem;
