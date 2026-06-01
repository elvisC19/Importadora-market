import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import importadoraService from '../../services/importadoraService';
import orderService from '../../services/orderService';

// Status badge styling consistent with AdminOrdersPage
const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  processing: {
    label: 'En Proceso',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  shipped: {
    label: 'Enviado 🚚',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  delivered: {
    label: 'Entregado ✅',
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
  },
  cancelled: {
    label: 'Cancelado ❌',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
};

const ImportadoraOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activePrintId, setActivePrintId] = useState(null);

  const handlePrint = (orderId) => {
    setActivePrintId(orderId);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 4000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      await importadoraService.updateOrderStatus(orderId, newStatus);
      showToast(`El pedido #${orderId} se actualizó a '${STATUS_CONFIG[newStatus].label}' con éxito.`);
      
      // Reload both orders list and stats
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMsg = err.response?.data?.detail || 'Error al actualizar el estado del pedido.';
      showToast(errorMsg, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        importadoraService.getMyOrders(statusFilter || null),
        importadoraService.getMyStats(),
      ]);
      setOrders(ordersData || []);
      setStats(statsData || null);
      setError(null);
    } catch (err) {
      console.error('Error loading importadora orders:', err);
      setError('No se pudieron cargar las ventas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('es-ES', options);
    } catch {
      return dateStr;
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Toast Notice */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold animate-in slide-in-from-bottom duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full p-6 border-r border-slate-800 z-30 select-none">
        <div className="mb-10">
          <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-accent text-[28px]">store</span>
            <span>Importadora</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/importadora/productos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">widgets</span>
            <span className="text-sm font-semibold">Mis Productos</span>
          </Link>
          <Link to="/importadora/subir" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-sm font-semibold">Subir Producto</span>
          </Link>
          <Link to="/importadora/pedidos" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg shadow-sm font-bold">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-sm font-semibold">Mis Ventas</span>
          </Link>
          <hr className="border-slate-800 my-4" />
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm font-semibold">Volver a la Tienda</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 p-4 md:p-8 relative min-w-0">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span className="text-slate-400">Importadora</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary font-bold">Mis Ventas</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-accent">point_of_sale</span>
              Mis Ventas
            </h1>
            <p className="text-gray-500 text-sm mt-1">Monitorea y actualiza los pedidos que incluyen tus productos importados.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <Link
              to="/importadora/productos"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-primary border border-gray-250 font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">widgets</span>
              Mis Productos
            </Link>
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Sincronizar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined">error</span>
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadData}
              className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pedidos Recibidos</span>
              <span className="text-3xl font-extrabold text-primary block mt-1">
                {stats ? stats.total_orders : '—'}
              </span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Total Vendido</span>
              <span className="text-3xl font-extrabold text-emerald-600 block mt-1">
                {stats ? `Bs. ${stats.total_revenue.toFixed(2)}` : '—'}
              </span>
            </div>
          </div>

          {/* Pending */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px] animate-pulse">pending</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pendientes</span>
              <span className="text-3xl font-extrabold text-amber-600 block mt-1">
                {stats ? stats.pending_orders : '—'}
              </span>
            </div>
          </div>

          {/* Top Product */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">trophy</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Más Vendido</span>
              <span className="text-lg font-extrabold text-primary block mt-1 truncate max-w-[150px]" title={stats?.top_product || ''}>
                {stats?.top_product || 'Sin datos'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-0 w-full">
          
          {/* Filtering Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col min-w-[150px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-gray-250 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-accent"
                >
                  <option value="">Todos los Estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">En Proceso</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="mt-4 px-3 py-2 text-xs font-bold text-red-605 hover:text-red-800 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                  Limpiar
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider self-end sm:self-center">
              Mostrando {orders.length} pedidos
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-slate-500 font-bold text-sm">Cargando tus ventas...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Nº Pedido</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Teléfono</th>
                    <th className="px-6 py-4">Dirección</th>
                    <th className="px-6 py-4">Mis Productos</th>
                    <th className="px-6 py-4 text-right">Mi Subtotal</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {orders.map((order) => {
                    const statusVal = order.status?.toLowerCase() || 'pending';
                    const config = STATUS_CONFIG[statusVal] || STATUS_CONFIG.pending;
                    const isExpanded = expandedOrderId === order.order_id;

                    return (
                      <React.Fragment key={order.order_id}>
                        <tr
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => toggleExpand(order.order_id)}
                        >
                          {/* Order ID */}
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-primary">#{order.order_id}</span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            {formatDate(order.order_date)}
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4">
                            <span className="text-slate-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">phone</span>
                              {order.client_phone}
                            </span>
                          </td>

                          {/* Address */}
                          <td className="px-6 py-4">
                            <span className="text-slate-600 truncate block max-w-[200px]" title={order.client_address}>
                              {order.client_address}
                            </span>
                          </td>

                          {/* My Products summary */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              {order.my_items.slice(0, 2).map((item, idx) => (
                                <span key={idx} className="text-xs text-slate-700">
                                  <span className="font-bold">{item.quantity}×</span> {item.product_name}
                                </span>
                              ))}
                              {order.my_items.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  +{order.my_items.length - 2} más...
                                </span>
                              )}
                            </div>
                          </td>

                          {/* My Subtotal */}
                          <td className="px-6 py-4 text-right">
                            <span className="text-primary font-bold">Bs. {order.my_subtotal.toFixed(2)}</span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
                              {config.label}
                            </span>
                          </td>

                          {/* Expand Icon */}
                          <td className="px-4 py-4 text-center">
                            <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              keyboard_arrow_down
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 animate-in fade-in duration-200">
                            <td colSpan={8} className="px-6 py-5">
                              <div className="max-w-3xl space-y-4">
                                
                                {/* Action cards grid - hidden during print */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
                                  {/* Client Details and Action */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between gap-3 text-left">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Información de Contacto</span>
                                      <p className="text-sm font-bold text-slate-800">Dirección y Teléfono del Cliente</p>
                                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        {order.client_name || 'Desconocido'}
                                      </p>
                                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">phone</span>
                                        {order.client_phone}
                                      </p>
                                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                        {order.client_address}
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      {/* Premium WhatsApp Integration button */}
                                      <a 
                                        href={`https://wa.me/591${order.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                          `Hola ${order.client_name || 'Cliente'}, te saludamos de Importadora Market. Estamos procesando tu pedido #${order.order_id}, por favor envíanos el comprobante de transferencia o pago para coordinar la entrega.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] select-none cursor-pointer"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        WhatsApp
                                      </a>

                                      {/* Print Invoice button */}
                                      <button 
                                        onClick={() => handlePrint(order.order_id)}
                                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] select-none cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">print</span>
                                        Imprimir Nota / Factura
                                      </button>
                                    </div>
                                  </div>

                                  {/* Status Updater Card */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between gap-3 text-left">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estado de la Entrega</span>
                                      <p className="text-sm font-bold text-slate-800">Actualizar Estado</p>
                                      <p className="text-xs text-slate-400 block mt-0.5">El cliente recibirá la notificación de cambio de estado.</p>
                                    </div>
                                    
                                    {updatingStatusId === order.order_id ? (
                                      <div className="flex items-center gap-2 py-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></span>
                                        <span className="text-xs text-slate-400">Actualizando...</span>
                                      </div>
                                    ) : (
                                      <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        className="w-full max-w-[200px] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                                      >
                                        <option value="pending">Pendiente</option>
                                        <option value="confirmed">Confirmado</option>
                                        <option value="processing">En Proceso</option>
                                        <option value="shipped">Enviado</option>
                                        <option value="delivered">Entregado</option>
                                        <option value="cancelled">Cancelado</option>
                                      </select>
                                    )}
                                  </div>
                                </div>

                                {/* Custom Printable Invoice/Note details layout container */}
                                <div id={`print-invoice-${order.order_id}`} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col text-left">
                                  {/* Print-only Invoice Header */}
                                  <div className="border-b pb-4 mb-4 flex justify-between items-center">
                                    <div>
                                      <h2 className="text-lg font-black text-slate-900 tracking-tight">IMPORTADORA MARKET</h2>
                                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Confiabilidad y Desempeño Institucional</p>
                                    </div>
                                    <div className="text-right">
                                      <h3 className="text-sm font-black text-primary uppercase tracking-wider">Nota de Entrega / Factura</h3>
                                      <p className="text-xs font-bold text-slate-500 mt-0.5">Pedido #{order.order_id}</p>
                                    </div>
                                  </div>

                                  {/* Print Details Grid */}
                                  <div className="grid grid-cols-2 gap-6 text-xs mb-6">
                                    <div>
                                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Datos de Facturación / Envío:</span>
                                      <p className="font-bold text-slate-800">{order.client_name || 'Desconocido'}</p>
                                      <p className="text-slate-500 font-mono mt-0.5">Telf: {order.client_phone}</p>
                                      <p className="text-slate-600 mt-1 font-medium">{order.client_address}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Fecha de Emisión:</span>
                                      <p className="font-bold text-slate-800">{formatDate(order.order_date)}</p>
                                      <span className="text-[10px] font-black text-slate-400 uppercase block mt-2 mb-1">Estado:</span>
                                      <span className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 uppercase">
                                        {STATUS_CONFIG[order.status?.toLowerCase()]?.label || order.status}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Items list */}
                                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                          <th className="px-4 py-3">Producto</th>
                                          <th className="px-4 py-3 text-center">Cantidad</th>
                                          <th className="px-4 py-3 text-right">Precio Unit.</th>
                                          <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                                        {order.my_items.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-primary">{item.product_name}</td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">Bs. {item.unit_price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-primary font-extrabold">Bs. {item.subtotal.toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50 border-t border-slate-200">
                                          <td colSpan={3} className="px-4 py-3 text-right font-black text-slate-500 uppercase tracking-wider">
                                            Total a Pagar (Bolivianos)
                                          </td>
                                          <td className="px-4 py-3 text-right font-black text-accent text-sm">
                                            Bs. {order.my_subtotal.toFixed(2)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>

                                  {/* Client Notes in invoice preview */}
                                  {order.client_notes && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-xs text-left">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Instrucciones Especiales del Comprador</span>
                                      <p className="text-slate-600 italic">"{order.client_notes}"</p>
                                    </div>
                                  )}

                                  <div className="border-t border-dashed pt-4 text-center text-[9px] text-slate-400">
                                    <p className="font-semibold uppercase tracking-wider">Gracias por preferir Importadora Market</p>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                <span className="material-symbols-outlined text-[40px] text-slate-300">storefront</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Sin ventas aún</h3>
              <p className="text-on-surface-variant max-w-md mx-auto mb-6 text-sm">
                {statusFilter
                  ? 'No se encontraron pedidos con el estado seleccionado.'
                  : 'Cuando los clientes compren tus productos importados, los pedidos aparecerán aquí.'}
              </p>
              {!statusFilter && (
                <Link
                  to="/importadora/productos"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-on-secondary rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px]">inventory</span>
                  Ver mis productos
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Print Invoice Style Rules Block */}
      {activePrintId && (
        <style>{`
          @media print {
            /* Hide EVERYTHING by default */
            body * {
              visibility: hidden !important;
            }
            /* Show ONLY our printable invoice container and its children */
            #print-invoice-${activePrintId}, #print-invoice-${activePrintId} * {
              visibility: visible !important;
            }
            #print-invoice-${activePrintId} {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              color: black !important;
              padding: 40px !important;
              border: none !important;
              box-shadow: none !important;
            }
            /* Hide the WhatsApp integration button, print controls and state updates select in printed invoice */
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default ImportadoraOrdersPage;
