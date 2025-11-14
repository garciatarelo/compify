// Utility functions for checking component compatibility

import { mockComponents } from '../data/mockComponents';

/**
 * Verifica la compatibilidad entre componentes seleccionados
 * @param {Object} currentBuild - El build actual con los componentes seleccionados
 * @returns {Array} - Array de issues de compatibilidad
 */
export function checkCompatibility(currentBuild) {
  const issues = [];

  // Obtener componentes seleccionados
  const cpu = currentBuild.cpu ? mockComponents.cpu.items.find(i => i.id === currentBuild.cpu) : null;
  const motherboard = currentBuild.motherboard ? mockComponents.motherboard.items.find(i => i.id === currentBuild.motherboard) : null;
  const ram = currentBuild.ram ? mockComponents.ram.items.find(i => i.id === currentBuild.ram) : null;
  const gpu = currentBuild.gpu ? mockComponents.gpu.items.find(i => i.id === currentBuild.gpu) : null;
  const psu = currentBuild.psu ? mockComponents.psu.items.find(i => i.id === currentBuild.psu) : null;

  // Verificar compatibilidad CPU - Motherboard
  if (cpu && motherboard) {
    if (cpu.socket !== motherboard.socket) {
      issues.push({
        level: 'critical',
        components: ['CPU', 'Placa Base'],
        message: `❌ INCOMPATIBLE: <strong>${cpu.name}</strong> (socket ${cpu.socket.toUpperCase()}) NO es compatible con <strong>${motherboard.name}</strong> (socket ${motherboard.socket.toUpperCase()})`,
        solution: cpu.socket === 'intel-1700'
          ? '💡 Necesitas una placa base con socket Intel LGA 1700'
          : '💡 Necesitas una placa base con socket AMD AM5'
      });
    }
  } else if (cpu && !motherboard) {
    issues.push({
      level: 'info',
      components: ['Placa Base'],
      message: `ℹ️ Selecciona una <strong>Placa Base compatible con socket ${cpu.socket.toUpperCase()}</strong> para tu procesador ${cpu.name}`
    });
  } else if (motherboard && !cpu) {
    issues.push({
      level: 'info',
      components: ['CPU'],
      message: `ℹ️ Selecciona un <strong>Procesador compatible con socket ${motherboard.socket.toUpperCase()}</strong> para tu placa base ${motherboard.name}`
    });
  }

  // Verificar compatibilidad RAM - Motherboard
  if (ram && motherboard) {
    if (ram.type !== motherboard.ramType) {
      issues.push({
        level: 'critical',
        components: ['RAM', 'Placa Base'],
        message: `❌ INCOMPATIBLE: <strong>${ram.name}</strong> (tipo ${ram.type.toUpperCase()}) NO es compatible con <strong>${motherboard.name}</strong> (tipo ${motherboard.ramType.toUpperCase()})`,
        solution: `💡 Necesitas memoria RAM tipo ${motherboard.ramType.toUpperCase()}`
      });
    }
    if (ram.capacity > motherboard.maxRam) {
      issues.push({
        level: 'warning',
        components: ['RAM', 'Placa Base'],
        message: `⚠️ ADVERTENCIA: La capacidad de <strong>${ram.name}</strong> (${ram.capacity}GB) excede el máximo soportado por <strong>${motherboard.name}</strong> (${motherboard.maxRam}GB)`,
        solution: '💡 La placa base podría no reconocer toda la memoria'
      });
    }
  } else if (ram && !motherboard) {
    issues.push({
      level: 'info',
      components: ['Placa Base'],
      message: `ℹ️ Selecciona una <strong>Placa Base compatible con ${ram.type.toUpperCase()}</strong> para tu memoria ${ram.name}`
    });
  }

  // Verificar potencia de la fuente
  if (psu && (cpu || gpu)) {
    const cpuTDP = cpu?.tdp || 0;
    const gpuTDP = gpu?.tdp || 0;
    const totalTDP = cpuTDP + gpuTDP + 100;
    const recommended = totalTDP * 1.3;

    if (psu.wattage < totalTDP) {
      issues.push({
        level: 'critical',
        components: ['Fuente de Poder', cpu ? 'CPU' : '', gpu ? 'GPU' : ''].filter(Boolean),
        message: `❌ INSUFICIENTE: <strong>${psu.name}</strong> (${psu.wattage}W) NO es suficiente para tu configuración`,
        solution: `💡 Consumo estimado: ${Math.ceil(totalTDP)}W. Necesitas mínimo ${Math.ceil(totalTDP)}W (recomendado: ${Math.ceil(recommended)}W)`,
        details: `CPU: ${cpuTDP}W${gpu ? ` + GPU: ${gpuTDP}W` : ''} + Otros: 100W = ${totalTDP}W total`
      });
    } else if (psu.wattage < recommended) {
      issues.push({
        level: 'warning',
        components: ['Fuente de Poder'],
        message: `⚠️ JUSTA: <strong>${psu.name}</strong> (${psu.wattage}W) es suficiente pero ajustada`,
        solution: `💡 Se recomienda ${Math.ceil(recommended)}W para mejor estabilidad y eficiencia`,
        details: `Consumo estimado: ${totalTDP}W (${Math.round(psu.wattage / totalTDP * 100)}% de capacidad)`
      });
    }
  } else if ((cpu || gpu) && !psu) {
    const totalTDP = (cpu?.tdp || 0) + (gpu?.tdp || 0) + 100;
    issues.push({
      level: 'info',
      components: ['Fuente de Poder'],
      message: `ℹ️ Tu configuración necesita una <strong>Fuente de Poder de al menos ${Math.ceil(totalTDP * 1.3)}W</strong>`,
      details: `Consumo estimado: ${totalTDP}W`
    });
  }

  return issues;
}

