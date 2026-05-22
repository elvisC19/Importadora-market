import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';

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
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const params = {
        skip,
        limit,
        ...(debouncedSearch && { nombre: debouncedSearch }),
        ...(filters.categoria_id && { categoria_id: filters.categoria_id }),
        ...(filters.precio_min && { precio_min: filters.precio_min }),
        ...(filters.precio_max && { precio_max: filters.precio_max }),
        ...(filters.is_offer && { is_offer: true }),
        ...(filters.is_new && { is_new: true }),
        ...(filters.is_featured && { is_featured: true }),
      };
      
      const data = await productService.getProducts(params);
      setProducts(data.items);
      setTotal(data.total);
      
      // Update URL params
      const currentParams = new URLSearchParams();
      if (debouncedSearch) currentParams.set('nombre', debouncedSearch);
      if (filters.categoria_id) currentParams.set('categoria_id', filters.categoria_id);
      if (filters.precio_min) currentParams.set('precio_min', filters.precio_min);
      if (filters.precio_max) currentParams.set('precio_max', filters.precio_max);
      if (filters.is_offer) currentParams.set('is_offer', 'true');
      if (filters.is_new) currentParams.set('is_new', 'true');
      if (filters.is_featured) currentParams.set('is_featured', 'true');
      if (page > 1) currentParams.set('page', page);
      setSearchParams(currentParams);
      
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">filter_alt</span>
              Filtros
            </h2>
            
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <input 
                type="text" 
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select 
                name="categoria_id"
                value={filters.categoria_id}
                onChange={handleFilterChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio (Bs.)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  name="precio_min"
                  placeholder="Min"
                  value={filters.precio_min}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none"
                  min="0"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  name="precio_max"
                  placeholder="Max"
                  value={filters.precio_max}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none"
                  min="0"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="is_offer" checked={filters.is_offer} onChange={handleFilterChange} className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">En Oferta</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="is_new" checked={filters.is_new} onChange={handleFilterChange} className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">Novedades</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="is_featured" checked={filters.is_featured} onChange={handleFilterChange} className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">Destacados</span>
              </label>
            </div>
            
            {/* Clear Filters */}
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilters({ categoria_id: '', precio_min: '', precio_max: '', is_offer: false, is_new: false, is_featured: false });
                setPage(1);
              }}
              className="mt-6 w-full py-2 text-sm font-bold text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            >
              Limpiar Filtros
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-primary">Catálogo de Productos</h1>
            <span className="text-sm text-gray-500 font-medium">{total} resultado{total !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-600 font-medium flex items-center">
                    Página {page} de {totalPages}
                  </span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">search_off</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ProductsPage;
