import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';

const CheckoutPage = () => {
  const { cart, cartItemsCount, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Price calculations
  const standardTotal = cart.reduce((sum, item) => sum + (item.product.precio * item.cantidad), 0);
  const discountTotal = cart.reduce((sum, item) => {
    if (item.product.is_offer && item.product.offer_price != null) {
      return sum + ((item.product.precio - item.product.offer_price) * item.cantidad);
    }
    return sum;
  }, 0);
  const finalTotal = cartTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      setError('Por favor ingresa una dirección de envío válida (mínimo 5 caracteres).');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 7) {
      setError('El teléfono debe tener al menos 7 dígitos.');
      return;
    }

    if (cart.length === 0) {
      setError('Tu carrito de compras está vacío.');
      return;
    }

    setLoading(true);

    try {
      // Map cart items to payload format (quantity, not cantidad)
      const payloadItems = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.cantidad,
      }));

      const orderData = {
        shipping_address: shippingAddress.trim(),
        phone: cleanPhone,
        notes: notes.trim() || null,
        items: payloadItems,
      };

      const result = await orderService.createOrder(orderData);
      setCreatedOrder(result);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Error placing order:', err);
      setError(
        err.response?.data?.detail || 
        'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && createdOrder) {
    return (
      <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-outline-variant rounded-3xl p-8 md:p-10 text-center shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-600 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[48px]">
              check_circle
            </span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">¡Pedido Recibido!</h1>
          <p className="text-on-surface-variant mb-6 text-body-medium max-w-md mx-auto">
            Muchas gracias por tu compra. Tu pedido con código <strong className="text-primary font-bold">#{createdOrder.id}</strong> ha sido registrado exitosamente y está siendo procesado.
          </p>

          {/* Quick specs preview */}
          <div className="bg-slate-50 border border-outline-variant rounded-2xl p-5 mb-8 text-left space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles de Envío y Pedido</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div>
                <p className="text-xs text-slate-400 font-medium">Cliente</p>
                <p className="text-on-surface mt-0.5">{user?.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Teléfono Contacto</p>
                <p className="text-on-surface mt-0.5">{createdOrder.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-medium">Dirección de Destino</p>
                <p className="text-on-surface mt-0.5 line-clamp-1">{createdOrder.shipping_address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Estado</p>
                <p className="text-amber-600 mt-0.5 capitalize font-bold">{createdOrder.status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Monto Total</p>
                <p className="text-green-600 mt-0.5 font-bold">{createdOrder.total_amount?.toFixed(2) || finalTotal.toFixed(2)} Bs.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/pedidos"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl hover:opacity-95 active:scale-98 transition-all font-bold shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              Ver Historial de Pedidos
            </Link>
            <Link
              to="/productos"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-98 transition-all font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 md:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 overflow-x-auto whitespace-nowrap pb-1">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link to="/carrito" className="hover:text-primary transition-colors">Carrito</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">Finalizar Compra</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Finalizar Compra</h1>
          <p className="text-on-surface-variant text-body-medium mt-1">
            Completa la información requerida para registrar tu pedido.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">shopping_cart_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No hay artículos para pagar</h3>
            <p className="text-on-surface-variant mb-6">
              Tu carrito está vacío. Agrega algunos productos para poder continuar con la compra.
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Protected Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              {/* User details read-only card */}
              <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase">Nombre</label>
                    <p className="text-on-surface mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.nombre || 'Cargando...'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase">Email</label>
                    <p className="text-on-surface mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl truncate">
                      {user?.email || 'Cargando...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order data inputs */}
              <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-5">
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">local_shipping</span>
                  Datos de Envío y Contacto
                </h3>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Shipping Address Input */}
                <div>
                  <label htmlFor="shippingAddress" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dirección de Envío / Destino *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-slate-400">
                      pin_drop
                    </span>
                    <textarea
                      id="shippingAddress"
                      rows="2"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Ej. Av. Hernando Siles #123, Zona Sur, La Paz"
                      className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-medium bg-slate-50/50"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Teléfono de Contacto *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        phone_iphone
                      </span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="76543210"
                      className="w-full pl-[42px] pr-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-bold bg-slate-50/50"
                      required
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                    Ingresa un número de teléfono válido para contacto.
                  </p>
                </div>

                {/* Notes (optional) */}
                <div>
                  <label htmlFor="notes" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    id="notes"
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales, horario de entrega preferido, etc."
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-medium bg-slate-50/50"
                  ></textarea>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl hover:opacity-95 active:scale-98 transition-all font-bold shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Procesando Orden...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">send_and_archive</span>
                    Confirmar Pedido
                  </>
                )}
              </button>
            </form>

            {/* Right: Review Order Items (5 columns) */}
            <div className="lg:col-span-5 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-headline font-bold text-on-surface border-b border-outline-variant pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">shopping_bag</span>
                Resumen del Pedido
              </h3>

              {/* Items list inline */}
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const product = item.product;
                  const hasDiscount = product.is_offer && product.offer_price != null;
                  const activePrice = hasDiscount ? product.offer_price : product.precio;

                  return (
                    <div key={product.id} className="flex gap-3 items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center">
                          {product.imagen_url ? (
                            <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">image</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-on-surface truncate max-w-[160px] md:max-w-[200px]" title={product.nombre}>
                            {product.nombre}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Cant: {item.cantidad} x {activePrice} Bs.
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-on-surface whitespace-nowrap">
                        {(activePrice * item.cantidad).toFixed(2)} Bs.
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mini Price Breakdowns */}
              <div className="border-t border-outline-variant pt-4 space-y-3 text-sm font-semibold">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Monto Standard</span>
                  <span>{standardTotal.toFixed(2)} Bs.</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-600 bg-green-50/50 px-2 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[15px]">local_offer</span>
                      Descuentos
                    </span>
                    <span>-{discountTotal.toFixed(2)} Bs.</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>

                <div className="border-t border-outline-variant pt-4 flex justify-between items-baseline">
                  <span className="text-base font-headline font-bold text-on-surface">Total a Pagar</span>
                  <span className="text-xl font-headline font-bold text-primary">{finalTotal.toFixed(2)} Bs.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
