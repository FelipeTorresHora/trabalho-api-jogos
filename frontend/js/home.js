// Home Page JavaScript

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

// Carousel state
let currentSlide = 0;
let carouselTimer = null;
const SLIDE_INTERVAL = 10000; // 15 segundos
let featuredGames = [];

// Filter state
let selectedCategory = 'Todos';

// Cache de jogos da API
let allGamesCache = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  await loadAllGames(); // Carregar jogos primeiro
  initHeroCarousel();
  initCategoryFilter();
  setupSearch();
});

// Carregar todos os jogos da API
async function loadAllGames() {
  try {
    const result = await GameAPI.getAll();

    if (result.success && result.data) {
      allGamesCache = result.data;

      // Filtrar jogos em destaque para o carousel
      featuredGames = allGamesCache.filter(jogo => jogo.destaque || jogo.featured);

      // Se não houver jogos em destaque, pegar os primeiros 3
      if (featuredGames.length === 0 && allGamesCache.length > 0) {
        featuredGames = allGamesCache.slice(0, Math.min(3, allGamesCache.length));
      }

      // Renderizar grid de jogos
      await loadGames();
    } else {
      console.error('Erro ao carregar jogos:', result.error);
      showError('Erro ao carregar jogos');
    }
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    showError('Erro ao conectar com servidor');
  }
}

// ===========================================
// HERO CAROUSEL
// ===========================================

function initHeroCarousel() {
  // featuredGames já foi carregado em loadAllGames()
  if (featuredGames.length === 0) {
    console.warn('No featured games found');
    return;
  }

  renderCarouselSlides();
  renderCarouselIndicators();
  setupCarouselControls();
  startAutoplay();
}

function renderCarouselSlides() {
  const slidesContainer = document.getElementById('heroSlides');

  slidesContainer.innerHTML = featuredGames.map((jogo, index) => {
    const imagemUrl = jogo.imagem || jogo.imagens || 'images/default.jpg';
    const descricaoPreview = jogo.descricao ? jogo.descricao.substring(0, 150) + '...' : '';
    const nomeJogo = jogo.nome || jogo.titulo || 'Jogo';

    return `
    <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="hero-background" style="background-image: url('${imagemUrl}')"></div>
      <div class="hero-content">
        <div class="hero-text">
          <h2>Jogo em Destaque</h2>
          <h1>${nomeJogo}</h1>
          <p>${descricaoPreview}</p>
          <div class="hero-actions">
            <button class="btn" onclick="viewGameDetails(${jogo.id})">Ver Detalhes</button>
            <button class="btn btn-secondary" onclick="addToCartFromHero(${jogo.id})">Adicionar ao Carrinho</button>
          </div>
        </div>
      </div>
    </div>
  `}).join('');
}

function renderCarouselIndicators() {
  const indicatorsContainer = document.getElementById('heroIndicators');

  indicatorsContainer.innerHTML = featuredGames.map((_, index) => `
    <span class="hero-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
  `).join('');

  // Add click listeners to indicators
  const indicators = document.querySelectorAll('.hero-indicator');
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.dataset.index);
      goToSlide(index);
    });
  });
}

function setupCarouselControls() {
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const carousel = document.querySelector('.hero-carousel');

  // Previous button
  prevBtn.addEventListener('click', prevSlide);

  // Next button
  nextBtn.addEventListener('click', nextSlide);

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % featuredGames.length;
  updateSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + featuredGames.length) % featuredGames.length;
  updateSlide();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlide();
}

function updateSlide() {
  // Update slides
  const slides = document.querySelectorAll('.hero-slide');
  slides.forEach((slide, index) => {
    if (index === currentSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // Update indicators
  const indicators = document.querySelectorAll('.hero-indicator');
  indicators.forEach((indicator, index) => {
    if (index === currentSlide) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });

  // Restart autoplay timer
  stopAutoplay();
  startAutoplay();
}

function startAutoplay() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }

  carouselTimer = setInterval(() => {
    nextSlide();
  }, SLIDE_INTERVAL);
}

function stopAutoplay() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

// Hero CTA functions (made global for onclick)
window.addToCartFromHero = async function(gameId) {
  try {
    const result = await CartAPI.add(gameId);

    if (result.success) {
      showSuccess('Jogo adicionado ao carrinho!');
      updateCartBadge();
    } else {
      showError(result.error || 'Erro ao adicionar ao carrinho');
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    showError('Erro ao conectar com servidor');
  }
};

// ===========================================
// CATEGORY FILTER
// ===========================================

function initCategoryFilter() {
  const categories = ['Todos', ...getUniqueCategories()];
  renderCategoryButtons(categories);
}

function getUniqueCategories() {
  // Pegar categorias dos jogos já carregados e converter IDs para nomes
  const categories = allGamesCache.map(jogo => getCategoryName(jogo.fkCategoria));
  return [...new Set(categories)].filter(cat => cat).sort();
}

function renderCategoryButtons(categories) {
  const filterContainer = document.getElementById('categoryFilter');

  filterContainer.innerHTML = categories.map(category => `
    <button class="category-btn ${category === 'Todos' ? 'active' : ''}" data-category="${category}">
      ${category}
    </button>
  `).join('');

  // Add click listeners
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterByCategory(category);
    });
  });
}

