import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { getLaptopsFormatted, searchLaptops } from '../services/laptopsApi';

function Home() {
  const { filters, updateFilters, resetFilters } = useApp();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar laptops desde la API al montar el componente
  useEffect(() => {
    loadLaptops();
  }, []);

  const loadLaptops = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLaptopsFormatted();
      const laptops = result.laptops || result;
      setAllProducts(laptops);
      setFilteredProducts(laptops);
    } catch (err) {
      console.error('Error al cargar laptops:', err);
      setError('No se pudieron cargar las laptops. Verifica que el servidor Laravel esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  // Aplicar filtros localmente
  const applyFilters = () => {
    let result = [...allProducts];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.model?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.cpu?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de marca
    if (filters.brand) {
      result = result.filter(p => p.brand === filters.brand);
    }

    // Filtro de precio
    result = result.filter(p => {
      const minPrice = p.minPrice || 0;
      return minPrice >= filters.minPrice && minPrice <= filters.maxPrice;
    });

    setFilteredProducts(result);
  };

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  const handleBrandChange = (e) => {
    updateFilters({ brand: e.target.value });
  };

  const handleReset = () => {
    resetFilters();
    setFilteredProducts(allProducts);
  };

  // Obtener marcas únicas de los productos cargados
  const brands = [...new Set(allProducts.map(p => p.brand))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Comparador de Laptops
          </h1>
          <p className="text-gray-600">
            Encuentra las mejores laptops al mejor precio en múltiples tiendas
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadLaptops}
              className="mt-2 text-red-600 hover:text-red-700 font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando laptops...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre, marca o procesador..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={filters.brand}
                    onChange={handleBrandChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las marcas</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Filtrar
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
                <button
                  onClick={handleReset}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        product={selectedProduct}
      />
    </div>
  );
}

export default Home;
