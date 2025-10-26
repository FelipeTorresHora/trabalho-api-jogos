// History Page JavaScript

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

let userOrders = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  await loadOrders();
});

// Load user orders from API
async function loadOrders() {
  const container = document.getElementById('ordersContainer');

  try {
    const result = await SaleAPI.getAll();

    if (result.success && result.data) {
      userOrders = result.data;

      // Para cada venda, buscar o carrinho finalizado e seus itens
      const vendasComItens = await Promise.all(
        userOrders.map(async (venda) => {
          try {
            // Buscar todos os carrinhos do usuário
            const carrinhosResult = await CartAPI.getAll();

            if (carrinhosResult.success && carrinhosResult.data.carrinhosComItens) {
              // Filtrar carrinho finalizado que pertence a esta venda
              const carrinhoFinalizado = carrinhosResult.data.carrinhosComItens.find(
                c => c.status === 'F' && c.fkVenda === venda.id
              );

              if (carrinhoFinalizado && carrinhoFinalizado.itens) {
                // Buscar detalhes de cada jogo
                const itensComDetalhes = await Promise.all(
                  carrinhoFinalizado.itens.map(async (item) => {
                    try {
                      const jogoResult = await GameAPI.getById(item.fkJogo);
                      return {
                        ...item,
                        jogo: jogoResult.success ? jogoResult.data : null
                      };
                    } catch (error) {
                      console.error(`Erro ao buscar jogo ${item.fkJogo}:`, error);
                      return {
                        ...item,
                        jogo: null
                      };
                    }
                  })
                );

                return { ...venda, itens: itensComDetalhes };
              }
            }

            return { ...venda, itens: [] };
          } catch (error) {
            console.error(`Erro ao buscar itens da venda ${venda.id}:`, error);
            return { ...venda, itens: [] };
          }
        })
      );

      userOrders = vendasComItens;

      // Sort by date (most recent first)
      userOrders.sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      });

      // Check if user has orders
      if (userOrders.length === 0) {
        container.innerHTML = `
          <div class="empty-orders">
            <div class="empty-orders-icon">📦</div>
            <h2>Nenhuma compra realizada</h2>
            <p>Você ainda não realizou nenhuma compra. Explore nossa loja e encontre jogos incríveis!</p>
            <a href="home.html" class="btn">Explorar Jogos</a>
          </div>
        `;
        return;
      }

      // Render orders
      container.innerHTML = userOrders.map(order => renderOrderCard(order)).join('');

      // Setup event listeners
      setupEventListeners();
    } else {
      console.error('Erro ao carregar pedidos:', result.error);
      showError('Erro ao carregar histórico de pedidos');
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-orders-icon">❌</div>
          <h2>Erro ao carregar pedidos</h2>
          <p>Tente novamente mais tarde</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    showError('Erro ao conectar com servidor');
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-orders-icon">❌</div>
        <h2>Erro ao conectar com servidor</h2>
        <p>Tente novamente mais tarde</p>
      </div>
    `;
  }
}

// Render order card
function renderOrderCard(order) {
  // Backend fields: id, data, valor_total, quantidade, fk_usuario
  const itens = order.itens || [];
  // Usar quantidade do backend em vez de contar itens
  const itemsCount = order.quantidade || itens.length || 0;

  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <div class="order-id">Pedido #${order.id}</div>
          <div class="order-date">
            ${formatDateTime(order.data)}
          </div>
        </div>

        <div class="order-meta">
          <div class="order-total">${formatCurrency(order.valor_total)}</div>
          ${renderStatusBadge(order.status)}
        </div>
      </div>

      <div class="order-details-summary">
        <div class="detail-item">
          <span class="detail-label">Data/Hora:</span>
          <span class="detail-value">
            ${formatDateTime(order.data)}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Pagamento:</span>
          <span class="detail-value">
            ${order.forma_pagamento ?
              `${getPaymentMethodIcon(order.forma_pagamento)} ${order.forma_pagamento}`
              : 'Não especificado'}
          </span>
        </div>
      </div>

      ${itens.length > 0 ? `
        <div class="order-items">
          <div class="order-items-summary">
            ${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}
          </div>

          <div class="order-items-list" id="orderItems${order.id}">
            ${itens.map(item => renderOrderItem(item, order)).join('')}
          </div>
        </div>

        <div class="order-actions">
          <button class="toggle-details-btn" data-order-id="${order.id}">
            Ver Detalhes
          </button>
        </div>
      ` : `
        <div class="order-items">
          <div class="order-items-summary">
            ${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}
          </div>
        </div>
      `}
    </div>
  `;
}

// Render status badge
function renderStatusBadge(status) {
  // Backend não retorna status, usar "Aprovado" como padrão
  if (!status) {
    status = 'Aprovado';
  }

  let badgeClass = 'badge';

  switch(status.toLowerCase()) {
    case 'entregue':
    case 'aprovado':
      badgeClass += ' badge-success';
      break;
    case 'processando':
    case 'pendente':
      badgeClass += ' badge-warning';
      break;
    case 'cancelado':
      badgeClass += ' badge-error';
      break;
    default:
      badgeClass += ' badge-success';
  }

  return `<span class="${badgeClass}">${status}</span>`;
}

