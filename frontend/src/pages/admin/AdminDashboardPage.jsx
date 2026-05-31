import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import statsService from '../../services/statsService';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-750 p-4 rounded-2xl shadow-2xl text-xs font-bold text-white">
        <p className="text-slate-400 mb-1">Fecha: {payload[0].payload.date}</p>
        <p className="text-accent flex items-center gap-1.5 text-sm">
          <span className="material-symbols-outlined text-[16px] text-accent">receipt_long</span>
          Pedidos: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const stats = await statsService.getDashboardStats();
      setData(stats);

      const chart = await statsService.getOrdersChart(7);
      // Formatear la fecha para visualización en el gráfico (ej. YYYY-MM-DD -> DD/MM)
      const formattedChart = chart.map((item) => {
        const parts = item.date.split('-');
        return {
          ...item,
          displayName: parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date,
        };
      });
      setChartData(formattedChart);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Ocurrió un error al intentar recuperar las estadísticas del panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blobData = await statsService.exportOrdersCsv('', '');
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedidos_export_completo_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Exportación completa a CSV exitosa.');
    } catch (err) {
      console.error('Error exporting entire orders CSV:', err);
      showToast('Error al exportar los pedidos a CSV.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const stats = data?.summary || {
    total_products: 0,
    total_users: 0,
    orders_today: 0,
    pending_orders: 0,
    total_earnings: 0,
  };

  const topProducts = data?.most_ordered_products || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 md:px-margin-desktop select-none">
      {/* Toast Notice */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold animate-in slide-in-from-bottom duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p>{toast.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span className="text-slate-400">Admin</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary">Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-accent">dashboard</span>
              Panel de Administración
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Visualiza el resumen general, estadísticas de ventas, métricas de inventario y accesos directos de control.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-primary border border-gray-200 font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              {exporting ? 'Exportando...' : 'Exportar Ventas'}
            </button>
            <button 
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              title="Refrescar estadísticas"
            >
              <span className="material-symbols-outlined text-[20px] animate-spin-hover">refresh</span>
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

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <span className="text-slate-400 font-semibold text-sm">Cargando métricas del sistema...</span>
          </div>
        ) : (
          <>
            {/* Stats Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
              {/* Active Products */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Productos Activos</span>
                  <span className="text-3xl font-extrabold text-primary block mt-1">{stats.total_products}</span>
                </div>
              </div>

              {/* Registered Users */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">group</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Usuarios</span>
                  <span className="text-3xl font-extrabold text-primary block mt-1">{stats.total_users}</span>
                </div>
              </div>

              {/* Orders Today */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px] animate-pulse">date_range</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pedidos Hoy</span>
                  <span className="text-3xl font-extrabold text-primary block mt-1">{stats.orders_today}</span>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">pending</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pendientes</span>
                  <span className="text-3xl font-extrabold text-primary block mt-1">{stats.pending_orders}</span>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">payments</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Ingresos Totales</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">Bs. {stats.total_earnings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-10">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">Accesos Rápidos de Gestión</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link 
                  to="/admin/inventario"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-accent hover:text-white border border-slate-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">store</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Catálogo e Inventario</span>
                    <span className="text-[11px] opacity-75 block">Aprobar, editar y subir productos</span>
                  </div>
                </Link>

                <Link 
                  to="/admin/usuarios"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-accent hover:text-white border border-slate-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Roles de Usuarios</span>
                    <span className="text-[11px] opacity-75 block">Controlar administradores e importadoras</span>
                  </div>
                </Link>

                <Link 
                  to="/admin/pedidos"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-accent hover:text-white border border-slate-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Pedidos y Entregas</span>
                    <span className="text-[11px] opacity-75 block">Actualizar despachos de clientes</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Daily Orders Line Chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent">show_chart</span>
                    Pedidos (Últimos 7 días)
                  </h3>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gráfico de Línea</span>
                </div>
                
                <div className="w-full h-80 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayName" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight={700}
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight={700}
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Pedidos"
                        stroke="#2dd4bf" 
                        strokeWidth={3}
                        dot={{ r: 4, stroke: '#2dd4bf', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, stroke: '#2dd4bf', strokeWidth: 2, fill: '#2dd4bf' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent">emoji_events</span>
                    Productos Más Vendidos
                  </h3>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Top 5</span>
                </div>

                {topProducts.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {topProducts.map((prod, index) => {
                      const medalColors = [
                        'bg-yellow-50 text-yellow-600 border-yellow-100',
                        'bg-slate-100 text-slate-600 border-slate-200',
                        'bg-amber-50 text-amber-700 border-amber-200',
                      ];
                      
                      const medalIcon = index < 3 ? 'trophy' : 'workspace_premium';
                      
                      return (
                        <div 
                          key={prod.product_id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {/* Ranking Badge */}
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs ${
                              medalColors[index] || 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <div className="max-w-[150px] sm:max-w-[200px] lg:max-w-[130px]">
                              <span className="font-bold text-slate-800 block text-xs truncate" title={prod.nombre}>
                                {prod.nombre}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">ID: #{prod.product_id}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 block">{prod.total_quantity} uds.</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              Comprado
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 mb-1">trending_flat</span>
                    <p className="text-slate-400 font-bold text-xs">Sin ventas registradas aún.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
