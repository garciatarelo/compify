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
  // Estado de autenticación (simulado)
  // TODO API: El login será POST /api/auth/login con { email, password }
  // TODO API: El token JWT se guardará en localStorage y se enviará en headers
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Estado de favoritos por usuario (guardado en localStorage)
  // Cada usuario tiene su propia lista de favoritos
  const [favorites, setFavorites] = useState([]);

  // Restaurar favoritos al iniciar sesión
  useEffect(() => {
    if (user && user.email) {
      const saved = localStorage.getItem(`favorites_${user.email}`);
      setFavorites(saved ? JSON.parse(saved) : []);
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Estado de filtros para productos
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    minPrice: 0,
    maxPrice: 100000,
    processor: '',
    graphics: ''
  });

  // Estado de view mode (grid/list)
  const [viewMode, setViewMode] = useState('grid');

  // Estado de modales
  const [activeModal, setActiveModal] = useState(null);

  // Guardar favoritos en localStorage por usuario cuando cambien
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Guardar al usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Funciones para manejar favoritos
  const addFavorite = (productId) => {
    if (!favorites.includes(productId)) {
      const newFavorites = [...favorites, productId];
      setFavorites(newFavorites);
      if (user && user.email) {
        localStorage.setItem(`favorites_${user.email}`, JSON.stringify(newFavorites));
      }
    }
  };

  
  const removeFavorite = (productId) => {
    const newFavorites = favorites.filter(id => id !== productId);
    setFavorites(newFavorites);
    if (user && user.email) {
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(newFavorites));
    }
  };

  const toggleFavorite = (productId) => {
    console.log('Toggling favorite for productId:', productId);
    if (favorites.includes(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
    setTimeout(() => {
      console.log('Current favorites:', favorites);
    }, 0);
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Funciones para autenticación
  const login = async (input, password) => {
    if (!input || !password) return false;
    let email = input;
    let username = input;
    // Si es email, extraer username
    if (input.includes('@')) {
      email = input;
      username = input.split('@')[0];
    } else {
      // Si es username, construir email
      if (input === 'admin') email = 'admin@gmail.com';
      else if (input === 'marialopez') email = 'maria@gmail.com';
      else email = `${input}@example.com`;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          username,
          password
        })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setFavorites([]); // Limpiar favoritos solo en memoria, no en localStorage
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
      maxPrice: 100000,
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
