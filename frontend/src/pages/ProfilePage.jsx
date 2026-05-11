import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await api.put('/users/me', formData);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error al actualizar el perfil.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-full text-2xl font-bold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
            <p className="text-slate-500">Gestiona tu información personal y de contacto.</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="nombre">Nombre Completo</label>
            <input 
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
              id="nombre" 
              type="text" 
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
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="telefono">Teléfono</label>
            <input 
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
              id="telefono" 
              type="tel" 
              value={formData.telefono || ''}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button 
              className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
