import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import Footer from '../components/layout/Footer';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('nombre') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [filters, setFilters] = useState({
    categoria_id: searchParams.get('categoria_id') || '',
    precio_min: searchParams.get('precio_min') || '',
    precio_max: searchParams.get('precio_max') || '',
    is_offer: searchParams.get('is_offer') === 'true',
    is_new: searchParams.get('is_new') === 'true',
    is_featured: searchParams.get('is_featured') === 'true',
  });
  
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const limit = 12;

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const { categoria_id, precio_min, precio_max, is_offer, is_new, is_featured } = filters;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const params = {
        skip,
        limit,
        ...(debouncedSearch && { nombre: debouncedSearch }),
        ...(categoria_id && { categoria_id }),
        ...(precio_min && { precio_min }),
        ...(precio_max && { precio_max }),
        ...(is_offer && { is_offer: true }),
        ...(is_new && { is_new: true }),
        ...(is_featured && { is_featured: true }),
      };
      
      const data = await productService.getProducts(params);
      setProducts(data.items);
      setTotal(data.total);
      
      // Update URL params
      const currentParams = new URLSearchParams();
      if (debouncedSearch) currentParams.set('nombre', debouncedSearch);
      if (categoria_id) currentParams.set('categoria_id', categoria_id);
      if (precio_min) currentParams.set('precio_min', precio_min);
      if (precio_max) currentParams.set('precio_max', precio_max);
      if (is_offer) currentParams.set('is_offer', 'true');
      if (is_new) currentParams.set('is_new', 'true');
      if (is_featured) currentParams.set('is_featured', 'true');
      if (page > 1) currentParams.set('page', page);
      setSearchParams(currentParams);
      
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoria_id, precio_min, precio_max, is_offer, is_new, is_featured, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync category filter if changed in URL directly (e.g. from homepage navigation)
  useEffect(() => {
    const urlCatId = searchParams.get('categoria_id');
    if (urlCatId !== null && urlCatId !== filters.categoria_id) {
      setFilters(prev => ({ ...prev, categoria_id: urlCatId }));
      setPage(1);
    }
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPage(1); // reset to first page on filter change
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-xl">
        <div className="flex flex-col lg:flex-row gap-stack-xl">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-surface-container-lowest p-stack-lg rounded-2xl border border-outline-variant sticky top-24 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                <h2 className="font-headline-md text-[20px] text-on-surface font-extrabold flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">filter_alt</span>
                  Filtros
                </h2>
                <span className="text-xs text-slate-400 font-mono">Bs. {total} prod.</span>
              </div>
              
              {/* Search Bar Input */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Buscar Producto</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input 
                    type="text" 
                    placeholder="Nombre del producto..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm placeholder:text-slate-400 focus:ring-1 focus:ring-secondary/20"
                  />
                </div>
              </div>

              {/* Category Select Option */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Categoría</label>
                <select 
                  name="categoria_id"
                  value={filters.categoria_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Limit Inputs */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Rango de Precio</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    name="precio_min"
                    placeholder="Min (Bs.)"
                    value={filters.precio_min}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm outline-none"
                    min="0"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input 
                    type="number" 
                    name="precio_max"
                    placeholder="Max (Bs.)"
                    value={filters.precio_max}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm outline-none"
                    min="0"
                  />
                </div>
              </div>

              {/* Toggle Badges Filters */}
              <div className="space-y-3 pt-2">
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Características</label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="is_offer" 
                    checked={filters.is_offer} 
                    onChange={handleFilterChange} 
                    className="w-4.5 h-4.5 rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                    En Oferta Especial
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="is_new" 
                    checked={filters.is_new} 
                    onChange={handleFilterChange} 
                    className="w-4.5 h-4.5 rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                    Novedades y Lanzamientos
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="is_featured" 
                    checked={filters.is_featured} 
                    onChange={handleFilterChange} 
                    className="w-4.5 h-4.5 rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                    Productos Destacados
                  </span>
                </label>
              </div>
              
              {/* Clear Filters CTA */}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ categoria_id: '', precio_min: '', precio_max: '', is_offer: false, is_new: false, is_featured: false });
                  setPage(1);
                }}
                className="w-full py-3 bg-white border border-outline-variant hover:bg-slate-50 text-on-surface-variant hover:text-primary font-label-md text-label-md rounded-lg font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer block text-center"
              >
                Limpiar Filtros
              </button>
            </div>
          </aside>

          {/* Catalog Listing Main Panel */}
          <main className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg bg-surface-container-lowest p-stack-lg rounded-2xl border border-outline-variant shadow-sm gap-4">
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">Catálogo de Productos</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Calidad e integridad institucional garantizada</p>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full font-bold">
                {total > 0 ? `Mostrando ${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} de ${total}` : '0 productos'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-stack-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-stack-lg">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 pt-6 border-t border-outline-variant max-w-sm mx-auto">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-label-md text-label-md font-bold shadow-sm transition-all duration-200"
                    >
                      Anterior
                    </button>
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {page} / {totalPages}
                    </span>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-label-md text-label-md font-bold shadow-sm transition-all duration-200"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-16 rounded-2xl shadow-sm border border-outline-variant text-center flex flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined text-[64px] text-slate-300">search_off</span>
                <h3 className="font-headline-md text-on-surface font-extrabold">No se encontraron productos</h3>
                <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                  No hay productos con los parámetros especificados. Intente flexibilizar los filtros de precio o características.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ categoria_id: '', precio_min: '', precio_max: '', is_offer: false, is_new: false, is_featured: false });
                    setPage(1);
                  }}
                  className="px-6 py-2.5 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg font-bold hover:bg-secondary/90 transition-all cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;
