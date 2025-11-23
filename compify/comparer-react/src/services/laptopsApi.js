// Servicio para obtener laptops desde la API de Laravel

import axios from 'axios';

// URL base de la API de Laravel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token JWT si existe
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Obtener todas las laptops con paginación
 * @param {Object} params - Parámetros de consulta (page, per_page, brand, min_price, max_price)
 */
export const getLaptops = async (params = {}) => {
  try {
    const response = await apiClient.get('/laptops', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener laptops:', error);
    throw error;
  }
};

/**
 * Obtener una laptop específica por ID
 * @param {number} id - ID de la laptop
 */
export const getLaptopById = async (id) => {
  try {
    const response = await apiClient.get(`/laptops/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener laptop ${id}:`, error);
    throw error;
  }
};

/**
 * Buscar laptops por texto
 * @param {string} searchTerm - Término de búsqueda
 */
export const searchLaptops = async (searchTerm) => {
  try {
    const response = await apiClient.get('/laptops/search', {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar laptops:', error);
    throw error;
  }
};

/**
 * Transformar datos de la API al formato esperado por el frontend
 */
export const transformLaptopsToFrontendFormat = (apiLaptops) => {
  if (!apiLaptops || !Array.isArray(apiLaptops)) {
    return [];
  }

  // La nueva respuesta es un array de grupos, cada uno con un array de productos
  const products = [];
  apiLaptops.forEach(group => {
    if (Array.isArray(group.products)) {
      group.products.forEach(product => {
        // Extraer RAM como número (ej: "16GB DDR5" -> 16)
        const ramMatch = product.ram?.match(/(\d+)/);
        const ramGB = ramMatch ? parseInt(ramMatch[1]) : 0;

        products.push({
          id: product.product_id, // Usar product_id como identificador único
          brand: product.brand,
          name: `${product.brand} ${product.model}`,
          model: product.model,
          processor: product.cpu || 'N/A',
          cpu: product.cpu,
          ram: product.ram || `${ramGB}GB`,
          ramFull: product.ram,
          storage: product.storage || 'N/A',
          graphics: product.gpu || 'Integrada',
          display: product.display || 'N/A',
          imageUrl: product.image_url || 'https://placehold.co/400x300/6366f1/white?text=Laptop',
          description: product.description,
          os: product.os || 'N/A',
          specs: product.specs || {},
          stores: product.prices?.map(price => ({
            name: price.store_name || 'Tienda',
            price: parseFloat(price.price),
            url: price.url,
            logo: price.logo_url || '🏪',
            shipping: 'Consultar'
          })) || [],
          minPrice: parseFloat(product.min_price) || 0,
          maxPrice: parseFloat(product.max_price) || 0,
          avgPrice: product.prices?.length > 0
            ? product.prices.reduce((sum, p) => sum + parseFloat(p.price), 0) / product.prices.length
            : 0,
        });
      });
    }
  });
  return products;
};

/**
 * Obtener laptops con transformación automática para el frontend
 */
export const getLaptopsFormatted = async (params = {}) => {
  try {
    const response = await getLaptops(params);
    
    // Si la respuesta tiene paginación
    if (response.data) {
      return {
        laptops: transformLaptopsToFrontendFormat(response.data),
        pagination: {
          currentPage: response.current_page,
          lastPage: response.last_page,
          perPage: response.per_page,
          total: response.total,
        }
      };
    }
    
    // Si es un array simple
    return {
      laptops: transformLaptopsToFrontendFormat(response),
      pagination: null
    };
  } catch (error) {
    console.error('Error al obtener laptops formateadas:', error);
    throw error;
  }
};

/**
 * Filtrar laptops por marca
 */
export const filterByBrand = async (brand) => {
  try {
    const response = await getLaptops({ brand });
    return transformLaptopsToFrontendFormat(response.data || response);
  } catch (error) {
    console.error(`Error al filtrar por marca ${brand}:`, error);
    throw error;
  }
};

/**
 * Filtrar laptops por rango de precio
 */
export const filterByPriceRange = async (minPrice, maxPrice) => {
  try {
    const response = await getLaptops({ 
      min_price: minPrice, 
      max_price: maxPrice 
    });
    return transformLaptopsToFrontendFormat(response.data || response);
  } catch (error) {
    console.error('Error al filtrar por precio:', error);
    throw error;
  }
};
