// Profile Page JavaScript

// Check authentication
Auth.requireAuth();

// Mapeamento de IDs de categoria para nomes
const CATEGORIAS = {
  1: 'Ação',
  2: 'RPG',
  3: 'Aventura',
  4: 'Estratégia',
  5: 'Esporte',
  6: 'Corrida',
  7: 'Terror',
  8: 'Puzzle',
  9: 'Simulação',
  10: 'Plataforma',
  11: 'Luta',
  12: 'Tiro',
  13: 'Musical',
  14: 'Ação',
  15: 'Casual'
};

// Helper function to get category name from ID
function getCategoryName(fkCategoria) {
  return CATEGORIAS[fkCategoria] || 'Outros';
}

let wishlistItems = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  await loadUserProfile();
  await loadWishlist();
  setupFormHandling();
  setupLogout();
});

// Load user profile
async function loadUserProfile() {
  try {
    const result = await UserAPI.getProfile();

    if (!result.success || !result.data) {
      showError('Erro ao carregar perfil');
      return;
    }

    const user = result.data;

    // Set avatar (pode vir do backend ou usar padrão)
    const avatar = document.getElementById('userAvatar');
    avatar.src = user.avatar || 'https://i.pravatar.cc/150?img=1';

    // Populate form fields usando campos do backend
    document.getElementById('name').value = user.nome || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.telefone || '';

    // Atualizar localStorage com dados atualizados
    const currentUser = Auth.getCurrentUser() || {};
    const updatedUser = { ...currentUser, ...user };
    Storage.set('currentUser', updatedUser);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showError('Erro ao conectar com servidor');
  }
}

// Setup form handling
function setupFormHandling() {
  const form = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');

  // Email validation
  const emailInput = document.getElementById('email');
  const emailHelper = document.getElementById('emailHelper');
  if (emailInput) {
    emailInput.addEventListener('input', function(e) {
      const email = e.target.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email && !emailRegex.test(email)) {
        emailHelper.style.display = 'block';
        emailHelper.textContent = 'Por favor, insira um email válido';
        emailInput.style.borderColor = '#ff6b6b';
      } else {
        emailHelper.style.display = 'none';
        emailInput.style.borderColor = '';
      }
    });
  }

  // Phone formatting
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 10) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
      }
      e.target.value = value;
    });
  }

  // Password strength checker
  const newPasswordInput = document.getElementById('newPassword');
  const passwordStrengthBar = document.getElementById('passwordStrengthBar');
  const passwordStrengthText = document.getElementById('passwordStrengthText');
  const passwordStrengthContainer = document.getElementById('passwordStrength');

  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function(e) {
      const password = e.target.value;

      if (password.length === 0) {
        passwordStrengthContainer.style.display = 'none';
        return;
      }

      passwordStrengthContainer.style.display = 'block';

      const strength = calculatePasswordStrength(password);

      passwordStrengthBar.style.width = strength.percentage + '%';
      passwordStrengthBar.style.backgroundColor = strength.color;
      passwordStrengthText.textContent = strength.text;
      passwordStrengthText.style.color = strength.color;
    });
  }

  // Confirm password validation
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const confirmPasswordHelper = document.getElementById('confirmPasswordHelper');

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function(e) {
      const newPassword = newPasswordInput.value;
      const confirmPassword = e.target.value;

      if (confirmPassword && newPassword !== confirmPassword) {
        confirmPasswordHelper.style.display = 'block';
        confirmPasswordHelper.textContent = 'As senhas não coincidem';
        confirmPasswordInput.style.borderColor = '#ff6b6b';
      } else {
        confirmPasswordHelper.style.display = 'none';
        confirmPasswordInput.style.borderColor = '';
      }
    });
  }

  // Profile form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    saveProfile();
  });

  // Password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      changePassword();
    });
  }
}

// Calculate password strength
function calculatePasswordStrength(password) {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  };

  // Count passed checks
  Object.values(checks).forEach(passed => {
    if (passed) strength++;
  });

  const percentage = (strength / 5) * 100;

  if (strength <= 2) {
    return {
      percentage,
      color: '#ff6b6b',
      text: 'Senha fraca - adicione mais caracteres'
    };
  } else if (strength === 3) {
    return {
      percentage,
      color: '#ffa500',
      text: 'Senha média - considere adicionar caracteres especiais'
    };
  } else if (strength === 4) {
    return {
      percentage,
      color: '#90ee90',
      text: 'Senha boa'
    };
  } else {
    return {
      percentage,
      color: '#4CAF50',
      text: 'Senha forte'
    };
  }
}

