import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import Footer from '../components/layout/Footer';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hero carousel banners with premium styling to match design specs
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      badge: "NUEVO INGRESO",
      title: "Precision Engineered Performance",
      desc: "Descubre la nueva colección de calzado deportivo elite importado diseñado para máxima confiabilidad y rendimiento de punta.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-MbPDOHjsj_itSBooyYrHc0VgvEVPAcqggjJnezdL7NYK1x6xBMKzuFe0TTXMUUDTPq-WBkNHhna01rl8KngYDTlALX3k4DJ5XcZCZWWyoPSySDy73enwrzGfB9NZdbctcZjgiTC-EYvZu-EApa9R9LYIDOdYPHKghTYbgrnC13zJRwksINCE6e6EsLIF5vhZ2WHW_0jE9qzl5kWoG_WMA6WUdn2tHalrxt3rJ6oFwka1Dse0kWRJmwJFxDHs2i8aUs3eePc8vk4",
      cta: "Comprar Colección",
      link: "/productos"
    },
    {
      badge: "SONIDO HI-FI",
      title: "Acoustics Pro Wireless",
      desc: "Disfruta de audición inmersiva de alta fidelidad con cancelación activa de ruido híbrida y batería inteligente de larga duración.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpGKjBIeGQqv0dws9nUZLSvxsPXSFjN8649ecuoV9rh9d83EskITeDSw7q8GFLnWz8N0oegZUOu3uQRicaGu81RFLt1B98SAsM2al52sBoNGW9fjYK9kLCyUg8NxvAS0j9MpbiplC45HIqBwy5ZbX8gDPyZCYZnWxYJsjZ_kctWdUCpfLvTOV_Eynk0xhjs2w9ZbB7si3eJGp1Y4KnB65_5RVQrBG2A3qGKHeNM-MdGVkzwepsVZQvTDbZzYEaQzY2Akzvu8JZeno",
      cta: "Ver Ofertas Especiales",
      link: "/productos?is_offer=true"
    },
    {
      badge: "ALTA RELOJERÍA",
      title: "Chrono Elite Series 5",
      desc: "Fabricado con titanio aeroespacial de grado 5 y cristal de zafiro de extrema resistencia. Fiabilidad y distinción sin límites.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALARIfEufWa7QvDJIkcCIsJ1ggAte_IclnU0g8rw-MszrQZg63-ufccdPKoqFweTI-5dDWlTpTycYCQEwriOpIMdtV8b32acBmU8cLOJRrewOP7R2UC5qpiGPD0I4alp72NNMfssCnVdfVE1zzGXoHEY6IfbLqo_Mi4rjifS4A7vRT_nV5rRz1jbNdHb-267M_mZTL5bfkMqT505fQpSaz1ojXt7vtgP41SeqldMk_2Ky4rb3qVAdMmQuRDyKkXkXSZpuEjPl56zU",
      cta: "Ver Detalles Premium",
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
        const [cats, featured, offers, productsResponse] = await Promise.all([
          productService.getCategories(),
          productService.getFeatured(0, 4),
          productService.getOffers(0, 4),
          productService.getProducts({ is_new: true, limit: 4 })
        ]);
        setCategories(cats);
        setFeaturedProducts(featured);
        setOfferProducts(offers);
        setNewProducts(productsResponse.items || []);
      } catch (err) {
        console.error("Error loading storefront data", err);
        setError("Error de conexión. Intente cargar nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    loadStorefrontData();
  }, []);

  // Category Icon Map according to material icons in design specs
  const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('audio') || lower.includes('tecnología') || lower.includes('electron')) return 'devices';
    if (lower.includes('accesorio') || lower.includes('celular') || lower.includes('funda')) return 'phone_iphone';
    if (lower.includes('cargador') || lower.includes('cable') || lower.includes('bater')) return 'bolt';
    if (lower.includes('ropa') || lower.includes('moda') || lower.includes('fashion')) return 'apparel';
    if (lower.includes('hogar') || lower.includes('decor')) return 'home';
    if (lower.includes('deporte') || lower.includes('fitness')) return 'fitness_center';
    return 'grid_view';
  };

  return (
    <div className="min-h-screen">
      
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative w-full h-[520px] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 flex transition-transform duration-700 h-full w-full">
          {slides.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img 
                className="w-full h-full object-cover brightness-50" 
                src={slide.image} 
                alt={slide.title}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-margin-desktop bg-gradient-to-r from-on-background/90 via-on-background/50 to-transparent">
                <div className="max-w-container-max mx-auto w-full text-left space-y-4">
                  <span className="inline-block px-3.5 py-1 bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full mb-stack-md w-max font-bold tracking-wider">
                    {slide.badge}
                  </span>
                  <h1 className="font-display-lg text-display-lg text-white max-w-2xl leading-none">
                    {slide.title}
                  </h1>
                  <p className="font-body-lg text-body-lg text-surface-container-highest max-w-xl pb-4">
                    {slide.desc}
                  </p>
                  <Link 
                    to={slide.link}
                    className="inline-block px-8 py-3.5 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg w-max hover:bg-secondary/90 active:scale-95 transition-all shadow-lg font-semibold"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-stack-xl right-margin-desktop flex gap-stack-sm z-20">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-white opacity-100 scale-105" : "bg-white opacity-45 hover:opacity-75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. PREMIUM CATEGORIES GRID */}
      <section className="px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-stack-lg border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">Categorías Premium</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Importaciones seleccionadas para cada departamento</p>
          </div>
          <Link 
            to="/productos" 
            className="text-secondary font-label-md text-label-md flex items-center gap-stack-xs hover:underline font-bold"
          >
            Ver Todo <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-stack-md">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-2">
                <div className="aspect-square bg-slate-100 rounded-xl"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-stack-md">
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/productos?categoria_id=${category.id}`} 
                className="group cursor-pointer text-center"
              >
                <div className="aspect-square rounded-xl bg-surface-container flex items-center justify-center mb-stack-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[36px] text-primary group-hover:text-white transition-colors">
                    {getCategoryIcon(category.nombre)}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-on-surface font-bold truncate px-1">
                  {category.nombre}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS GRID */}
      <section className="px-margin-desktop py-stack-xl bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-md mb-stack-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">Destacados de Importación</h2>
            <div className="h-px bg-outline-variant flex-1"></div>
            <Link to="/productos?is_featured=true" className="text-secondary hover:underline font-semibold text-sm">Ver Todos</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-surface rounded-xl p-4 border border-outline-variant space-y-4 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-lg"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No hay productos destacados disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. EXCLUSIVE DEALS SECTION */}
      <section className="px-margin-desktop py-stack-xl max-w-container-max mx-auto">
        <div className="flex items-center gap-stack-md mb-stack-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">Ofertas de Temporada</h2>
          <div className="h-px bg-outline-variant flex-1"></div>
          <Link to="/productos?is_offer=true" className="text-secondary hover:underline font-semibold text-sm">Ver Todas</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-surface rounded-xl p-4 border border-outline-variant space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-lg"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : offerProducts.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No hay ofertas disponibles por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEW ARRIVALS GRID */}
      <section className="px-margin-desktop py-stack-xl bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-md mb-stack-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">Recién Llegados</h2>
            <div className="h-px bg-outline-variant flex-1"></div>
            <Link to="/productos?is_new=true" className="text-secondary hover:underline font-semibold text-sm">Ver Todos</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-surface rounded-xl p-4 border border-outline-variant space-y-4 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-lg"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : newProducts.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No hay nuevos productos cargados recientemente.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. NEWSLETTER / CORPORATE CALL TO ACTION */}
      <section className="px-margin-desktop py-stack-xl">
        <div className="max-w-container-max mx-auto bg-primary text-white rounded-2xl p-stack-xl flex flex-col md:flex-row items-center justify-between gap-stack-xl overflow-hidden relative">
          <div className="z-10 relative space-y-2">
            <h2 className="font-headline-lg text-headline-lg font-bold leading-tight">Reliability delivered to your door.</h2>
            <p className="font-body-lg text-body-lg text-slate-300">Suscríbete para recibir alertas exclusivas sobre novedades de importación.</p>
          </div>
          <div className="flex w-full md:w-auto gap-stack-md z-10 relative">
            <input 
              className="flex-1 md:w-80 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white font-body-sm text-body-sm backdrop-blur-sm" 
              placeholder="Ingresa tu correo empresarial" 
              type="email"
            />
            <button 
              onClick={() => alert("¡Gracias por suscribirte!")}
              className="px-6 py-3 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg whitespace-nowrap hover:bg-secondary/90 active:scale-95 transition-all font-bold cursor-pointer"
            >
              Unirme Ahora
            </button>
          </div>
          {/* Decorative design accent circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container rounded-full opacity-10 blur-xl"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
