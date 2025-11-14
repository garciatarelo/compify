// Utility functions for formatting prices, dates, and other display values

/**
 * Formatea un número como precio en soles peruanos
 * @param {number} price 
 * @returns {string} 
 */
export function formatPrice(price) {
  return `S/ ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formatea una fecha para mostrar en el historial de precios
 * @param {string} dateString 
 * @returns {string} 
 */
export function formatDate(dateString) {
  const [day, month] = dateString.split('/');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[parseInt(month) - 1]}`;
}

/**
 * Calcula el porcentaje de descuento entre dos precios
 * @param {number} currentPrice 
 * @param {number} originalPrice 
 * @returns {number} 
 */
export function calculateDiscount(currentPrice, originalPrice) {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Obtiene la clase CSS para el nivel de compatibilidad
 * @param {string} level 
 * @returns {string}
 */
export function getCompatibilityClass(level) {
  switch (level) {
    case 'critical':
      return 'bg-red-50 border-red-300 text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    case 'info':
      return 'bg-blue-50 border-blue-300 text-blue-800';
    default:
      return 'bg-gray-50 border-gray-300 text-gray-800';
  }
}

/**
 * Formatea el nombre de un socket para mostrar
 * @param {string} socket 
 * @returns {string} 
 */
export function formatSocket(socket) {
  if (socket.includes('intel')) {
    return `Intel LGA ${socket.split('-')[1]}`;
  } else if (socket.includes('amd')) {
    return `AMD ${socket.split('-')[1].toUpperCase()}`;
  }
  return socket.toUpperCase();
}

/**
 * Formatea el tipo de RAM para mostrar
 * @param {string} ramType 
 * @returns {string}
 */
export function formatRAMType(ramType) {
  return ramType.replace(/ddr(\d)/i, 'DDR$1').toUpperCase();
}

/**
 * Obtiene el color de la badge de compatibilidad
 * @param {boolean} isCompatible 
 * @returns {string} 
 */
export function getCompatibilityBadgeClass(isCompatible) {
  return isCompatible
    ? 'bg-green-100 text-green-800 border-green-300'
    : 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Trunca texto largo agregando "..."
 * @param {string} text
 * @param {number} maxLength 
 * @returns {string} 
 */
export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formatea watios con sufijo "W"
 * @param {number} watts 
 * @returns {string}
 */
export function formatWattage(watts) {
  return `${watts}W`;
}

/**
 * Formatea TDP con sufijo "W"
 * @param {number} tdp
 * @returns {string} 
 */
export function formatTDP(tdp) {
  return `${tdp}W`;
}

/**
 * Obtiene el ícono de tendencia de precio
 * @param {Array} priceHistory 
 * @returns {Object}
 */
export function getPriceTrend(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return { icon: '➖', color: 'text-gray-500', change: 0 };
  }

  const latest = priceHistory[priceHistory.length - 1].price;
  const previous = priceHistory[priceHistory.length - 2].price;
  const change = ((latest - previous) / previous) * 100;

  if (change > 5) {
    return { icon: '📈', color: 'text-red-500', change: Math.round(change) };
  } else if (change < -5) {
    return { icon: '📉', color: 'text-green-500', change: Math.round(change) };
  } else {
    return { icon: '➖', color: 'text-gray-500', change: 0 };
  }
}

/**
 * Obtiene la clase de color para el cambio de precio
 * @param {number} change - Cambio porcentual
 * @returns {string} - Clases de Tailwind CSS
 */
export function getPriceChangeClass(change) {
  if (change > 0) return 'text-red-600';
  if (change < 0) return 'text-green-600';
  return 'text-gray-600';
}

/**
 * Formatea el cambio de precio con símbolo
 * @param {number} change - Cambio porcentual
 * @returns {string} - Formateado (ej: "+5%", "-10%")
 */
export function formatPriceChange(change) {
  if (change === 0) return '0%';
  return `${change > 0 ? '+' : ''}${change}%`;
}
