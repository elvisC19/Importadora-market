import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productService from '../services/productService';
import Footer from '../components/layout/Footer';

// Fallback component for images that haven't been added yet
const ImageFallback = ({ label, className = '' }) => (
  <div className={`w-full h-full flex items-center justify-center bg-brand-tech ${className}`}>
    <span className="text-white font-bold text-lg text-center px-4 drop-shadow-lg">{label}</span>
  </div>
);

// SectionHeader component for reuse and styling consistency
const SectionHeader = ({ title, subtitle, viewAllLink, viewAllText }) => {
  return (
    <div className="flex justify-between items-start mb-stack-lg border-b border-[#CCFBF1]/30 pb-4">
      <div className="flex items-start gap-3">
        {/* Vertical copper bar */}
        <div className="w-[4px] h-[22px] bg-[#B45309] rounded-full mt-1.5 shrink-0" />
        <div className="text-left">
          <h2 className="font-headline-md text-headline-sm md:text-headline-md text-[#134E4A] font-extrabold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] text-[#0F766E] mt-1 font-semibold">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="text-xs md:text-sm font-bold flex items-center hover:bg-[#B45309] hover:text-white transition-all cursor-pointer select-none"
          style={{
            border: '1px solid #B45309',
            color: '#B45309',
            padding: '6px 14px',
            borderRadius: '20px'
          }}
        >
          {viewAllText}
        </Link>
      )}
    </div>
  );
};

// Section Empty State
const EmptySectionState = ({ icon }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px', background: 'white',
      borderRadius: '12px', border: '2px dashed #CCFBF1'
    }} className="my-stack-md w-full">
      <span style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>{icon}</span>
      <p style={{ fontSize: '14px', color: '#0F766E', fontWeight: '500' }}>
        No hay productos disponibles por el momento
      </p>
      <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
        Vuelve pronto para encontrar novedades
      </p>
    </div>
  );
};

