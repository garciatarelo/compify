import React, { useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

function ProductCard({ product, onViewDetails }) {
  const { toggleFavorite, isFavorite, user } = useApp();
  const favorite = isFavorite(product.id);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Calcular el precio más bajo de las tiendas disponibles
  const lowestPrice = product.stores && product.stores.length > 0
    ? Math.min(...product.stores.map(s => s.price))
    : 0;

  // Ordenar tiendas por precio ascendente
  const sortedStores = [...(product.stores || [])].sort((a, b) => a.price - b.price);

  return (
    <>
      <div className="relative">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
          {/* Image Container */}
          <div className="relative h-64 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  setShowLoginModal(true);
                  return;
                }
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

          {/* Información principal del producto */}
          <div className="px-6 pt-4 pb-2 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-gray-800 mb-1 truncate">{product.name}</h2>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li><strong>Procesador:</strong> {product.processor}</li>
              <li><strong>RAM:</strong> {product.ram}</li>
              <li><strong>Almacenamiento:</strong> {product.storage}</li>
              <li><strong>Gráficos:</strong> {product.graphics}</li>
            </ul>
          </div>

          <div className="border-t pt-4 mt-auto px-6 pb-4">
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Mejor precio</div>
              <div className="text-2xl font-bold text-green-600">{formatPrice(lowestPrice)}</div>
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
                        <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-bold">Mejor</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${index === 0 ? 'text-green-700' : 'text-gray-900'}`}>{formatPrice(store.price)}</span>
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

        {/* Modal para login */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Inicia sesión para añadir favoritos</h2>
              <p className="mb-6 text-gray-600">Debes iniciar sesión para poder guardar productos en favoritos.</p>

              <div className="flex justify-center gap-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión
                </button>

                <button
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductCard;
