// Aventurem - Utility Functions

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
  const imageMap = {
    'A Lenda do Herói': 'a_lenda_do_heroi.jpg',
    'Half-Life: Alyx': 'alyx.jpg',
    'Among Us': 'among_us.jpg',
    'Bloodborne': 'bloodborne.jpg',
    'Call of Duty: Modern Warfare': 'call_of_duty.jpg',
    'Cyberpunk 2077': 'cyberpunk.jpg',
    'Enigma do Medo': 'enigma_do_medo.jpg',
    'Fallout 4': 'fallout.jpg',
    'Grand Theft Auto V': 'gta_v.jpg',
    'Horizon Zero Dawn': 'horizon.jpg',
    'Like a Dragon': 'like_a_dragon.jpg',
    'Minecraft': 'minecraft.jpg',
    'Monster Hunter: World': 'monster_hunter.jpg',
    'Persona 5 Royal': 'persona_royal.jpg',
    'Portal 2': 'portal2.jpg',
    'Red Dead Redemption 2': 'red_dead_redemption2.jpg',
    'Resident Evil Village': 'resident_evil.jpg',
    'Sekiro: Shadows Die Twice': 'sekiro.jpg',
    'The Elder Scrolls V: Skyrim': 'skyrim.jpg',
    'Stardew Valley': 'stardew_valley.jpg',
    'The Legend of Zelda: Breath of the Wild': 'the_legend_of_zelda.jpg',
    'The Witcher 3: Wild Hunt': 'the_witcher.jpg'
  };

  const fileName = imageMap[gameName];
  if (fileName) {
    return `/src/assets/images/${fileName}`;
  }

  // Default placeholder
  return '/src/assets/images/placeholder.jpg';
}
