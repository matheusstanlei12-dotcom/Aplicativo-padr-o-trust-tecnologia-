import React from 'react';
import { ShieldAlert, Battery, Smartphone } from 'lucide-react';
import './Dashboard.css';

const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="mobile-container" style={{ backgroundColor: '#1e3a8a' }}>
      <div className="dashboard-page animate-slide-up" style={{ padding: '30px' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4 }}>
            Para dispositivos Xiaomi, configure também:
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px' }}>1. Segurança &gt; Permissões</p>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Autostart - Ative para este app</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
              <Smartphone size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px' }}>2. Segurança &gt; Gerenciar Apps</p>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Este App &gt; Economizar Bateria - Sem restrições</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
              <Battery size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px' }}>3. Configurações &gt; Bateria</p>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Economizar Bateria - Adicione este app às exceções</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <img 
            src="/assets/character/thinking.png" 
            alt="Thinking Character" 
            style={{ width: '220px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
            className="animate-float"
          />
        </div>

        <button 
          onClick={onBack}
          className="glass-card" 
          style={{ 
            marginTop: '20px',
            padding: '14px',
            borderRadius: '40px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontWeight: 800,
            fontSize: '16px',
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.2, transform: 'rotate(15deg)' }}>
            <img src="/assets/logo.png" alt="" style={{ height: '30px' }} />
          </div>
          ENTENDI
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
