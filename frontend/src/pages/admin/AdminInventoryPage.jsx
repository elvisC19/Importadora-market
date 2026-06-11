import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import adminProductService from '../../services/adminProductService';

const AdminInventoryPage = () => {
  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'all' | 'pending' | 'visible'
  const [activeTab, setActiveTab] = useState('all');

  // Stats States
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    lowStock: 0,
    activeOffers: 0,
  });

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Create Mode"
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen_url: '',
    imagen_secundaria_url: '',
    imagen_alternativa_url: '',
    video_enlace: '',
    categoria_id: '',
    is_offer: false,
    offer_price: '',
    is_new: false,
    is_featured: false,
  });

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Toast System
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 4000);
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const cats = await productService.getCategories();
      setCategories(cats);

      // 2. Fetch approved products (public) & pending products (admin)
      const approvedRes = await productService.getProducts({ skip: 0, limit: 100 });
      const pendingRes = await adminProductService.getPendingProducts(0, 100);

      const approvedList = approvedRes.items || [];
      const pendingList = pendingRes || [];

      // Combine both lists
      const allProducts = [...pendingList, ...approvedList];
      setProducts(allProducts);

      // 3. Compute stats
      const total = allProducts.length;
      const pending = pendingList.length;
      const lowStock = allProducts.filter(p => p.stock <= 5).length;
      const activeOffers = allProducts.filter(p => p.is_offer).length;

      setStats({ total, pending, lowStock, activeOffers });
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setError("Ocurrió un error al cargar la información del inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtered Products list based on current active tab
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'pending':
        return products.filter(p => !p.is_approved);
      case 'visible':
        return products.filter(p => p.is_approved);
      case 'all':
      default:
        return products;
    }
  };

  // Product Actions
  const handleApproveProduct = async (id) => {
    try {
      await adminProductService.approveProduct(id);
      showToast("Producto aprobado correctamente.");
      await loadDashboardData();
    } catch (err) {
      console.error("Error approving product", err);
      showToast("Error al aprobar el producto.", "error");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await adminProductService.toggleVisibility(id);
      showToast("Estado destacado actualizado correctamente.");
      await loadDashboardData();
    } catch (err) {
      console.error("Error toggling featured status", err);
      showToast(err.response?.data?.detail || "Error al cambiar el estado destacado.", "error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Intento 1: Eliminación física en la base de datos (CRUD Tradicional)
      await adminProductService.deleteProduct(productId);
      showToast("Producto eliminado físicamente de la base de datos con éxito.");
      await loadDashboardData();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      
      // Si el backend responde con un 400 controlado (Tiene ventas asociadas)
      if (error.response?.status === 400) {
        const confirmarBaja = window.confirm(
          "Este producto cuenta con pedidos e historial de ventas registrado, por lo que PostgreSQL impide su borrado físico.\n\n¿Desea DARLO DE BAJA (Borrado Lógico)? Esto lo ocultará inmediatamente del catálogo público para los clientes pero mantendrá el historial de pedidos."
        );
        
        if (confirmarBaja) {
          try {
            // Ejecuta la actualización mandando el estado desactivado
            await adminProductService.updateProduct(productId, { is_active: false });
            showToast("El producto ha sido dado de baja correctamente y ocultado del catálogo público.");
            await loadDashboardData();
          } catch (updateError) {
            alert("Error al intentar dar de baja el producto: " + (updateError.response?.data?.detail || updateError.message));
          }
        }
      } else {
        // Cualquier otro error de red o servidor
        alert("Error inesperado: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  // Modal Open Handlers
  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '0',
      imagen_url: '',
      imagen_secundaria_url: '',
      imagen_alternativa_url: '',
      video_enlace: '',
      categoria_id: categories.length > 0 ? categories[0].id.toString() : '',
      is_offer: false,
      offer_price: '',
      is_new: false,
      is_featured: false,
      is_active: true,
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      imagen_url: product.imagen_url || '',
      imagen_secundaria_url: product.imagen_secundaria_url || '',
      imagen_alternativa_url: product.imagen_alternativa_url || '',
      video_enlace: product.video_enlace || '',
      categoria_id: product.categoria_id.toString(),
      is_offer: product.is_offer,
      offer_price: product.offer_price ? product.offer_price.toString() : '',
      is_new: product.is_new,
      is_featured: product.is_featured,
      is_active: product.is_active !== undefined ? product.is_active : true,
    });
    setIsProductModalOpen(true);
  };

  // Form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Product Form Submission
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!productForm.nombre || !productForm.precio || !productForm.categoria_id) {
      showToast("Por favor complete los campos obligatorios.", "error");
      return;
    }

    const payload = {
      nombre: productForm.nombre,
      descripcion: productForm.descripcion || null,
      precio: parseFloat(productForm.precio),
      stock: parseInt(productForm.stock) || 0,
      imagen_url: productForm.imagen_url || null,
      imagen_secundaria_url: productForm.imagen_secundaria_url || null,
      imagen_alternativa_url: productForm.imagen_alternativa_url || null,
      video_enlace: productForm.video_enlace || null,
      categoria_id: parseInt(productForm.categoria_id),
      is_offer: productForm.is_offer,
      offer_price: productForm.is_offer && productForm.offer_price ? parseFloat(productForm.offer_price) : null,
      is_new: productForm.is_new,
      is_featured: productForm.is_featured,
      is_active: productForm.is_active !== undefined ? productForm.is_active : true,
    };

    if (payload.is_offer) {
      if (payload.offer_price === null) {
        showToast("Si el producto está en oferta, debe asignar un precio de oferta.", "error");
        return;
      }
      if (payload.offer_price >= payload.precio) {
        showToast("El precio de oferta debe ser estrictamente menor al precio original.", "error");
        return;
      }
    }

    try {
      if (editingProduct) {
        // Update mode
        await adminProductService.updateProduct(editingProduct.id, payload);
        showToast("Producto actualizado exitosamente.");
      } else {
        // Create mode
        await adminProductService.createProduct(payload);
        showToast("Producto creado y aprobado exitosamente.");
      }
      setIsProductModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error("Error saving product", err);
      showToast(err.response?.data?.detail || "Error al guardar el producto.", "error");
    }
  };

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("El nombre de la categoría es obligatorio.", "error");
      return;
    }

    try {
      await adminProductService.createCategory({
        nombre: newCategoryName.trim(),
        descripcion: newCategoryDesc.trim() || null
      });
      showToast("Categoría creada exitosamente.");
      setNewCategoryName('');
      setNewCategoryDesc('');
      await loadDashboardData();
    } catch (err) {
      console.error("Error creating category", err);
      showToast("Error al crear la categoría. Quizá ya existe.", "error");
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("¿Eliminar esta categoría? Esto también eliminará permanentemente todos los productos que pertenezcan a ella en cascada.")) {
      return;
    }
    try {
      await adminProductService.deleteCategory(catId);
      showToast("Categoría eliminada.");
      await loadDashboardData();
    } catch (err) {
      console.error("Error deleting category", err);
      showToast("Error al eliminar la categoría.", "error");
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 md:px-margin-desktop select-none">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold text-sm ${
            toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
          }`}>
            <span className="material-symbols-outlined">
              {toast.type === 'success' ? 'done_all' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Admin</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary font-bold">Inventario</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-accent">inventory_2</span>
              Gestión de Inventario
            </h1>
            <p className="text-gray-500 text-sm mt-1">Supervisa, edita, aprueba productos y administra categorías del catálogo.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-opacity-95 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent/20 active:scale-[0.98] transition-all self-start md:self-auto"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined">error</span>
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* ═══════════ SECTION 1: Statistics Cards ═══════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">widgets</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Total Productos</span>
              <span className="text-3xl font-extrabold text-primary block mt-1">{loading ? '...' : stats.total}</span>
            </div>
          </div>

          {/* Pending Products */}
          <div 
            onClick={() => setActiveTab('pending')}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]">pending_actions</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Pendientes Aprob.</span>
              <span className="text-3xl font-extrabold text-primary block mt-1">{loading ? '...' : stats.pending}</span>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Stock Crítico (≤5)</span>
              <span className="text-3xl font-extrabold text-primary block mt-1">{loading ? '...' : stats.lowStock}</span>
            </div>
          </div>

          {/* Active Offers */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">sell</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Ofertas Activas</span>
              <span className="text-3xl font-extrabold text-primary block mt-1">{loading ? '...' : stats.activeOffers}</span>
            </div>
          </div>
        </div>

        {/* ═══════════ SECTION 2: Products Table (Full Width) ═══════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          {/* Tab Navigation & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-gray-100 gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent text-[24px]">inventory_2</span>
              <h2 className="text-lg font-extrabold text-primary">Catálogo de Productos</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border border-gray-200 bg-white rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'all' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'pending' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Pendientes
                  {stats.pending > 0 && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('visible')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'visible' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Visibles
                </button>
              </div>
              
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider hidden sm:block">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Imagen</th>
                    <th className="px-6 py-4">Detalles del Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Precio (Bs.)</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-gray-100 overflow-hidden flex items-center justify-center">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-gray-300">image</span>
                          )}
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <h4 className="font-bold text-primary truncate" title={p.nombre}>{p.nombre}</h4>
                          {p.submitted_by_id && (
                            <div className="text-[11px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">person</span>
                              Enviado por: ID {p.submitted_by_id}
                            </div>
                          )}
                          <div className="flex gap-1.5 mt-1.5">
                            {p.is_new && <span className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-bold uppercase">Nuevo</span>}
                            {p.is_offer && <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-bold uppercase">Oferta</span>}
                            {p.is_featured && <span className="text-[9px] bg-yellow-50 text-yellow-600 border border-yellow-200 px-1.5 py-0.5 rounded font-bold uppercase">Destacado</span>}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                          {p.categoria?.nombre || 'General'}
                        </span>
                      </td>

                      {/* Price details */}
                      <td className="px-6 py-4">
                        {p.is_offer ? (
                          <div>
                            <span className="text-gray-400 text-xs line-through block">Bs. {p.precio.toFixed(2)}</span>
                            <span className="text-accent font-bold">Bs. {p.offer_price?.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-primary font-bold">Bs. {p.precio.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Stock details */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          p.stock > 5 ? 'text-green-600 bg-green-50' : p.stock > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {p.stock} disp.
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                            p.is_approved 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.is_approved ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                            {p.is_approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                          {!p.is_active && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-full border border-red-200 uppercase">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {!p.is_approved ? (
                            <>
                              <button 
                                onClick={() => handleApproveProduct(p.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 shadow-sm transition-all"
                                title="Aprobar Producto"
                              >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Aprobar
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 shadow-sm transition-all"
                                title="Rechazar Producto"
                              >
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                Rechazar
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Toggle Visibility (Featured) */}
                              <button 
                                onClick={() => handleToggleVisibility(p.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  p.is_featured 
                                    ? 'text-yellow-500 hover:bg-yellow-50' 
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title="Alternar Destacado"
                              >
                                <span className="material-symbols-outlined">{p.is_featured ? 'star_rate' : 'star'}</span>
                              </button>

                              {/* Edit Action */}
                              <button 
                                onClick={() => openEditModal(p)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                title="Editar Producto"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>

                              {/* Delete Action */}
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                title="Eliminar Producto"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">inventory</span>
              <h3 className="text-gray-700 font-bold text-lg mb-1">Sin productos</h3>
              <p className="text-gray-400 text-sm">No hay productos en esta sección del catálogo.</p>
            </div>
          )}
        </div>

        {/* ═══════════ SECTION 3: Category Management (Full Width) ═══════════ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-accent text-[28px]">category</span>
            <div>
              <h2 className="text-xl font-extrabold text-primary">Administrar Categorías</h2>
              <p className="text-gray-400 text-xs mt-0.5">Crea, visualiza y elimina las categorías del catálogo de productos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Create Category Form */}
            <div>
              <form onSubmit={handleCreateCategory} className="space-y-5 bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">add_box</span>
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">Nueva Categoría</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre de la Categoría *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Accesorios, Audífonos, Electrónica..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Descripción (Opcional)</label>
                  <textarea 
                    placeholder="Ej. Artículos y repuestos tecnológicos..."
                    rows="3"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                  Añadir Categoría
                </button>
              </form>
            </div>

            {/* Right: Categories List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">list</span>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Categorías Registradas</span>
                </div>
                <span className="text-xs text-gray-400 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                  {categories.length} total
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-xs text-gray-400">Cargando categorías...</div>
              ) : categories.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <div 
                      key={cat.id} 
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-500 text-[20px]">folder</span>
                        </div>
                        <div>
                          <span className="font-bold text-primary text-sm block">{cat.nombre}</span>
                          {cat.descripcion && (
                            <p className="text-[11px] text-gray-400 font-medium truncate max-w-xs">{cat.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar Categoría"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-[36px] text-gray-200 mb-2 block">category</span>
                  <p className="text-xs text-gray-400 font-bold">No hay categorías registradas.</p>
                  <p className="text-[11px] text-gray-300 mt-1">Crea una desde el formulario de la izquierda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* PRODUCT CREATE/EDIT MODAL                  */}
      {/* ========================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">
                  {editingProduct ? 'edit_note' : 'add_circle'}
                </span>
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h2>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductFormSubmit}>
              <div className="px-8 py-6 max-h-[60vh] overflow-y-auto space-y-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nombre del Producto *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    required
                    value={productForm.nombre}
                    onChange={handleFormChange}
                    placeholder="Ej. Audífonos Bluetooth JBL 510BT"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea 
                    name="descripcion"
                    rows="3"
                    value={productForm.descripcion}
                    onChange={handleFormChange}
                    placeholder="Detalles sobre características, especificaciones..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  />
                </div>

                {/* Category, Original Price & Stock Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Categoría *</label>
                    <select 
                      name="categoria_id"
                      required
                      value={productForm.categoria_id}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Precio Original (Bs.) *</label>
                    <input 
                      type="number" 
                      name="precio"
                      required
                      min="0.01"
                      step="0.01"
                      value={productForm.precio}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Stock Disponible</label>
                    <input 
                      type="number" 
                      name="stock"
                      min="0"
                      value={productForm.stock}
                      onChange={handleFormChange}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>
                </div>

                {/* Offer Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="is_offer" 
                      checked={productForm.is_offer} 
                      onChange={handleFormChange} 
                      className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent" 
                    />
                    <div>
                      <span className="text-sm font-bold text-primary block">¿Habilitar Oferta de Descuento?</span>
                      <span className="text-xs text-gray-400 block mt-0.5">El precio original se tachará y se mostrará el precio promocional.</span>
                    </div>
                  </label>

                  {productForm.is_offer && (
                    <div className="animate-in fade-in-50 duration-200 pl-8">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Precio de Oferta (Bs.) *</label>
                      <input 
                        type="number" 
                        name="offer_price"
                        required={productForm.is_offer}
                        min="0.01"
                        step="0.01"
                        value={productForm.offer_price}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all max-w-[200px]"
                      />
                    </div>
                  )}
                </div>

                {/* Media Urls (Image & Video) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">URL de la Imagen Principal</label>
                    <input 
                      type="url" 
                      name="imagen_url"
                      value={productForm.imagen_url}
                      onChange={handleFormChange}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Enlace de Video (YouTube)</label>
                    <input 
                      type="url" 
                      name="video_enlace"
                      value={productForm.video_enlace}
                      onChange={handleFormChange}
                      placeholder="https://youtube.com/..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">URL de la Imagen (Ángulo Secundario)</label>
                    <input 
                      type="url" 
                      name="imagen_secundaria_url"
                      value={productForm.imagen_secundaria_url}
                      onChange={handleFormChange}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">URL de la Imagen (Ángulo Alternativo)</label>
                    <input 
                      type="url" 
                      name="imagen_alternativa_url"
                      value={productForm.imagen_alternativa_url}
                      onChange={handleFormChange}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    />
                  </div>
                </div>

                {/* Product Tags Toggles */}
                <div className="flex flex-wrap gap-8 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="is_new" 
                      checked={productForm.is_new} 
                      onChange={handleFormChange} 
                      className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" 
                    />
                    <span className="text-sm font-semibold text-gray-700">Marcar como Novedad</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="is_featured" 
                      checked={productForm.is_featured} 
                      onChange={handleFormChange} 
                      className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" 
                    />
                    <span className="text-sm font-semibold text-gray-700">Marcar como Destacado (Máx. 10)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={productForm.is_active} 
                      onChange={handleFormChange} 
                      className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" 
                    />
                    <span className="text-sm font-semibold text-gray-700">Producto Activo (Visible en Catálogo)</span>
                  </label>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
