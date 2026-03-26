import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import SyncScreen from './pages/SyncScreen';
import SettingsScreen from './pages/SettingsScreen';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'sync' | 'settings'>('dashboard');

  return (
    <div className="App">
      {currentScreen === 'dashboard' && (
        <Dashboard 
          onSync={() => setCurrentScreen('sync')} 
          onSettings={() => setCurrentScreen('settings')} 
        />
      )}
      
      {currentScreen === 'sync' && (
        <SyncScreen onBack={() => setCurrentScreen('dashboard')} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />
      )}
    </div>
  );
}

export default App;
