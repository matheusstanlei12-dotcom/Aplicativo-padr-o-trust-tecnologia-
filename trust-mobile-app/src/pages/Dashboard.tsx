import React from 'react';
import { 
  Bell, 
  MapPin, 
  Wifi, 
  HardDrive, 
  RefreshCw, 
  CloudUpload,
  CheckCircle,
  Menu,
  Star,
  Home,
  Check,
  ClipboardList,
  History,
  SendHorizontal
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  onSync: () => void;
  onSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSync, onSettings }) => {
  return (
    <div className="mobile-container">
      <div className="dashboard-page">
        {/* Header */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="icon-btn">
              <Menu size={28} />
            </button>
            <button className="icon-btn">
              <Home size={28} />
            </button>
          </div>
          
          <div className="header-center">
            <span style={{ color: 'white', fontWeight: 800 }}>
              INSPECT<small style={{ display: 'inline', fontSize: '12px' }}>APP</small>
              <small style={{ display: 'block', fontSize: '8px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 400 }}>
                Formulários Inteligentes
              </small>
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="icon-btn" onClick={onSettings}>
              <Star size={28} />
            </button>
            <button className="icon-btn" style={{ position: 'relative' }} onClick={onSettings}>
              <Bell size={28} />
              <div style={{ 
                position: 'absolute', 
                top: '4px', 
                right: '4px', 
                background: '#22c55e', 
                color: 'white', 
                borderRadius: '50%', 
                width: '18px', 
                height: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '10px', 
                border: '2px solid #2d2b7c',
                fontWeight: 700
              }}>0</div>
            </button>
          </div>
        </header>

        {/* User Card */}
        <div className="user-card-container">
          <div className="user-card">
            <div className="user-header">
              <div className="avatar-wrapper">
                <img src="/assets/character/welcome.png" alt="User" />
              </div>
              <div className="user-greeting">
                <h3 style={{ margin: 0 }}>Bem-vindo,</h3>
                <h2 style={{ margin: 0 }}>[Trust] Matheus</h2>
              </div>
            </div>

            <p className="card-intro">
               Tenho algumas informações importantes para você:
            </p>

            <div className="status-grid">
              <div className="status-item active">
                <div className="status-icon-box">
                  <MapPin size={28} strokeWidth={1.5} />
                  <div className="check-badge">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <span>GPS</span>
                <small>ATIVADO</small>
              </div>
              
              <div className="status-item active">
                <div className="status-icon-box">
                  <Wifi size={28} strokeWidth={1.5} />
                  <div className="check-badge">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <span>WI-FI</span>
                <small>ATIVADO</small>
              </div>

              <div className="status-item active">
                <div className="status-icon-box">
                  <HardDrive size={28} strokeWidth={1.5} />
                  <div className="check-badge">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <span>ESPAÇO</span>
                <small>0 de 0</small>
              </div>
            </div>

            {/* Sync Flow */}
            <div className="sync-grid">
              <div className="sync-item">
                <RefreshCw size={24} color="#94a3b8" />
                <span>BUSCAR FORMULÁRIOS</span>
                <small>ÚLTIMA: HOJE</small>
                <button className="btn-sync" onClick={onSync}>ATUAL.</button>
              </div>
              <div className="sync-item">
                <CloudUpload size={24} color="#94a3b8" />
                <span>BACKUP DO APP</span>
                <small>ÚLTIMA: NENHUM</small>
                <button className="btn-sync" style={{ background: '#5250a1' }} onClick={onSync}>FAZER</button>
              </div>
            </div>
          </div>

          <div className="floating-character">
            <img src="/assets/character/welcome.png" alt="" />
          </div>
        </div>

        <div className="actions-section">
           <p className="section-title">
             Gerencie suas atividades através das funcionalidades abaixo:
           </p>

           <div className="action-grid">
              <div className="action-card" onClick={onSync}>
                 <div className="action-badge">1</div>
                 <div className="action-icon">
                    <ClipboardList size={22} />
                 </div>
                 <div className="action-info">
                    <span>CONTRATOS</span>
                 </div>
              </div>

              <div className="action-card">
                 <div className="action-badge">0</div>
                 <div className="action-icon">
                    <History size={22} />
                 </div>
                 <div className="action-info">
                    <span>EM PREENCHIMENTO</span>
                 </div>
              </div>

              <div className="action-card disabled" style={{ background: '#bbdefb' }}>
                 <div className="action-badge">0</div>
                 <div className="action-icon">
                    <SendHorizontal size={22} />
                 </div>
                 <div className="action-info" style={{ color: '#1e3a8a' }}>
                    <span>AGUARDANDO ENVIO</span>
                 </div>
              </div>

              <div className="action-card disabled" style={{ background: '#bbdefb' }}>
                 <div className="action-badge">8</div>
                 <div className="action-icon">
                    <CheckCircle size={22} />
                 </div>
                 <div className="action-info" style={{ color: '#1e3a8a' }}>
                    <span>CONCLUÍDOS (ONLINE)</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
