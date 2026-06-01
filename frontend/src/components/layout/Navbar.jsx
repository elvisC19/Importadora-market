import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout, isAdmin, isImportadora } = useAuth();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isImportadoraDropdownOpen, setIsImportadoraDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const importadoraDropdownRef = useRef(null);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('importadora-lang', newLang);
  };

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
        ? 'text-brand-copper-light border-b-2 border-brand-copper font-bold'
        : 'text-brand-mint/80 hover:text-brand-copper-light'
    }`;

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive(path)
        ? 'bg-brand-tech/20 text-brand-copper-light font-bold'
        : 'text-brand-mint/80 hover:bg-brand-tech/10 hover:text-brand-copper-light'
    }`;

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-6 lg:px-8 w-full h-16 z-50 bg-brand-deep border-b border-brand-tech/30 fixed top-0 select-none">
        {/* Brand logo & Main Navigation */}
        <div className="flex items-center gap-stack-md">
          <Link to="/" className="text-xl font-headline font-bold text-white hover:text-brand-copper-light transition-colors whitespace-nowrap">
            Importadora Market
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg ml-stack-xl">
            <Link to="/" className={navLinkClass('/')}>
              {t('nav.home')}
            </Link>
            <Link to="/productos" className={navLinkClass('/productos')}>
              {t('nav.catalog')}
            </Link>
            <Link to="/nosotros" className={navLinkClass('/nosotros')}>
              {t('nav.about')}
            </Link>
            <Link to="/contacto" className={navLinkClass('/contacto')}>
              {t('nav.contact')}
            </Link>
            {user && (
              <Link to="/pedidos" className={navLinkClass('/pedidos')}>
                {t('nav.myOrders')}
              </Link>
            )}
          </nav>
        </div>

        {/* Central Search Input — Hidden on mobile */}
        <div className="hidden md:flex items-center gap-stack-md flex-1 max-w-md mx-stack-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-mint/50 text-[20px]">
              search
            </span>
            <input 
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-2 bg-brand-tech/20 border border-brand-tech/30 rounded-xl focus:outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper font-body-sm text-body-sm text-white placeholder-brand-mint/40 transition-colors"
            />
          </div>
        </div>

        {/* Right-hand Action Icons & Profiles — Desktop */}
        <div className="flex items-center gap-2 md:gap-stack-md">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-brand-tech/30 bg-brand-tech/20 text-brand-mint hover:bg-brand-copper hover:text-brand-copper-light hover:border-brand-copper"
            title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span>{currentLang === 'es' ? '🇧🇴' : '🇺🇸'}</span>
            <span>{currentLang === 'es' ? 'ES' : 'EN'}</span>
          </button>

          {/* Shopping Cart Icon with dynamic badge */}
          <Link 
            to="/carrito" 
            className="relative p-2.5 hover:bg-brand-tech/20 rounded-full transition-all text-brand-mint/80 hover:text-brand-copper-light group flex items-center justify-center"
            aria-label={t('nav.cart')}
          >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
              shopping_cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-copper text-[10px] font-black text-brand-copper-light animate-pulse shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Desktop-only controls */}
          <div className="hidden md:flex items-center gap-stack-md">
            {user ? (
              <div className="flex items-center gap-stack-md">
                {isImportadora && (
                  <div className="relative" ref={importadoraDropdownRef}>
                    <button 
                      onClick={() => setIsImportadoraDropdownOpen(!isImportadoraDropdownOpen)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                        isImportadoraDropdownOpen 
                          ? 'bg-brand-copper text-brand-copper-light border-brand-copper shadow-lg' 
                          : 'bg-brand-tech/20 text-brand-mint border-brand-tech/30 hover:bg-brand-tech/30'
                      }`}
                    >
                      {t('nav.importadoraPanel')}
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isImportadoraDropdownOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    
                    {isImportadoraDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-brand-deep rounded-xl shadow-2xl border border-brand-tech/30 overflow-hidden text-brand-mint animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-2 border-b border-brand-tech/20 bg-brand-deep/80">
                          <p className="text-[10px] font-bold text-brand-mint/50 uppercase px-3 py-1">{t('nav.importadoraPanel')}</p>
                        </div>
                        <div className="p-1">
                          <Link 
                            to="/importadora/productos" 
                            onClick={() => setIsImportadoraDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">inventory</span>
                            {t('nav.myProducts')}
                          </Link>
                          <Link 
                            to="/importadora/subir" 
                            onClick={() => setIsImportadoraDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            {t('nav.uploadProduct')}
                          </Link>
                          <Link 
                            to="/importadora/pedidos" 
                            onClick={() => setIsImportadoraDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                            Mis Ventas
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
                          ? 'bg-brand-copper text-brand-copper-light border-brand-copper shadow-lg' 
                          : 'bg-brand-tech/20 text-brand-mint border-brand-tech/30 hover:bg-brand-tech/30'
                      }`}
                    >
                      {t('nav.adminPanel')}
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-brand-deep rounded-xl shadow-2xl border border-brand-tech/30 overflow-hidden text-brand-mint animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-2 border-b border-brand-tech/20 bg-brand-deep/80">
                          <p className="text-[10px] font-bold text-brand-mint/50 uppercase px-3 py-1">{t('nav.administration')}</p>
                        </div>
                        <div className="p-1">
                          <Link 
                            to="/admin" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            {t('nav.dashboard')}
                          </Link>
                          <Link 
                            to="/admin/usuarios" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            {t('nav.users')}
                          </Link>
                          <Link 
                            to="/admin/inventario" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                            {t('nav.inventory')}
                          </Link>
                          <Link 
                            to="/admin/pedidos" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                            {t('nav.orders')}
                          </Link>
                          <Link 
                            to="/admin/contactos" 
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-brand-tech/20 hover:text-brand-copper-light transition-colors flex items-center gap-3 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                            {t('nav.contacts')}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Account Profile info */}
                <div className="flex items-center gap-3 pl-2 border-l border-brand-tech/30">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold leading-tight text-white">{user.nombre}</span>
                    <Link to="/perfil" className="text-[10px] text-brand-mint/60 hover:text-brand-copper-light transition-colors font-semibold uppercase tracking-wider">{t('nav.viewProfile')}</Link>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-brand-tech/20 rounded-full transition-colors group"
                    title={t('nav.logout')}
                  >
                    <span className="material-symbols-outlined text-brand-mint/60 group-hover:text-rose-400 transition-colors text-[20px]">
                      logout
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-stack-lg">
                <Link to="/login" className="font-body-sm text-sm text-brand-mint/80 hover:text-brand-copper-light transition-colors font-bold">
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/registro" 
                  className="px-4 py-2 bg-brand-copper text-brand-copper-light font-bold rounded-lg hover:bg-brand-copper/90 active:scale-95 transition-all shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Button — Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-brand-tech/20 rounded-lg transition-colors text-brand-mint hover:text-brand-copper-light"
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
          <div className="absolute top-16 right-0 w-full max-w-sm h-[calc(100vh-4rem)] bg-brand-deep border-l border-brand-tech/30 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 space-y-4">
              
              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border border-brand-tech/30 bg-brand-tech/20 text-brand-mint hover:bg-brand-copper hover:text-brand-copper-light"
              >
                <span>{currentLang === 'es' ? '🇧🇴' : '🇺🇸'}</span>
                <span>{currentLang === 'es' ? 'Español' : 'English'}</span>
              </button>

              {/* Mobile Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-mint/50 text-[20px]">
                  search
                </span>
                <input 
                  type="text"
                  placeholder={t('nav.searchMobile')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="w-full pl-10 pr-4 py-3 bg-brand-tech/20 border border-brand-tech/30 rounded-xl focus:outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper text-sm text-white placeholder-brand-mint/40 transition-colors"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <p className="text-[10px] font-bold text-brand-mint/40 uppercase tracking-wider px-4 pt-2 pb-1">{t('nav.navigation')}</p>
                <Link to="/" className={mobileNavLinkClass('/')}>
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  {t('nav.home')}
                </Link>
                <Link to="/productos" className={mobileNavLinkClass('/productos')}>
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  {t('nav.catalog')}
                </Link>
                <Link to="/nosotros" className={mobileNavLinkClass('/nosotros')}>
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  {t('nav.about')}
                </Link>
                <Link to="/contacto" className={mobileNavLinkClass('/contacto')}>
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  {t('nav.contact')}
                </Link>
                {user && (
                  <Link to="/pedidos" className={mobileNavLinkClass('/pedidos')}>
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    {t('nav.myOrders')}
                  </Link>
                )}
              </nav>

              {/* Importadora Panel Links */}
              {user && isImportadora && (
                <div className="border-t border-brand-tech/20 pt-3 space-y-1">
                  <p className="text-[10px] font-bold text-brand-mint/40 uppercase tracking-wider px-4 pt-1 pb-1">{t('nav.importadoraPanel')}</p>
                  <Link to="/importadora/productos" className={mobileNavLinkClass('/importadora/productos')}>
                    <span className="material-symbols-outlined text-[20px]">inventory</span>
                    {t('nav.myProducts')}
                  </Link>
                  <Link to="/importadora/subir" className={mobileNavLinkClass('/importadora/subir')}>
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    {t('nav.uploadProduct')}
                  </Link>
                  <Link to="/importadora/pedidos" className={mobileNavLinkClass('/importadora/pedidos')}>
                    <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                    Mis Ventas
                  </Link>
                </div>
              )}

              {/* Admin Panel Links */}
              {user && isAdmin && (
                <div className="border-t border-brand-tech/20 pt-3 space-y-1">
                  <p className="text-[10px] font-bold text-brand-mint/40 uppercase tracking-wider px-4 pt-1 pb-1">{t('nav.administration')}</p>
                  <Link to="/admin/usuarios" className={mobileNavLinkClass('/admin/usuarios')}>
                    <span className="material-symbols-outlined text-[20px]">group</span>
                    {t('nav.users')}
                  </Link>
                  <Link to="/admin/inventario" className={mobileNavLinkClass('/admin/inventario')}>
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    {t('nav.inventory')}
                  </Link>
                  <Link to="/admin/pedidos" className={mobileNavLinkClass('/admin/pedidos')}>
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    {t('nav.orders')}
                  </Link>
                  <Link to="/admin/contactos" className={mobileNavLinkClass('/admin/contactos')}>
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    {t('nav.contacts')}
                  </Link>
                </div>
              )}

              {/* User Account Section */}
              <div className="border-t border-brand-tech/20 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-brand-tech/20 rounded-xl">
                      <div className="w-10 h-10 bg-brand-copper text-brand-copper-light rounded-full flex items-center justify-center font-bold text-sm">
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.nombre}</p>
                        <Link to="/perfil" className="text-[11px] text-brand-mint/60 hover:text-brand-copper-light font-semibold">
                          {t('nav.viewProfile')}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-tech/20 hover:bg-red-900/30 text-brand-mint hover:text-rose-400 rounded-xl text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-tech/20 text-brand-mint hover:text-brand-copper-light rounded-xl text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/registro"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-copper text-brand-copper-light rounded-xl text-sm font-bold hover:bg-brand-copper/90 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                      {t('nav.register')}
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