// Save profile
async function saveProfile() {
  const form = document.getElementById('profileForm');

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Preparar dados usando campos do backend
  const userData = {
    nome: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefone: document.getElementById('phone').value.trim()
  };

  // Add visual feedback to button
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  submitBtn.textContent = 'Salvando...';
  submitBtn.disabled = true;

  try {
    // Atualizar via API
    const result = await UserAPI.updateProfile(userData);

    if (result.success) {
      // Atualizar localStorage com dados retornados
      const currentUser = Auth.getCurrentUser() || {};
      const updatedUser = { ...currentUser, ...result.data };
      Storage.set('currentUser', updatedUser);

      // Show success message
      showSuccess('Perfil atualizado com sucesso!');

      submitBtn.textContent = 'Salvo!';
      submitBtn.style.backgroundColor = '#4CAF50';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
        submitBtn.disabled = false;
      }, 2000);
    } else {
      showError(result.error || 'Erro ao atualizar perfil');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    showError('Erro ao conectar com servidor');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Change password
async function changePassword() {
  const form = document.getElementById('passwordForm');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  // Validate passwords match
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    showError('As senhas não coincidem');
    return;
  }

  // Validate password strength (minimum 8 characters)
  if (newPasswordInput.value.length < 8) {
    showError('A senha deve ter pelo menos 8 caracteres');
    return;
  }

  // Get values
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = newPasswordInput.value;

  // Add visual feedback to button
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  submitBtn.textContent = 'Alterando...';
  submitBtn.disabled = true;

  try {
    const result = await AuthAPI.changePassword(currentPassword, newPassword);

    if (result.success) {
      showSuccess('Senha alterada com sucesso!');

      // Clear form
      form.reset();
      document.getElementById('passwordStrength').style.display = 'none';

      submitBtn.textContent = 'Senha Alterada!';
      submitBtn.style.backgroundColor = '#4CAF50';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
        submitBtn.disabled = false;
      }, 2000);
    } else {
      showError(result.error || 'Erro ao alterar senha');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    showError('Erro ao conectar com servidor');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Setup logout
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Deseja realmente sair da sua conta?')) {
        Auth.logout();
      }
    });
  }
}

// Load wishlist
async function loadWishlist() {
  const container = document.getElementById('wishlistContainer');

  try {
    const result = await WishlistAPI.getAll();

    if (result.success && result.data) {
      wishlistItems = result.data;

      if (wishlistItems.length === 0) {
        container.innerHTML = `
          <div class="empty-wishlist">
            <div class="empty-wishlist-icon">🤍</div>
            <p>Sua lista de desejos está vazia</p>
            <p class="text-secondary">Adicione jogos que você deseja comprar mais tarde!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="wishlist-grid">
          ${wishlistItems.map(item => renderWishlistItem(item)).join('')}
        </div>
      `;

      // Setup event listeners
      setupWishlistListeners();
    } else {
      console.error('Erro ao carregar wishlist:', result.error);
      container.innerHTML = `
        <div class="empty-wishlist">
          <div class="empty-wishlist-icon">❌</div>
          <p>Erro ao carregar lista de desejos</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro ao carregar wishlist:', error);
    container.innerHTML = `
      <div class="empty-wishlist">
        <div class="empty-wishlist-icon">❌</div>
        <p>Erro ao conectar com servidor</p>
      </div>
    `;
  }
}

// Render wishlist item
function renderWishlistItem(item) {
  // Backend retorna jogos diretamente (SELECT jogos.*)
  const jogoId = item.id;
  const titulo = item.nome || item.titulo || 'Jogo';

  // Preparar imagens - backend pode retornar string ou array
  const imagens = Array.isArray(item.imagens)
    ? item.imagens
    : (item.imagem ? [item.imagem] : ['images/default.jpg']);
  const imagemUrl = imagens[0];

  const categoria = getCategoryName(item.fkCategoria);
  const preco = item.preco || 0;

  return `
    <div class="wishlist-card" data-jogo-id="${jogoId}">
      <img src="${imagemUrl}" alt="${titulo}" class="wishlist-image">
      <div class="wishlist-info">
        <h3 class="wishlist-title">${titulo}</h3>
        <p class="wishlist-category">${categoria}</p>
        <p class="wishlist-price">${formatCurrency(preco)}</p>
        <div class="wishlist-actions">
          <button class="btn btn-sm move-to-cart-btn" data-jogo-id="${jogoId}">
            🛒 Adicionar ao Carrinho
          </button>
          <button class="btn btn-sm btn-secondary remove-wishlist-btn" data-jogo-id="${jogoId}">
            🗑️ Remover
          </button>
        </div>
      </div>
    </div>
  `;
}

// Setup wishlist listeners
function setupWishlistListeners() {
  // Move to cart buttons
  document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const jogoId = parseInt(this.dataset.jogoId);

      try {
        // Adicionar ao carrinho
        const addResult = await CartAPI.add(jogoId);

        if (addResult.success) {
          // Remover da wishlist
          const removeResult = await WishlistAPI.remove(jogoId);

          if (removeResult.success) {
            showSuccess('Jogo adicionado ao carrinho!');
            updateCartBadge();
            await loadWishlist(); // Reload wishlist
          } else {
            showError(removeResult.error || 'Erro ao remover da lista de desejos');
          }
        } else {
          showError(addResult.error || 'Erro ao adicionar ao carrinho');
        }
      } catch (error) {
        console.error('Erro ao mover para carrinho:', error);
        showError('Erro ao conectar com servidor');
      }
    });
  });

  // Remove buttons
  document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const jogoId = parseInt(this.dataset.jogoId);

      if (confirm('Deseja remover este jogo da lista de desejos?')) {
        try {
          const result = await WishlistAPI.remove(jogoId);

          if (result.success) {
            showSuccess('Removido da lista de desejos');
            await loadWishlist(); // Reload wishlist
          } else {
            showError(result.error || 'Erro ao remover da lista');
          }
        } catch (error) {
          console.error('Erro ao remover da wishlist:', error);
          showError('Erro ao conectar com servidor');
        }
      }
    });
  });
}
