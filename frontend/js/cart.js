// Cart Page JavaScript

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

let cartItems = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  await loadCart();
});

// Load cart from API
async function loadCart() {
  try {
    const result = await CartAPI.getAll();

    if (result.success && result.data) {
      // Backend retorna: { carrinhosComItens: [ { id, itens: [...] } ] }
      if (result.data.carrinhosComItens &&
          Array.isArray(result.data.carrinhosComItens) &&
          result.data.carrinhosComItens.length > 0) {

        // Filtrar apenas carrinhos ATIVOS (status = 'A')
        // Carrinhos finalizados (status = 'F') não devem aparecer aqui
        const carrinhosAtivos = result.data.carrinhosComItens.filter(c => c.status === 'A');

        // Se não houver carrinhos ativos, exibir carrinho vazio
        if (carrinhosAtivos.length === 0) {
          cartItems = [];
          renderCart();
          return;
        }

        // Pegar o primeiro carrinho ATIVO
        const carrinho = carrinhosAtivos[0];
        const itensDoCarrinho = carrinho.itens || [];

        if (itensDoCarrinho.length === 0) {
          cartItems = [];
          renderCart();
          return;
        }

        // Buscar detalhes de cada jogo via API
        const itensComDetalhes = await Promise.all(
          itensDoCarrinho.map(async (item) => {
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

        cartItems = itensComDetalhes;
      } else {
        // Carrinho vazio ou estrutura inesperada
        cartItems = [];
      }

      renderCart();
    } else {
      console.error('Erro ao carregar carrinho:', result.error);
      showError('Erro ao carregar carrinho');
      cartItems = [];
      renderCart();
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    showError('Erro ao conectar com servidor');
    cartItems = [];
    renderCart();
  }
}

// Render cart
function renderCart() {
  const container = document.getElementById('cartContainer');

  // PROTEÇÃO: Garantir que cartItems seja sempre um array
  if (!Array.isArray(cartItems)) {
    console.warn('⚠️ AVISO: cartItems não é um array:', cartItems);
    cartItems = [];
  }

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione jogos incríveis ao seu carrinho e comece a jogar!</p>
        <a href="home.html" class="btn">Continuar Comprando</a>
      </div>
    `;
    return;
  }

  // Calcular total do carrinho (sem quantidade, cada item = 1)
  const total = cartItems.reduce((sum, item) => {
    const preco = item.jogo?.preco || 0;
    return sum + preco; // Cada item tem quantidade implícita de 1
  }, 0);

  container.innerHTML = `
    <div class="cart-summary">
      <h1 class="cart-title">Resumo da Compra</h1>

      <div class="cart-items">
        ${cartItems.map(item => renderCartItem(item)).join('')}
      </div>

      <div class="cart-totals">
        <div class="cart-total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <div class="cart-total-row total">
          <span>Total:</span>
          <span>${formatCurrency(total)}</span>
        </div>
      </div>

      <div class="payment-methods">
        <p class="payment-methods-title">Formas de pagamento aceitas:</p>
        <div class="payment-icons">
          <div class="payment-icon" title="Visa">💳</div>
          <div class="payment-icon" title="Mastercard">💳</div>
          <div class="payment-icon" title="American Express">💳</div>
          <div class="payment-icon" title="Pix">📱</div>
        </div>
      </div>

      <button class="btn btn-full" id="checkoutBtn">Finalizar Compra</button>
    </div>
  `;

  setupEventListeners();
}

// Render cart item
function renderCartItem(item) {
  // Backend fields: id (item ID), fkJogo, fkCarrinho, jogo (fetched separately)
  const jogo = item.jogo || {};
  const jogoId = item.fkJogo; // ← Campo correto do backend

  // Debug: verificar se jogoId existe
  if (!jogoId) {
    console.error('❌ fkJogo não encontrado no item:', item);
    return '<div class="cart-item">Erro: Jogo não encontrado</div>';
  }

  const nomeJogo = jogo.nome || jogo.titulo || 'Jogo';
  const imagemUrl = getGameImage(nomeJogo);
  const categoriaNome = getCategoryName(jogo.fkCategoria);
  const preco = jogo.preco || 0;
  const quantidade = 1; // Backend não retorna quantidade, assumir 1

  return `
    <div class="cart-item" data-game-id="${jogoId}">
      <img src="${imagemUrl}" alt="${nomeJogo}" class="cart-item-image">

      <div class="cart-item-info">
        <h3 class="cart-item-title">${nomeJogo}</h3>
        <p class="cart-item-platform">${categoriaNome}</p>
        <div class="cart-item-quantity">Quantidade: ${quantidade}</div>
      </div>

      <div class="cart-item-actions">
        <div class="cart-item-price">${formatCurrency(preco * quantidade)}</div>
        <button class="remove-btn" data-game-id="${jogoId}">Remover</button>
      </div>
    </div>
  `;
}

// Setup event listeners
function setupEventListeners() {
  // Remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const gameId = parseInt(this.dataset.gameId);

      // Validar se o ID é válido
      if (isNaN(gameId) || !gameId) {
        console.error('❌ ID inválido:', this.dataset.gameId);
        showError('Erro: ID do jogo inválido');
        return;
      }

      if (confirm('Deseja remover este item do carrinho?')) {
        const result = await CartAPI.remove(gameId);

        if (result.success) {
          await loadCart(); // Recarregar carrinho
          updateCartBadge();
          showSuccess('Item removido do carrinho');
        } else {
          showError(result.error || 'Erro ao remover item');
        }
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      window.location.href = 'checkout.html';
    });
  }
}
