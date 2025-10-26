// Game Details Page JavaScript

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

let currentGame = null;
let gameReviews = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  await loadGameDetails();
});

// Load game details
async function loadGameDetails() {
  const gameId = parseInt(getQueryParam('id'));

  if (!gameId) {
    showError('Jogo não encontrado');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000);
    return;
  }

  try {
    // Carregar dados do jogo da API
    const result = await GameAPI.getById(gameId);

    if (!result.success || !result.data) {
      showError('Jogo não encontrado');
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 2000);
      return;
    }

    currentGame = result.data;

    // Carregar avaliações do jogo
    try {
      const reviewsResult = await ReviewAPI.getByGame(gameId);

      if (reviewsResult.success && reviewsResult.data) {
        // Backend pode retornar objeto único, array, ou null
        if (Array.isArray(reviewsResult.data)) {
          gameReviews = reviewsResult.data;
        } else if (reviewsResult.data && typeof reviewsResult.data === 'object') {
          // Se retornar objeto único, transformar em array
          gameReviews = [reviewsResult.data];
        } else {
          gameReviews = [];
        }
      } else {
        // Resposta vazia ou sem sucesso
        gameReviews = [];
      }
    } catch (error) {
      console.warn('Erro ao carregar avaliações:', error);
      gameReviews = [];
    }

    await renderGameDetails();
  } catch (error) {
    console.error('Erro ao carregar detalhes do jogo:', error);
    showError('Erro ao conectar com servidor');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000);
  }
}

