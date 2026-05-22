import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin, isImportadora } = useAuth();
  const { cartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isImportadoraDropdownOpen, setIsImportadoraDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const importadoraDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigate(`/productos?nombre=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `font-body-sm text-sm font-semibold transition-colors pb-1 ${
      isActive(path)
        ? 'text-teal-400 border-b-2 border-teal-400 font-bold'
        : 'text-slate-300 hover:text-teal-400'
    }`;

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive(path)
        ? 'bg-teal-500/10 text-teal-400 font-bold'
        : 'text-slate-300 hover:bg-slate-800 hover:text-teal-400'
    }`;

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-6 lg:px-8 w-full h-16 z-50 bg-slate-900 border-b border-slate-800 fixed top-0 select-none">
        {/* Brand logo & Main Navigation */}
        <div className="flex items-center gap-stack-md">
          <Link to="/" className="text-xl font-headline font-bold text-white hover:text-teal-400 transition-colors whitespace-nowrap">
            Importadora Market
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg ml-stack-xl">
            <Link to="/" className={navLinkClass('/')}>
              Inicio
            </Link>
            <Link to="/productos" className={navLinkClass('/productos')}>
              Catálogo
            </Link>
            {user && (
              <Link to="/pedidos" className={navLinkClass('/pedidos')}>
                Mis Pedidos
              </Link>
            )}
          </nav>
        </div>

        {/* Central Search Input — Hidden on mobile */}
        <div className="hidden md:flex items-center gap-stack-md flex-1 max-w-md mx-stack-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input 
              type="text"
              placeholder="Buscar importaciones premium..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 font-body-sm text-body-sm text-white placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Right-hand Action Icons & Profiles — Desktop */}
        <div className="flex items-center gap-2 md:gap-stack-md">
          {/* Shopping Cart Icon with dynamic badge */}
          <Link 
            to="/carrito" 
            className="relative p-2.5 hover:bg-slate-800 rounded-full transition-all text-slate-300 hover:text-teal-400 group flex items-center justify-center"
            aria-label="Carrito de compras"
          >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
              shopping_cart
            </span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse shadow-lg">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Desktop-only controls */}
          <div className="hidden md:flex items-center gap-stack-md">
            {user ? (
              <div className="flex items-center gap-stack-md">
                {(isImportadora || isAdmin) && (
                  <div className="relative" ref={importadoraDropdownRef}>
                    <button 
                      onClick={() => setIsImportadoraDropdownOpen(!isImportadoraDropdownOpen)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                        isImportadoraDropdownOpen 
                          ? 'bg-teal-500 text-slate-950 border-teal-500 shadow-lg' 
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      Panel Importadora
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isImportadoraDropdownOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    
                    {isImportadoraDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-2 border-b border-slate-800 bg-slate-950/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Importadora</p>
                        </div>
                        <div className="p-1">
                          <Link 
                            to="/importadora/productos" 
                            onClick={() => setIsImportadoraDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-teal-400 transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">inventory</span>
                            Mis Productos
                          </Link>
                          <Link 
                            to="/importadora/subir" 
                            onClick={() => setIsImportadoraDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-teal-400 transition-colors flex items-center gap-3 rounded-lg"
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
                          ? 'bg-teal-500 text-slate-950 border-teal-500 shadow-lg' 
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      Panel Admin
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-2 border-b border-slate-800 bg-slate-950/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Administración</p>
                        </div>
                        <div className="p-1">
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 cursor-not-allowed flex items-center gap-3"
                            title="Próximamente"
                            disabled
                          >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            Dashboard
                          </button>
                          <Link 
                            to="/admin/usuarios" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-teal-400 transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            Usuarios
                          </Link>
                          <Link 
                            to="/admin/inventario" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-teal-400 transition-colors flex items-center gap-3 rounded-lg"
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
                <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold leading-tight text-white">{user.nombre}</span>
                    <Link to="/perfil" className="text-[10px] text-slate-400 hover:text-teal-400 transition-colors font-semibold uppercase tracking-wider">Ver Perfil</Link>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
                    title="Cerrar Sesión"
                  >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-rose-400 transition-colors text-[20px]">
                      logout
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-stack-lg">
                <Link to="/login" className="font-body-sm text-sm text-slate-300 hover:text-teal-400 transition-colors font-bold">
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro" 
                  className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg hover:bg-teal-400 active:scale-95 transition-all shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Button — Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-teal-400"
            aria-label="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-[26px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* =============================== */}
      {/* MOBILE MENU DRAWER / OVERLAY    */}
      {/* =============================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="absolute top-16 right-0 w-full max-w-sm h-[calc(100vh-4rem)] bg-slate-900 border-l border-slate-800 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 space-y-4">
              
              {/* Mobile Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input 
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm text-white placeholder-slate-400 transition-colors"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 pt-2 pb-1">Navegación</p>
                <Link to="/" className={mobileNavLinkClass('/')}>
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  Inicio
                </Link>
                <Link to="/productos" className={mobileNavLinkClass('/productos')}>
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  Catálogo
                </Link>
                {user && (
                  <Link to="/pedidos" className={mobileNavLinkClass('/pedidos')}>
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    Mis Pedidos
                  </Link>
                )}
              </nav>

              {/* Importadora Panel Links */}
              {user && (isImportadora || isAdmin) && (
                <div className="border-t border-slate-800 pt-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 pt-1 pb-1">Panel Importadora</p>
                  <Link to="/importadora/productos" className={mobileNavLinkClass('/importadora/productos')}>
                    <span className="material-symbols-outlined text-[20px]">inventory</span>
                    Mis Productos
                  </Link>
                  <Link to="/importadora/subir" className={mobileNavLinkClass('/importadora/subir')}>
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    Subir Producto
                  </Link>
                </div>
              )}

              {/* Admin Panel Links */}
              {user && isAdmin && (
                <div className="border-t border-slate-800 pt-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 pt-1 pb-1">Administración</p>
                  <Link to="/admin/usuarios" className={mobileNavLinkClass('/admin/usuarios')}>
                    <span className="material-symbols-outlined text-[20px]">group</span>
                    Usuarios
                  </Link>
                  <Link to="/admin/inventario" className={mobileNavLinkClass('/admin/inventario')}>
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    Inventario
                  </Link>
                </div>
              )}

              {/* User Account Section */}
              <div className="border-t border-slate-800 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
                      <div className="w-10 h-10 bg-teal-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-sm">
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.nombre}</p>
                        <Link to="/perfil" className="text-[11px] text-slate-400 hover:text-teal-400 font-semibold">
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-rose-400 rounded-xl text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 hover:text-teal-400 rounded-xl text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-teal-400 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
