import { createContext, useContext, useState, useEffect } from 'react';
import { checkCompatibility, calculateBuildTotal } from '../utils/compatibility';

// Crear el contexto
const BuilderContext = createContext();

// Hook personalizado para usar el contexto
export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder debe usarse dentro de un BuilderProvider');
  }
  return context;
};

// TODO API: Este contexto manejará el estado del builder y guardará/cargará builds
// Provider del contexto
export const BuilderProvider = ({ children }) => {
  // Estado del build actual (guardado en localStorage)
  // TODO API: Los builds se guardarán con POST /api/builds y se cargarán con GET /api/builds/{id}
  const [currentBuild, setCurrentBuild] = useState(() => {
    const saved = localStorage.getItem('currentBuild');
    return saved ? JSON.parse(saved) : {
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null,
      case: null
    };
  });

  // Estado de issues de compatibilidad
  const [compatibilityIssues, setCompatibilityIssues] = useState([]);

  // Estado del total del build
  const [buildTotal, setBuildTotal] = useState({ minTotal: 0, maxTotal: 0, selectedTotal: 0, componentCount: 0 });

  // Guardar build en localStorage cuando cambie
  // TODO API: Aquí también se debe sincronizar con POST /api/builds/{id} para guardar en servidor
  useEffect(() => {
    localStorage.setItem('currentBuild', JSON.stringify(currentBuild));
    
    // Recalcular compatibilidad y total
    // TODO API: La validación de compatibilidad puede hacerse también en backend
    // con POST /api/builds/validate enviando el currentBuild
    const issues = checkCompatibility(currentBuild);
    setCompatibilityIssues(issues);
    
    const total = calculateBuildTotal(currentBuild);
    setBuildTotal(total);
  }, [currentBuild]);

  // Agregar o actualizar un componente en el build
  const addComponent = (category, componentId, storeName = null, price = null, storeUrl = null) => {
    setCurrentBuild(prev => ({
      ...prev,
      [category]: componentId,
      [`${category}_store`]: storeName,
      [`${category}_price`]: price,
      [`${category}_url`]: storeUrl
    }));
  };

  // Remover un componente del build
  const removeComponent = (category) => {
    setCurrentBuild(prev => {
      const newBuild = { ...prev };
      newBuild[category] = null;
      delete newBuild[`${category}_store`];
      delete newBuild[`${category}_price`];
      delete newBuild[`${category}_url`];
      return newBuild;
    });
  };

  // Actualizar tienda seleccionada para un componente
  const updateComponentStore = (category, storeName, price) => {
    setCurrentBuild(prev => ({
      ...prev,
      [`${category}_store`]: storeName,
      [`${category}_price`]: price
    }));
  };

  // Limpiar todo el build
  const clearBuild = () => {
    setCurrentBuild({
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null,
      case: null
    });
  };

  // Verificar si el build está completo
  const isBuildComplete = () => {
    return Object.values(currentBuild).every(value => value !== null);
  };

  // Obtener componente seleccionado de una categoría
  const getSelectedComponent = (category) => {
    return currentBuild[category];
  };

  // Obtener tienda seleccionada de un componente
  const getSelectedStore = (category) => {
    return currentBuild[`${category}_store`];
  };

  // Obtener precio seleccionado de un componente
  const getSelectedPrice = (category) => {
    return currentBuild[`${category}_price`];
  };

  // Verificar si hay issues críticos de compatibilidad
  const hasCriticalIssues = () => {
    return compatibilityIssues.some(issue => issue.level === 'critical');
  };

  // Obtener issues por nivel
  const getIssuesByLevel = (level) => {
    return compatibilityIssues.filter(issue => issue.level === level);
  };

  // Valor del contexto
  const value = {
    // Estado
    currentBuild,
    compatibilityIssues,
    buildTotal,
    
    // Funciones de componentes
    addComponent,
    removeComponent,
    updateComponentStore,
    clearBuild,
    
    // Funciones de consulta
    isBuildComplete,
    getSelectedComponent,
    getSelectedStore,
    getSelectedPrice,
    hasCriticalIssues,
    getIssuesByLevel
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};
