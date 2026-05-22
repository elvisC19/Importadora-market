import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart, cartItemsCount, cartTotal } = useCart();

  // Calculate standard total and discount savings
  const standardTotal = cart.reduce((sum, item) => sum + (item.product.precio * item.cantidad), 0);
  const discountTotal = cart.reduce((sum, item) => {
    if (item.product.is_offer && item.product.offer_price != null) {
      return sum + ((item.product.precio - item.product.offer_price) * item.cantidad);
    }
    return sum;
  }, 0);
  const finalTotal = cartTotal;

  if (cartItemsCount === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-outline-variant rounded-2xl p-8 text-center shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px] text-slate-400 animate-pulse">
              shopping_bag
            </span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Tu carrito está vacío</h1>
          <p className="text-on-surface-variant mb-8 text-body-medium max-w-sm mx-auto">
            ¡Parece que aún no has añadido nada a tu carrito! Explora nuestras ofertas exclusivas e importaciones premium de alta calidad.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl hover:opacity-95 active:scale-98 transition-all font-bold shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            Ver Catálogo de Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 md:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link to="/productos" className="hover:text-primary transition-colors">Catálogo</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">Carrito de Compras</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface">Carrito de Compras</h1>
              <p className="text-on-surface-variant text-body-medium mt-1">
                Gestiona tus artículos antes de completar la orden de compra.
              </p>
            </div>
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-sm font-bold text-error border border-red-200 hover:bg-red-50 rounded-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Vaciar Carrito
            </button>
          </div>
        </div>

        {/* Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.product;
              const hasDiscount = product.is_offer && product.offer_price != null;
              const currentPrice = hasDiscount ? product.offer_price : product.precio;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-outline-variant p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center justify-between"
                >
                  {/* Left: Product Image & Details */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-1">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-outline-variant">
                      {product.imagen_url ? (
                        <img
                          src={product.imagen_url}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-[32px]">image</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-1.5">
                        {product.is_new && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold border border-blue-100 uppercase tracking-wider">
                            Novedad
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold border border-red-100 uppercase tracking-wider">
                            Oferta
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline font-bold text-on-surface text-base truncate" title={product.nombre}>
                        {product.nombre}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 max-w-sm">
                        {product.descripcion || 'Sin descripción disponible'}
                      </p>

                      {/* Stock alerts */}
                      {product.stock <= 5 ? (
                        <p className="text-[11px] font-bold text-error mt-1.5 flex items-center gap-1 justify-center sm:justify-start">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          ¡Solo {product.stock} unidades disponibles!
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold text-green-600 mt-1.5 flex items-center gap-1 justify-center sm:justify-start">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          En Stock ({product.stock})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity Adjustments, Price & Delete */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    {/* Quantity selectors */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(product.id, item.cantidad - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white active:scale-90 transition-all font-bold text-lg"
                        title="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-slate-800 text-sm">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, item.cantidad + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white active:scale-90 transition-all font-bold text-lg"
                        title="Incrementar cantidad"
                        disabled={item.cantidad >= product.stock}
                      >
                        +
                      </button>
                    </div>

                    {/* Price and Subtotal Info */}
                    <div className="text-right flex flex-col justify-center sm:justify-end">
                      <div className="flex items-center gap-2 justify-end">
                        {hasDiscount ? (
                          <>
                            <span className="text-xs text-slate-400 line-through font-semibold">{product.precio} Bs.</span>
                            <span className="text-base font-bold text-error">{product.offer_price} Bs.</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-on-surface">{product.precio} Bs.</span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Subtotal: {(currentPrice * item.cantidad).toFixed(2)} Bs.
                      </span>
                    </div>

                    {/* Trash Delete */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-slate-400 hover:text-error hover:bg-red-50 rounded-xl transition-all active:scale-95"
                      title="Eliminar artículo"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-xl font-headline font-bold text-on-surface border-b border-outline-variant pb-4">
                Resumen de Compra
              </h2>

              <div className="space-y-3 font-body-sm text-sm">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Subtotal ({cartItemsCount} artículos)</span>
                  <span>{standardTotal.toFixed(2)} Bs.</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">local_offer</span>
                      Descuento por Ofertas
                    </span>
                    <span>-{discountTotal.toFixed(2)} Bs.</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Envío</span>
                  <span className="text-green-600 font-bold">Gratis</span>
                </div>

                <div className="border-t border-outline-variant my-4 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-headline font-bold text-on-surface">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-headline font-bold text-primary">{finalTotal.toFixed(2)} Bs.</span>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Impuestos incluidos</p>
                  </div>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl hover:opacity-95 active:scale-98 transition-all font-bold shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                  Proceder al Pago
                </Link>
                <Link
                  to="/productos"
                  className="flex items-center justify-center gap-2 w-full py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl active:scale-98 transition-all font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Seguir Comprando
                </Link>
              </div>

              {/* Security info */}
              <div className="border-t border-outline-variant pt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <span className="material-symbols-outlined text-[16px] text-green-600">lock</span>
                  Pago Seguro & Pedido por WhatsApp
                </div>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Tus pedidos se procesan y validan directamente a través de WhatsApp para tu máxima comodidad y seguridad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
