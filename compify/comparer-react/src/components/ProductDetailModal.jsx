import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import Modal from './Modal';
import PriceChart from './PriceChart';
import { formatPrice, formatDate } from '../utils/formatters';

// TODO API: Este componente consumirá GET /api/products/{id} para obtener detalles completos
// Estructura esperada del producto desde la API:
// {
//   id, name, brand, imageUrl, processor, ram, graphics,
//   stores: [{ name, price, url, logo, shipping }],
//   priceHistory: [{ date, price, storeName, storeLogo }]
// }
function ProductDetailModal({ isOpen, onClose, product }) {
  if (!product) return null;

  // Función para obtener el historial de precios mínimos combinado
  // TODO API: La respuesta de GET /api/products/{id}/price-history debe incluir:
  // [{ date: string, minPrice: number, storeName: string, storeLogo: string }]
  const getCombinedPriceHistory = () => {
    // Si existe priceHistory a nivel de producto (datos mock actuales)
    if (product.priceHistory && product.priceHistory.length > 0) {
      // En datos mock, el historial es del precio general
      // Para mostrar la tienda, buscamos cuál tiene el precio más cercano
      return product.priceHistory.map(entry => {
        // Encontrar qué tienda tiene el precio más bajo en este momento
        const closestStore = product.stores.reduce((best, store) => {
          const diff = Math.abs(store.price - entry.price);
          const bestDiff = Math.abs(best.price - entry.price);
          return diff < bestDiff ? store : best;
        }, product.stores[0]);
        
        return {
          date: entry.date,
          price: entry.price,
          storeName: closestStore.name,
          storeLogo: closestStore.logo
        };
      });
    }
    
    // Fallback: retornar array vacío si no hay historial
    return [];
  };

  // Calcular precio mínimo y máximo actuales
  const prices = product.stores.map(s => s.price);
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
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="xl">
      {/* Product Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {/* Product Image */}
          <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1">
            <div className="text-sm text-blue-600 font-semibold mb-2">
              {product.brand}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {product.name}
            </h2>
            
            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center">
                <span className="font-semibold text-gray-600 w-28">Procesador:</span>
                <span className="text-gray-800">{product.processor}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-600 w-28">RAM:</span>
                <span className="text-gray-800">{product.ram}GB</span>
              </div>
              <div className="flex items-center col-span-2">
                <span className="font-semibold text-gray-600 w-28">Gráficos:</span>
                <span className="text-gray-800">{product.graphics}</span>
              </div>
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
          🏪 Comparación de Tiendas ({product.stores.length} disponibles)
        </h3>
        <div className="space-y-3">
          {product.stores
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

                    {/* Price & Action */}
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className={`text-2xl font-bold ${
                          isCheapest ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {formatPrice(store.price)}
                        </div>
                      </div>
                      <a
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isCheapest
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <ExternalLink size={18} />
                        <span>Comprar</span>
                      </a>
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
          La diferencia entre la tienda más cara y más barata es de{' '}
          <span className="font-bold">
            {formatPrice(maxPrice - minPrice)}
          </span>
          . Los precios se actualizan regularmente, por lo que te recomendamos verificar antes de comprar.
        </p>
      </div>
    </Modal>
  );
}

export default ProductDetailModal;
