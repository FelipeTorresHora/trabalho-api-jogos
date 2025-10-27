// Aventurem - Utility Functions

// LocalStorage Management
const Storage = {
  // Get data from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  },

  // Set data in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting data in localStorage:', error);
      return false;
    }
  },

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data from localStorage:', error);
      return false;
    }
  },

  // Clear all localStorage
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

// Authentication Management
const Auth = {
  // Logout user
  logout() {
    Storage.remove('currentUser');
    // Também remove o token JWT se estiver usando API
    if (typeof API !== 'undefined' && API.clearToken) {
      API.clearToken();
    }
    window.location.href = 'index.html';
  },

  // Get current logged-in user
  getCurrentUser() {
    return Storage.get('currentUser');
  },

  // Check if user is logged in
  isLoggedIn() {
    // Verifica se tem usuário no localStorage OU token JWT válido
    const hasUser = !!this.getCurrentUser();
    const hasToken = typeof API !== 'undefined' && API.getToken && !!API.getToken();
    return hasUser || hasToken;
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Backend retorna perfil: "Administrador" ou "Cliente"
    return user.perfil === 'Administrador';
  },

  // Require authentication (redirect to login if not logged in)
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // Require admin authentication (redirect to home if not admin)
  requireAdmin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    if (!this.isAdmin()) {
      window.location.href = 'home.html';
      return false;
    }
    return true;
  }
};

// Wishlist Management
const Wishlist = {
  // Get wishlist items
  async getItems() {
    const userId = Auth.getCurrentUser()?.id;
    if (!userId) return [];

    try {
      const result = await WishlistAPI.getAll();
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar wishlist:', error);
      return [];
    }
  },

  // Add item to wishlist
  async addItem(gameId) {
    const userId = Auth.getCurrentUser()?.id;
    if (!userId) return { success: false, message: 'Usuário não autenticado' };

    try {
      const result = await WishlistAPI.add(gameId);

      if (result.success) {
        return { success: true, message: 'Adicionado à lista de desejos' };
      } else {
        return { success: false, message: result.error || 'Erro ao adicionar à lista de desejos' };
      }
    } catch (error) {
      console.error('Erro ao adicionar à wishlist:', error);
      return { success: false, message: 'Erro ao conectar com servidor' };
    }
  },

  // Remove item from wishlist
  async removeItem(gameId) {
    const userId = Auth.getCurrentUser()?.id;
    if (!userId) return { success: false, message: 'Usuário não autenticado' };

    try {
      const result = await WishlistAPI.remove(gameId);

      if (result.success) {
        return { success: true, message: 'Removido da lista de desejos' };
      } else {
        return { success: false, message: result.error || 'Erro ao remover da lista de desejos' };
      }
    } catch (error) {
      console.error('Erro ao remover da wishlist:', error);
      return { success: false, message: 'Erro ao conectar com servidor' };
    }
  },

  // Check if game is in wishlist
  async isInWishlist(gameId) {
    const items = await this.getItems();
    return items.some(item => item.id === gameId);
  },

  // Get wishlist count
  async getCount() {
    const items = await this.getItems();
    return items.length;
  },

  // Clear wishlist (not used, but keeping for compatibility)
  async clear() {
    const userId = Auth.getCurrentUser()?.id;
    if (!userId) return { success: false, message: 'Usuário não autenticado' };

    try {
      const items = await this.getItems();

      // Remove each item from wishlist
      for (const item of items) {
        await WishlistAPI.remove(item.id);
      }

      return { success: true, message: 'Lista de desejos limpa' };
    } catch (error) {
      console.error('Erro ao limpar wishlist:', error);
      return { success: false, message: 'Erro ao conectar com servidor' };
    }
  },

  // Move item from wishlist to cart
  async moveToCart(gameId) {
    const addToCartResult = await Cart.addItem(gameId);
    if (addToCartResult.success) {
      await this.removeItem(gameId);
      return { success: true, message: 'Item movido para o carrinho' };
    }
    return addToCartResult;
  }
};

