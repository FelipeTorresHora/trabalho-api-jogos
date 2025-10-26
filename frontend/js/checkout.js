// Checkout Page JavaScript

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

  // Load cart from API
  await loadCart();

  // Check if cart is empty
  if (cartItems.length === 0) {
    showError('Seu carrinho está vazio!');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000);
    return;
  }

  loadOrderSummary();
  setupPaymentMethodToggle();
  setupFormHandling();
  prefillUserData();
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

        // Se não houver carrinhos ativos, carrinho está vazio
        if (carrinhosAtivos.length === 0) {
          cartItems = [];
          return;
        }

        // Pegar o primeiro carrinho ATIVO
        const carrinho = carrinhosAtivos[0];
        const itensDoCarrinho = carrinho.itens || [];

        if (itensDoCarrinho.length === 0) {
          cartItems = [];
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
    } else {
      console.error('Erro ao carregar carrinho:', result.error);
      cartItems = [];
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    cartItems = [];
  }
}

// Load order summary
function loadOrderSummary() {
  const orderItemsContainer = document.getElementById('orderItems');

  orderItemsContainer.innerHTML = cartItems.map(item => {
    const jogo = item.jogo || {};
    const titulo = jogo.nome || jogo.titulo || 'Jogo';

    // Preparar imagens - backend pode retornar string ou array
    const imagens = Array.isArray(jogo.imagens)
      ? jogo.imagens
      : (jogo.imagem ? [jogo.imagem] : ['images/default.jpg']);
    const imagemUrl = imagens[0];

    const categoria = getCategoryName(jogo.fkCategoria);
    const preco = jogo.preco || 0;
    // Backend não suporta quantidade - sempre 1 item por entrada no carrinho
    const quantidade = 1;

    return `
      <div class="order-item">
        <img src="${imagemUrl}" alt="${titulo}" class="order-item-image">
        <div class="order-item-info">
          <div class="order-item-title">${titulo}</div>
          <div class="order-item-details">${categoria} • Qty: ${quantidade}</div>
          <div class="order-item-price">${formatCurrency(preco)}</div>
        </div>
      </div>
    `;
  }).join('');

  // Calculate totals - sem multiplicação por quantidade
  const total = cartItems.reduce((sum, item) => {
    const preco = item.jogo?.preco || 0;
    return sum + preco;
  }, 0);

  // Update totals
  document.getElementById('orderSubtotal').textContent = formatCurrency(total);
  document.getElementById('orderTotal').textContent = formatCurrency(total);
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('cardDetails');
  const pixDetails = document.getElementById('pixDetails');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'card') {
        cardDetails.classList.remove('hidden');
        pixDetails.classList.add('hidden');

        // Make card fields required
        document.getElementById('cardNumber').required = true;
        document.getElementById('cardName').required = true;
        document.getElementById('cardExpiry').required = true;
        document.getElementById('cardCvv').required = true;
      } else {
        cardDetails.classList.add('hidden');
        pixDetails.classList.remove('hidden');

        // Make card fields not required
        document.getElementById('cardNumber').required = false;
        document.getElementById('cardName').required = false;
        document.getElementById('cardExpiry').required = false;
        document.getElementById('cardCvv').required = false;
      }
    });
  });
}

// Setup form handling
function setupFormHandling() {
  const form = document.getElementById('checkoutForm');

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Card expiry formatting
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  // CEP formatting
  const cep = document.getElementById('cep');
  if (cep) {
    cep.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 5) {
        value = value.slice(0, 5) + '-' + value.slice(5, 8);
      }
      e.target.value = value;
    });
  }

  // Phone formatting
  const phone = document.getElementById('phone');
  if (phone) {
    phone.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 10) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
      }
      e.target.value = value;
    });
  }

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleCheckout();
  });
}

// Prefill user data
function prefillUserData() {
  const currentUser = Auth.getCurrentUser();

  if (currentUser) {
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.telefone || '';
  }
}

// Handle checkout
async function handleCheckout() {
  const form = document.getElementById('checkoutForm');
  const formData = new FormData(form);

  // Convert to object
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Processando...';
  submitBtn.disabled = true;

  try {
    // Criar venda via API
    // O backend processa o carrinho automaticamente via /vendas/checkout
    // Enviamos os dados de pagamento (backend atual vai ignorar mas requisição funciona)
    const result = await SaleAPI.create(data);

    if (result.success) {
      // O backend já limpa o carrinho automaticamente após o checkout
      updateCartBadge();
      showSuccess('Pedido realizado com sucesso!');

      // Redirect to history page
      setTimeout(() => {
        window.location.href = 'history.html';
      }, 1500);
    } else {
      showError(result.error || 'Erro ao processar pedido');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    showError('Erro ao conectar com servidor');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
