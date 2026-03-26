import React from 'react';
import './SyncScreen.css';

const SyncScreen: React.FC = () => {
  return (
    <div className="sync-screen-container">
      <h1 className="sync-title">Sincronismo realizado com sucesso!</h1>
      
      <div className="character-sync-box">
        {/* Animated Arrows */}
        <div className="sync-arrow arrow-left">
           <img src="/sync_arrow_left.png" alt="arrow" className="arrow-img" />
        </div>
        
        <img src="/assets/character/success.png" alt="Success" className="sync-character animate-float" />

        <div className="sync-arrow arrow-right">
           <img src="/sync_arrow_right.png" alt="arrow" className="arrow-img" />
        </div>
      </div>

      <button className="btn-primary ok-btn">OK</button>
    </div>
  );
};

export default SyncScreen;
