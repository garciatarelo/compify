import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';
import { getLowestPrice } from '../data/mockProducts';

function ProductCard({ product, onViewDetails }) {
  const { toggleFavorite, isFavorite } = useApp();
  const favorite = isFavorite(product.id);
  const lowestPrice = getLowestPrice(product);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <div className="text-sm text-blue-600 font-semibold mb-1">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold w-24">Procesador:</span>
            <span className="truncate">{product.processor}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-24">RAM:</span>
            <span>{product.ram}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-24">Gráficos:</span>
            <span className="truncate">{product.graphics}</span>
          </div>
        </div>

        {/* Price */}
        <div className="border-t pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Desde</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(lowestPrice)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {product.stores.length} tiendas
            </div>
          </div>
        </div>

        {/* View Details Button - opens modal with store comparison */}
        <button 
          type="button"
          onClick={() => onViewDetails && onViewDetails(product)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
