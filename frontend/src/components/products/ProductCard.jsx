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

  return (
    <Link 
      to={`/productos/${id}`} 
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative"
    >
      {/* Badges Container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {is_new && (
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            NUEVO
          </span>
        )}
        {is_offer && (
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            OFERTA
          </span>
        )}
      </div>

      {/* Featured Star */}
      {is_featured && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 p-1.5 rounded-full shadow-sm">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden group-hover:opacity-95 transition-opacity">
        {imagen_url ? (
          <img 
            src={imagen_url} 
            alt={nombre} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-1">{categoria?.nombre || 'General'}</p>
        <h3 className="text-primary font-semibold text-lg line-clamp-2 leading-tight mb-2 flex-grow">
          {nombre}
        </h3>
        
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
          <div>
            {is_offer ? (
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm line-through">Bs. {precio.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-xl">Bs. {final_price.toFixed(2)}</span>
                  {discount_percentage && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-medium">
                      -{discount_percentage}%
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-primary font-bold text-xl">Bs. {final_price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="text-right">
            {stock === 0 ? (
              <span className="text-red-500 text-sm font-medium">Sin stock</span>
            ) : (
              <span className="text-green-600 text-sm font-medium">{stock} disp.</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
