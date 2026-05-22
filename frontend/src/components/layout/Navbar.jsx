import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isImportadora } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isImportadoraDropdownOpen, setIsImportadoraDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const adminDropdownRef = useRef(null);
  const importadoraDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigate(`/productos?nombre=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
      if (importadoraDropdownRef.current && !importadoraDropdownRef.current.contains(event.target)) {
        setIsImportadoraDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex justify-between items-center px-margin-desktop w-full h-16 z-50 bg-surface border-b border-outline-variant fixed top-0 select-none">
      {/* Brand logo & Main Navigation */}
      <div className="flex items-center gap-stack-md">
        <Link to="/" className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed">
          Importadora Market
        </Link>
        <nav className="hidden md:flex items-center gap-stack-lg ml-stack-xl">
          <Link 
            to="/" 
            className={`font-body-md text-body-md transition-colors ${
              isActive('/') 
                ? 'text-primary border-b-2 border-primary pb-1 font-bold' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Inicio
          </Link>
          <Link 
            to="/productos" 
            className={`font-body-md text-body-md transition-colors ${
              isActive('/productos') 
                ? 'text-primary border-b-2 border-primary pb-1 font-bold' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Catálogo
          </Link>
          {user && (
            <Link 
              to="/pedidos" 
              className={`font-body-md text-body-md transition-colors ${
                isActive('/pedidos') 
                  ? 'text-primary border-b-2 border-primary pb-1 font-bold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Mis Pedidos
            </Link>
          )}
        </nav>
      </div>

      {/* Central Search Input (matches tienda_inicio) */}
      <div className="flex items-center gap-stack-md flex-1 max-w-md mx-stack-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input 
            type="text"
            placeholder="Buscar importaciones premium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary font-body-sm text-body-sm"
          />
        </div>
      </div>

      {/* Right-hand Action Icons & Profiles */}
      <div className="flex items-center gap-stack-md">
        {user ? (
          <div className="flex items-center gap-stack-md">
            {(isImportadora || isAdmin) && (
              <div className="relative" ref={importadoraDropdownRef}>
                <button 
                  onClick={() => setIsImportadoraDropdownOpen(!isImportadoraDropdownOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    isImportadoraDropdownOpen 
                      ? 'bg-secondary text-on-secondary border-secondary shadow-lg' 
                      : 'bg-white text-slate-700 border-outline-variant hover:bg-slate-50'
                  }`}
                >
                  Panel Importadora
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isImportadoraDropdownOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                
                {isImportadoraDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-outline-variant bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Importadora</p>
                    </div>
                    <div className="p-1">
                      <Link 
                        to="/importadora/productos" 
                        onClick={() => setIsImportadoraDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-3 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">inventory</span>
                        Mis Productos
                      </Link>
                      <Link 
                        to="/importadora/subir" 
                        onClick={() => setIsImportadoraDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-3 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Subir Producto
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button 
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    isAdminDropdownOpen 
                      ? 'bg-primary text-white border-primary shadow-lg' 
                      : 'bg-white text-slate-700 border-outline-variant hover:bg-slate-50'
                  }`}
                >
                  Panel Admin
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                
                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-outline-variant bg-slate-50/50">
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
                      <Link 
                        to="/admin/inventario" 
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-3 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        Inventario
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Account Profile info */}
            <div className="flex items-center gap-3 pl-2 border-l border-outline-variant">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold leading-tight text-on-surface">{user.nombre}</span>
                <Link to="/perfil" className="text-[10px] text-on-surface-variant hover:text-secondary transition-colors font-semibold uppercase tracking-wider">Ver Perfil</Link>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors group"
                title="Cerrar Sesión"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors text-[20px]">
                  logout
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-stack-lg">
            <Link to="/login" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-bold">
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="px-stack-xl py-2 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all font-bold shadow-sm"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
