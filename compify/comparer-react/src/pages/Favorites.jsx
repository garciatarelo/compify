import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { getLaptopsFormatted } from '../services/laptopsApi';

// Este componente ahora muestra los productos favoritos reales
function Favorites() {
  const { favorites } = useApp();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await getLaptopsFormatted({ per_page: 100 });
        setAllProducts(result.laptops || result);
      } catch (err) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  // Filtrar productos favoritos reales
  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart size={40} className="text-red-500" fill="currentColor" />
            <h1 className="text-4xl font-bold text-gray-800">Mis Favoritos</h1>
          </div>
          <p className="text-gray-600">
            Productos que has guardado para ver más tarde
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">Cargando favoritos...</p>
          </div>
        ) : favoriteProducts.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              {favoriteProducts.length} producto{favoriteProducts.length !== 1 ? 's' : ''} favorito{favoriteProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No tienes favoritos aún</p>
            <p className="text-gray-400 mb-6">
              Haz clic en el corazón de cualquier producto para agregarlo a favoritos
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            >
              Ver Productos
            </a>
          </div>
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

export default Favorites;
