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
  // Login user
  login(email, password) {
    // Get all users (default + custom, excluding deleted)
    const customUsers = Storage.get('customUsers') || [];
    const deletedUsers = Storage.get('deletedUsers') || [];
    const defaultUsers = users.filter(u => !deletedUsers.includes(u.id));
    const allUsers = [...defaultUsers, ...customUsers];

    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const userData = { ...user };
      delete userData.password;
      Storage.set('currentUser', userData);
      return { success: true, user: userData };
    }
    return { success: false, message: 'Email ou senha incorretos' };
  },

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

// Cart Management
const Cart = {
  // Get cart items
  getItems() {
    return Storage.get('cart') || [];
  },

  // Add item to cart
  addItem(gameId, quantity = 1) {
    const cart = this.getItems();
    const game = games.find(g => g.id === gameId);

    if (!game) return { success: false, message: 'Jogo não encontrado' };

    const existingItem = cart.find(item => item.gameId === gameId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        gameId: game.id,
        gameTitle: game.title,
        price: game.price,
        platform: game.platform,
        image: game.images[0],
        quantity: quantity
      });
    }

    Storage.set('cart', cart);
    return { success: true, message: 'Item adicionado ao carrinho' };
  },

  // Remove item from cart
  removeItem(gameId) {
    let cart = this.getItems();
    cart = cart.filter(item => item.gameId !== gameId);
    Storage.set('cart', cart);
    return { success: true, message: 'Item removido do carrinho' };
  },

  // Update item quantity
  updateQuantity(gameId, quantity) {
    const cart = this.getItems();
    const item = cart.find(item => item.gameId === gameId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(gameId);
      }
      item.quantity = quantity;
      Storage.set('cart', cart);
      return { success: true };
    }

    return { success: false, message: 'Item não encontrado no carrinho' };
  },

  // Get cart count
  getCount() {
    const cart = this.getItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Get cart subtotal
  getSubtotal() {
    const cart = this.getItems();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Get cart total
  getTotal() {
    return this.getSubtotal(); // Can add taxes, shipping, etc. here
  },

  // Clear cart
  clear() {
    Storage.set('cart', []);
    return { success: true, message: 'Carrinho limpo' };
  },

  // Check if cart is empty
  isEmpty() {
    return this.getItems().length === 0;
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
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const count = Cart.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

// Get Game by ID
function getGameById(gameId) {
  return games.find(game => game.id === parseInt(gameId));
}

// Get User Orders
function getUserOrders(userId) {
  return orders.filter(order => order.userId === userId);
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

// User Management (Admin Functions)
const UserManager = {
  // Get all users (from data.js and localStorage)
  getAllUsers() {
    const customUsers = Storage.get('customUsers') || [];
    const deletedUsers = Storage.get('deletedUsers') || [];
    const defaultUsers = users.filter(u => !deletedUsers.includes(u.id));
    // Combine default users with custom users
    return [...defaultUsers, ...customUsers];
  },

  // Get user by ID
  getUserById(userId) {
    const allUsers = this.getAllUsers();
    return allUsers.find(user => user.id === userId);
  },

  // Create new user
  createUser(userData) {
    const customUsers = Storage.get('customUsers') || [];
    const allUsers = this.getAllUsers();

    // Check if email already exists
    if (allUsers.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email já cadastrado' };
    }

    // Generate new ID
    const maxId = allUsers.reduce((max, user) => Math.max(max, user.id), 0);
    const newUser = {
      id: maxId + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      birthDate: userData.birthDate || '',
      avatar: userData.avatar || 'https://i.pravatar.cc/150?img=' + (maxId + 1),
      role: userData.role || 'user'
    };

    customUsers.push(newUser);
    Storage.set('customUsers', customUsers);

    return { success: true, message: 'Usuário criado com sucesso', user: newUser };
  },

  // Update user
  updateUser(userId, userData) {
    const customUsers = Storage.get('customUsers') || [];
    const userIndex = customUsers.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      // Update custom user
      customUsers[userIndex] = { ...customUsers[userIndex], ...userData };
      Storage.set('customUsers', customUsers);
      return { success: true, message: 'Usuário atualizado com sucesso' };
    } else {
      // Check if it's a default user
      const defaultUser = users.find(u => u.id === userId);
      if (defaultUser) {
        // Can't update default users directly, but we can track changes
        return { success: false, message: 'Não é possível editar usuários padrão' };
      }
      return { success: false, message: 'Usuário não encontrado' };
    }
  },

  // Delete user (including default users)
  deleteUser(userId) {
    const customUsers = Storage.get('customUsers') || [];
    const deletedUsers = Storage.get('deletedUsers') || [];

    const customUserIndex = customUsers.findIndex(u => u.id === userId);

    if (customUserIndex !== -1) {
      // Delete custom user
      customUsers.splice(customUserIndex, 1);
      Storage.set('customUsers', customUsers);
      return { success: true, message: 'Usuário removido com sucesso' };
    } else {
      // Mark default user as deleted
      const defaultUser = users.find(u => u.id === userId);
      if (defaultUser) {
        deletedUsers.push(userId);
        Storage.set('deletedUsers', deletedUsers);
        return { success: true, message: 'Usuário removido com sucesso' };
      }
      return { success: false, message: 'Usuário não encontrado' };
    }
  },

  // Get user orders
  getUserOrders(userId) {
    const allOrders = [...orders, ...(Storage.get('userOrders') || [])];
    return allOrders.filter(order => order.userId === userId);
  },

  // Get user reviews
  getUserReviews(userId) {
    const allReviews = [];
    games.forEach(game => {
      if (game.reviews) {
        game.reviews.forEach(review => {
          if (review.userId === userId) {
            allReviews.push({
              ...review,
              gameId: game.id,
              gameTitle: game.title
            });
          }
        });
      }
    });
    return allReviews;
  }
};

// Game Management (Admin Functions)
const GameManager = {
  // Get all games (from data.js and localStorage)
  getAllGames() {
    const customGames = Storage.get('customGames') || [];
    const deletedGames = Storage.get('deletedGames') || [];
    const defaultGames = games.filter(g => !deletedGames.includes(g.id));
    return [...defaultGames, ...customGames];
  },

  // Get game by ID
  getGameById(gameId) {
    const allGames = this.getAllGames();
    return allGames.find(game => game.id === gameId);
  },

  // Create new game
  createGame(gameData) {
    const customGames = Storage.get('customGames') || [];
    const allGames = this.getAllGames();

    // Generate new ID
    const maxId = allGames.reduce((max, game) => Math.max(max, game.id), 0);
    const newGame = {
      id: maxId + 1,
      title: gameData.title,
      price: parseFloat(gameData.price),
      rating: parseFloat(gameData.rating),
      platform: gameData.platform || 'PC',
      category: gameData.category,
      brand: gameData.brand,
      featured: gameData.featured || false,
      images: [gameData.image],
      description: gameData.description,
      reviews: []
    };

    customGames.push(newGame);
    Storage.set('customGames', customGames);

    return { success: true, message: 'Jogo criado com sucesso', game: newGame };
  },

  // Update game
  updateGame(gameId, gameData) {
    const customGames = Storage.get('customGames') || [];
    const updatedGames = Storage.get('updatedGames') || {};

    const customGameIndex = customGames.findIndex(g => g.id === gameId);

    if (customGameIndex !== -1) {
      // Update custom game
      customGames[customGameIndex] = {
        ...customGames[customGameIndex],
        title: gameData.title,
        price: parseFloat(gameData.price),
        rating: parseFloat(gameData.rating),
        platform: gameData.platform,
        category: gameData.category,
        brand: gameData.brand,
        featured: gameData.featured || false,
        images: [gameData.image],
        description: gameData.description
      };
      Storage.set('customGames', customGames);
      return { success: true, message: 'Jogo atualizado com sucesso' };
    } else {
      // Update default game (store changes in updatedGames)
      const defaultGame = games.find(g => g.id === gameId);
      if (defaultGame) {
        updatedGames[gameId] = {
          title: gameData.title,
          price: parseFloat(gameData.price),
          rating: parseFloat(gameData.rating),
          platform: gameData.platform,
          category: gameData.category,
          brand: gameData.brand,
          featured: gameData.featured || false,
          images: [gameData.image],
          description: gameData.description
        };
        Storage.set('updatedGames', updatedGames);
        return { success: true, message: 'Jogo atualizado com sucesso' };
      }
      return { success: false, message: 'Jogo não encontrado' };
    }
  },

  // Delete game (including default games)
  deleteGame(gameId) {
    const customGames = Storage.get('customGames') || [];
    const deletedGames = Storage.get('deletedGames') || [];

    const customGameIndex = customGames.findIndex(g => g.id === gameId);

    if (customGameIndex !== -1) {
      // Delete custom game
      customGames.splice(customGameIndex, 1);
      Storage.set('customGames', customGames);
      return { success: true, message: 'Jogo removido com sucesso' };
    } else {
      // Mark default game as deleted
      const defaultGame = games.find(g => g.id === gameId);
      if (defaultGame) {
        deletedGames.push(gameId);
        Storage.set('deletedGames', deletedGames);
        return { success: true, message: 'Jogo removido com sucesso' };
      }
      return { success: false, message: 'Jogo não encontrado' };
    }
  },

  // Get game statistics
  getGameStats(gameId) {
    const allOrders = [...orders, ...(Storage.get('userOrders') || [])];
    let totalSales = 0;
    let totalRevenue = 0;

    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.gameId === gameId) {
          totalSales += item.quantity;
          totalRevenue += item.price * item.quantity;
        }
      });
    });

    return {
      totalSales,
      totalRevenue
    };
  },

  // Get game reviews
  getGameReviews(gameId) {
    const game = games.find(g => g.id === gameId);
    return game ? game.reviews || [] : [];
  }
};

