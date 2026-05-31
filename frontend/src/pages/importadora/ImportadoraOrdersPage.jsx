import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import importadoraService from '../../services/importadoraService';

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
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-16 px-4 md:px-margin-desktop select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Link to="/importadora/productos" className="hover:text-primary transition-colors">Importadora</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary">Mis Ventas</span>
            </div>
            <h1 className="text-3xl font-headline font-bold text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-accent">point_of_sale</span>
              Mis Ventas
            </h1>
            <p className="text-on-surface-variant mt-1 text-body-medium">
              Monitorea los pedidos que incluyen tus productos importados.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/importadora/productos"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-primary border border-gray-200 font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">inventory</span>
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Monto Total Vendido</span>
              <span className="text-3xl font-extrabold text-emerald-600 block mt-1">
                {stats ? `Bs. ${stats.total_revenue.toFixed(2)}` : '—'}
              </span>
            </div>
          </div>

          {/* Pending */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">trophy</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Más Vendido</span>
              <span className="text-lg font-extrabold text-primary block mt-1 truncate max-w-[180px]" title={stats?.top_product || ''}>
                {stats?.top_product || 'Sin datos'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Filtering Toolbar */}
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  className="mt-4 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
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
              <p className="text-on-surface-variant font-medium">Cargando tus ventas...</p>
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
                          <tr className="bg-slate-50/80">
                            <td colSpan={8} className="px-6 py-5">
                              <div className="max-w-3xl">
                                {/* Client Notes */}
                                {order.client_notes && (
                                  <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas del Cliente</span>
                                    <p className="text-sm text-slate-600 italic">{order.client_notes}</p>
                                  </div>
                                )}

                                {/* Items detail table */}
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                                  Detalle de Mis Productos en este Pedido
                                </h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3 text-center">Cantidad</th>
                                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                                      {order.my_items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="px-4 py-3 text-primary">{item.product_name}</td>
                                          <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-slate-500">Bs. {item.unit_price.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right text-primary font-extrabold">Bs. {item.subtotal.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="bg-slate-50 border-t border-slate-200">
                                        <td colSpan={3} className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase">
                                          Mi Subtotal
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-extrabold text-accent">
                                          Bs. {order.my_subtotal.toFixed(2)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
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
      </div>
    </div>
  );
};

export default ImportadoraOrdersPage;
