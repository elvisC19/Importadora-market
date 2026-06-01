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
      <div className="min-h-screen bg-surface-container-lowest pt-24 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-outline-variant rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-150">
            <span className="material-symbols-outlined text-[48px]">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">¡Producto Enviado!</h2>
          <p className="text-on-surface-variant mb-6 text-body-medium">
            El producto <span className="font-bold text-primary">"{form.nombre}"</span> fue registrado exitosamente y está pendiente de aprobación por el administrador.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/importadora/productos"
              className="px-5 py-3 bg-secondary text-on-secondary rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
            >
              Ir a mis productos
            </Link>
            <p className="text-xs text-slate-400">Redireccionando automáticamente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-16 px-4 md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 font-semibold">
          <Link to="/importadora/productos" className="hover:text-primary transition-colors">
            Mis Productos
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface">Subir Producto</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold text-on-surface">Enviar Nueva Importación</h1>
          <p className="text-on-surface-variant mt-1 text-body-medium">
            Completa los detalles de tu producto para enviarlo a la mesa de aprobación del administrador.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
            <div className="font-semibold text-sm">{error}</div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm">
          {catsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-on-surface-variant font-medium">Cargando categorías...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-4 pb-2 border-b border-outline-variant">
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm font-semibold"
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
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
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm resize-none"
                />
              </div>

              {/* Prices Section */}
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-4 pb-2 border-b border-outline-variant">
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm font-bold text-primary"
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
                      className="w-5 h-5 accent-secondary border-outline-variant rounded focus:ring-secondary cursor-pointer"
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
                <h3 className="text-lg font-bold text-on-surface mb-4 pb-2 border-b border-outline-variant">
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-body-sm text-body-sm"
                    />
                  </div>

                  {/* Tags checkboxes */}
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-6 bg-slate-50 p-4 rounded-2xl border border-outline-variant">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_new"
                        name="is_new"
                        checked={form.is_new}
                        onChange={handleChange}
                        className="w-5 h-5 accent-blue-600 border-outline-variant rounded cursor-pointer"
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
                        className="w-5 h-5 accent-primary border-outline-variant rounded cursor-pointer"
                      />
                      <label htmlFor="is_featured" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Solicitar destaque en portada (Destaque principal)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-outline-variant">
                <Link
                  to="/importadora/productos"
                  className="w-full sm:w-auto px-6 py-3 border border-outline-variant hover:bg-slate-50 rounded-xl font-bold text-sm text-center transition-colors text-slate-600"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default SubirProductoPage;