// Company Management (Admin Functions)
const CompanyManager = {
  // Get all companies (from data.js and localStorage)
  getAllCompanies() {
    const customCompanies = Storage.get('customCompanies') || [];
    const deletedCompanies = Storage.get('deletedCompanies') || [];
    const defaultCompanies = companies.filter(c => !deletedCompanies.includes(c.id));
    return [...defaultCompanies, ...customCompanies];
  },

  // Get company by ID
  getCompanyById(companyId) {
    const allCompanies = this.getAllCompanies();
    return allCompanies.find(company => company.id === companyId);
  },

  // Create new company
  createCompany(companyData) {
    const customCompanies = Storage.get('customCompanies') || [];
    const allCompanies = this.getAllCompanies();

    // Check if company name already exists
    if (allCompanies.find(c => c.name.toLowerCase() === companyData.name.toLowerCase())) {
      return { success: false, message: 'Empresa com este nome já existe' };
    }

    // Generate new ID
    const maxId = allCompanies.reduce((max, company) => Math.max(max, company.id), 0);
    const newCompany = {
      id: maxId + 1,
      name: companyData.name,
      country: companyData.country,
      foundedYear: parseInt(companyData.foundedYear),
      website: companyData.website || ''
    };

    customCompanies.push(newCompany);
    Storage.set('customCompanies', customCompanies);

    return { success: true, message: 'Empresa criada com sucesso', company: newCompany };
  },

  // Update company
  updateCompany(companyId, companyData) {
    const customCompanies = Storage.get('customCompanies') || [];
    const updatedCompanies = Storage.get('updatedCompanies') || {};

    const customCompanyIndex = customCompanies.findIndex(c => c.id === companyId);

    if (customCompanyIndex !== -1) {
      // Update custom company
      customCompanies[customCompanyIndex] = {
        ...customCompanies[customCompanyIndex],
        name: companyData.name,
        country: companyData.country,
        foundedYear: parseInt(companyData.foundedYear),
        website: companyData.website || ''
      };
      Storage.set('customCompanies', customCompanies);
      return { success: true, message: 'Empresa atualizada com sucesso' };
    } else {
      // Update default company (store changes in updatedCompanies)
      const defaultCompany = companies.find(c => c.id === companyId);
      if (defaultCompany) {
        updatedCompanies[companyId] = {
          name: companyData.name,
          country: companyData.country,
          foundedYear: parseInt(companyData.foundedYear),
          website: companyData.website || ''
        };
        Storage.set('updatedCompanies', updatedCompanies);
        return { success: true, message: 'Empresa atualizada com sucesso' };
      }
      return { success: false, message: 'Empresa não encontrada' };
    }
  },

  // Delete company
  deleteCompany(companyId) {
    const customCompanies = Storage.get('customCompanies') || [];
    const deletedCompanies = Storage.get('deletedCompanies') || [];

    const customCompanyIndex = customCompanies.findIndex(c => c.id === companyId);

    if (customCompanyIndex !== -1) {
      // Delete custom company
      customCompanies.splice(customCompanyIndex, 1);
      Storage.set('customCompanies', customCompanies);
      return { success: true, message: 'Empresa removida com sucesso' };
    } else {
      // Mark default company as deleted
      const defaultCompany = companies.find(c => c.id === companyId);
      if (defaultCompany) {
        deletedCompanies.push(companyId);
        Storage.set('deletedCompanies', deletedCompanies);
        return { success: true, message: 'Empresa removida com sucesso' };
      }
      return { success: false, message: 'Empresa não encontrada' };
    }
  },

  // Get games by company
  getGamesByCompany(companyName) {
    const allGames = GameManager.getAllGames();
    return allGames.filter(game => game.brand === companyName);
  }
};