// Render order item
function renderOrderItem(item, order) {
  // Backend fields: id, jogo_id, quantidade, preco_unitario, jogo (nested)
  const jogo = item.jogo || {};
  const titulo = jogo.nome || jogo.titulo || 'Jogo';
  const categoria = getCategoryName(jogo.fkCategoria);
  const quantidade = item.quantidade || 1;
  const precoUnitario = item.preco_unitario || jogo.preco || 0;
  const jogoId = item.fkJogo || item.jogo_id || jogo.id;
  const chaveAtivacao = item.chaveAtivacao || item.chave_ativacao;

  // Exibir botão de avaliar para pedidos aprovados (status padrão)
  const isApproved = !order.status || order.status === 'Aprovado' || order.status === 'Entregue';

  return `
    <div class="order-item">
      <div class="order-item-info">
        <div class="order-item-title">${titulo}</div>
        <div class="order-item-details">
          ${categoria} • Quantidade: ${quantidade}
        </div>
        ${chaveAtivacao ? `
          <div class="activation-key">
            🔑 Chave: <code>${chaveAtivacao}</code>
          </div>
        ` : ''}
        ${isApproved && jogoId ? `
          <button
            class="review-btn"
            data-game-id="${jogoId}"
            data-order-id="${order.id}"
          >
            ⭐ Avaliar Jogo
          </button>
        ` : ''}
      </div>
      <div class="order-item-price">${formatCurrency(precoUnitario * quantidade)}</div>
    </div>
  `;
}

// Setup event listeners
function setupEventListeners() {
  const toggleButtons = document.querySelectorAll('.toggle-details-btn');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const orderId = this.dataset.orderId;
      const itemsList = document.getElementById(`orderItems${orderId}`);

      if (itemsList) {
        itemsList.classList.toggle('expanded');

        // Update button text
        if (itemsList.classList.contains('expanded')) {
          this.textContent = 'Ocultar Detalhes';
        } else {
          this.textContent = 'Ver Detalhes';
        }
      }
    });
  });

  // Review button listeners
  const reviewButtons = document.querySelectorAll('.review-btn');
  reviewButtons.forEach(btn => {
    btn.addEventListener('click', async function() {
      const gameId = parseInt(this.dataset.gameId);
      const orderId = parseInt(this.dataset.orderId);
      await openReviewModal(gameId, orderId);
    });
  });

  // Modal close listeners
  const closeReviewModalBtn = document.getElementById('closeReviewModal');
  const cancelReviewBtn = document.getElementById('cancelReviewBtn');
  const reviewModal = document.getElementById('reviewModal');

  if (closeReviewModalBtn) {
    closeReviewModalBtn.addEventListener('click', () => closeModal());
  }

  if (cancelReviewBtn) {
    cancelReviewBtn.addEventListener('click', () => closeModal());
  }

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        closeModal();
      }
    });
  }

  // Star selector
  setupStarSelector();

  // Review form submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }
}

// Open review modal
async function openReviewModal(gameId, orderId) {
  try {
    const result = await GameAPI.getById(gameId);

    if (!result.success || !result.data) {
      showError('Jogo não encontrado');
      return;
    }

    const jogo = result.data;
    const modal = document.getElementById('reviewModal');
    const gameInfoContainer = document.getElementById('reviewGameInfo');
    const reviewGameIdInput = document.getElementById('reviewGameId');
    const reviewOrderIdInput = document.getElementById('reviewOrderId');

    // Set hidden fields
    reviewGameIdInput.value = gameId;
    reviewOrderIdInput.value = orderId;

    // Preparar imagem
    const imagemUrl = Array.isArray(jogo.imagens)
      ? jogo.imagens[0]
      : (jogo.imagem || 'images/default.jpg');

    // Render game info
    const tituloJogo = jogo.nome || jogo.titulo || 'Jogo';
    const categoriaJogo = getCategoryName(jogo.fkCategoria);

    gameInfoContainer.innerHTML = `
      <img src="${imagemUrl}" alt="${tituloJogo}">
      <div class="game-info-text">
        <h3>${tituloJogo}</h3>
        <p>${categoriaJogo}</p>
      </div>
    `;

    // Reset form
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewRating').value = '';
    document.querySelectorAll('.star-select').forEach(star => {
      star.classList.remove('selected');
    });

    // Show modal
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar jogo:', error);
    showError('Erro ao carregar dados do jogo');
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('reviewModal');
  modal.classList.add('hidden');
}

// Setup star selector
function setupStarSelector() {
  const stars = document.querySelectorAll('.star-select');
  const ratingInput = document.getElementById('reviewRating');

  stars.forEach((star, index) => {
    // Hover effect
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => {
        if (i <= index) {
          s.classList.add('hovered');
        } else {
          s.classList.remove('hovered');
        }
      });
    });

    // Click to select
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      ratingInput.value = rating;

      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });

  // Remove hover effect when leaving star container
  const starSelector = document.getElementById('starSelector');
  if (starSelector) {
    starSelector.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });
  }
}

// Handle review submission
async function handleReviewSubmit(e) {
  e.preventDefault();

  const jogoId = parseInt(document.getElementById('reviewGameId').value);
  const nota = parseInt(document.getElementById('reviewRating').value);
  const comentario = document.getElementById('reviewComment').value.trim();

  // Validate
  if (!nota) {
    showError('Por favor, selecione uma avaliação de 1 a 5 estrelas');
    return;
  }

  if (!comentario) {
    showError('Por favor, escreva um comentário sobre o jogo');
    return;
  }

  try {
    // Create review via API
    const result = await ReviewAPI.create(jogoId, nota, comentario);

    if (result.success) {
      showSuccess('Avaliação enviada com sucesso!');
      closeModal();
      // Reload orders to update review buttons
      await loadOrders();
    } else {
      showError(result.error || 'Erro ao enviar avaliação');
    }
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
    showError('Erro ao conectar com servidor');
  }
}
