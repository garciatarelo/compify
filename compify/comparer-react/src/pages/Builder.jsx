import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';
import { mockComponents } from '../data/mockComponents';
import ComponentModal from '../components/BuilderComponents/ComponentModalNew';
import BuildSummary from '../components/BuilderComponents/BuildSummaryFixed';
import CompatibilityAlert from '../components/BuilderComponents/CompatibilityAlert';
import PriceComparisonModal from '../components/BuilderComponents/PriceComparisonModal';
import { formatPrice } from '../utils/formatters';
import * as LucideIcons from 'lucide-react';

// TODO API: Este componente consumirá:
// - GET /api/components para obtener todos los componentes por categoría
// - GET /api/components/{id} para detalles de un componente específico
// - La compatibilidad se validará con las reglas devueltas por la API
function Builder() {
  const { currentBuild, compatibilityIssues, clearBuild, getSelectedComponent } = useBuilder();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Convertir mockComponents a array con id
  // TODO API: Reemplazar con datos de GET /api/components?category=all
  const categories = Object.entries(mockComponents).map(([id, category]) => ({
    ...category,
    id
  }));

  const openComponentModal = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  const closeModal = () => {
    setSelectedCategory(null);
  };

  // Mapeo de iconos de lucide
  const getIconComponent = (iconName) => {
    const iconMap = {
      'cpu': 'Cpu',
      'circuit-board': 'CircuitBoard',
      'memory-stick': 'MemoryStick',
      'box': 'Box',
      'hard-drive': 'HardDrive',
      'zap': 'Zap',
      'package': 'Package'
    };
    
    const IconComponent = LucideIcons[iconMap[iconName]];
    return IconComponent ? <IconComponent className="w-5 h-5 text-gray-600" /> : <span>📦</span>;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-3xl font-bold mb-6">
          🔧 Arma tu PC Personalizada
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de Selección de Componentes */}
          <div className="lg:col-span-2 space-y-4">
            <div id="component-list">
              {categories.map((category) => {
                const selectedComponentId = currentBuild[category.id];
                const selectedComponent = selectedComponentId 
                  ? category.items.find(item => item.id === selectedComponentId) 
                  : null;

                const selectedStore = currentBuild[`${category.id}_store`];
                const selectedPrice = currentBuild[`${category.id}_price`];
                
                const minPrice = selectedComponent ? Math.min(...selectedComponent.stores.map(s => s.price)) : null;
                const maxPrice = selectedComponent ? Math.max(...selectedComponent.stores.map(s => s.price)) : null;
                const storeCount = selectedComponent ? selectedComponent.stores.length : 0;

                const storeInfo = selectedComponent && selectedStore 
                  ? selectedComponent.stores.find(s => s.name === selectedStore)
                  : null;

                return (
                  <div 
                    key={category.id}
                    className={`bg-white p-5 rounded-lg shadow hover:shadow-xl transition-all ${
                      selectedComponent ? 'border-l-4 border-indigo-500' : 'border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getIconComponent(category.icon)}
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            {category.name}
                          </p>
                        </div>
                        <p className="text-lg font-bold mb-1">
                          {selectedComponent ? selectedComponent.name : 'No seleccionado'}
                        </p>
                        {selectedComponent && (
                          <>
                            <p className="text-sm text-gray-600 mb-2">{selectedComponent.specs}</p>
                            {storeInfo ? (
                              <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                <span className="text-lg">{storeInfo.logo}</span>
                                <div className="flex-1">
                                  <p className="text-xs text-gray-600">Comprar en:</p>
                                  <p className="text-sm font-bold text-indigo-700">{storeInfo.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-extrabold text-indigo-600">
                                    {formatPrice(selectedPrice)}
                                  </p>
                                  <p className="text-xs text-gray-500">{storeInfo.shipping}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                                  Desde {formatPrice(minPrice)}
                                </span>
                                {storeCount > 1 && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                    {storeCount} tiendas
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        {!selectedComponent && (
                          <p className="text-sm text-gray-400">Haz clic en "Seleccionar" para elegir</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {selectedComponent && !storeInfo && (
                          <>
                            <p className="text-sm text-gray-500 mb-1">Rango de precios</p>
                            <p className="text-2xl font-extrabold text-indigo-600 mb-2">
                              {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                            </p>
                          </>
                        )}
                        <button 
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedComponent 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                          onClick={() => openComponentModal(category.id)}
                        >
                          {selectedComponent ? (storeInfo ? 'Cambiar tienda' : 'Elegir tienda') : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alertas de compatibilidad */}
            <div id="compatibility-alerts" className="space-y-2">
              {compatibilityIssues.length > 0 && (
                <CompatibilityAlert issues={compatibilityIssues} />
              )}
            </div>
          </div>

          {/* Columna de Resumen y Presupuesto */}
          <div className="lg:col-span-1">
            <BuildSummary onClearBuild={clearBuild} onOpenComparison={() => setShowComparisonModal(true)} />
          </div>
        </div>
      </div>

      {/* Modal de Selección de Componentes */}
      {selectedCategory && (
        <ComponentModal
          isOpen={!!selectedCategory}
          onClose={closeModal}
          categoryKey={selectedCategory}
          category={mockComponents[selectedCategory]}
        />
      )}

      {/* Modal de Comparación de Precios */}
      <PriceComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
      />
    </div>
  );
}

export default Builder;
