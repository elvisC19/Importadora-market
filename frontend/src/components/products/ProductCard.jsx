import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
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
    // Trigger local storage cart / custom toast
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch a global storage event to update the navbar cart badge
    window.dispatchEvent(new Event('storage'));
    
    // Show a premium native toast notice
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 left-5 z-50 bg-on-background text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-outline/20 animate-bounce";
    toast.innerHTML = `
      <span class="material-symbols-outlined text-green-400">check_circle</span>
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Carrito Actualizado</p>
        <p class="text-sm font-semibold">${nombre.substring(0, 24)}...</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <Link 
      to={`/productos/${id}`} 
      className="group bg-surface rounded-xl overflow-hidden border border-outline-variant hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-container">
        {imagen_url ? (
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={imagen_url} 
            alt={nombre} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-[48px]">image</span>
          </div>
        )}
        
        {/* Badges Container */}
        <div className="absolute top-stack-md left-stack-md flex flex-col gap-1.5 z-10">
          {is_new && (
            <span className="px-3 py-1 bg-secondary text-on-secondary font-label-sm text-label-sm rounded font-bold uppercase tracking-wider">
              NUEVO
            </span>
          )}
          {is_offer && (
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded font-bold uppercase tracking-wider">
              OFERTA
            </span>
          )}
        </div>

        {/* Featured Star Indicator */}
        {is_featured && (
          <span className="absolute top-stack-md right-stack-md p-1.5 bg-white/95 rounded-full shadow-sm text-yellow-500 material-symbols-outlined text-[16px] z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        )}

        {stock > 0 && (
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-stack-md right-stack-md p-2.5 bg-white text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-secondary hover:text-white cursor-pointer z-10"
            title="Agregar al Carrito"
          >
            <span className="material-symbols-outlined text-[20px] block">add_shopping_cart</span>
          </button>
        )}
      </div>

      <div className="p-stack-md flex flex-col flex-grow justify-between">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-stack-xs font-semibold">
            {categoria?.nombre || 'General'}
          </p>
          <h3 className="font-body-md text-body-md text-on-surface font-semibold mb-stack-sm line-clamp-2 min-h-[48px] group-hover:text-secondary transition-colors duration-200">
            {nombre}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-stack-md">
            {is_offer ? (
              <>
                <span className="font-data-mono text-data-mono text-secondary font-bold text-sm">Bs. {final_price.toFixed(2)}</span>
                <span className="font-data-mono text-data-mono text-outline line-through text-xs">Bs. {precio.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-data-mono text-data-mono text-primary font-bold text-sm">Bs. {precio.toFixed(2)}</span>
            )}
          </div>
          
          <div>
            {stock === 0 ? (
              <span className="text-error text-[10px] font-bold uppercase bg-error-container/50 px-2 py-0.5 rounded-full">Agotado</span>
            ) : (
              <span className="text-green-600 text-[10px] font-bold uppercase bg-green-50 px-2 py-0.5 rounded-full">{stock} disp.</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
