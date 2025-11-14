import { Info, BarChart3, ExternalLink } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { formatPrice } from '../../utils/formatters';
import { mockComponents } from '../../data/mockComponents';
import * as LucideIcons from 'lucide-react';

function BuildSummary({ onClearBuild, onOpenComparison }) {
  const { currentBuild, buildTotal, compatibilityIssues } = useBuilder();

  // Obtener componentes seleccionados
  const selectedComponents = Object.entries(currentBuild)
    .filter(([key, value]) => !key.includes('_') && value !== null)
    .map(([categoryId, componentId]) => {
      const category = mockComponents[categoryId];
      if (!category || !category.items) return null;
      
      const component = category.items.find(item => item.id === componentId);
      if (!component) return null;
      
      const selectedStore = currentBuild[`${categoryId}_store`];
      const selectedPrice = currentBuild[`${categoryId}_price`];
      const storeUrl = currentBuild[`${categoryId}_url`];
      
      // Obtener logo de la tienda
      const storeInfo = selectedStore 
        ? component.stores.find(s => s.name === selectedStore)
        : null;
      const storeLogo = storeInfo?.logo || '🛒';
      
      return {
        categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        component,
        selectedStore,
        selectedPrice: selectedPrice || Math.min(...component.stores.map(s => s.price)),
        storeUrl,
        storeLogo
      };
    })
    .filter(Boolean);

  // Mapeo de iconos
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
    return IconComponent ? <IconComponent className="w-4 h-4 text-gray-500" /> : null;
  };

  // Determinar estado de compatibilidad
  const criticalIssues = compatibilityIssues.filter(i => i.level === 'critical');
  const warnings = compatibilityIssues.filter(i => i.level === 'warning');
  
  const getCompatibilityStatus = () => {
    if (criticalIssues.length > 0) {
      return {
        icon: 'AlertCircle',
        text: 'Incompatibilidades detectadas',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        borderColor: 'border-red-300'
      };
    } else if (warnings.length > 0) {
      return {
        icon: 'AlertTriangle',
        text: 'Advertencias encontradas',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-300'
      };
    } else if (selectedComponents.length === 7) {
      return {
        icon: 'CheckCircle',
        text: '¡Todo compatible!',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        borderColor: 'border-green-300'
      };
    } else {
      return {
        icon: 'Info',
        text: 'Selecciona componentes',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300'
      };
    }
  };

  const compatStatus = getCompatibilityStatus();
  const CompatIcon = LucideIcons[compatStatus.icon];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
      <h3 className="text-xl font-bold mb-4">💰 Resumen de Compra</h3>
      
      {/* Indicador de compatibilidad general */}
      <div className={`mb-4 p-3 rounded-lg ${compatStatus.bgColor} border ${compatStatus.borderColor}`}>
        <div className="flex items-center gap-2">
          {CompatIcon && <CompatIcon className={`w-5 h-5 ${compatStatus.textColor}`} />}
          <span className={`font-medium ${compatStatus.textColor}`}>{compatStatus.text}</span>
        </div>
      </div>
      
      {/* Resumen del build */}
      <div id="build-summary" className="space-y-3 mb-6">
        {selectedComponents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No has seleccionado componentes todavía
          </p>
        ) : (
          selectedComponents.map(({ categoryId, categoryName, categoryIcon, component, selectedStore, selectedPrice }) => {
            const storeInfo = selectedStore 
              ? component.stores.find(s => s.name === selectedStore)
              : null;

            return (
              <div key={categoryId} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2 flex-1">
                  {getIconComponent(categoryIcon)}
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-medium">{categoryName}</span>
                    {storeInfo && (
                      <p className="text-xs text-gray-500">
                        {storeInfo.logo} {storeInfo.name}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600">
                  {formatPrice(selectedPrice)}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      <hr className="my-4" />
      
      {/* Precios */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Precio Mínimo:</span>
          <span id="build-min-price" className="font-bold text-green-600">
            {formatPrice(buildTotal.minTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Precio Máximo:</span>
          <span id="build-max-price" className="font-bold text-red-600">
            {formatPrice(buildTotal.maxTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">Precio Promedio:</span>
          <span id="build-total-price" className="text-3xl font-extrabold text-indigo-600">
            {formatPrice(buildTotal.avgTotal)}
          </span>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="space-y-2">
        <button 
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
          onClick={onOpenComparison}
        >
          <BarChart3 className="w-5 h-5" />
          Ver Comparación Completa
        </button>
        <button 
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200"
          onClick={onClearBuild}
        >
          Limpiar Configuración
        </button>
      </div>
    </div>
  );
}

export default BuildSummary;
