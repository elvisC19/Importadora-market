import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast('Falta el token de recuperación en la URL.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password
      });
      showToast('¡Contraseña restablecida correctamente!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error in reset-password request:', err);
      const errorMsg = err.response?.data?.detail || 'Hubo un problema al restablecer tu contraseña.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 relative">
      {/* Toast Notice */}
      {toast.show && (
        <div className={`fixed top-20 right-5 md:right-1/2 md:translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold animate-in slide-in-from-top duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p>{toast.message}</p>
        </div>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-100 animate-in fade-in duration-300">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-primary flex items-center justify-center rounded-2xl mb-4 border border-blue-100 shadow-sm">
            <span className="material-symbols-outlined text-3xl">key</span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">Establecer nueva contraseña</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Elige una nueva contraseña segura para tu cuenta.
          </p>
        </div>

        {!token ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center font-semibold">
              El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.
            </div>
            <Link 
              to="/recuperar-contrasena" 
              className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nueva Contraseña */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block" htmlFor="password">
                Nueva Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                  lock
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium" 
                  id="password" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                  lock_open
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium" 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Repite la contraseña" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              className="w-full py-3.5 bg-primary hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