// Render game details
async function renderGameDetails() {
  const container = document.getElementById('gameDetailsContainer');

  // Preparar imagens - backend pode retornar string ou array
  const imagens = Array.isArray(currentGame.imagens)
    ? currentGame.imagens
    : (currentGame.imagem ? [currentGame.imagem] : ['images/default.jpg']);

  const avaliacaoMedia = currentGame.avaliacao_media || 0;
  const nomeJogo = currentGame.nome || currentGame.titulo || 'Jogo';
  const categoriaNome = getCategoryName(currentGame.fkCategoria);

  // Check if game is in wishlist
  const isInWishlist = await Wishlist.isInWishlist(currentGame.id);

  container.innerHTML = `
    <div class="gallery-section">
      <a href="home.html" class="back-button">← Voltar</a>
      <img src="${imagens[0]}" alt="${nomeJogo}" class="main-image" id="mainImage">
      ${imagens.length > 1 ? `
        <div class="thumbnail-gallery">
          ${imagens.map((img, index) => `
            <img src="${img}" alt="${nomeJogo}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div class="info-section">
      <div class="game-header">
        <span class="game-category-badge">${categoriaNome}</span>
        <h1 class="game-details-title">${nomeJogo}</h1>
        <div class="game-details-rating">
          ${generateStarRating(avaliacaoMedia)}
          <span>${avaliacaoMedia.toFixed(1)} estrelas</span>
        </div>
        <div class="game-details-price">${formatCurrency(currentGame.preco)}</div>
        <div class="add-to-cart-section">
          <button class="btn btn-full" id="addToCartBtn">Adicionar ao Carrinho</button>
          <button class="btn btn-secondary" id="buyNowBtn">Comprar Agora</button>
          <button class="btn wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}" id="wishlistBtn">
            ${isInWishlist ? '❤️ Na Lista de Desejos' : '🤍 Adicionar à Lista'}
          </button>
        </div>
      </div>

      <div class="tabs-section">
        <div class="tabs">
          <button class="tab active" data-tab="description">Descrição</button>
          <button class="tab" data-tab="reviews">Avaliações (${Array.isArray(gameReviews) ? gameReviews.length : 0})</button>
        </div>

        <div id="descriptionTab" class="tab-content active">
          <div class="description-content">
            <p>${currentGame.descricao}</p>
          </div>
        </div>

        <div id="reviewsTab" class="tab-content">
          ${renderReviews()}
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupEventListeners();
}

// Render reviews
function renderReviews() {
  // Garantir que gameReviews é um array
  if (!Array.isArray(gameReviews) || gameReviews.length === 0) {
    return `
      <div class="no-reviews">
        <p>Ainda não há avaliações para este jogo.</p>
        <p>Seja o primeiro a avaliar!</p>
      </div>
    `;
  }

  return `
    <div class="reviews-list">
      ${gameReviews.map(review => {
        // Backend fields: nome_usuario, nota, comentario, data_criacao
        const avatarUrl = review.avatar_usuario || generateAvatar(review.nome_usuario);
        const nomeUsuario = review.nome_usuario || 'Usuário';
        const nota = review.nota || 0;
        const comentario = review.comentario || '';
        const dataCriacao = review.data_criacao || new Date().toISOString();

        return `
          <div class="review-card">
            <div class="review-header">
              <img src="${avatarUrl}" alt="${nomeUsuario}" class="review-avatar">
              <div class="review-user-info">
                <div class="review-user-name">${nomeUsuario}</div>
                <div class="review-date">${formatDate(dataCriacao)}</div>
              </div>
              <div class="review-rating">
                ${generateStarRating(nota)}
              </div>
            </div>
            <p class="review-comment">${comentario}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Setup event listeners
function setupEventListeners() {
  // Thumbnail gallery
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('mainImage');

  // Preparar imagens - backend pode retornar string ou array
  const imagens = Array.isArray(currentGame.imagens)
    ? currentGame.imagens
    : (currentGame.imagem ? [currentGame.imagem] : ['images/default.jpg']);

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
      const index = this.dataset.index;

      // Update main image
      mainImage.src = imagens[index];

      // Update active thumbnail
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      const contentId = tabName + 'Tab';
      document.getElementById(contentId).classList.add('active');
    });
  });

  // Add to cart button
  document.getElementById('addToCartBtn').addEventListener('click', async function() {
    // Desabilitar botão durante requisição
    this.disabled = true;
    const originalText = this.textContent;
    this.textContent = 'Adicionando...';

    try {
      const result = await CartAPI.add(currentGame.id);

      if (result.success) {
        showSuccess('Jogo adicionado ao carrinho!');
        updateCartBadge();

        // Change button text temporarily
        this.textContent = '✓ Adicionado!';
        this.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
          this.textContent = originalText;
          this.style.backgroundColor = '';
          this.disabled = false;
        }, 2000);
      } else {
        showError(result.error || 'Erro ao adicionar ao carrinho');
        this.textContent = originalText;
        this.disabled = false;
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      showError('Erro ao conectar com servidor');
      this.textContent = originalText;
      this.disabled = false;
    }
  });

  // Buy now button
  document.getElementById('buyNowBtn').addEventListener('click', function() {
    // Add to cart and go to cart page
    Cart.addItem(currentGame.id);
    window.location.href = 'cart.html';
  });

  // Wishlist button
  document.getElementById('wishlistBtn').addEventListener('click', async function() {
    try {
      const isInWishlist = await Wishlist.isInWishlist(currentGame.id);

      if (isInWishlist) {
        // Remove from wishlist
        const result = await Wishlist.removeItem(currentGame.id);
        if (result.success) {
          showSuccess('Removido da lista de desejos');
          this.classList.remove('in-wishlist');
          this.innerHTML = '🤍 Adicionar à Lista';
        } else {
          showError(result.message);
        }
      } else {
        // Add to wishlist
        const result = await Wishlist.addItem(currentGame.id);
        if (result.success) {
          showSuccess('Adicionado à lista de desejos!');
          this.classList.add('in-wishlist');
          this.innerHTML = '❤️ Na Lista de Desejos';
        } else {
          showError(result.message);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar wishlist:', error);
      showError('Erro ao conectar com servidor');
    }
  });
}
