import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
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
    if (!email.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      const message = response.data?.message || 'Si el correo está registrado, recibirás un enlace de recuperación en breve.';
      showToast(message, 'success');
      setEmail('');
    } catch (err) {
      console.error('Error in forgot-password request:', err);
      const errorMsg = err.response?.data?.detail || 'Hubo un error al procesar tu solicitud.';
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
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">¿Olvidaste tu contraseña?</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Ingresa tu dirección de correo electrónico registrado y te enviaremos las instrucciones de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                mail
              </span>
              <input 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium" 
                id="email" 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Enviando enlace...
              </>
            ) : (
              'Enviar Enlace'
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
