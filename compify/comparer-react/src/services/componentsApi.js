// Servicio para obtener componentes desde la API de Laravel

import axios from 'axios';

// URL base de la API de Laravel
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtener todos los componentes agrupados por tipo
 */
export const getAllComponents = async () => {
  try {
    const response = await apiClient.get('/components');
    return response.data;
  } catch (error) {
    console.error('Error al obtener componentes:', error);
    throw error;
  }
};

/**
 * Obtener componentes por tipo específico
 * @param {string} type - cpu, motherboard, ram, gpu, psu, storage, case
 */
export const getComponentsByType = async (type) => {
  try {
    const response = await apiClient.get(`/components/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener componentes de tipo ${type}:`, error);
    throw error;
  }
};

/**
 * Verificar compatibilidad entre componentes
 * @param {Object} components - { cpu_id, motherboard_id, ram_id, gpu_id, psu_id }
 */
export const checkCompatibility = async (components) => {
  try {
    const response = await apiClient.post('/components/check-compatibility', components);
    return response.data;
  } catch (error) {
    console.error('Error al verificar compatibilidad:', error);
    throw error;
  }
};

/**
 * Obtener un producto específico por ID
 * @param {number} id - ID del producto
 */
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/components/product/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    throw error;
  }
};

/**
 * Transformar datos de la API al formato esperado por el frontend
 */
export const transformComponentsToFrontendFormat = (apiComponents) => {
  const mockComponentsFormat = {};

  // Mapear cada tipo de componente
  Object.keys(apiComponents).forEach(type => {
    const items = apiComponents[type];
    
    mockComponentsFormat[type] = {
      name: getComponentDisplayName(type),
      icon: getComponentIcon(type),
      items: items.map(item => ({
        id: item.product_id,
        name: `${item.brand} ${item.model}`,
        specs: getComponentSpecs(type, item),
        // Campos específicos según el tipo
        ...(type === 'cpu' && {
          socket: item.socket,
          tdp: item.tdp,
          cores: item.cores,
          threads: item.threads,
        }),
        ...(type === 'motherboard' && {
          socket: item.socket,
          ramType: item.ram_type,
          maxRam: item.max_ram,
          ramSlots: item.ram_slots,
        }),
        ...(type === 'ram' && {
          type: item.memory_type,
          capacity: item.capacity,
          speed: item.speed,
        }),
        ...(type === 'gpu' && {
          tdp: item.tdp,
          vram: item.vram,
        }),
        ...(type === 'psu' && {
          wattage: item.wattage,
          efficiency: item.efficiency,
        }),
        price: item.base_price || 0,
        image: item.image_url,
      }))
    };
  });

  return mockComponentsFormat;
};

// Funciones auxiliares
function getComponentDisplayName(type) {
  const names = {
    cpu: 'Procesador (CPU)',
    motherboard: 'Placa Base',
    ram: 'Memoria RAM',
    gpu: 'Tarjeta Gráfica (GPU)',
    psu: 'Fuente de Poder',
    storage: 'Almacenamiento',
    case: 'Gabinete',
  };
  return names[type] || type;
}

function getComponentIcon(type) {
  const icons = {
    cpu: 'cpu',
    motherboard: 'motherboard',
    ram: 'memory',
    gpu: 'gpu',
    psu: 'power',
    storage: 'storage',
    case: 'case',
  };
  return icons[type] || 'component';
}

function getComponentSpecs(type, item) {
  switch (type) {
    case 'cpu':
      return `${item.cores} Núcleos, ${item.threads} Hilos, ${item.turbo_clock}GHz Turbo`;
    case 'motherboard':
      return `Socket ${item.socket}, ${item.ram_type?.toUpperCase()}, ${item.max_ram}GB Max`;
    case 'ram':
      return `${item.capacity}GB ${item.memory_type?.toUpperCase()}, ${item.speed}MHz`;
    case 'gpu':
      return `${item.vram}GB VRAM, ${item.tdp}W TDP`;
    case 'psu':
      return `${item.wattage}W, ${item.efficiency}`;
    case 'storage':
      return `${item.storage_capacity}GB ${item.storage_type?.toUpperCase()}`;
    case 'case':
      return item.description || 'Case ATX';
    default:
      return item.description || '';
  }
}
