import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (redirectPath) {
        localStorage.removeItem('redirect_after_login');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex">
        {/* Visual Side (Left) */}
        <section className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" 
              alt="Logistics" 
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          </div>
          <div className="relative z-10 p-12 flex flex-col justify-between w-full">
            <div>
              <h1 className="text-white text-4xl font-extrabold tracking-tight">
                Importadora Market
              </h1>
              <p className="text-slate-300 text-lg mt-4 max-w-md">
                Confiabilidad Institucional y Desempeño. Accede a tu panel de control de cadena de suministro global.
              </p>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 max-w-sm">
                <div className="flex items-center gap-2 mb-2 text-orange-400">
                  <span className="material-symbols-outlined">verified</span>
                  <span className="text-xs font-semibold tracking-wider uppercase">SOCIO CONFIABLE</span>
                </div>
                <p className="text-white text-sm">
                  Únete a más de 5,000 distribuidores que gestionan inventarios de alta densidad con nuestras herramientas de precisión.
                </p>
              </div>
            </div>
            <footer className="text-white/60 text-xs">
              © 2026 Importadora Market. Todos los derechos reservados.
            </footer>
          </div>
        </section>

        {/* Form Side (Right) */}
        <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
                <span className="material-symbols-outlined text-white">store</span>
              </div>
              <span className="text-2xl font-bold text-primary">Importadora Market</span>
            </div>

            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
              <p className="text-slate-500 mt-2">Por favor, ingresa tus datos para iniciar sesión.</p>
            </header>

            {message && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #B45309',
                color: '#92400E',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">Correo Electrónico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input 
                    className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                    id="email" 
                    type="email" 
                    placeholder="nombre@empresa.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">Contraseña</label>
                  <Link className="text-sm font-semibold text-accent hover:underline" to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input 
                    className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button 
                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <p className="text-center mt-8 text-slate-600">
              ¿No tienes cuenta? <Link className="text-accent font-bold hover:underline" to="/registro">Crea una cuenta</Link>
            </p>

            {/* Trust Badges */}
            <div className="mt-12 pt-12 border-t border-slate-100 grid grid-cols-3 gap-4 opacity-50">
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-slate-400">verified_user</span>
                <span className="text-[10px] uppercase tracking-wider font-bold">SSL Seguro</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-slate-400">payments</span>
                <span className="text-[10px] uppercase tracking-wider font-bold">PCI Compliant</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-slate-400">support_agent</span>
                <span className="text-[10px] uppercase tracking-wider font-bold">Soporte 24/7</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 px-12 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <span className="text-lg font-bold text-primary">Importadora Market</span>
          <p className="text-sm text-slate-500">© 2026 Importadora Market. Confiabilidad y Desempeño Institucional.</p>
        </div>
        <div className="flex gap-6">
          <Link className="text-sm text-slate-500 hover:text-primary transition-colors" to="#">Privacidad</Link>
          <Link className="text-sm text-slate-500 hover:text-primary transition-colors" to="#">Términos</Link>
          <Link className="text-sm text-slate-500 hover:text-primary transition-colors" to="#">Soporte</Link>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
