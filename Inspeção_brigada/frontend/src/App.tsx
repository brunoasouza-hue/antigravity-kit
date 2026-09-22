import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Equipamentos } from './pages/Equipamentos';
import { FichaTecnica } from './pages/FichaTecnica';
import { CadastroUsuario } from './pages/CadastroUsuario';
import { Usuarios } from './pages/Usuarios';
import { NovaVistoria } from './pages/NovaVistoria';
import { HistoricoVistorias } from './pages/HistoricoVistorias';
import { Relatorios } from './pages/Relatorios';

const ProtectedLayout: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, token, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-xs text-slate-500">
        Carregando sessão...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/inventario"
            element={
              <ProtectedLayout>
                <Equipamentos />
              </ProtectedLayout>
            }
          />

          <Route
            path="/equipamentos"
            element={
              <ProtectedLayout>
                <Equipamentos />
              </ProtectedLayout>
            }
          />

          <Route
            path="/ficha/:codigo"
            element={
              <ProtectedLayout>
                <FichaTecnica />
              </ProtectedLayout>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ProtectedLayout adminOnly>
                <Usuarios />
              </ProtectedLayout>
            }
          />

          <Route
            path="/cadastro-usuario"
            element={
              <ProtectedLayout adminOnly>
                <CadastroUsuario />
              </ProtectedLayout>
            }
          />

          <Route
            path="/vistoria"
            element={
              <ProtectedLayout>
                <NovaVistoria />
              </ProtectedLayout>
            }
          />

          <Route
            path="/historico"
            element={
              <ProtectedLayout>
                <HistoricoVistorias />
              </ProtectedLayout>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ProtectedLayout>
                <Relatorios />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
