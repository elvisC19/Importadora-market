import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    return /^[67]\d{7}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    if (formData.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    if (formData.telefono && !validatePhone(formData.telefono)) {
      return setError('El teléfono debe ser un número boliviano válido (8 dígitos, empieza con 6 o 7).');
    }

    setLoading(true);
    try {
      await register(formData.nombre, formData.email, formData.password, formData.telefono, 'cliente');
      // Auto login
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse. El correo podría estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex">
        {/* Visual Side (Left) - Same as Login */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" 
              alt="Logistics" 
              className="object-cover w-full h-full opacity-50 mix-blend-overlay"
            />
          </div>
          <div className="relative z-10 p-12 flex flex-col justify-between w-full">
            <div>
              <h1 className="text-white text-4xl font-extrabold tracking-tight">
                Importadora Market
              </h1>
              <p className="text-slate-300 text-lg mt-4 max-w-md">
                Crea tu cuenta institucional y comienza a optimizar tu flujo de importaciones hoy mismo.
              </p>
            </div>
            <footer className="text-white/60 text-xs">
              © 2026 Importadora Market. Todos los derechos reservados.
            </footer>
          </div>
        </section>

        {/* Form Side (Right) */}
        <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Crear cuenta</h2>
              <p className="text-slate-500 mt-2">Únete a nuestra red de distribución global.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="nombre">Nombre Completo</label>
                <input 
                  className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="nombre" 
                  type="text" 
                  placeholder="Ej. Juan Pérez" 
                  value={formData.nombre}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">Correo Electrónico</label>
                <input 
                  className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="email" 
                  type="email" 
                  placeholder="nombre@empresa.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="telefono">Teléfono (Bolivia)</label>
                <input 
                  className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="telefono" 
                  type="tel" 
                  placeholder="71234567" 
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">Contraseña</label>
                  <input 
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">Confirmar</label>
                  <input 
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <button 
                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </form>

            <p className="text-center mt-8 text-slate-600">
              ¿Ya tienes cuenta? <Link className="text-accent font-bold hover:underline" to="/login">Inicia sesión</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