/**
 * Calcula el precio total del build
 * @param {Object} currentBuild 
 * @returns {Object} 
 */
export function calculateBuildTotal(currentBuild) {
  let minTotal = 0;
  let maxTotal = 0;
  let selectedTotal = 0;
  let avgSum = 0;
  let componentCount = 0;

  Object.entries(currentBuild).forEach(([key, componentId]) => {
    // Saltar las claves metadata (_store, _price)
    if (key.includes('_') || !componentId) return;

    const category = mockComponents[key];
    const component = category?.items.find(item => item.id === componentId);
    
    if (component && component.stores) {
      const prices = component.stores.map(s => s.price);
      minTotal += Math.min(...prices);
      maxTotal += Math.max(...prices);
      avgSum += prices.reduce((a, b) => a + b, 0) / prices.length;

      // Usar precio seleccionado específico si existe, sino usar el mínimo
      const selectedPrice = currentBuild[`${key}_price`];
      selectedTotal += selectedPrice || Math.min(...prices);

      componentCount++;
    }
  });

  return {
    minTotal,
    maxTotal,
    selectedTotal,
    avgTotal: Math.round(avgSum),
    componentCount
  };
}

/**
 * Calcula las combinaciones de precios de todas las tiendas posibles
 * @param {Object} currentBuild 
 * @returns {Array} 
 */
export function calculateStoreCombinations(currentBuild) {
  const combinations = [];
  const storeNames = new Set();
  const storeLogos = {};

  // Recopilar todas las tiendas únicas y sus logos
  Object.keys(currentBuild).forEach(key => {
    // Saltar las claves metadata (_store, _price)
    if (key.includes('_')) return;

    const componentId = currentBuild[key];
    if (componentId) {
      const category = mockComponents[key];
      if (!category || !category.items) return;
      
      const component = category.items.find(i => i.id === componentId);
      if (component && component.stores) {
        component.stores.forEach(store => {
          storeNames.add(store.name);
          if (!storeLogos[store.name]) {
            storeLogos[store.name] = store.logo;
          }
        });
      }
    }
  });

  // NUEVA: Agregar combinación de "Tu selección actual"
  let selectedTotal = 0;
  let selectedStoreBreakdown = {};
  let hasSelectedStores = false;

  Object.keys(currentBuild).forEach(key => {
    if (key.includes('_')) return;

    const componentId = currentBuild[key];
    const selectedStore = currentBuild[`${key}_store`];
    const selectedPrice = currentBuild[`${key}_price`];

    if (componentId) {
      const category = mockComponents[key];
      if (!category || !category.items) return;
      
      const component = category.items.find(i => i.id === componentId);
      if (component && component.stores) {
        if (selectedStore && selectedPrice) {
          hasSelectedStores = true;
          selectedTotal += selectedPrice;
          if (!selectedStoreBreakdown[selectedStore]) {
            const storeInfo = component.stores.find(s => s.name === selectedStore);
            selectedStoreBreakdown[selectedStore] = {
              name: selectedStore,
              logo: storeInfo?.logo || '🏪',
              total: 0
            };
          }
          selectedStoreBreakdown[selectedStore].total += selectedPrice;
        } else {
          // Si no hay tienda seleccionada, usar el precio mínimo
          const minPrice = Math.min(...component.stores.map(s => s.price));
          selectedTotal += minPrice;
        }
      }
    }
  });

  // Agregar "Tu selección actual" como primera opción si hay tiendas seleccionadas
  if (hasSelectedStores) {
    combinations.push({
      name: '🎯 Tu Selección Actual',
      total: selectedTotal,
      stores: Object.values(selectedStoreBreakdown),
      isSelected: true
    });
  }

  // Para cada tienda, calcular el total si compras todo ahí
  storeNames.forEach(storeName => {
    let total = 0;
    let missingComponents = 0;

    Object.keys(currentBuild).forEach(key => {
      if (key.includes('_')) return;

      const componentId = currentBuild[key];
      if (componentId) {
        const category = mockComponents[key];
        if (!category || !category.items) return;
        
        const component = category.items.find(i => i.id === componentId);
        if (component && component.stores) {
          const storePrice = component.stores.find(s => s.name === storeName);
          if (storePrice) {
            total += storePrice.price;
          } else {
            // Si esta tienda no tiene este componente, usar el precio más bajo disponible
            const minPrice = Math.min(...component.stores.map(s => s.price));
            total += minPrice;
            missingComponents++;
          }
        }
      }
    });

    combinations.push({
      name: `${storeName}${missingComponents > 0 ? ' (mixto)' : ''}`,
      total: total,
      stores: [{ name: storeName, logo: storeLogos[storeName] || '🏪', total: total }],
      isMixed: missingComponents > 0
    });
  });

  // Ordenar por precio (menor a mayor) pero mantener "Tu selección" al inicio si existe
  const selectedCombination = combinations.find(c => c.isSelected);
  const otherCombinations = combinations.filter(c => !c.isSelected).sort((a, b) => a.total - b.total);

  const sortedCombinations = selectedCombination
    ? [selectedCombination, ...otherCombinations]
    : otherCombinations;

  // Calcular ahorros vs la más cara
  if (sortedCombinations.length > 0) {
    const maxPrice = Math.max(...sortedCombinations.map(c => c.total));
    const minPrice = Math.min(...sortedCombinations.map(c => c.total));
    sortedCombinations.forEach(combo => {
      combo.savings = maxPrice - combo.total;
      combo.isCheapest = combo.total === minPrice;
    });
  }

  return sortedCombinations;
}
