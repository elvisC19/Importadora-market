import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center px-8 w-full h-16 z-50 bg-primary text-white border-b border-white/10 sticky top-0 shadow-md">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">store</span>
          </div>
          <span className="hidden sm:inline">Importadora Market</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-8">
          <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">Inicio</Link>
          <Link to="/productos" className="text-sm font-medium hover:text-accent transition-colors">Productos</Link>
          {user && (
            <Link to="/pedidos" className="text-sm font-medium hover:text-accent transition-colors">Mis Pedidos</Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {user.is_admin && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isAdminDropdownOpen ? 'bg-accent text-white shadow-lg' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Panel Admin
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                
                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Administración</p>
                    </div>
                    <div className="p-1">
                      <button 
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-300 cursor-not-allowed flex items-center gap-3"
                        title="Próximamente"
                      >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard
                      </button>
                      <Link 
                        to="/admin/usuarios" 
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-3 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">group</span>
                        Usuarios
                      </Link>
                      <button 
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-300 cursor-not-allowed flex items-center gap-3"
                        title="Próximamente"
                      >
                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        Inventario
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold leading-tight">{user.nombre}</span>
                <Link to="/perfil" className="text-[10px] text-slate-400 hover:text-accent transition-colors font-semibold uppercase tracking-wider">Ver Perfil</Link>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                title="Cerrar Sesión"
              >
                <span className="material-symbols-outlined text-slate-300 group-hover:text-error transition-colors">logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold hover:text-accent transition-colors">Iniciar Sesión</Link>
            <Link to="/registro" className="px-5 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
