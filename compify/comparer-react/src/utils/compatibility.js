// Utility functions for checking component compatibility

/**
 * Helper para encontrar un componente por ID, buscando también dentro de grupos
 */
const findComponent = (items, id) => {
  if (!items) return null;
  // 1. Buscar coincidencia exacta (ID de producto o ID de grupo)
  let component = items.find(i => i.id == id);
  
  // 2. Si no se encuentra, buscar si el ID pertenece a una tienda dentro de un grupo
  if (!component) {
    component = items.find(i => i.stores && i.stores.some(s => s.product_id == id));
  }
  return component;
};

/**
 * Verifica la compatibilidad entre componentes seleccionados
 * @param {Object} currentBuild - El build actual con los componentes seleccionados
 * @param {Object} componentsData - Datos de componentes (mock o de la API)
 * @returns {Array} - Array de issues de compatibilidad
 */
export function checkCompatibility(currentBuild, componentsData) {
  const issues = [];

  // Obtener componentes seleccionados
  const cpu = currentBuild.cpu ? findComponent(componentsData.cpu?.items, currentBuild.cpu) : null;
  const motherboard = currentBuild.motherboard ? findComponent(componentsData.motherboard?.items, currentBuild.motherboard) : null;
  const ram = currentBuild.ram ? findComponent(componentsData.ram?.items, currentBuild.ram) : null;
  const gpu = currentBuild.gpu ? findComponent(componentsData.gpu?.items, currentBuild.gpu) : null;
  const psu = currentBuild.psu ? findComponent(componentsData.psu?.items, currentBuild.psu) : null;

  // Verificar compatibilidad CPU - Motherboard
  if (cpu && motherboard) {
    const cpuSocket = (cpu.socket || '').toUpperCase();
    const mbSocket = (motherboard.socket || '').toUpperCase();

    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({
        level: 'critical',
        components: ['CPU', 'Placa Base'],
        message: `❌ INCOMPATIBLE: <strong>${cpu.name}</strong> (socket ${cpuSocket}) NO es compatible con <strong>${motherboard.name}</strong> (socket ${mbSocket})`,
        solution: `💡 Necesitas una placa base con socket ${cpuSocket}`
      });
    }
  } else if (cpu && !motherboard) {
    const cpuSocket = (cpu.socket || 'DESCONOCIDO').toUpperCase();
    issues.push({
      level: 'info',
      components: ['Placa Base'],
      message: `ℹ️ Selecciona una <strong>Placa Base compatible con socket ${cpuSocket}</strong> para tu procesador ${cpu.name}`
    });
  } else if (motherboard && !cpu) {
    const mbSocket = (motherboard.socket || 'DESCONOCIDO').toUpperCase();
    issues.push({
      level: 'info',
      components: ['CPU'],
      message: `ℹ️ Selecciona un <strong>Procesador compatible con socket ${mbSocket}</strong> para tu placa base ${motherboard.name}`
    });
  }

  // Verificar compatibilidad RAM - Motherboard
  if (ram && motherboard) {
    const ramGen = (ram.memory_type || '').toUpperCase(); 
    const mbRamGen = (motherboard.memory_type || '').toUpperCase();

    if (ramGen && mbRamGen && ramGen !== mbRamGen) {
      issues.push({
        level: 'critical',
        components: ['RAM', 'Placa Base'],
        message: `❌ INCOMPATIBLE: <strong>${ram.name}</strong> (tipo ${ramGen}) NO es compatible con <strong>${motherboard.name}</strong> (tipo ${mbRamGen})`,
        solution: `💡 Necesitas memoria RAM tipo ${mbRamGen}`
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
    const ramGen = (ram.memory_type || 'DESCONOCIDO').toUpperCase();
    issues.push({
      level: 'info',
      components: ['Placa Base'],
      message: `ℹ️ Selecciona una <strong>Placa Base compatible con ${ramGen}</strong> para tu memoria ${ram.name}`
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
 * @param {Object} componentsData
 * @returns {Object} 
 */
export function calculateBuildTotal(currentBuild, componentsData) {
  let minTotal = 0;
  let maxTotal = 0;
  let selectedTotal = 0;
  let avgSum = 0;
  let componentCount = 0;

  Object.entries(currentBuild).forEach(([key, componentId]) => {
    // Saltar las claves metadata (_store, _price)
    if (key.includes('_') || !componentId) return;

    const category = componentsData[key];
    const component = findComponent(category?.items, componentId);
    
    if (component && component.stores && component.stores.length > 0) {
      const prices = component.stores.map(s => Number(s.price)).filter(p => p !== null && !isNaN(p) && p > 0);
      
      if (prices.length > 0) {
        minTotal += Math.min(...prices);
        maxTotal += Math.max(...prices);
        avgSum += prices.reduce((a, b) => a + b, 0) / prices.length;

        // Usar precio seleccionado específico si existe, sino usar el mínimo
        const selectedPrice = currentBuild[`${key}_price`];
        selectedTotal += selectedPrice ? Number(selectedPrice) : Math.min(...prices);

        componentCount++;
      }
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
 * @param {Object} componentsData
 * @returns {Array} 
 */
export function calculateStoreCombinations(currentBuild, componentsData) {
  const combinations = [];
  const storeNames = new Set();
  const storeLogos = {};

  // Recopilar todas las tiendas únicas y sus logos
  Object.keys(currentBuild).forEach(key => {
    // Saltar las claves metadata (_store, _price)
    if (key.includes('_')) return;

    const componentId = currentBuild[key];
    if (componentId) {
      const category = componentsData[key];
      const component = findComponent(category?.items, componentId);
      
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
      const category = componentsData[key];
      const component = findComponent(category?.items, componentId);
      
      if (component && component.stores) {
        if (selectedStore && selectedPrice) {
          hasSelectedStores = true;
          selectedTotal += Number(selectedPrice);
          if (!selectedStoreBreakdown[selectedStore]) {
            const storeInfo = component.stores.find(s => s.name === selectedStore);
            selectedStoreBreakdown[selectedStore] = {
              name: selectedStore,
              logo: storeInfo?.logo || '🏪',
              total: 0
            };
          }
          selectedStoreBreakdown[selectedStore].total += Number(selectedPrice);
        } else {
          // Si no hay tienda seleccionada, usar el precio mínimo
          const minPrice = Math.min(...component.stores.map(s => Number(s.price)));
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
    const breakdown = {};

    Object.keys(currentBuild).forEach(key => {
      if (key.includes('_')) return;

      const componentId = currentBuild[key];
      if (componentId) {
        const category = componentsData[key];
        const component = findComponent(category?.items, componentId);
        
        if (component && component.stores) {
          const storePrice = component.stores.find(s => s.name === storeName);
          if (storePrice) {
            total += Number(storePrice.price);
            breakdown[key] = { store: storeName, price: Number(storePrice.price), url: storePrice.url };
          } else {
            // Si esta tienda no tiene este componente, usar el precio más bajo disponible
            const minStore = component.stores.reduce((min, s) => Number(s.price) < Number(min.price) ? s : min, component.stores[0]);
            total += Number(minStore.price);
            breakdown[key] = { store: minStore.name, price: Number(minStore.price), url: minStore.url };
            missingComponents++;
          }
        }
      }
    });

    combinations.push({
      name: `${storeName}${missingComponents > 0 ? ' (mixto)' : ''}`,
      total: total,
      stores: [{ name: storeName, logo: storeLogos[storeName] || '🏪', total: total }],
      isMixed: missingComponents > 0,
      breakdown: breakdown
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
