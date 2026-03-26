import React from 'react';
import { RefreshCw } from 'lucide-react';
import './Dashboard.css'; // Reuse some basic styles if needed

const SyncScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="mobile-container" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' }}>
      <div className="dashboard-page animate-slide-up" style={{ justifyContent: 'center', height: '100vh', padding: '40px' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>
            Sincronismo realizado com sucesso!
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0' }}>
             {/* Animating Arrows */}
             <div className="animate-float" style={{ opacity: 0.8 }}>
                <RefreshCw size={80} color="white" />
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <img 
            src="/assets/character/success.png" 
            alt="Success Character" 
            style={{ width: '280px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
            className="animate-float"
          />
          <div style={{ position: 'absolute', bottom: '0', right: '40px', opacity: 0.3 }}>
             <img src="/assets/logo.png" alt="" style={{ height: '40px' }} />
          </div>
        </div>

        <button 
          onClick={onBack}
          className="glass-card" 
          style={{ 
            marginTop: '40px',
            padding: '16px 40px',
            borderRadius: '40px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontWeight: 800,
            fontSize: '18px',
            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.2, transform: 'rotate(15deg)' }}>
            <img src="/assets/logo.png" alt="" style={{ height: '30px' }} />
          </div>
          OK
        </button>
      </div>
    </div>
  );
};

export default SyncScreen;
