import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      // Requerimiento: Mostrar éxito siempre para evitar enumeración, 
      // pero internamente podemos registrar el error si queremos.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h2>
          <p className="text-slate-500 mt-2">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
              Si el correo está registrado en nuestro sistema, recibirás un enlace de recuperación en breve.
            </div>
            <Link 
              to="/login" 
              className="w-full h-12 bg-primary text-white font-bold rounded-lg flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Correo Electrónico</label>
              <input 
                className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                id="email" 
                type="email" 
                placeholder="nombre@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button 
              className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-primary">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
