import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import { NovaPeritagem } from './pages/NovaPeritagem';
import SyncScreen from './pages/SyncScreen';
import SettingsScreen from './pages/SettingsScreen';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard onSync={() => navigate('/sync')} onSettings={() => navigate('/settings')} />} />
        <Route path="/sync" element={<SyncScreen onBack={() => navigate('/dashboard')} />} />
        <Route path="/settings" element={<SettingsScreen onBack={() => navigate('/dashboard')} />} />
        <Route path="/nova-peritagem" element={<NovaPeritagem />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
