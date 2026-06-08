import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // ── Estado del modal de reseña ──
  const [reviewModal, setReviewModal] = useState({ open: false, productId: null, productName: '' });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewToast, setReviewToast] = useState({ show: false, message: '', type: 'success' });
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getCustomerOrders();
      // Sort orders chronologically (newest first)
      const sorted = (data || []).sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));
      setOrders(sorted);
      
      // Auto-expand the first order if any exists
      if (sorted.length > 0) {
        setExpandedOrderId(sorted[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setError('No pudimos recuperar tu historial de pedidos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleAccordion = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Helper to format date in Spanish
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Fecha no disponible';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateStr;
    }
  };

  const parseNotes = (notesStr) => {
    if (!notesStr) return { razon_social: '', nit_ci: '', customer_notes: '' };
    try {
      const parsed = JSON.parse(notesStr);
      if (parsed && typeof parsed === 'object') {
        return {
          razon_social: parsed.razon_social || '',
          nit_ci: parsed.nit_ci || '',
          customer_notes: parsed.customer_notes || ''
        };
      }
    } catch (e) {
      // ignore
    }
    return { razon_social: '', nit_ci: '', customer_notes: notesStr };
  };

  // Helper to style status badges — Hito 3 statuses
  const getStatusBadge = (status) => {
    const cleanStatus = status?.toLowerCase() || 'pending';
    
    const statusConfig = {
      pending: {
        label: 'Pendiente',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-600',
        animate: true,
      },
      confirmed: {
        label: 'Confirmado',
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-600',
      },
      processing: {
        label: 'En Proceso',
        classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-600',
      },
      shipped: {
        label: 'Enviado',
        classes: 'bg-purple-50 text-purple-700 border-purple-200',
        dotClass: 'bg-purple-600',
      },
      delivered: {
        label: 'Entregado',
        classes: 'bg-green-50 text-green-700 border-green-200',
        dotClass: 'bg-green-600',
      },
      cancelled: {
        label: 'Cancelado',
        classes: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-600',
      },
    };

    const config = statusConfig[cleanStatus] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.classes} ${config.animate ? 'animate-pulse' : ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
        {config.label}
      </span>
    );
  };

  // ── Helpers del Modal de Reseña ──
  const showReviewToast = (message, type = 'success') => {
    setReviewToast({ show: true, message, type });
    setTimeout(() => setReviewToast({ show: false, message: '', type }), 4000);
  };

  const openReviewModal = (productId, productName) => {
    setReviewModal({ open: true, productId, productName });
    setReviewRating(0);
    setReviewHover(0);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, productId: null, productName: '' });
    setReviewRating(0);
    setReviewHover(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await reviewService.createReview(reviewModal.productId, {
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setReviewedProducts((prev) => new Set([...prev, reviewModal.productId]));
      showReviewToast('¡Reseña enviada exitosamente! Gracias por tu opinión.');
      closeReviewModal();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al enviar la reseña.';
      showReviewToast(detail, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant font-semibold">Cargando tu historial de compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-outline-variant p-6 rounded-2xl shadow-md text-center">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">error</span>
          <p className="font-bold text-lg text-on-surface mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-95 font-bold shadow-md active:scale-95 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 md:px-margin-desktop">
      <div className="max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 overflow-x-auto whitespace-nowrap pb-1">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">Mis Pedidos</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Historial de Pedidos</h1>
          <p className="text-on-surface-variant text-body-medium mt-1">
            Realiza un seguimiento de tus compras cronológicas y verifica sus estados de entrega.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px] text-slate-400">
                receipt_long
              </span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No tienes pedidos registrados</h3>
            <p className="text-on-surface-variant mb-6 text-sm max-w-sm mx-auto">
              Aún no has realizado ninguna compra en Importadora Market. Explora nuestro catálogo de productos para hacer tu primer pedido.
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              
              // Calculate details totals
              const itemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
              const sellerPhone = order.items?.find(it => it.product?.seller_phone)?.product?.seller_phone || order.items?.find(it => it.product?.submitted_by_phone)?.product?.submitted_by_phone || '70000000';
              const cleanSellerPhone = sellerPhone.replace(/\D/g, '');
              const waSellerPhone = cleanSellerPhone.startsWith('591') || cleanSellerPhone.length > 8 ? cleanSellerPhone : '591' + cleanSellerPhone;
              const whatsappHref = `https://wa.me/${waSellerPhone}?text=${encodeURIComponent(
                `Hola Importadora Market, mi pedido #${order.id} ya fue aceptado. Quiero coordinar el método de pago manual y el envío de mis datos de facturación.`
              )}`;

              return (
                <div 
                  key={order.id}
                  className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Accordion Trigger Header */}
                  <div
                    onClick={() => toggleAccordion(order.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs border border-slate-200/50">
                        #{order.id}
                      </div>
                      <div className="text-sm font-semibold text-slate-400">
                        {formatDate(order.order_date)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-400 font-medium">{itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}</p>
                        <p className="text-base font-bold text-primary mt-0.5">{order.total_amount?.toFixed(2)} Bs.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span 
                          className={`material-symbols-outlined text-slate-400 text-[22px] transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-primary' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Expandable Content */}
                  <div 
                    className={`transition-all duration-300 ease-in-out border-t border-outline-variant/60 ${
                      isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="p-5 bg-slate-50/30 space-y-6">
                      {/* Meta Delivery Specs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-outline-variant/60 pb-5 text-sm font-semibold">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Dirección de Envío</p>
                          <p className="text-on-surface bg-white p-3 rounded-xl border border-outline-variant/40 leading-relaxed font-medium">
                            {order.shipping_address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Contacto Registrado</p>
                          <p className="text-on-surface bg-white p-3 rounded-xl border border-outline-variant/40 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-green-600">phone</span>
                            {order.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Estado del Pedido</p>
                          <div className="bg-white p-3 rounded-xl border border-outline-variant/40">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>

                      {/* Notes section (if present) */}
                      {order.notes && (() => {
                        const billing = parseNotes(order.notes);
                        return (
                          <div className="border-b border-outline-variant/60 pb-5 space-y-4">
                            {(billing.razon_social || billing.nit_ci) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Razón Social de Facturación</p>
                                  <p className="text-on-surface bg-white p-3 rounded-xl border border-outline-variant/40 text-sm font-semibold">
                                    {billing.razon_social || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">CI / NIT</p>
                                  <p className="text-on-surface bg-white p-3 rounded-xl border border-outline-variant/40 text-sm font-semibold">
                                    {billing.nit_ci || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}
                            {billing.customer_notes && (
                              <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Notas del Comprador</p>
                                <p className="text-on-surface bg-white p-3 rounded-xl border border-outline-variant/40 text-sm font-medium leading-relaxed">
                                  {billing.customer_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Items list breakdown */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Artículos en este Pedido</h4>
                        <div className="divide-y divide-outline-variant/50">
                          {order.items?.map((item) => {
                            const prod = item.product || {};
                            const canReview = order.status === 'delivered' && prod.id && !reviewedProducts.has(prod.id);
                            const alreadyReviewed = order.status === 'delivered' && prod.id && reviewedProducts.has(prod.id);
                            return (
                              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="w-12 h-12 bg-white border border-outline-variant rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {prod.imagen_url ? (
                                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="material-symbols-outlined text-slate-300 text-[22px]">image</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-sm font-bold text-on-surface truncate" title={prod.nombre}>
                                      {prod.nombre || 'Producto no especificado'}
                                    </h5>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      Cantidad: <strong className="text-slate-600 font-semibold">{item.quantity}</strong> x {item.unit_price?.toFixed(2)} Bs.
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {canReview && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openReviewModal(prod.id, prod.nombre || 'Producto');
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">star</span>
                                      Reseñar
                                    </button>
                                  )}
                                  {alreadyReviewed && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                                      <span className="material-symbols-outlined text-[14px]">check</span>
                                      Reseñado
                                    </span>
                                  )}
                                  <span className="text-sm font-bold text-on-surface whitespace-nowrap">
                                    {item.subtotal?.toFixed(2)} Bs.
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {order.status === 'confirmed' && (
                        <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600">check_circle</span>
                          <span>¡Tu pedido fue aceptado! Por favor, ponte en contacto con la importadora para enviar tu comprobante de pago y coordinar los datos de tu factura.</span>
                        </div>
                      )}

                      {/* Footer CTA */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/60 pt-5 bg-slate-50 -mx-5 -mb-5 px-5 py-4 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <span className="material-symbols-outlined text-[16px] text-green-600">lock</span>
                          Pedido Seguro
                        </div>
                        <a 
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-white border border-green-200 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer select-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                          Coordinar Pago por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Toast de Reseña */}
      {reviewToast.show && (
        <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold ${
          reviewToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{reviewToast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p>{reviewToast.message}</p>
        </div>
      )}

      {/* Modal de Reseña */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={closeReviewModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeReviewModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-amber-500 text-[28px]">rate_review</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Dejar Reseña</h3>
              <p className="text-sm text-slate-400 mt-1 truncate px-4" title={reviewModal.productName}>
                {reviewModal.productName}
              </p>
            </div>

            {/* Estrellas interactivas */}
            <div className="flex justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHover(star)}
                  onMouseLeave={() => setReviewHover(0)}
                  className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined text-[36px] transition-colors ${
                      star <= (reviewHover || reviewRating)
                        ? 'text-amber-400'
                        : 'text-slate-200'
                    }`}
                    style={{ fontVariationSettings: star <= (reviewHover || reviewRating) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {reviewRating > 0 && (
              <p className="text-center text-xs font-semibold text-amber-600 mb-4">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][reviewRating]}
              </p>
            )}

            {/* Comentario opcional */}
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Escribe un comentario (opcional)..."
              maxLength={1000}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-slate-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none resize-none transition-all mb-5"
            />

            <button
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || reviewSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              {reviewSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Enviar Reseña
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