// Local premium product card for homepage matching specific guidelines
const HomeProductCard = ({ product }) => {
  const { t } = useTranslation();
  
  const {
    id,
    nombre,
    precio,
    stock,
    imagen_url,
    is_offer,
    is_new,
    is_featured,
    categoria,
    final_price,
    discount_percentage
  } = product;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));
    
    // Toast notification
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 left-5 z-50 bg-brand-deep text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-brand-tech/30 animate-bounce";
    toast.innerHTML = `
      <span class="material-symbols-outlined text-green-400">check_circle</span>
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-brand-mint/60">${t('product.cartUpdated')}</p>
        <p class="text-sm font-semibold">${nombre.substring(0, 24)}...</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  let badgeText = '';
  if (is_featured) badgeText = 'DESTACADO';
  else if (is_offer) badgeText = 'OFERTA';
  else if (is_new) badgeText = 'NUEVO';

  const currentPrice = is_offer ? final_price : precio;

  return (
    <Link 
      to={`/productos/${id}`} 
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.01]"
      style={{ border: '1px solid #CCFBF1' }}
    >
      {/* 140px height with #E6FDF8 background */}
      <div className="relative h-[140px] w-full flex items-center justify-center overflow-hidden" style={{ background: '#E6FDF8' }}>
        {imagen_url ? (
          <img 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
            src={imagen_url} 
            alt={nombre} 
          />
        ) : (
          <span className="material-symbols-outlined text-[40px]" style={{ color: '#0F766E', opacity: 0.3 }}>image</span>
        )}
        
        {badgeText && (
          <span 
            className="absolute top-2 left-2 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded text-[#FEF3C7] shadow-sm z-10" 
            style={{ background: '#B45309' }}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow text-left justify-between">
        <div className="space-y-1 mb-3">
          <p className="text-[11px] text-[#0F766E] uppercase tracking-wider font-extrabold">
            {categoria?.nombre || t('product.general')}
          </p>
          <h3 className="text-sm font-bold line-clamp-2 min-h-[40px] hover:text-[#B45309] transition-colors" style={{ color: '#134E4A' }}>
            {nombre}
          </h3>
        </div>

        <div className="space-y-3 mt-auto pt-2 border-t border-[#CCFBF1]/20">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black" style={{ color: '#B45309' }}>
              Bs. {currentPrice.toFixed(2)}
            </span>
            {is_offer && (
              <span className="text-xs line-through text-slate-400 font-mono">
                Bs. {precio.toFixed(2)}
              </span>
            )}
          </div>

          {stock > 0 ? (
            <button 
              onClick={handleAddToCart}
              className="w-full py-2.5 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-xs font-bold shadow-sm cursor-pointer"
              style={{ background: '#134E4A', color: '#CCFBF1', borderRadius: '8px' }}
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              {t('product.addToCart')}
            </button>
          ) : (
            <div className="w-full py-2.5 flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold rounded-lg select-none">
              {t('product.outOfStock')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Section separator
const SectionSeparator = () => (
  <hr style={{ border: 'none', borderTop: '1px solid #CCFBF1', margin: '0 40px' }} />
);

// Map of category design configurations (gradient background and icons)
const categoryConfigs = {
  tecnologia: {
    gradient: 'linear-gradient(135deg, #B45309, #92400E)',
    icon: 'devices',
    mockCount: '24'
  },
  relojeria: {
    gradient: 'linear-gradient(135deg, #134E4A, #0F766E)',
    icon: 'watch',
    mockCount: '12'
  },
  moda: {
    gradient: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
    icon: 'apparel',
    mockCount: '18'
  },
  hogar: {
    gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    icon: 'home',
    mockCount: '15'
  },
  default: {
    gradient: 'linear-gradient(135deg, #134E4A, #0F766E)',
    icon: 'grid_view',
    mockCount: '10'
  }
};

const getCategoryConfig = (name) => {
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (norm.includes('tecnologia') || norm.includes('audio') || norm.includes('accesorio') || norm.includes('cargador') || norm.includes('cable')) {
    return categoryConfigs.tecnologia;
  }
  if (norm.includes('reloj') || norm.includes('relojeria')) {
    return categoryConfigs.relojeria;
  }
  if (norm.includes('moda') || norm.includes('ropa')) {
    return categoryConfigs.moda;
  }
  if (norm.includes('hogar') || norm.includes('mueble') || norm.includes('deco')) {
    return categoryConfigs.hogar;
  }
  return categoryConfigs.default;
};

const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroImgErrors, setHeroImgErrors] = useState({});

  // Hero carousel banners — configured with local images and texts
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      badge: t('hero.slide1Badge'),
      title: t('hero.slide1Title'),
      desc: t('hero.slide1Desc'),
      image: "/images/hero/hero-1.jpg",
      fallbackLabel: t('hero.slide1Badge'),
      cta: t('hero.slide1Cta'),
      link: "/productos"
    },
    {
      badge: t('hero.slide2Badge'),
      title: t('hero.slide2Title'),
      desc: t('hero.slide2Desc'),
      image: "/images/hero/hero-2.jpg",
      fallbackLabel: t('hero.slide2Badge'),
      cta: t('hero.slide2Cta'),
      link: "/productos?is_offer=true"
    },
    {
      badge: t('hero.slide3Badge'),
      title: t('hero.slide3Title'),
      desc: t('hero.slide3Desc'),
      image: "/images/hero/hero-3.jpg",
      fallbackLabel: t('hero.slide3Badge'),
      cta: t('hero.slide3Cta'),
      link: "/productos"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const loadStorefrontData = async () => {
      try {
        setLoading(true);
        const [cats, featured, offers, newArrivals] = await Promise.all([
          productService.getCategories(),
          productService.getFeatured(0, 4),
          productService.getOffers(0, 4),
          productService.getNewArrivals(0, 4)
        ]);
        setCategories(cats);
        setFeaturedProducts(featured);
        setOfferProducts(offers);
        setNewProducts(newArrivals || []);
      } catch (err) {
        console.error("Error loading storefront data", err);
        setError(t('home.connectionError'));
      } finally {
        setLoading(false);
      }
    };
    loadStorefrontData();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0FDF4' }}>
      
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative w-full h-[380px] sm:h-[500px] lg:h-[620px] overflow-hidden bg-brand-deep">
        <div className="absolute inset-0 flex transition-transform duration-700 h-full w-full">
          {slides.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {heroImgErrors[idx] ? (
                <ImageFallback label={slide.fallbackLabel} />
              ) : (
                <img 
                  className="w-full h-full object-cover" 
                  src={slide.image} 
                  alt={slide.title}
                  onError={() => setHeroImgErrors(prev => ({ ...prev, [idx]: true }))}
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-margin-desktop bg-gradient-to-r from-black/60 via-black/15 to-transparent">
                <div className="max-w-container-max mx-auto w-full text-left space-y-2 sm:space-y-4">
                  <span className="inline-block px-3.5 py-1 bg-[#B45309] text-[#FEF3C7] font-label-md text-label-md rounded-full mb-stack-md w-max font-bold tracking-wider">
                    {slide.badge}
                  </span>
                  <h1 className="text-2xl sm:text-4xl lg:text-display-lg font-display-lg text-white max-w-2xl leading-none">
                    {slide.title}
                  </h1>
                  <p className="font-body-lg text-sm sm:text-body-lg text-brand-mint/80 max-w-xl pb-2 sm:pb-4 hidden sm:block">
                    {slide.desc}
                  </p>
                  <Link 
                    to={slide.link}
                    className="inline-block px-8 py-3.5 text-brand-copper-light font-label-md text-label-md rounded-lg w-max hover:opacity-90 active:scale-95 transition-all shadow-lg font-semibold"
                    style={{ background: '#B45309' }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-stack-xl right-4 md:right-margin-desktop flex gap-stack-sm z-20">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-[#B45309] opacity-100 scale-105" : "bg-white opacity-45 hover:opacity-75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. PREMIUM CATEGORIES GRID - Redesigned to 4 Solid Gradient Cards */}
      <section className="px-4 md:px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <SectionHeader 
          title={t('home.premiumCategories')} 
          subtitle={t('home.categoriesSubtitle')} 
          viewAllLink="/productos" 
          viewAllText={t('home.viewAll')} 
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse h-[120px] bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
            {categories.slice(0, 4).map((category) => {
              const config = getCategoryConfig(category.nombre);
              return (
                <Link 
                  key={category.id}
                  to={`/productos?categoria_id=${category.id}`} 
                  className="relative h-[120px] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-end p-4 text-white group cursor-pointer"
                  style={{ background: config.gradient }}
                >
                  {/* Large icon in the top-right corner with 0.6 opacity */}
                  <span className="material-symbols-outlined absolute top-2 right-2 text-[48px] opacity-60 text-white select-none pointer-events-none group-hover:scale-110 transition-transform">
                    {config.icon}
                  </span>

                  {/* Name and product count bottom-left */}
                  <div className="flex flex-col text-left z-10">
                    <span className="font-extrabold text-lg tracking-tight leading-none mb-1 text-white">
                      {category.nombre}
                    </span>
                    <span className="text-[11px] text-white/95 font-semibold bg-white/10 px-2 py-0.5 rounded-full w-max mt-1">
                      {config.mockCount} productos
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <SectionSeparator />

      {/* 3. FEATURED PRODUCTS GRID */}
      <section className="px-4 md:px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <SectionHeader 
          title={t('home.featuredImports')} 
          subtitle="Selección exclusiva de productos altamente valorados" 
          viewAllLink="/productos?is_featured=true" 
          viewAllText={t('home.viewAllFeatured')} 
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-[#CCFBF1] space-y-4 animate-pulse">
                <div className="h-[140px] bg-slate-100 rounded-lg"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                <div className="h-6 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <EmptySectionState icon="⭐" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {featuredProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <SectionSeparator />

      {/* 4. EXCLUSIVE DEALS SECTION */}
      <section className="px-4 md:px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <SectionHeader 
          title={t('home.exclusiveDeals')} 
          subtitle="Precios especiales y descuentos por tiempo limitado" 
          viewAllLink="/productos?is_offer=true" 
          viewAllText={t('home.viewAllOffers')} 
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-[#CCFBF1] space-y-4 animate-pulse">
                <div className="h-[140px] bg-slate-100 rounded-lg"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : offerProducts.length === 0 ? (
          <EmptySectionState icon="🏷️" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {offerProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <SectionSeparator />

      {/* 5. NEW ARRIVALS GRID */}
      <section className="px-4 md:px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <SectionHeader 
          title={t('home.newArrivals')} 
          subtitle="Las últimas importaciones añadidas a nuestro inventario" 
          viewAllLink="/productos?is_new=true" 
          viewAllText={t('home.viewAllNew')} 
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-[#CCFBF1] space-y-4 animate-pulse">
                <div className="h-[140px] bg-slate-100 rounded-lg"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : newProducts.length === 0 ? (
          <EmptySectionState icon="🆕" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {newProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <SectionSeparator />

      {/* 6. NEWSLETTER / CORPORATE CALL TO ACTION - Redesigned layout */}
      <section style={{ margin: '24px 40px' }}>
        <div 
          className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-stack-xl overflow-hidden relative"
          style={{
            background: '#134E4A',
            borderRadius: '16px',
            padding: '28px 32px'
          }}
        >
          <div className="z-10 relative text-left space-y-2 max-w-xl">
            <h2 className="font-headline-lg text-headline-lg font-bold leading-tight text-white">
              {t('home.ctaTitle')}
            </h2>
            <p className="font-body-lg text-body-lg" style={{ color: '#CCFBF1' }}>
              {t('home.ctaSubtitle')}
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-stack-md z-10 relative items-center">
            <input 
              className="flex-1 md:w-80 px-4 py-3 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B45309] font-body-sm text-body-sm bg-white" 
              placeholder={t('home.ctaEmailPlaceholder')}
              type="email"
            />
            <button 
              onClick={() => alert(t('home.ctaThanks'))}
              className="px-6 py-3 text-brand-copper-light font-label-md text-label-md rounded-lg whitespace-nowrap hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
              style={{ background: '#B45309' }}
            >
              {t('home.ctaButton')}
            </button>
          </div>
          
          {/* Decorative design accent circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#B45309] rounded-full opacity-10 blur-xl"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
