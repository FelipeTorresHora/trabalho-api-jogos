// Aventurem - Utility Functions
import gameImagesMap from '../data/gameImages.json';

// LocalStorage Management
export const Storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting data in localStorage:', error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data from localStorage:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Format Currency
export function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Format Date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format Date and Time
export function formatDateTime(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get Payment Method Label
export function getPaymentMethodLabel(method) {
  const labels = {
    'card': 'Cartão de Crédito',
    'pix': 'Pix'
  };
  return labels[method] || 'Não especificado';
}

// Get Payment Method Icon
export function getPaymentMethodIcon(method) {
  const icons = {
    'card': '💳',
    'pix': '📱'
  };
  return icons[method] || '💰';
}

// Generate avatar URL from user name
export function generateAvatar(userName) {
  // Gerar número pseudo-aleatório baseado no nome do usuário
  let hash = 0;
  if (userName) {
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
  }

  // Converter para número entre 1 e 70 (range de avatares disponíveis)
  const avatarId = Math.abs(hash % 70) + 1;

  return `https://i.pravatar.cc/150?img=${avatarId}`;
}

// Validate Email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Debounce function for search
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get Query Parameter
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Generate Activation Key
export function generateActivationKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;

  let key = '';
  for (let i = 0; i < segments; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return key;
}

// Get image path for game
export function getGameImage(gameName) {
  // 1. Verificar localStorage primeiro (jogos novos com upload)
  try {
    const dynamicImages = JSON.parse(localStorage.getItem('dynamicGameImages') || '{}');
    if (dynamicImages[gameName]) {
      return dynamicImages[gameName];
    }
  } catch (error) {
    console.error('Error reading dynamic game images:', error);
  }

  // 2. Verificar JSON estático (jogos antigos)
  const fileName = gameImagesMap[gameName];
  if (fileName) {
    return `/src/assets/images/${fileName}`;
  }

  // 3. Default placeholder
  return '/src/assets/images/placeholder.svg';
}

// Add or update game image mapping in localStorage
export function setGameImage(gameName, imagePath) {
  try {
    const dynamicImages = JSON.parse(localStorage.getItem('dynamicGameImages') || '{}');
    dynamicImages[gameName] = imagePath;
    localStorage.setItem('dynamicGameImages', JSON.stringify(dynamicImages));
    return true;
  } catch (error) {
    console.error('Error setting game image:', error);
    return false;
  }
}

// Convert game name to snake_case for filename
export function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '_') // Substitui caracteres especiais por _
    .replace(/^_+|_+$/g, ''); // Remove _ do início e fim
}

// Debug: Get all dynamic game images from localStorage
export function debugGameImages() {
  try {
    const dynamicImages = JSON.parse(localStorage.getItem('dynamicGameImages') || '{}');
    console.log('=== DEBUG: Dynamic Game Images ===');
    console.log('Total mappings:', Object.keys(dynamicImages).length);
    console.log('Mappings:');
    Object.entries(dynamicImages).forEach(([gameName, imagePath]) => {
      console.log(`  "${gameName}" → ${imagePath}`);
      console.log(`    Expected filename: ${toSnakeCase(gameName)}.jpg`);
    });
    console.log('================================');
    return dynamicImages;
  } catch (error) {
    console.error('Error reading dynamic game images:', error);
    return {};
  }
}

// Clear all dynamic game images
export function clearDynamicImages() {
  try {
    localStorage.removeItem('dynamicGameImages');
    console.log('✅ Dynamic game images cleared');
    return true;
  } catch (error) {
    console.error('Error clearing dynamic images:', error);
    return false;
  }
}

// Remove specific game image mapping
export function removeGameImage(gameName) {
  try {
    const dynamicImages = JSON.parse(localStorage.getItem('dynamicGameImages') || '{}');
    if (dynamicImages[gameName]) {
      delete dynamicImages[gameName];
      localStorage.setItem('dynamicGameImages', JSON.stringify(dynamicImages));
      console.log(`✅ Removed mapping for "${gameName}"`);
      return true;
    }
    console.log(`⚠️ No mapping found for "${gameName}"`);
    return false;
  } catch (error) {
    console.error('Error removing game image:', error);
    return false;
  }
}
