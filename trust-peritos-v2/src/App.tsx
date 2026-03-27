import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const NovaPeritagem = React.lazy(() => import('./pages/NovaPeritagem'));
const AguardandoPeritagem = React.lazy(() => import('./pages/AguardandoPeritagem'));
const HistoricoPeritagem = React.lazy(() => import('./pages/HistoricoPeritagem'));
const Perfil = React.lazy(() => import('./pages/Perfil'));
const Sincronizacao = React.lazy(() => import('./pages/Sincronizacao'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) return <div className="mobile-container" style={{ justifyContent: 'center', alignItems: 'center', color: 'white' }}>Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="mobile-container" style={{ justifyContent: 'center', alignItems: 'center', color: 'white' }}>Iniciando...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/nova-peritagem" 
              element={
                <PrivateRoute>
                  <NovaPeritagem />
                </PrivateRoute>
              } 
            />

            <Route path="/aguardando" element={<PrivateRoute><AguardandoPeritagem /></PrivateRoute>} />
            <Route path="/historico" element={<PrivateRoute><HistoricoPeritagem /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/sincronizacao" element={<PrivateRoute><Sincronizacao /></PrivateRoute>} />
            <Route path="/alterar-senha" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
