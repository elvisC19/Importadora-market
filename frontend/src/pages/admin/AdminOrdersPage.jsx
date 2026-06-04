import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import statsService from '../../services/statsService';

// Traductores y estilos para estados
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

// Transiciones válidas (para evitar llamadas erróneas al backend)
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const AdminOrdersPage = () => {
  // Data States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Statistics States
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    earnings: 0,
    cancelled: 0,
  });

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [exporting, setExporting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 4000);
  };

  // Load orders data
  const loadOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders from API with optional filters
      const parsedDateFrom = dateFrom ? new Date(dateFrom).toISOString() : null;
      const parsedDateTo = dateTo ? new Date(dateTo).toISOString() : null;

      const data = await orderService.getAdminOrders(0, 100, statusFilter || null, parsedDateFrom, parsedDateTo);
      setOrders(data || []);

      // Calculate statistics based on fetched/unfiltered data (fetching all once)
      const allData = await orderService.getAdminOrders(0, 100, null, null, null);
      
      const total = allData.length;
      const pending = allData.filter(o => o.status === 'pending').length;
      const cancelled = allData.filter(o => o.status === 'cancelled').length;
      
      // Calculate earnings from completed or confirmed purchases (non-cancelled)
      const earnings = allData
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total_amount, 0);

      setStats({ total, pending, earnings, cancelled });
      setError(null);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Ocurrió un error al intentar recuperar la lista de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blobData = await statsService.exportOrdersCsv(dateFrom, dateTo);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      
      const start = dateFrom || 'inicio';
      const end = dateTo || 'fin';
      link.setAttribute('download', `pedidos_export_${start}_to_${end}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Exportación a CSV realizada con éxito.');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showToast('Error al exportar pedidos a CSV.', 'error');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFrom, dateTo]);

  // Handle Order Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check frontend side transition validation
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      showToast(`No se permite cambiar el estado de ${STATUS_CONFIG[order.status].label} a ${STATUS_CONFIG[newStatus].label}`, 'error');
      return;
    }

    setUpdatingStatusId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`El pedido #${orderId} se actualizó a '${STATUS_CONFIG[newStatus].label}' con éxito.`);
      
      // Update local state smoothly
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: updated.status, updated_at: updated.updated_at } : o)));
      
      // Update currently open detail modal if any
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: updated.status, updated_at: updated.updated_at }));
      }
      
      // Reload stats
      const allData = await orderService.getAdminOrders(0, 100, null, null, null);
      const total = allData.length;
      const pending = allData.filter(o => o.status === 'pending').length;
      const cancelled = allData.filter(o => o.status === 'cancelled').length;
      const earnings = allData.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);
      setStats({ total, pending, earnings, cancelled });
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMsg = err.response?.data?.detail || 'Error al actualizar el estado del pedido.';
      showToast(errorMsg, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Open Detail View Modal
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Date Formatting Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
          <p className="text-xs text-slate-400 mt-1">Gestión del Sistema</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link to="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-semibold">Usuarios</span>
          </Link>
          <Link to="/admin/inventario" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm font-semibold">Inventario</span>
          </Link>
          <Link to="/admin/pedidos" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg shadow-sm font-bold animate-in">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm font-semibold">Pedidos</span>
          </Link>
          <Link to="/admin/contactos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">mail</span>
            <span className="text-sm font-semibold">Contactos</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 p-4 md:p-8 relative min-w-0">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Admin</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary font-bold">Pedidos</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-accent">receipt_long</span>
              Gestión de Pedidos
            </h1>
            <p className="text-gray-500 text-sm mt-1">Monitorea compras, cambia estados de entrega y visualiza los datos de envío de los clientes.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button 
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-primary border border-gray-200 font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              title="Exportar pedidos filtrados a CSV"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <button 
              onClick={loadOrders}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              title="Refrescar lista"
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
          </div>
        )}

        <div className="px-4 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
          {/* Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Orders Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pedidos Totales</span>
                <span className="text-3xl font-extrabold text-primary block mt-1">{stats.total}</span>
              </div>
            </div>

            {/* Pending/New Card */}
            <div 
              onClick={() => setStatusFilter('pending')}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px] animate-pulse">pending</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pendientes</span>
                <span className="text-3xl font-extrabold text-primary block mt-1">{stats.pending}</span>
              </div>
            </div>

            {/* Sales Earnings Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Ingresos Generados</span>
                <span className="text-3xl font-extrabold text-emerald-600 block mt-1">Bs. {stats.earnings.toFixed(2)}</span>
              </div>
            </div>

            {/* Cancelled Card */}
            <div 
              onClick={() => setStatusFilter('cancelled')}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-red-200 transition-all group"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">cancel</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Cancelados</span>
                <span className="text-3xl font-extrabold text-primary block mt-1">{stats.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Main Content Layout Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Advanced Filtering & Inputs Toolbar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl mb-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Select */}
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

                {/* Date From Picker */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-white border border-gray-250 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Date To Picker */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-white border border-gray-250 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Clear Filters Button */}
                {(statusFilter || dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="mt-4 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                    Limpiar
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider self-end lg:self-center">
                Mostrando {orders.length} pedidos
              </div>
            </div>

            {/* Table container */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Pedido</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Pedido</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {orders.map(order => {
                      const statusVal = order.status?.toLowerCase() || 'pending';
                      const config = STATUS_CONFIG[statusVal] || STATUS_CONFIG.pending;
                      const allowedNext = ALLOWED_TRANSITIONS[statusVal] || [];

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* ID Pedido */}
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-primary">#{order.id}</span>
                          </td>

                          {/* Cliente Details */}
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-bold text-primary block">{order.user?.nombre || 'Desconocido'}</span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">{order.user?.email || 'N/A'}</span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">phone</span>
                                {order.phone}
                              </span>
                            </div>
                          </td>

                          {/* Fecha */}
                          <td className="px-6 py-4 text-slate-500">
                            {formatDate(order.order_date || order.created_at)}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4">
                            <span className="text-primary font-bold">Bs. {order.total_amount.toFixed(2)}</span>
                          </td>

                          {/* Estado Selector */}
                          <td className="px-6 py-4">
                            {updatingStatusId === order.id ? (
                              <div className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></span>
                                <span className="text-xs text-slate-400">Actualizando...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {/* Status Badge */}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
                                  {config.label}
                                </span>

                                {/* Quick Change Dropdown if states transitions are available */}
                                {allowedNext.length > 0 && (
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold cursor-pointer focus:outline-none"
                                  >
                                    <option value={order.status} disabled>Cambiar estado...</option>
                                    {allowedNext.map(next => (
                                      <option key={next} value={next}>
                                        {STATUS_CONFIG[next]?.label || next}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openDetailModal(order)}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-xl transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-white">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">receipt_long</span>
                <p className="text-slate-400 font-bold text-sm">No se encontraron pedidos registrados con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ======================================= */}
      {/* ORDER DETAILS MODAL (GLASSMORPHIC)      */}
      {/* ======================================= */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop blurring effect */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsDetailModalOpen(false)}
          />

          {/* Modal Card content */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>Pedido #{selectedOrder.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedOrder.status]?.badgeClass || ''}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Registrado el {formatDate(selectedOrder.order_date || selectedOrder.created_at)}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Section 1: Customer details & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Información del Cliente
                  </h4>
                  <p className="font-bold text-sm text-primary">{selectedOrder.user?.nombre || 'Desconocido'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.user?.email || 'N/A'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">phone</span>
                    {selectedOrder.phone}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    Datos de Entrega
                  </h4>
                  <p className="text-sm font-semibold text-primary">{selectedOrder.shipping_address}</p>
                   {(() => {
                     const billing = parseNotes(selectedOrder.notes);
                     return (
                       <>
                         {(billing.razon_social || billing.nit_ci) && (
                           <div className="mt-2 pt-2 border-t border-slate-200">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Datos de Facturación:</span>
                             <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                               <p><strong>Razón Social:</strong> {billing.razon_social || 'N/A'}</p>
                               <p><strong>CI / NIT:</strong> {billing.nit_ci || 'N/A'}</p>
                             </div>
                           </div>
                         )}
                         {billing.customer_notes && (
                           <div className="mt-2 pt-2 border-t border-slate-200">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas Adicionales:</span>
                             <p className="text-xs text-slate-600 font-medium italic mt-0.5 bg-white p-2 rounded-lg border border-slate-100">
                               {billing.customer_notes}
                             </p>
                           </div>
                         )}
                       </>
                     );
                   })()}
                 </div>
              </div>

              {/* Section 2: Order Items list with Images */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Detalle de Productos</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-4 py-3">Miniatura</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-center">Cant.</th>
                        <th className="px-4 py-3 text-right">Unitario</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {selectedOrder.items && selectedOrder.items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          {/* Image Thumbnail */}
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center">
                              {item.product?.imagen_url ? (
                                <img src={item.product.imagen_url} alt={item.product.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-300">image</span>
                              )}
                            </div>
                          </td>

                          {/* Product Info */}
                          <td className="px-4 py-3">
                            <span className="text-primary truncate block max-w-[200px]" title={item.product?.nombre}>
                              {item.product?.nombre || `Producto ID #${item.product_id}`}
                            </span>
                            {item.product?.categoria && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded block mt-0.5 uppercase w-max">
                                {item.product.categoria.nombre}
                              </span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="px-4 py-3 text-center text-primary font-bold">
                            {item.quantity}
                          </td>

                          {/* Unit price */}
                          <td className="px-4 py-3 text-right text-slate-500 font-bold">
                            Bs. {item.unit_price.toFixed(2)}
                          </td>

                          {/* Subtotal */}
                          <td className="px-4 py-3 text-right text-primary font-extrabold">
                            Bs. {item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer with pricing & transition controls */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Order total amount display */}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monto Total del Pedido</span>
                <span className="text-2xl font-extrabold text-accent">Bs. {selectedOrder.total_amount.toFixed(2)}</span>
              </div>

              {/* Status transitions control */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {selectedOrder.status === 'confirmed' && (
                  <a
                    href={`https://wa.me/${(() => {
                      const cleanPhone = selectedOrder.phone.replace(/\D/g, '');
                      return cleanPhone.startsWith('591') || cleanPhone.length > 8 ? cleanPhone : '591' + cleanPhone;
                    })()}?text=${encodeURIComponent(
                      `Hola ${selectedOrder.user?.nombre || ''}, hemos verificado y confirmado tu pedido número #${selectedOrder.id} en Importadora Market. Procedamos con la coordinación del pago por QR/transferencia y los detalles de tu factura.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 select-none"
                  >
                    <span>💬 Contactar con el cliente</span>
                  </a>
                )}
                {ALLOWED_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Actualizar estado:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {ALLOWED_TRANSITIONS[selectedOrder.status].map(next => (
                        <button
                          key={next}
                          onClick={() => handleStatusChange(selectedOrder.id, next)}
                          disabled={updatingStatusId !== null}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                            next === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              : 'bg-teal-500 text-slate-950 border-teal-400 hover:bg-teal-400'
                          }`}
                        >
                          {STATUS_CONFIG[next]?.label || next}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                    <span>El pedido se encuentra completado y cerrado.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
