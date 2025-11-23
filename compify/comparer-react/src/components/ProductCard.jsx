import { Heart, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

function ProductCard({ product, onViewDetails }) {
  const { toggleFavorite, isFavorite } = useApp();
  const favorite = isFavorite(product.id);
  
  // Calcular el precio más bajo de las tiendas disponibles
  const lowestPrice = product.stores && product.stores.length > 0
    ? Math.min(...product.stores.map(s => s.price))
    : 0;

  // Ordenar tiendas por precio ascendente
  const sortedStores = [...(product.stores || [])].sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
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
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand */}
        <div className="text-sm text-blue-600 font-semibold mb-1">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 h-14">
          {product.name}
        </h3>

        {/* Price & Stores Comparison */}
        <div className="border-t pt-4 mt-auto">
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Mejor precio</div>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(lowestPrice)}
            </div>
          </div>

          {/* Store List */}
          <div className="space-y-2 mb-4">
            {sortedStores.length > 0 ? (
              sortedStores.map((store, index) => (
                <a 
                  key={index} 
                  href={store.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                    index === 0 ? 'bg-green-50 border border-green-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{store.name}</span>
                    {index === 0 && (
                      <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-bold">
                        Mejor
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${index === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                      {formatPrice(store.price)}
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </a>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">No hay precios disponibles</div>
            )}
          </div>

          {/* View Details Button */}
          <button 
            type="button"
            onClick={() => onViewDetails && onViewDetails(product)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold text-sm"
          >
            Ver Especificaciones Completas
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
