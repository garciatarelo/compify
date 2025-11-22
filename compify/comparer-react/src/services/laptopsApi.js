// Servicio para obtener laptops desde la API de Laravel

import axios from 'axios';

// URL base de la API de Laravel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  return apiLaptops.map(laptop => {
    // Extraer RAM como número (ej: "16GB DDR5" -> 16)
    const ramMatch = laptop.ram?.match(/(\d+)/);
    const ramGB = ramMatch ? parseInt(ramMatch[1]) : 0;

    return {
      id: laptop.product_id,
      brand: laptop.brand,
      name: `${laptop.brand} ${laptop.model}`, // Combinar marca y modelo para el nombre
      model: laptop.model,
      processor: laptop.cpu || 'N/A', // ProductCard espera "processor"
      cpu: laptop.cpu,
      ram: laptop.ram || `${ramGB}GB`, // ProductCard espera un string o número, preferimos el string original
      ramFull: laptop.ram, // Mantener el string completo por si acaso
      storage: laptop.storage || 'N/A',
      graphics: laptop.gpu || 'Integrada', // ProductCard espera "graphics"
      display: laptop.display || 'N/A',
      imageUrl: laptop.image_url || 'https://placehold.co/400x300/6366f1/white?text=Laptop', // ProductCard espera "imageUrl"
      description: laptop.description,
      os: laptop.os || 'N/A',
      specs: laptop.specs || {},
      
      // Precios de tiendas (formato compatible con ProductCard)
      stores: laptop.prices?.map(price => ({
        name: price.store_name || 'Tienda', // Fallback si store_name es null
        price: parseFloat(price.price),
        url: price.url,
        logo: price.logo_url || '🏪',
        shipping: 'Consultar' // Valor por defecto
      })) || [],
      
      // Precios agregados
      minPrice: parseFloat(laptop.min_price) || 0,
      maxPrice: parseFloat(laptop.max_price) || 0,
      avgPrice: laptop.prices?.length > 0 
        ? laptop.prices.reduce((sum, p) => sum + parseFloat(p.price), 0) / laptop.prices.length 
        : 0,
    };
  });
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
