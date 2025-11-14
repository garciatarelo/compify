// 🔧 Servicio de ejemplo para productos
// Este archivo muestra cómo implementar las llamadas a la API

import axios from 'axios';

// TODO: Configurar la URL base de tu API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - redirigir al login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// 📦 PRODUCTOS (LAPTOPS)
// ============================================

/**
 * Obtener lista de productos con filtros
 * @param {Object} filters - { search, brand, minPrice, maxPrice }
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Obtener detalles de un producto específico
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>} Detalles del producto
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Obtener historial de precios de un producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} Historial de precios
 * Response esperado: [{ date, price, storeName, storeLogo }]
 */
export const getProductPriceHistory = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}/price-history`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching price history for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Obtener lista de marcas disponibles
 * @returns {Promise<Array>} Lista de marcas
 */
export const getBrands = async () => {
  try {
    const response = await apiClient.get('/products/brands');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// ============================================
// 🖥️ COMPONENTES (PC BUILDER)
// ============================================

/**
 * Obtener componentes organizados por categoría
 * @param {string} category - Categoría opcional (cpu, motherboard, ram, etc.)
 * @returns {Promise<Object>} Componentes por categoría
 */
export const getComponents = async (category = null) => {
  try {
    const url = category ? `/components?category=${category}` : '/components';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

/**
 * Obtener detalles de un componente específico
 * @param {string} componentId - ID del componente
 * @returns {Promise<Object>} Detalles del componente
 */
export const getComponentById = async (componentId) => {
  try {
    const response = await apiClient.get(`/components/${componentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching component ${componentId}:`, error);
    throw error;
  }
};

/**
 * Obtener historial de precios de un componente
 * @param {string} componentId - ID del componente
 * @returns {Promise<Array>} Historial de precios
 * Response esperado: [{ date, price, storeName, storeLogo }]
 */
export const getComponentPriceHistory = async (componentId) => {
  try {
    const response = await apiClient.get(`/components/${componentId}/price-history`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching price history for component ${componentId}:`, error);
    throw error;
  }
};

// ============================================
// ⭐ FAVORITOS
// ============================================

/**
 * Obtener lista de favoritos del usuario
 * @returns {Promise<Array>} Lista de productos favoritos
 */
export const getFavorites = async () => {
  try {
    const response = await apiClient.get('/users/favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

/**
 * Agregar producto a favoritos
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const addFavorite = async (productId) => {
  try {
    const response = await apiClient.post('/users/favorites', { productId });
    return response.data;
  } catch (error) {
    console.error(`Error adding favorite ${productId}:`, error);
    throw error;
  }
};

/**
 * Remover producto de favoritos
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const removeFavorite = async (productId) => {
  try {
    const response = await apiClient.delete(`/users/favorites/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing favorite ${productId}:`, error);
    throw error;
  }
};

// ============================================
// 🛠️ BUILDS (PC BUILDER)
// ============================================

/**
 * Obtener lista de builds del usuario
 * @returns {Promise<Array>} Lista de builds
 */
export const getBuilds = async () => {
  try {
    const response = await apiClient.get('/builds');
    return response.data;
  } catch (error) {
    console.error('Error fetching builds:', error);
    throw error;
  }
};

/**
 * Obtener detalles de un build específico
 * @param {number} buildId - ID del build
 * @returns {Promise<Object>} Detalles del build
 */
export const getBuildById = async (buildId) => {
  try {
    const response = await apiClient.get(`/builds/${buildId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching build ${buildId}:`, error);
    throw error;
  }
};

/**
 * Guardar un nuevo build
 * @param {Object} buildData - { name, components, selectedStores }
 * @returns {Promise<Object>} Build guardado
 */
export const saveBuild = async (buildData) => {
  try {
    const response = await apiClient.post('/builds', buildData);
    return response.data;
  } catch (error) {
    console.error('Error saving build:', error);
    throw error;
  }
};

/**
 * Actualizar un build existente
 * @param {number} buildId - ID del build
 * @param {Object} buildData - { name, components, selectedStores }
 * @returns {Promise<Object>} Build actualizado
 */
export const updateBuild = async (buildId, buildData) => {
  try {
    const response = await apiClient.put(`/builds/${buildId}`, buildData);
    return response.data;
  } catch (error) {
    console.error(`Error updating build ${buildId}:`, error);
    throw error;
  }
};

/**
 * Eliminar un build
 * @param {number} buildId - ID del build
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteBuild = async (buildId) => {
  try {
    const response = await apiClient.delete(`/builds/${buildId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting build ${buildId}:`, error);
    throw error;
  }
};

/**
 * Validar compatibilidad de un build
 * @param {Object} buildComponents - { cpu, motherboard, ram, ... }
 * @returns {Promise<Object>} { isValid, issues }
 */
export const validateBuild = async (buildComponents) => {
  try {
    const response = await apiClient.post('/builds/validate', buildComponents);
    return response.data;
  } catch (error) {
    console.error('Error validating build:', error);
    throw error;
  }
};

// ============================================
// 🔐 AUTENTICACIÓN
// ============================================

/**
 * Iniciar sesión
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { token, user }
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} { token, user }
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    const { token, user } = response.data;
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    // Limpiar datos locales siempre
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// ============================================
// 📖 EJEMPLO DE USO EN COMPONENTES
// ============================================

/*
// En Home.jsx:
import { getProducts, getBrands } from '../services/api';

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadProducts = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getProducts(filters);
    setProducts(data);
  } catch (err) {
    setError('Error al cargar productos');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadProducts();
}, [filters]);
*/

export default apiClient;
