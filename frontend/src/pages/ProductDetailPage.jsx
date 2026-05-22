import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import Footer from '../components/layout/Footer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0); // For switching between big image & thumbnails
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product", err);
        setError("No se pudo cargar la información del producto. Es posible que no exista o no esté aprobado.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Helper to parse YouTube URLs for iframe embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return null;
  };

  // Add to cart with local storage syncing and toast notification
  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex(item => item.id === product.id);
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += quantity;
    } else {
      existingCart.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch event to update Navbar count
    window.dispatchEvent(new Event('storage'));

    // Custom Toast Notice
    const toast = document.createElement('div');
    toast.className = "fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-outline/25 animate-bounce";
    toast.innerHTML = `
      <span class="material-symbols-outlined text-green-400">check_circle</span>
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Agregado al Carrito</p>
        <p class="text-sm font-semibold">${quantity} x ${product.nombre.substring(0, 24)}...</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  // WhatsApp purchase enquiry
  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const phoneNumber = "59170000000";
    const currentUrl = window.location.href;
    const priceText = product.is_offer 
      ? `Bs. ${product.offer_price.toFixed(2)} (Antes Bs. ${product.precio.toFixed(2)})`
      : `Bs. ${product.precio.toFixed(2)}`;
    
    const message = `¡Hola Importadora Market! 👋 Estoy listo para adquirir el siguiente producto:
 
🛍️ *${product.nombre}*
🏷️ Categoría: ${product.categoria?.nombre || 'General'}
💵 Precio de Lista: ${priceText}
🔢 Cantidad Requerida: ${quantity}
🔗 Enlace de Referencia: ${currentUrl}
 
¿Me podrían coordinar el despacho e indicarme el método de transferencia bancaria? ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wider uppercase animate-pulse">Cargando Detalle de Importación...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-margin-desktop py-20 text-center">
        <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant flex flex-col items-center shadow-lg">
          <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold mb-2">Producto No Disponible</h2>
          <p className="font-body-md text-on-surface-variant mb-8 max-w-md">{error || "El producto consultado no existe o no se encuentra aprobado para el storefront público."}</p>
          <Link 
            to="/productos" 
            className="px-8 py-3.5 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-all font-bold"
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const {
    nombre,
    precio,
    descripcion,
    stock,
    imagen_url,
    video_enlace,
    is_offer,
    is_new,
    is_featured,
    categoria,
    final_price,
    discount_percentage
  } = product;

  const embedVideoUrl = video_enlace ? getYouTubeEmbedUrl(video_enlace) : null;

  // We mock a few extra image angles using our primary image to create a rich Bento Grid look if no other images exist
  const productImages = [
    imagen_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    imagen_url ? `${imagen_url}&auto=format&fit=crop&w=400&q=60` : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    imagen_url ? `${imagen_url}&auto=format&fit=crop&w=400&q=50` : "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
        
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-outline mb-8 overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
          <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
          <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
          <Link to={`/productos?categoria_id=${categoria?.id}`} className="hover:text-primary transition-colors text-slate-400">{categoria?.nombre || 'General'}</Link>
          <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
          <span className="text-primary truncate max-w-[200px]">{nombre}</span>
        </nav>

        {/* Product Detail Section: Asymmetric Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* LEFT SIDE: Image Gallery & Video (Bento Style) */}
          <div className="lg:col-span-7 flex flex-col gap-stack-lg">
            <div className="grid grid-cols-4 grid-rows-4 gap-stack-md h-[300px] sm:h-[400px] lg:h-[550px]">
              
              {/* Big Main Image Container */}
              <div className="col-span-4 row-span-3 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest relative flex items-center justify-center shadow-sm">
                {showVideoPlayer && embedVideoUrl ? (
                  <iframe 
                    src={embedVideoUrl} 
                    title={`Video demo of ${nombre}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img 
                    className="w-full h-full object-cover p-2 hover:scale-[1.02] transition-transform duration-500" 
                    src={productImages[activeMediaIndex]} 
                    alt={nombre} 
                  />
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-stack-md left-stack-md flex flex-col gap-1.5 pointer-events-none">
                  {is_new && (
                    <span className="px-3 py-1 bg-secondary text-on-secondary font-label-sm text-label-sm rounded uppercase tracking-wider font-bold">
                      NUEVO
                    </span>
                  )}
                  {is_offer && (
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded uppercase tracking-wider font-bold">
                      OFERTA
                    </span>
                  )}
                  {is_featured && (
                    <span className="px-3 py-1 bg-primary text-white font-label-sm text-label-sm rounded uppercase tracking-wider font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] font-bold">star</span>
                      DESTACADO
                    </span>
                  )}
                </div>
              </div>

              {/* Bento Thumbnail 1 */}
              <button 
                onClick={() => { setActiveMediaIndex(0); setShowVideoPlayer(false); }}
                className={`col-span-1 row-span-1 rounded-xl overflow-hidden border transition-all duration-300 ${
                  activeMediaIndex === 0 && !showVideoPlayer ? 'border-secondary ring-2 ring-secondary/15 scale-95 shadow-md' : 'border-outline-variant hover:border-slate-400'
                }`}
              >
                <img className="w-full h-full object-cover" src={productImages[0]} alt="Ángulo Principal" />
              </button>

              {/* Bento Thumbnail 2 */}
              <button 
                onClick={() => { setActiveMediaIndex(1); setShowVideoPlayer(false); }}
                className={`col-span-1 row-span-1 rounded-xl overflow-hidden border transition-all duration-300 ${
                  activeMediaIndex === 1 && !showVideoPlayer ? 'border-secondary ring-2 ring-secondary/15 scale-95 shadow-md' : 'border-outline-variant hover:border-slate-400'
                }`}
              >
                <img className="w-full h-full object-cover" src={productImages[1]} alt="Ángulo Secundario" />
              </button>

              {/* Bento Thumbnail 3 */}
              <button 
                onClick={() => { setActiveMediaIndex(2); setShowVideoPlayer(false); }}
                className={`col-span-1 row-span-1 rounded-xl overflow-hidden border transition-all duration-300 ${
                  activeMediaIndex === 2 && !showVideoPlayer ? 'border-secondary ring-2 ring-secondary/15 scale-95 shadow-md' : 'border-outline-variant hover:border-slate-400'
                }`}
              >
                <img className="w-full h-full object-cover" src={productImages[2]} alt="Ángulo Alternativo" />
              </button>

              {/* Bento Video Launcher Thumbnail */}
              {video_enlace ? (
                <button 
                  onClick={() => setShowVideoPlayer(true)}
                  className={`col-span-1 row-span-1 relative rounded-xl overflow-hidden border bg-on-background group cursor-pointer transition-all duration-300 ${
                    showVideoPlayer ? 'border-secondary ring-2 ring-secondary/15 scale-95' : 'border-outline-variant hover:border-slate-400'
                  }`}
                >
                  <img className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" src={productImages[0]} alt="Video Launcher" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                  </div>
                </button>
              ) : (
                <div className="col-span-1 row-span-1 rounded-xl border border-outline-variant bg-surface-container flex flex-col items-center justify-center text-slate-400 text-center p-1">
                  <span className="material-symbols-outlined text-[20px]">videocam_off</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-1">Sin Video</span>
                </div>
              )}
            </div>

            {/* Video Showcase Section */}
            {video_enlace && embedVideoUrl && (
              <div className="rounded-xl bg-surface-container-highest p-stack-lg border border-outline-variant">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[24px]">videocam</span>
                  <h3 className="font-headline-md text-headline-md font-extrabold">Performance Showcase</h3>
                </div>
                <div className="aspect-video bg-on-background rounded-lg flex items-center justify-center relative overflow-hidden group border border-outline/10">
                  {!showVideoPlayer ? (
                    <>
                      <img className="absolute inset-0 w-full h-full object-cover opacity-50 filter blur-[1px]" src={productImages[0]} alt="Video Demo Preview" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-stack-md">
                        <div className="text-white text-left">
                          <p className="font-label-md text-label-md uppercase tracking-widest text-secondary-container font-extrabold mb-1">Live Demonstration</p>
                          <p className="font-body-md text-body-md font-semibold">Demostración en vivo y características principales</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowVideoPlayer(true)}
                        className="absolute w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                      >
                        <span className="material-symbols-outlined text-white text-4xl block" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                      </button>
                    </>
                  ) : (
                    <iframe 
                      src={embedVideoUrl} 
                      title={`Demonstration of ${nombre}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Product Info & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-stack-lg">
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl shadow-sm space-y-6 text-left">
              
              <div className="flex justify-between items-start">
                <span className="px-3.5 py-1.5 bg-slate-900 text-white text-label-sm font-label-sm rounded-full font-bold uppercase tracking-wider">
                  {categoria?.nombre || 'PREMIUM IMPORTS'}
                </span>
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md text-label-md text-slate-800 font-bold">4.9 (1.2k valoraciones)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface leading-tight">
                  {nombre}
                </h1>
                <p className="font-body-sm text-body-sm text-slate-400 font-mono tracking-wider">SKU: IMP-2026-0{id}</p>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {descripcion || "Producto importado bajo altos estándares de calidad institucional. Este artículo ofrece un alto desempeño, durabilidad asegurada y cumple cabalmente con las especificaciones técnicas requeridas."}
              </p>

              {/* Price Panel */}
              <div className="flex items-baseline gap-stack-md border-y border-outline-variant py-4">
                {is_offer ? (
                  <>
                    <span className="font-display-lg text-display-lg text-secondary font-black">Bs. {final_price.toFixed(2)}</span>
                    <span className="font-body-md text-body-md text-outline line-through font-mono">Bs. {precio.toFixed(2)}</span>
                    {discount_percentage && (
                      <span className="ml-2 bg-orange-100 border border-orange-200 text-secondary text-xs font-bold px-2 py-0.5 rounded font-mono">
                        -{discount_percentage}% desc.
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-display-lg text-display-lg text-primary font-black">Bs. {precio.toFixed(2)}</span>
                )}
              </div>

              {/* Stock Warning Banner */}
              {stock <= 0 ? (
                <div className="flex items-center gap-stack-sm p-stack-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <span className="material-symbols-outlined text-red-600 animate-pulse text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                  <span className="font-label-md text-label-md font-bold uppercase tracking-wide">AGOTADO: Coordinando Próxima Importación</span>
                </div>
              ) : stock <= 8 ? (
                <div className="flex items-center gap-stack-sm p-stack-sm bg-error-container/20 rounded-lg border border-error-container text-error">
                  <span className="material-symbols-outlined text-error animate-pulse text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span className="font-label-md text-label-md font-bold uppercase tracking-wide">ALTA DEMANDA: Quedan solo {stock} unidades</span>
                </div>
              ) : (
                <div className="flex items-center gap-stack-sm p-stack-sm bg-green-50 rounded-lg border border-green-200 text-green-700">
                  <span className="material-symbols-outlined text-green-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-md text-label-md font-bold uppercase tracking-wide">STOCK INSTITUCIONAL: Listo para Despacho</span>
                </div>
              )}

              {/* Quantity selector and actions */}
              {stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Cantidad:</span>
                    <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface-container shadow-inner">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors font-extrabold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] block font-black">remove</span>
                      </button>
                      <span className="px-5 text-sm font-black text-on-surface w-10 text-center select-none font-mono">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                        disabled={quantity >= stock}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors font-extrabold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] block font-black">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Add to Cart Button */}
                    <button 
                      onClick={handleAddToCart}
                      className="w-full h-14 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 font-bold rounded-lg flex items-center justify-center gap-stack-sm shadow-md active:scale-95 transition-all cursor-pointer font-sans tracking-wide"
                    >
                      <span className="material-symbols-outlined font-bold">add_shopping_cart</span>
                      AGREGAR AL CARRITO
                    </button>

                    {/* Buy Now (WhatsApp Order) Button */}
                    <button 
                      onClick={handleWhatsAppEnquiry}
                      className="w-full h-14 bg-primary text-white hover:bg-slate-900 font-bold rounded-lg flex items-center justify-center gap-stack-sm shadow-md active:scale-95 transition-all cursor-pointer font-sans tracking-wide border border-slate-800"
                    >
                      <svg className="w-5 h-5 fill-current text-green-400" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.424 2.5 1.134 3.471L6.5 18.5l3.181-.832a5.727 5.727 0 0 0 2.35.513h.002c3.182 0 5.769-2.586 5.77-5.766 0-3.18-2.587-5.766-5.772-5.766zm3.385 8.163c-.147.415-.852.766-1.173.811-.321.045-.634.07-.942-.023-.309-.092-1.077-.425-2.022-1.267-.735-.654-1.233-1.464-1.378-1.712-.145-.248-.016-.381.109-.506.112-.113.248-.292.372-.439.124-.146.166-.248.248-.415.083-.166.041-.314-.02-.439-.062-.124-.559-1.348-.766-1.848-.202-.488-.406-.421-.559-.429-.145-.008-.31-.01-.476-.01-.165 0-.434.062-.661.309-.227.247-.867.848-.867 2.07 0 1.221.888 2.4 1.012 2.565.124.166 1.747 2.668 4.232 3.74.591.255 1.053.407 1.412.521.593.189 1.134.162 1.562.098.477-.071 1.472-.601 1.679-1.183.207-.582.207-1.08.145-1.183-.062-.104-.227-.166-.476-.29z" />
                        <path d="M12.5 2C6.701 2 2 6.701 2 12.5c0 1.956.541 3.785 1.479 5.354L2 23.5l5.807-1.524A10.457 10.457 0 0 0 12.5 23c5.799 0 10.5-4.701 10.5-10.5S18.299 2 12.5 2zm0 19c-1.733 0-3.358-.48-4.742-1.314l-.34-.204-3.522.924.94-3.434-.224-.356A8.455 8.455 0 0 1 4 12.5C4 7.813 7.813 4 12.5 4 17.187 4 21 7.813 21 12.5 21 17.187 17.187 21 12.5 21z" />
                      </svg>
                      COMPRAR AHORA (WHATSAPP)
                    </button>
                  </div>
                </div>
              )}

              {/* Guarantees Box */}
              <div className="pt-stack-lg border-t border-outline-variant flex flex-col gap-stack-md text-slate-600 text-left">
                <div className="flex items-center gap-stack-sm">
                  <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
                  <span className="font-body-sm text-body-sm">Garantía de Importación de 6 Meses</span>
                </div>
                <div className="flex items-center gap-stack-sm">
                  <span className="material-symbols-outlined text-secondary text-[22px]">local_shipping</span>
                  <span className="font-body-sm text-body-sm">Envío Express Asegurado a Todo el País</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications Bento Card */}
            <div className="bg-surface-container p-stack-lg rounded-xl border border-outline-variant text-left shadow-sm">
              <h3 className="font-headline-md text-headline-md font-extrabold mb-stack-md border-b border-outline-variant pb-2">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-2 gap-stack-md">
                
                <div className="p-stack-sm border-l-4 border-secondary bg-surface-container-lowest rounded-r-lg">
                  <p className="font-label-sm text-label-sm text-outline uppercase font-bold">Categoría</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-semibold">{categoria?.nombre || 'General'}</p>
                </div>
                
                <div className="p-stack-sm border-l-4 border-secondary bg-surface-container-lowest rounded-r-lg">
                  <p className="font-label-sm text-label-sm text-outline uppercase font-bold">Stock Físico</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-semibold">{stock} unidades disp.</p>
                </div>
                
                <div className="p-stack-sm border-l-4 border-secondary bg-surface-container-lowest rounded-r-lg">
                  <p className="font-label-sm text-label-sm text-outline uppercase font-bold">Condición</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-semibold">{is_new ? 'Nuevo Modelo' : 'Importación Directa'}</p>
                </div>
                
                <div className="p-stack-sm border-l-4 border-secondary bg-surface-container-lowest rounded-r-lg">
                  <p className="font-label-sm text-label-sm text-outline uppercase font-bold">Código Interno</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-semibold">#IMP-0026-0{id}</p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Details & Features Grid underneath */}
        <section className="mt-stack-xl py-stack-xl border-t border-outline-variant">
          <h2 className="font-headline-lg text-headline-lg text-center font-extrabold mb-stack-xl text-on-surface">Uncompromising Engineering</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-left">
            
            <div className="group p-stack-lg bg-surface-container-low border border-outline-variant rounded-xl hover:bg-surface-container-high transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-stack-md block">diamond</span>
              <h4 className="font-headline-md text-headline-md font-extrabold mb-stack-sm text-on-surface">Calidad de Importación</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Cada producto es importado directamente desde los proveedores globales líderes, garantizando la autenticidad y materiales premium testeados.
              </p>
            </div>

            <div className="group p-stack-lg bg-surface-container-low border border-outline-variant rounded-xl hover:bg-surface-container-high transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-stack-md block">precision_manufacturing</span>
              <h4 className="font-headline-md text-headline-md font-extrabold mb-stack-sm text-on-surface">Inspección Técnica</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Nuestros agentes de almacén testean manualmente el funcionamiento del producto antes de proceder al embalaje y despacho nacional.
              </p>
            </div>

            <div className="group p-stack-lg bg-surface-container-low border border-outline-variant rounded-xl hover:bg-surface-container-high transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-stack-md block">security</span>
              <h4 className="font-headline-md text-headline-md font-extrabold mb-stack-sm text-on-surface">Despacho Asegurado</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Utilizamos embalajes de alta resistencia e incluimos un seguro total por pérdida o daño físico durante la logística del transporte terrestre o aéreo.
              </p>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