// Format Currency
function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format Date and Time
function formatDateTime(isoString) {
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
function getPaymentMethodLabel(method) {
  const labels = {
    'card': 'Cartão de Crédito',
    'pix': 'Pix'
  };
  return labels[method] || 'Não especificado';
}

// Get Payment Method Icon
function getPaymentMethodIcon(method) {
  const icons = {
    'card': '💳',
    'pix': '📱'
  };
  return icons[method] || '💰';
}

// Generate Star Rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let html = '<div class="rating">';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<span class="star">★</span>';
  }

  // Half star
  if (hasHalfStar) {
    html += '<span class="star">★</span>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<span class="star empty">★</span>';
  }

  html += '</div>';
  return html;
}

// Generate avatar URL from user name
function generateAvatar(userName) {
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

// Show Error Banner
function showError(message, duration = 3000) {
  // Remove existing banner if any
  const existingBanner = document.querySelector('.error-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  // Create new banner
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.textContent = message;
  document.body.appendChild(banner);

  // Auto-remove after duration
  setTimeout(() => {
    banner.remove();
  }, duration);
}

// Show Success Message (similar to error but green)
function showSuccess(message, duration = 3000) {
  const existingBanner = document.querySelector('.success-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.style.backgroundColor = '#4CAF50';
  banner.textContent = message;
  document.body.appendChild(banner);

  setTimeout(() => {
    banner.remove();
  }, duration);
}

// Update Cart Badge in Header
async function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    try {
      const result = await CartAPI.getAll();
      let count = 0;

      if (result.success && result.data && result.data.carrinhosComItens) {
        const carrinhosAtivos = result.data.carrinhosComItens.filter(c => c.status === 'A');
        if (carrinhosAtivos.length > 0) {
          count = carrinhosAtivos[0].itens?.length || 0;
        }
      }

      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    } catch (error) {
      console.error('Erro ao atualizar badge do carrinho:', error);
    }
  }
}

// Validate Email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate Form
function validateForm(formData, rules) {
  const errors = {};

  for (const field in rules) {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = 'Este campo é obrigatório';
    } else if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Email inválido';
    } else if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Mínimo de ${fieldRules.minLength} caracteres`;
    } else if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Máximo de ${fieldRules.maxLength} caracteres`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Show Field Error
function showFieldError(fieldElement, message) {
  fieldElement.classList.add('error');

  // Remove existing error message
  const existingError = fieldElement.parentElement.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  if (message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error text-error';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '4px';
    errorElement.textContent = message;
    fieldElement.parentElement.appendChild(errorElement);
  }
}

// Clear Field Error
function clearFieldError(fieldElement) {
  fieldElement.classList.remove('error');
  const errorElement = fieldElement.parentElement.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

// Toggle Mobile Menu
function toggleMobileMenu() {
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

// Initialize Header
function initializeHeader() {
  // Update cart badge
  updateCartBadge();

  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Deseja realmente sair?')) {
        Auth.logout();
      }
    });
  }
}

// Debounce function for search
function debounce(func, wait) {
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
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Check and Update Order Status
// Verifica pedidos em "Processando" e atualiza para "Entregue" após 1 minuto
function checkAndUpdateOrderStatus() {
  const userOrders = Storage.get('userOrders') || [];
  let hasUpdates = false;

  const updatedOrders = userOrders.map(order => {
    // Verifica se o pedido está em "Processando" e possui timestamp
    if (order.status === 'Processando' && order.statusChangeTime) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - order.statusChangeTime;
      const oneMinute = 60 * 1000; // 60 segundos em milissegundos

      // Se passou 1 minuto, atualiza o status
      if (elapsedTime >= oneMinute) {
        order.status = 'Entregue';
        delete order.statusChangeTime; // Remove o timestamp pois não é mais necessário
        hasUpdates = true;
      }
    }

    return order;
  });

  // Salva as alterações se houve atualizações
  if (hasUpdates) {
    Storage.set('userOrders', updatedOrders);
  }

  return hasUpdates;
}

// Generate Activation Key
function generateActivationKey() {
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

// Copy text to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Chave copiada para a área de transferência!');
    }).catch(err => {
      // Fallback for older browsers
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    showSuccess('Chave copiada para a área de transferência!');
  } catch (err) {
    showError('Erro ao copiar chave. Copie manualmente.');
  }

  document.body.removeChild(textArea);
}
