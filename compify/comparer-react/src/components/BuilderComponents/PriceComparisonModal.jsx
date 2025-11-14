import { Trophy, Store } from 'lucide-react';
import Modal from '../Modal';
import { calculateStoreCombinations } from '../../utils/compatibility';
import { formatPrice } from '../../utils/formatters';
import { useBuilder } from '../../context/BuilderContext';

function PriceComparisonModal({ isOpen, onClose }) {
  const { currentBuild } = useBuilder();
  const combinations = calculateStoreCombinations(currentBuild);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comparación de Precios por Tienda" size="xl">
      <div className="mb-4 text-gray-600">
        <p>Compara cuánto costaría tu build comprando todos los componentes en cada tienda.</p>
        <p className="text-sm mt-1">
          Las tiendas marcadas como <span className="font-semibold">(mixto)</span> no tienen todos los componentes disponibles.
        </p>
      </div>

      <div className="space-y-3">
        {combinations.map((combo, index) => {
          const isFirst = index === 0;
          const savings = combo.savings || 0;

          return (
            <div
              key={combo.name}
              className={`border-2 rounded-lg p-5 transition-all ${
                combo.isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : combo.isCheapest
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Store Info */}
                <div className="flex items-start space-x-3">
                  {combo.isSelected ? (
                    <div className="text-3xl">🎯</div>
                  ) : combo.isCheapest ? (
                    <Trophy className="text-yellow-500" size={32} />
                  ) : (
                    <Store className="text-gray-400" size={32} />
                  )}
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      {combo.name}
                      {combo.isSelected && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          TU SELECCIÓN
                        </span>
                      )}
                      {combo.isCheapest && !combo.isSelected && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          MÁS BARATO
                        </span>
                      )}
                    </h3>
                    
                    {/* Store Breakdown (for mixed selections) */}
                    {combo.stores.length > 1 && (
                      <div className="mt-2 space-y-1">
                        {combo.stores.map((store) => (
                          <div key={store.name} className="flex items-center space-x-2 text-sm">
                            <span className="text-xl">{store.logo}</span>
                            <span className="text-gray-600">{store.name}:</span>
                            <span className="font-semibold text-gray-800">
                              {formatPrice(store.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {combo.isMixed && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        ⚠️ Esta tienda no tiene todos los componentes. Se usan precios de otras tiendas.
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Savings */}
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    combo.isCheapest ? 'text-green-600' : 'text-gray-800'
                  }`}>
                    {formatPrice(combo.total)}
                  </div>
                  
                  {savings > 0 && (
                    <div className="mt-1 text-sm text-green-600 font-semibold">
                      Ahorras {formatPrice(savings)}
                    </div>
                  )}
                  
                  {savings === 0 && !combo.isCheapest && (
                    <div className="mt-1 text-sm text-gray-500">
                      Precio estándar
                    </div>
                  )}
                </div>
              </div>

              {/* Position Indicator */}
              {isFirst && (
                <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-blue-700">
                  {combo.isSelected
                    ? '📌 Esta es tu configuración actual con las tiendas que elegiste'
                    : '🏆 Esta es la opción más económica'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Consejo</h4>
        <p className="text-sm text-blue-800">
          La diferencia entre la opción más cara y más barata es de{' '}
          <span className="font-bold">
            {formatPrice(Math.max(...combinations.map(c => c.total)) - Math.min(...combinations.map(c => c.total)))}
          </span>
          . Puedes ahorrar eligiendo cuidadosamente las tiendas para cada componente.
        </p>
      </div>
    </Modal>
  );
}

export default PriceComparisonModal;
