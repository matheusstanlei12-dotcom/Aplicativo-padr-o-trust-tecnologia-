import React from 'react';
import './Dashboard.css';

const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="mobile-container" style={{ background: '#2d2b7c' }}>
      <div className="dashboard-page" style={{ background: 'transparent', padding: '40px 20px', alignItems: 'center' }}>
        <p style={{ color: 'white', fontSize: '18px', textAlign: 'center', fontWeight: 600, lineHeight: 1.4, marginBottom: '20px' }}>
          Para evitar perda de dados e travamentos, especialmente em dispositivos Xiaomi e Motorola, é necessário desativar a otimização de bateria para este aplicativo.
        </p>
        
        <p style={{ color: 'white', fontSize: '16px', textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
          Isso garante que o app funcione corretamente em segundo plano.
        </p>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
           <img 
             src="/assets/character/thinking.png" 
             alt="" 
             style={{ width: '80%', height: 'auto' }} 
           />
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: 'auto' }}>
           <button 
             onClick={onBack}
             style={{ 
               flex: 1,
               background: '#94a3b8', 
               color: 'white', 
               border: 'none', 
               borderRadius: '40px', 
               padding: '16px 0', 
               fontSize: '14px', 
               fontWeight: 800
             }}
           >
             AGORA NÃO
           </button>
           <button 
             onClick={onBack}
             style={{ 
               flex: 1,
               background: '#22c55e', 
               color: 'white', 
               border: 'none', 
               borderRadius: '40px', 
               padding: '16px 0', 
               fontSize: '14px', 
               fontWeight: 800
             }}
           >
             CONFIGURAR
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
