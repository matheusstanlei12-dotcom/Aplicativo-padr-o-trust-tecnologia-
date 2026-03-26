import React from 'react';
import { Navigation, Wifi, Database, MapPin, Star, Bell, LayoutGrid, ClipboardList, PenTool, Send, CheckCircle2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container animate-slide-up">
      {/* Header */}
      <header className="dashboard-header">
        <button className="icon-btn"><LayoutGrid size={24} /></button>
        <div className="header-logo">
          <div className="logo-icon">
            <CheckCircle2 color="#06b6d4" size={32} />
          </div>
          <span className="logo-text">TRUST <small>FIELD</small></span>
        </div>
        <div className="header-actions">
          <button className="icon-btn"><Star size={24} /></button>
          <div className="notif-badge">
            <Bell size={24} />
            <span className="badge">0</span>
          </div>
        </div>
      </header>

      {/* User Status Card */}
      <div className="user-status-card glass-card">
        <div className="user-info">
          <div className="user-avatar">
            <img src="/avatar-placeholder.png" alt="Avatar" />
          </div>
          <div className="user-greeting">
            <h3>Bem-vindo,</h3>
            <h2>[Matheus] Stanley</h2>
          </div>
        </div>

        <div className="info-text">
            Tenho algumas informações importantes para você:
        </div>

        <div className="status-indicators">
          <div className="status-item active">
            <div className="status-icon"><MapPin size={24} /></div>
            <span>GPS</span>
            <small>ATIVADO</small>
          </div>
          <div className="status-item active">
            <div className="status-icon"><Wifi size={24} /></div>
            <span>WI-FI</span>
            <small>ATIVADO</small>
          </div>
          <div className="status-item">
            <div className="status-icon"><Database size={24} /></div>
            <span>ESPAÇO</span>
            <small>128 GB</small>
          </div>
        </div>

        <div className="sync-actions">
           <div className="sync-item">
              <div className="sync-icon rotate"><Navigation size={20} /></div>
              <span>BUSCAR DADOS</span>
              <small>ATUAL.</small>
           </div>
           <div className="sync-item">
              <div className="sync-icon"><Database size={20} /></div>
              <span>BACKUP</span>
              <small>FAZER</small>
           </div>
        </div>
      </div>

      <p className="section-title">Gerencie suas atividades:</p>

      {/* Action Grid */}
      <div className="action-grid">
        <button className="action-btn">
          <div className="btn-icon bg-blue"><ClipboardList size={28} /></div>
          <span>CONTRATOS</span>
          <span className="btn-count">1</span>
        </button>
        <button className="action-btn">
          <div className="btn-icon bg-green"><PenTool size={28} /></div>
          <span>EM PREENCHIMENTO</span>
          <span className="btn-count">0</span>
        </button>
        <button className="action-btn">
          <div className="btn-icon bg-yellow"><Navigation size={28} /></div>
          <span>AGUARDANDO ENVIO</span>
          <span className="btn-count">0</span>
        </button>
        <button className="action-btn">
          <div className="btn-icon bg-gray"><CheckCircle2 size={28} /></div>
          <span>CONCLUÍDOS</span>
          <span className="btn-count">0</span>
        </button>
      </div>

      {/* Floating Character */}
      <div className="floating-character-container">
          <img 
            src="/assets/character/welcome.png" 
            alt="Trust Character" 
            className="floating-character animate-float" 
          />
      </div>
    </div>
  );
};

export default Dashboard;
