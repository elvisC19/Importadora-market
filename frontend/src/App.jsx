import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import Navbar from './components/layout/Navbar';



const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<div className="p-8 text-2xl font-bold text-primary">Importadora Market - Storefront</div>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/pedidos" element={<div className="p-8">Mis Pedidos</div>} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<div className="p-8">Admin Dashboard - Resumen</div>} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>

    </QueryClientProvider>
  );
}

export default App;
