import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';

const MisProductosPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadMyProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getMySubmittedProducts();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading importadora products:', err);
      setError('No se pudieron cargar tus productos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  // Filter products by search and status
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && p.is_approved;
    if (statusFilter === 'pending') return matchesSearch && !p.is_approved;
    return matchesSearch;
  });

  // Calculate quick stats
  const totalSubmissions = products.length;
  const approvedCount = products.filter((p) => p.is_approved).length;
  const pendingCount = products.filter((p) => !p.is_approved).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 pt-16 overflow-x-hidden">
      {/* Sidebar - Desktop Only (RESTAURADO) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed top-16 bottom-0 left-0 p-6 border-r border-slate-800 z-30 select-none">
        <div className="mb-10 text-left">
          <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-amber-500 text-[28px]">store</span>
            <span>Importadora</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/importadora/productos" className="flex items-center gap-3 px-4 py-3 bg-amber-600 text-white rounded-lg shadow-sm font-bold">
            <span className="material-symbols-outlined">widgets</span>
            <span className="text-sm font-semibold">Mis Productos</span>
          </Link>
          <Link to="/importadora/subir" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-sm font-semibold">Subir Producto</span>
          </Link>
          <Link to="/importadora/pedidos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
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

      {/* Main Content (Área de Trabajo Estandarizada) */}
      <main className="flex-grow lg:ml-64 p-4 md:p-8 relative min-w-0 space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis Productos Subidos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona y realiza seguimiento de las importaciones que has enviado para aprobación.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 self-start md:self-auto">
            <Link
              to="/importadora/pedidos"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              Ver mis ventas
            </Link>
            <Link
              to="/importadora/subir"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Subir Nuevo Producto
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enviados</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalSubmissions}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <span className="material-symbols-outlined text-[28px]">verified</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Aprobados y Visibles</p>
              <h3 className="text-2xl font-black text-green-600 mt-1">{approvedCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <span className="material-symbols-outlined text-[28px]">pending</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pendientes de Aprobación</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            </div>
          </div>
        </div>

        {/* Controls Block */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
            />
          </div>

          {/* Status Switcher tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === 'approved' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Aprobados ({approvedCount})
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800 mb-4"></div>
            <p className="text-slate-500 font-medium">Cargando tus importaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm text-center">
            <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">error</span>
            <p className="font-bold text-lg mb-2">{error}</p>
            <button
              onClick={loadMyProducts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">drafts</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron productos</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'No hay productos que coincidan con los filtros seleccionados actualmente.'
                : 'Aún no has subido ningún producto. Envía tu primera importación haciendo clic en el botón de abajo.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/importadora/subir"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Subir mi primer producto
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Producto</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Categoría</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Precio</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Novedad / Oferta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
                    <tr key={`${product.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                            {product.imagen_url ? (
                              <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-[24px]">image</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{product.nombre}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xs md:max-w-md">
                              {product.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {product.categoria?.nombre || `ID: ${product.categoria_id}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {product.is_offer ? (
                            <>
                              <span className="text-sm font-bold text-red-600">{product.offer_price} Bs.</span>
                              <span className="text-xs text-slate-400 line-through">{product.precio} Bs.</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-800">{product.precio} Bs.</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                          product.stock <= 5 
                            ? 'bg-red-50 text-red-700 font-bold' 
                            : 'text-slate-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          {product.is_approved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              Pendiente
                            </span>
                          )}
                          {!product.is_active && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-full border border-red-200 uppercase">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {product.is_new && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                              Novedad
                            </span>
                          )}
                          {product.is_offer && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">
                              Oferta
                            </span>
                          )}
                          {!product.is_new && !product.is_offer && (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MisProductosPage;
