import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, History, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-lg border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-mono tracking-tighter uppercase">Hub</span>
        </NavLink>

        <NavLink 
          to="/aguardando" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`
          }
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-mono tracking-tighter uppercase">Pending</span>
        </NavLink>

        <NavLink 
          to="/historico" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`
          }
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-mono tracking-tighter uppercase">Logs</span>
        </NavLink>

        <NavLink 
          to="/perfil" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#10b981]' : 'text-slate-500'}`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-mono tracking-tighter uppercase">Access</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
