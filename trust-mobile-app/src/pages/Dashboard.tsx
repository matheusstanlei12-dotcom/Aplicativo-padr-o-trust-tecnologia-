import React from 'react';
import { 
  Bell, 
  MapPin, 
  Wifi, 
  HardDrive, 
  RefreshCw, 
  CloudUpload,
  FileText,
  Clock,
  Send,
  CheckCircle,
  Menu,
  Star
} from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="mobile-container">
      <div className="dashboard-page animate-slide-up">
        {/* Header */}
        <header className="dashboard-header">
          <button className="icon-btn">
            <Menu size={24} />
          </button>
          
          <div className="header-logo">
            <img src="/assets/logo.png" alt="Trust Logo" style={{ height: '32px', marginBottom: '4px' }} />
            <span style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase', color: 'white' }}>
              Formulários Inteligentes
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="icon-btn">
              <Star size={20} />
            </button>
            <button className="icon-btn" style={{ position: 'relative' }}>
              <Bell size={20} />
              <div className="badge-count" style={{ top: '-4px', right: '-4px', border: '2px solid var(--primary)' }}>3</div>
            </button>
          </div>
        </header>

        {/* User Status Card */}
        <div className="user-card glass-card">
          <div className="user-info">
            <div className="avatar-wrapper">
              <img src="/assets/character/welcome.png" alt="User Avatar" />
            </div>
            <div className="user-greeting">
              <h3>Bem-vindo,</h3>
              <h2>[Trust] Matheus</h2>
            </div>
            <div style={{ marginLeft: 'auto', opacity: 0.2 }}>
               <img src="/assets/logo.png" alt="" style={{ height: '30px' }} />
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0' }}>
            Tenho algumas informações importantes para você:
          </p>

          <div className="status-grid">
            <div className="status-item active" style={{ position: 'relative' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '12px' }}>
                <MapPin size={22} />
              </div>
              <span>GPS</span>
              <small>ATIVADO</small>
            </div>
            <div className="status-item active">
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '12px' }}>
                <Wifi size={22} />
              </div>
              <span>WI-FI</span>
              <small>ATIVADO</small>
            </div>
            <div className="status-item">
              <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '8px', borderRadius: '12px' }}>
                <HardDrive size={22} />
              </div>
              <span>ESPAÇO</span>
              <small>0 de 0</small>
            </div>
          </div>

          <div className="sync-row">
            <div className="sync-button" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.1, transform: 'rotate(15deg)' }}>
                <img src="/assets/logo.png" alt="" style={{ height: '25px' }} />
              </div>
              <RefreshCw size={18} color="var(--primary)" />
              <span>BUSCAR FORMULÁRIOS</span>
              <small>ÚLTIMA: HOJE</small>
            </div>
            <div className="sync-button" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.1, transform: 'rotate(15deg)' }}>
                <img src="/assets/logo.png" alt="" style={{ height: '25px' }} />
              </div>
              <CloudUpload size={18} color="var(--primary)" />
              <span>BACKUP DO APP</span>
              <small>ÚLTIMA: NENHUM</small>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'white', textAlign: 'center', marginTop: '10px', opacity: 0.9 }}>
          Gerencie suas atividades através das funcionalidades abaixo:
        </p>

        {/* Action Grid */}
        <div className="action-grid">
          <div className="action-card glass-card">
            <div className="badge-count">1</div>
            <div className="icon-box bg-blue">
              <FileText size={24} />
            </div>
            <span>CONTRATOS</span>
          </div>

          <div className="action-card glass-card">
            <div className="badge-count">0</div>
            <div className="icon-box bg-green">
              <Clock size={24} />
            </div>
            <span>EM PREENCHIMENTO</span>
          </div>

          <div className="action-card glass-card">
            <div className="badge-count">0</div>
            <div className="icon-box bg-yellow">
              <Send size={24} />
            </div>
            <span>AGUARDANDO ENVIO</span>
          </div>

          <div className="action-card glass-card">
            <div className="badge-count">8</div>
            <div className="icon-box bg-purple">
              <CheckCircle size={24} />
            </div>
            <span>CONCLUÍDOS (ONLINE)</span>
          </div>
        </div>

        {/* Floating Character */}
        <div className="character-box animate-float">
          <img src="/assets/character/welcome.png" alt="Character" className="character-img" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
