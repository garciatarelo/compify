import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AppContext = createContext();

// Hook personalizado para usar el contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};

// TODO API: Este contexto manejará el estado global y las llamadas a la API
// Provider del contexto
export const AppProvider = ({ children }) => {
  // Estado de favoritos (guardado en localStorage)
  // TODO API: Los favoritos se sincronizarán con POST/DELETE /api/users/favorites/{productId}
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado de autenticación (simulado)
  // TODO API: El login será POST /api/auth/login con { email, password }
  // TODO API: El token JWT se guardará en localStorage y se enviará en headers
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Estado de filtros para productos
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    minPrice: 0,
    maxPrice: 10000,
    processor: '',
    graphics: ''
  });

  // Estado de view mode (grid/list)
  const [viewMode, setViewMode] = useState('grid');

  // Estado de modales
  const [activeModal, setActiveModal] = useState(null);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Funciones para manejar favoritos
  // TODO API: addFavorite hará POST /api/users/favorites con { productId }
  const addFavorite = (productId) => {
    if (!favorites.includes(productId)) {
      setFavorites([...favorites, productId]);
      // TODO API: await fetch('/api/users/favorites', { method: 'POST', body: { productId } })
    }
  };

  // TODO API: removeFavorite hará DELETE /api/users/favorites/{productId}
  const removeFavorite = (productId) => {
    setFavorites(favorites.filter(id => id !== productId));
    // TODO API: await fetch(`/api/users/favorites/${productId}`, { method: 'DELETE' })
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Funciones para autenticación
  const login = (username, password) => {
    // Simulación de login (en producción iría a una API)
    if (username && password) {
      const userData = {
        id: '1',
        username: username,
        email: `${username}@example.com`,
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  // Funciones para filtros
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      minPrice: 0,
      maxPrice: 10000,
      processor: '',
      graphics: ''
    });
  };

  // Funciones para modales
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Valor del contexto
  const value = {
    // Estado
    favorites,
    user,
    filters,
    viewMode,
    activeModal,
    
    // Funciones de favoritos
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    
    // Funciones de autenticación
    login,
    logout,
    
    // Funciones de filtros
    updateFilters,
    resetFilters,
    
    // Funciones de UI
    setViewMode,
    openModal,
    closeModal
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
