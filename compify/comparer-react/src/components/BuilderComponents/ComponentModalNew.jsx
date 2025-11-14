import { useState } from 'react';
import { X, ChevronDown, TrendingDown, Check, ShoppingCart } from 'lucide-react';
import Modal from '../Modal';
import PriceChart from '../PriceChart';
import { useBuilder } from '../../context/BuilderContext';
import { formatPrice } from '../../utils/formatters';

function ComponentModalNew({ isOpen, onClose, categoryKey, category }) {
  const { addComponent } = useBuilder();
  const [expandedHistories, setExpandedHistories] = useState({});

  if (!category) return null;

  const handleSelectStore = (componentId, storeName, price, storeUrl) => {
    addComponent(categoryKey, componentId, storeName, price, storeUrl);
    onClose();
  };

  const togglePriceHistory = (componentId) => {
    setExpandedHistories(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const getCombinedPriceHistory = (component) => {
    if (component.priceHistory && component.priceHistory.length > 0) {
      return component.priceHistory.map(entry => {
        const closestStore = component.stores.reduce((best, store) => {
          const diff = Math.abs(store.price - entry.price);
          const bestDiff = Math.abs(best.price - entry.price);
          return diff < bestDiff ? store : best;
        }, component.stores[0]);
        
        return {
          date: entry.date,
          price: entry.price,
          storeName: closestStore.name,
          storeLogo: closestStore.logo
        };
      });
    }
    return [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Seleccionar ${category.name}`} size="xl">
      <div className="space-y-4">
        {category.items.map((component) => {
          const minPrice = Math.min(...component.stores.map(s => s.price));
          const maxPrice = Math.max(...component.stores.map(s => s.price));
          const priceHistory = getCombinedPriceHistory(component);
          const isHistoryExpanded = expandedHistories[component.id];

          return (
            <div 
              key={component.id}
              className="border-2 rounded-xl p-6 mb-4 transition-all border-gray-200 hover:shadow-xl bg-white"
            >
              {/* Header del componente */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b">
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">{component.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{component.specs}</p>
                  <div className="flex gap-2 text-xs flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      💵 Desde {formatPrice(minPrice)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      📊 Hasta {formatPrice(maxPrice)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                      🏪 {component.stores.length} tienda{component.stores.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para mostrar historial de precios */}
              {priceHistory.length > 0 && (
                <div className="mb-4">
                  <button 
                    onClick={() => togglePriceHistory(component.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <TrendingDown className="w-4 h-4 text-indigo-600" />
                      Ver Historial de Precios
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isHistoryExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Contenedor del historial (oculto por defecto) */}
                  {isHistoryExpanded && (
                    <div className="mt-3 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-sm text-gray-700">Últimos 30 días</h5>
                        <span className="text-xs text-gray-500">
                          Precio actual: {formatPrice(minPrice)}
                        </span>
                      </div>
                      <div className="h-[120px]">
                        <PriceChart priceHistory={priceHistory} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tiendas disponibles */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Elige dónde comprar este componente:
                </p>
                <div className="space-y-2">
                  {component.stores
                    .sort((a, b) => a.price - b.price)
                    .map((store, index) => {
                      const isBest = index === 0;
                      const isSelected = false; // TODO: check if this store is selected

                      return (
                        <div 
                          key={store.name}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                              : isBest 
                              ? 'bg-green-50 border-green-200 hover:border-green-300' 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{store.logo}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{store.name}</p>
                              <p className="text-xs text-gray-500">{store.shipping}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-bold text-lg ${isBest ? 'text-green-600' : 'text-gray-800'}`}>
                                {formatPrice(store.price)}
                              </p>
                              {isBest && (
                                <span className="text-xs text-green-600 font-medium">💰 Mejor precio</span>
                              )}
                            </div>
                            <button 
                              type="button"
                              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                              }`}
                              onClick={() => handleSelectStore(component.id, store.name, store.price, store.url)}
                            >
                              {isSelected ? '✓ Seleccionada' : 'Elegir aquí'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export default ComponentModalNew;
