import React from 'react';
import { RefreshCw } from 'lucide-react';
import './Dashboard.css';

const SyncScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="mobile-container" style={{ background: '#2d2b7c' }}>
      <div className="dashboard-page" style={{ background: 'transparent', padding: '40px 20px', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '24px', textAlign: 'center', fontWeight: 700, marginBottom: '20px' }}>
          Sincronismo realizado com sucesso!
        </h1>

        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
           <img 
             src="/assets/character/success.png" 
             alt="" 
             style={{ width: '80%', height: 'auto', zIndex: 5 }} 
           />
           {/* Decorative arrows would go here - using Refresh icon as placeholder */}
           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}>
              <RefreshCw size={200} color="white" />
           </div>
        </div>

        <button 
          onClick={onBack}
          style={{ 
            background: '#22c55e', 
            color: 'white', 
            border: 'none', 
            borderRadius: '40px', 
            padding: '16px 80px', 
            fontSize: '18px', 
            fontWeight: 800,
            marginTop: 'auto',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SyncScreen;