function filterByCategory(category) {
  selectedCategory = category;

  // Update active button
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Reload games with filter
  loadGames();
}

// ===========================================
// GAMES GRID
// ===========================================

async function loadGames(searchTerm = '') {
  const gamesGrid = document.getElementById('gamesGrid');

  try {
    // Preparar filtros para a API
    const filters = {};

    if (selectedCategory !== 'Todos') {
      filters.categoria = selectedCategory;
    }

    if (searchTerm) {
      filters.busca = searchTerm;
    }

    // Buscar jogos da API
    const result = await GameAPI.getAll(filters);

    // Clear grid
    gamesGrid.innerHTML = '';

    if (!result.success) {
      showError(result.error || 'Erro ao carregar jogos');
      return;
    }

    const jogos = result.data;

    // Check if no games found
    if (!jogos || jogos.length === 0) {
      gamesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🎮</div>
          <h3>Nenhum jogo encontrado</h3>
          <p>Tente ajustar os filtros ou buscar por outro termo</p>
        </div>
      `;
      return;
    }

    // Create game cards
    jogos.forEach(jogo => {
      const card = createGameCard(jogo);
      gamesGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    gamesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">❌</div>
        <h3>Erro ao conectar com servidor</h3>
        <p>Tente novamente mais tarde</p>
      </div>
    `;
  }
}

// Create game card element
function createGameCard(jogo) {
  const card = document.createElement('div');
  card.className = 'game-card';

  // Usar campos do backend: nome, fkCategoria, preco
  const imagemUrl = jogo.imagem || jogo.imagens || 'images/default.jpg';
  const avaliacaoMedia = jogo.avaliacao_media || 0;
  const nomeJogo = jogo.nome || jogo.titulo || 'Jogo';
  const categoriaNome = getCategoryName(jogo.fkCategoria);

  card.innerHTML = `
    <img src="${imagemUrl}" alt="${nomeJogo}" class="game-image" loading="lazy">
    <div class="game-info">
      <div class="game-category">${categoriaNome}</div>
      <h3 class="game-title">${nomeJogo}</h3>
      <div class="game-rating">
        ${generateStarRating(avaliacaoMedia)}
        <span>${avaliacaoMedia.toFixed(1)}</span>
      </div>
      <div class="game-price">${formatCurrency(jogo.preco)}</div>
      <div class="game-actions">
        <button class="btn btn-secondary view-details-btn" data-game-id="${jogo.id}">
          Ver Detalhes
        </button>
        <button class="btn add-to-cart-btn" data-game-id="${jogo.id}">
          Comprar
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  card.querySelector('.view-details-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    viewGameDetails(jogo.id);
  });

  card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(jogo.id);
  });

  // Card click goes to details
  card.addEventListener('click', () => {
    viewGameDetails(jogo.id);
  });

  return card;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// View game details
function viewGameDetails(gameId) {
  window.location.href = `game-details.html?id=${gameId}`;
}

// Make viewGameDetails global for carousel
window.viewGameDetails = viewGameDetails;

// Add to cart
async function addToCart(gameId) {
  try {
    const result = await CartAPI.add(gameId);

    if (result.success) {
      showSuccess('Jogo adicionado ao carrinho!');
      updateCartBadge();

      // Add visual feedback
      const btn = document.querySelector(`[data-game-id="${gameId}"].add-to-cart-btn`);
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Adicionado!';
        btn.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 1500);
      }
    } else {
      showError(result.error || 'Erro ao adicionar ao carrinho');
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    showError('Erro ao conectar com servidor');
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const searchTerm = e.target.value.trim();
      loadGames(searchTerm);
    }, 300));
  }
}
