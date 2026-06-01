import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';

const SubirProductoPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catsLoading, setCatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [form, setForm] = useState({
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

  // Load categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data || []);
        if (data && data.length > 0) {
          setForm((prev) => ({ ...prev, categoria_id: data[0].id.toString() }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('No se pudieron cargar las categorías del catálogo. Por favor recarga la página.');
      } finally {
        setCatsLoading(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!form.nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }
    if (!form.precio || parseFloat(form.precio) <= 0) {
      setError('El precio debe ser un número mayor a 0.');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }
    if (!form.stock || parseInt(form.stock) < 0) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }
    if (!form.categoria_id) {
      setError('Debes seleccionar una categoría.');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }
    if (form.is_offer) {
      if (!form.offer_price || parseFloat(form.offer_price) <= 0) {
        setError('Si el producto está en oferta, debes especificar un precio de oferta válido.');
        setLoading(false);
        setIsSubmitting(false);
        return;
      }
      if (parseFloat(form.offer_price) >= parseFloat(form.precio)) {
        setError('El precio de oferta debe ser menor al precio original.');
        setLoading(false);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        imagen_url: form.imagen_url.trim() || null,
        imagen_secundaria_url: form.imagen_secundaria_url.trim() || null,
        imagen_alternativa_url: form.imagen_alternativa_url.trim() || null,
        video_enlace: form.video_enlace.trim() || null,
        categoria_id: parseInt(form.categoria_id),
        is_offer: form.is_offer,
        offer_price: form.is_offer ? parseFloat(form.offer_price) : null,
        is_new: form.is_new,
        is_featured: form.is_featured,
      };

      await productService.submitImportadoraProduct(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/importadora/productos');
      }, 3000);
    } catch (err) {
      console.error('Error submitting product:', err);
      setError(
        err.response?.data?.detail || 
        'No se pudo enviar el producto. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800 pt-16 overflow-x-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed top-16 bottom-0 left-0 p-6 border-r border-slate-800 z-30 select-none">
          <div className="mb-10 text-left">
            <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2 hover:opacity-85 transition-opacity">
              <span className="material-symbols-outlined text-amber-500 text-[28px]">store</span>
              <span>Importadora</span>
            </Link>
            <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
          </div>
          <nav className="flex-1 space-y-2">
            <Link to="/importadora/productos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
              <span className="material-symbols-outlined">widgets</span>
              <span className="text-sm font-semibold">Mis Productos</span>
            </Link>
            <Link to="/importadora/subir" className="flex items-center gap-3 px-4 py-3 bg-amber-600 text-white rounded-lg shadow-sm font-bold">
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

        {/* Main Content Success */}
        <main className="flex-grow lg:ml-64 p-4 md:p-8 relative min-w-0 flex items-center justify-center">
          <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-lg animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Producto Enviado!</h2>
            <p className="text-slate-500 mb-6 text-sm">
              El producto <span className="font-bold text-slate-800">"{form.nombre}"</span> fue registrado exitosamente y está pendiente de aprobación por el administrador.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/importadora/productos"
                className="px-5 py-3 bg-slate-800 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md text-sm text-center"
              >
                Ir a mis productos
              </Link>
              <p className="text-xs text-slate-450">Redireccionando automáticamente...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 pt-16 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed top-16 bottom-0 left-0 p-6 border-r border-slate-800 z-30 select-none">
        <div className="mb-10 text-left">
          <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-amber-500 text-[28px]">store</span>
            <span>Importadora</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/importadora/productos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-all">
            <span className="material-symbols-outlined">widgets</span>
            <span className="text-sm font-semibold">Mis Productos</span>
          </Link>
          <Link to="/importadora/subir" className="flex items-center gap-3 px-4 py-3 bg-amber-600 text-white rounded-lg shadow-sm font-bold">
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
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4 font-semibold">
          <Link to="/importadora/productos" className="hover:text-slate-800 transition-colors">
            Mis Productos
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-700">Subir Producto</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Enviar Nueva Importación</h1>
          <p className="text-sm text-slate-500 mt-1">
            Completa los detalles de tu producto para enviarlo a la mesa de aprobación del administrador.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
            <div className="font-semibold text-sm">{error}</div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          {catsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-800 mb-4"></div>
              <p className="text-slate-500 font-medium">Cargando categorías...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="nombre">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Laptop ASUS ROG Strix G16"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                      required
                    />
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="categoria_id">
                      Categoría *
                    </label>
                    <select
                      id="categoria_id"
                      name="categoria_id"
                      value={form.categoria_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm font-semibold text-slate-800 cursor-pointer"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="stock">
                      Stock Inicial *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="Ej. 15"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="descripcion">
                  Descripción del Producto
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="4"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Detalles sobre especificaciones técnicas, marca, garantía, estado del producto, etc..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm resize-none text-slate-800"
                />
              </div>

              {/* Prices Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  Precio y Promociones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="precio">
                      Precio de Venta (Bs.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="precio"
                      name="precio"
                      min="0.01"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="Ej. 1299.99"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm font-bold text-slate-800"
                      required
                    />
                  </div>

                  {/* Offer check */}
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="is_offer"
                      name="is_offer"
                      checked={form.is_offer}
                      onChange={handleChange}
                      className="w-5 h-5 accent-amber-600 border-slate-200 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="is_offer" className="text-sm font-bold text-slate-700 cursor-pointer">
                      ¿Este producto está en oferta/descuento?
                    </label>
                  </div>

                  {/* Offer Price (visible only if is_offer checked) */}
                  {form.is_offer && (
                    <div className="md:col-span-2 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-bold text-red-700 mb-1.5" htmlFor="offer_price">
                        Precio Especial de Oferta (Bs.) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="offer_price"
                        name="offer_price"
                        min="0.01"
                        value={form.offer_price}
                        onChange={handleChange}
                        placeholder="Ej. 999.99"
                        className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:border-red-400 font-body-sm text-body-sm font-bold text-red-600"
                        required={form.is_offer}
                      />
                      <p className="text-xs text-red-500 mt-1.5 font-semibold">
                        Este precio reemplazará temporalmente el precio regular en las secciones de ofertas de la tienda.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Multimedia & Badges */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  Multimedia y Visualización
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="imagen_url">
                      Enlace de la Imagen Principal (URL)
                    </label>
                    <input
                      type="url"
                      id="imagen_url"
                      name="imagen_url"
                      value={form.imagen_url}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="video_enlace">
                      Enlace de Video (YouTube/Vimeo/Drive)
                    </label>
                    <input
                      type="url"
                      id="video_enlace"
                      name="video_enlace"
                      value={form.video_enlace}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                    />
                  </div>

                  {/* Secondary Image URL */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="imagen_secundaria_url">
                      Enlace de la Imagen (Ángulo Secundario)
                    </label>
                    <input
                      type="url"
                      id="imagen_secundaria_url"
                      name="imagen_secundaria_url"
                      value={form.imagen_secundaria_url}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/imagen_secundaria.jpg"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                    />
                  </div>

                  {/* Alternative Image URL */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="imagen_alternativa_url">
                      Enlace de la Imagen (Ángulo Alternativo)
                    </label>
                    <input
                      type="url"
                      id="imagen_alternativa_url"
                      name="imagen_alternativa_url"
                      value={form.imagen_alternativa_url}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/imagen_alternativa.jpg"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-body-sm text-body-sm text-slate-800"
                    />
                  </div>

                  {/* Tags checkboxes */}
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_new"
                        name="is_new"
                        checked={form.is_new}
                        onChange={handleChange}
                        className="w-5 h-5 accent-blue-600 border-slate-200 rounded cursor-pointer"
                      />
                      <label htmlFor="is_new" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Marcar como "Novedad" / "Recién Llegado"
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={form.is_featured}
                        onChange={handleChange}
                        className="w-5 h-5 accent-amber-600 border-slate-200 rounded cursor-pointer"
                      />
                      <label htmlFor="is_featured" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Solicitar destaque en portada (Destaque principal)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <Link
                  to="/importadora/productos"
                  className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-center transition-colors text-slate-600"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      Enviar Producto para Aprobación
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubirProductoPage;
