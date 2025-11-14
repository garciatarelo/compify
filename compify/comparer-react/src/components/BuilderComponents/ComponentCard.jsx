import { Check, X } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { formatPrice } from '../../utils/formatters';

function ComponentCard({ category, component, onClick, disabled = false }) {
  const { getSelectedComponent, getSelectedStore, getSelectedPrice } = useBuilder();
  const selectedId = getSelectedComponent(category.id);
  const selectedStore = getSelectedStore(category.id);
  const selectedPrice = getSelectedPrice(category.id);
  const isSelected = selectedId === component.id;

  // Calcular precio mínimo y máximo
  const prices = component.stores.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-50'
          : isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
      }`}
      onClick={() => !disabled && onClick()}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 mb-1">{component.name}</h4>
          <p className="text-sm text-gray-600">{component.specs}</p>
        </div>
        {isSelected && (
          <div className="ml-3">
            <Check size={24} className="text-blue-500" />
          </div>
        )}
        {disabled && (
          <div className="ml-3">
            <X size={24} className="text-red-500" />
          </div>
        )}
      </div>

      {/* Compatibility Info */}
      {(component.socket || component.type || component.tdp || component.wattage) && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs space-y-1">
          {component.socket && (
            <div className="flex items-center">
              <span className="font-semibold w-16">Socket:</span>
              <span className="text-gray-700">{component.socket.toUpperCase()}</span>
            </div>
          )}
          {component.type && (
            <div className="flex items-center">
              <span className="font-semibold w-16">Tipo:</span>
              <span className="text-gray-700">{component.type.toUpperCase()}</span>
            </div>
          )}
          {component.tdp && (
            <div className="flex items-center">
              <span className="font-semibold w-16">TDP:</span>
              <span className="text-gray-700">{component.tdp}W</span>
            </div>
          )}
          {component.wattage && (
            <div className="flex items-center">
              <span className="font-semibold w-16">Potencia:</span>
              <span className="text-gray-700">{component.wattage}W</span>
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-t pt-3">
        {isSelected && selectedStore && selectedPrice ? (
          <div>
            <div className="text-xs text-gray-500 mb-1">
              Seleccionado en {selectedStore}
            </div>
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(selectedPrice)}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {component.stores.length} tiendas disponibles
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-500">Desde</span>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(minPrice)}
              </span>
              {minPrice !== maxPrice && (
                <>
                  <span className="text-sm text-gray-500">hasta</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatPrice(maxPrice)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentCard;