// Review Management
const ReviewManager = {
  // Add a new review
  addReview(gameId, userId, rating, comment) {
    const customReviews = Storage.get('customReviews') || [];
    const currentUser = Auth.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    // Check if user has already reviewed this game
    const existingReview = customReviews.find(r => r.gameId === gameId && r.userId === userId);
    if (existingReview) {
      return { success: false, message: 'Você já avaliou este jogo' };
    }

    // Check if user has purchased this game
    const userOrders = UserManager.getUserOrders(userId);
    const hasPurchased = userOrders.some(order =>
      order.status === 'Entregue' &&
      order.items.some(item => item.gameId === gameId)
    );

    if (!hasPurchased) {
      return { success: false, message: 'Você só pode avaliar jogos que já comprou e recebeu' };
    }

    // Create new review
    const newReview = {
      id: Date.now(), // Simple ID generation
      gameId: gameId,
      userId: userId,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating: parseFloat(rating),
      comment: comment,
      date: new Date().toISOString()
    };

    customReviews.push(newReview);
    Storage.set('customReviews', customReviews);

    return { success: true, message: 'Avaliação enviada com sucesso!', review: newReview };
  },

  // Get all reviews for a specific game (default + custom)
  getGameReviews(gameId) {
    const game = games.find(g => g.id === gameId);
    const defaultReviews = game ? (game.reviews || []) : [];
    const customReviews = Storage.get('customReviews') || [];
    const gameCustomReviews = customReviews.filter(r => r.gameId === gameId);

    return [...defaultReviews, ...gameCustomReviews];
  },

  // Get all reviews by a specific user
  getUserReviews(userId) {
    const allReviews = [];

    // Get default reviews from games
    games.forEach(game => {
      if (game.reviews) {
        game.reviews.forEach(review => {
          if (review.userId === userId) {
            allReviews.push({
              ...review,
              gameId: game.id,
              gameTitle: game.title
            });
          }
        });
      }
    });

    // Get custom reviews
    const customReviews = Storage.get('customReviews') || [];
    const userCustomReviews = customReviews.filter(r => r.userId === userId);

    userCustomReviews.forEach(review => {
      const game = games.find(g => g.id === review.gameId);
      if (game) {
        allReviews.push({
          ...review,
          gameTitle: game.title
        });
      }
    });

    return allReviews;
  },

  // Check if user has reviewed a specific game
  hasUserReviewed(gameId, userId) {
    const customReviews = Storage.get('customReviews') || [];
    return customReviews.some(r => r.gameId === gameId && r.userId === userId);
  },

  // Delete a review (admin only or own review)
  deleteReview(reviewId, userId) {
    const customReviews = Storage.get('customReviews') || [];
    const reviewIndex = customReviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return { success: false, message: 'Avaliação não encontrada' };
    }

    const review = customReviews[reviewIndex];
    const currentUser = Auth.getCurrentUser();

    // Check if user is admin or the review owner
    if (!currentUser || (currentUser.role !== 'admin' && review.userId !== userId)) {
      return { success: false, message: 'Sem permissão para deletar esta avaliação' };
    }

    customReviews.splice(reviewIndex, 1);
    Storage.set('customReviews', customReviews);

    return { success: true, message: 'Avaliação removida com sucesso' };
  }
};

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
