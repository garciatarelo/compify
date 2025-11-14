import { ExternalLink, TrendingDown, TrendingUp, Check } from 'lucide-react';
import Modal from '../Modal';
import PriceChart from '../PriceChart';
import { useBuilder } from '../../context/BuilderContext';
import { formatPrice } from '../../utils/formatters';

function ComponentModal({ isOpen, onClose, category, component }) {
  const { addComponent } = useBuilder();

  if (!component) return null;

  const handleSelectStore = (storeName, price) => {
    addComponent(category.id, component.id, storeName, price);
    onClose();
  };

  // Función para obtener el historial de precios mínimos combinado
  // TODO API: Este método deberá consultar GET /api/components/{id}/price-history
  // La API debe devolver: [{ date: string, minPrice: number, storeName: string, storeLogo: string }]
  const getCombinedPriceHistory = () => {
    // Si existe priceHistory a nivel de componente (datos mock actuales)
    if (component.priceHistory && component.priceHistory.length > 0) {
      // En datos mock, el historial es del precio general
      // Para mostrar la tienda, buscamos cuál tiene el precio más cercano
      return component.priceHistory.map(entry => {
        // Encontrar qué tienda tiene el precio más bajo en este momento
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
    
    // Si cada tienda tiene su propio historial (estructura alternativa)
    // TODO API: La respuesta de la API debe incluir storeName y storeLogo en cada entrada
    const allDates = new Set();
    component.stores.forEach(store => {
      if (store.priceHistory) {
        store.priceHistory.forEach(entry => allDates.add(entry.date));
      }
    });
    
    if (allDates.size === 0) {
      // Si no hay historial, retornar array vacío
      return [];
    }
    
    // Para cada fecha, encontrar el precio mínimo y la tienda correspondiente
    const combinedHistory = Array.from(allDates)
      .sort()
      .map(date => {
        let minPrice = Infinity;
        let bestStore = null;
        
        component.stores.forEach(store => {
          if (store.priceHistory) {
            const priceEntry = store.priceHistory.find(h => h.date === date);
            if (priceEntry && priceEntry.price < minPrice) {
              minPrice = priceEntry.price;
              bestStore = store;
            }
          }
        });
        
        // Si no se encontró precio para esta fecha, usar el precio actual más bajo
        if (minPrice === Infinity) {
          const cheapestStore = component.stores.reduce((best, s) => 
            s.price < best.price ? s : best
          , component.stores[0]);
          minPrice = cheapestStore.price;
          bestStore = cheapestStore;
        }
        
        return {
          date,
          price: minPrice,
          storeName: bestStore?.name || 'Desconocido',
          storeLogo: bestStore?.logo || '🏪'
        };
      });
    
    return combinedHistory;
  };

  // Calcular precio mínimo y máximo actuales
  const prices = component.stores.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Obtener tendencia de precio
  const priceHistory = getCombinedPriceHistory();
  const getPriceTrend = () => {
    if (priceHistory.length < 2) return { direction: 'stable', percentage: 0 };
    
    const latest = priceHistory[priceHistory.length - 1].price;
    const previous = priceHistory[priceHistory.length - 2].price;
    const change = ((latest - previous) / previous) * 100;
    
    return {
      direction: change < 0 ? 'down' : change > 0 ? 'up' : 'stable',
      percentage: Math.abs(change).toFixed(1)
    };
  };
  
  const trend = getPriceTrend();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={component.name} size="xl">
      {/* Component Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {/* Component Icon/Image */}
          <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-6xl">{category.icon === 'cpu' ? '🖥️' : category.icon === 'circuit-board' ? '🔌' : category.icon === 'memory-stick' ? '💾' : category.icon === 'box' ? '🎮' : category.icon === 'hard-drive' ? '💿' : category.icon === 'zap' ? '⚡' : '📦'}</div>
          </div>
          
          {/* Component Info */}
          <div className="flex-1">
            <div className="text-sm text-blue-600 font-semibold mb-2">
              {category.name}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {component.name}
            </h2>
            
            {/* Specs */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">{component.specs}</p>
              
              {/* Compatibility Info */}
              {(component.socket || component.type || component.tdp || component.wattage || component.capacity) && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                  {component.socket && (
                    <div>
                      <span className="font-semibold text-gray-600">Socket:</span>
                      <span className="ml-2 text-gray-800">{component.socket.toUpperCase()}</span>
                    </div>
                  )}
                  {component.type && (
                    <div>
                      <span className="font-semibold text-gray-600">Tipo:</span>
                      <span className="ml-2 text-gray-800">{component.type.toUpperCase()}</span>
                    </div>
                  )}
                  {component.tdp && (
                    <div>
                      <span className="font-semibold text-gray-600">TDP:</span>
                      <span className="ml-2 text-gray-800">{component.tdp}W</span>
                    </div>
                  )}
                  {component.wattage && (
                    <div>
                      <span className="font-semibold text-gray-600">Potencia:</span>
                      <span className="ml-2 text-gray-800">{component.wattage}W</span>
                    </div>
                  )}
                  {component.capacity && (
                    <div>
                      <span className="font-semibold text-gray-600">Capacidad:</span>
                      <span className="ml-2 text-gray-800">{component.capacity}GB</span>
                    </div>
                  )}
                  {component.maxRam && (
                    <div>
                      <span className="font-semibold text-gray-600">RAM Máx:</span>
                      <span className="ml-2 text-gray-800">{component.maxRam}GB</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Price Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mejor precio</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(minPrice)}
                  </div>
                </div>
                {minPrice !== maxPrice && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Precio máximo</div>
                    <div className="text-xl font-semibold text-gray-700">
                      {formatPrice(maxPrice)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Trend */}
              {trend.direction !== 'stable' && (
                <div className={`mt-3 flex items-center ${
                  trend.direction === 'down' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.direction === 'down' ? (
                    <TrendingDown size={20} className="mr-2" />
                  ) : (
                    <TrendingUp size={20} className="mr-2" />
                  )}
                  <span className="font-semibold">
                    {trend.direction === 'down' ? 'Bajó' : 'Subió'} {trend.percentage}% desde la última actualización
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📈 Historial de Precios (Mejor Precio)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-[200px]">
            <PriceChart 
              priceHistory={priceHistory} 
              storeName="Mejor precio disponible"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Este gráfico muestra el precio más bajo disponible en cada fecha entre todas las tiendas.
          </p>
        </div>
      </div>

      {/* Stores Comparison */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🏪 Selecciona tu tienda preferida ({component.stores.length} disponibles)
        </h3>
        <div className="space-y-3">
          {component.stores
            .sort((a, b) => a.price - b.price)
            .map((store, index) => {
              const isCheapest = index === 0;
              const priceDiff = store.price - minPrice;
              
              return (
                <div
                  key={store.name}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isCheapest
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Store Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-4xl">{store.logo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-lg">
                            {store.name}
                          </h4>
                          {isCheapest && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              MEJOR PRECIO
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Envío: {store.shipping}
                        </div>
                        {priceDiff > 0 && (
                          <div className="text-sm text-amber-600 mt-1">
                            +{formatPrice(priceDiff)} más caro
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className={`text-2xl font-bold ${
                          isCheapest ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {formatPrice(store.price)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectStore(store.name, store.price)}
                          className={`inline-flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            isCheapest
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Check size={18} />
                          <span>Seleccionar</span>
                        </button>
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
                        >
                          <ExternalLink size={18} />
                          <span>Ver</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Consejo</h4>
        <p className="text-sm text-blue-800">
          Selecciona "Seleccionar" para agregar este componente a tu build con esa tienda, o haz clic en "Ver" para visitar la tienda y ver más detalles.
          {maxPrice - minPrice > 0 && (
            <span> La diferencia entre la tienda más cara y más barata es de{' '}
              <span className="font-bold">{formatPrice(maxPrice - minPrice)}</span>.
            </span>
          )}
        </p>
      </div>
    </Modal>
  );
}

export default ComponentModal;
