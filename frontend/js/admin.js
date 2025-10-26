// Admin Page JavaScript

// Require admin authentication
Auth.requireAdmin();

// Chart instances
let topGamesChart, categoriesChart, brandsChart;

// Data caches
let allSales = [];
let allGames = [];
let allUsers = [];
let allCompanies = [];

// Category mapping (ID -> Name)
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

// Helper function to get category name by ID
function getCategoryName(categoryId) {
  return CATEGORIAS[categoryId] || 'Outros';
}

// Helper function to normalize game data from backend
function normalizeGame(jogo) {
  if (!jogo) return null;

  return {
    id: jogo.id,
    titulo: jogo.nome || jogo.titulo,  // Backend usa 'nome', frontend espera 'titulo'
    nome: jogo.nome,  // Manter campo original também
    descricao: jogo.descricao,
    ano: jogo.ano,
    preco: jogo.preco,
    fkEmpresa: jogo.fkEmpresa || jogo.fk_empresa,
    fkCategoria: jogo.fkCategoria || jogo.fk_categoria,
    empresa_id: jogo.fkEmpresa || jogo.fk_empresa || jogo.empresa_id,
    categoria_id: jogo.fkCategoria || jogo.fk_categoria || jogo.categoria_id,
    categoria: getCategoryName(jogo.fkCategoria || jogo.fk_categoria),
    empresa_nome: jogo.empresa_nome,  // Será preenchido depois
    imagem: jogo.imagem || 'images/default.jpg',
    destaque: jogo.destaque || false,
    avaliacao_media: jogo.avaliacao_media || 0
  };
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  initializeHeader();
  setupTabs();
  await loadDashboard();
  await loadUsers();
  await loadGames();
  await loadCompanies();
  setupModals();
});

// Setup Tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.dataset.tab;

      // Remove active from all tabs
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked tab
      this.classList.add('active');
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });
}

// Load Dashboard with Charts
async function loadDashboard() {
  try {
    // Carregar vendas da API
    const salesResult = await SaleAPI.getAll();
    if (salesResult.success && salesResult.data) {
      allSales = salesResult.data;
    }

    // Carregar jogos da API e normalizar
    const gamesResult = await GameAPI.getAll();
    if (gamesResult.success && gamesResult.data) {
      allGames = gamesResult.data.map(jogo => normalizeGame(jogo));
    }

    // Carregar empresas para mapear nomes
    const companiesResult = await CompanyAPI.getAll();
    if (companiesResult.success && companiesResult.data) {
      allCompanies = companiesResult.data;

      // Adicionar empresa_nome aos jogos
      allGames = allGames.map(jogo => {
        const empresa = allCompanies.find(e => e.id === jogo.empresa_id);
        return {
          ...jogo,
          empresa_nome: empresa ? empresa.nome : `Empresa ${jogo.empresa_id}`
        };
      });
    }

    // Buscar carrinhos finalizados para obter itens das vendas
    const cartsResult = await CartAPI.getAll();
    let carrinhosFinalizados = [];
    if (cartsResult.success && cartsResult.data && cartsResult.data.carrinhosComItens) {
      carrinhosFinalizados = cartsResult.data.carrinhosComItens.filter(c => c.status === 'F');
    }

    // Combinar vendas com itens dos carrinhos
    const vendasComItens = allSales.map(venda => {
      const carrinho = carrinhosFinalizados.find(c => c.fkVenda === venda.id);
      const itens = carrinho ? (carrinho.itens || []) : [];

      // Adicionar dados do jogo em cada item
      const itensComJogo = itens.map(item => {
        const jogo = allGames.find(g => g.id === item.fkJogo);
        return {
          ...item,
          jogo_id: item.fkJogo,
          jogo: jogo,
          quantidade: 1,  // Backend não suporta quantidade, sempre 1
          preco_unitario: jogo ? jogo.preco : 0
        };
      });

      return {
        ...venda,
        itens: itensComJogo
      };
    });

    allSales = vendasComItens;

    // Calculate top selling games
    const gameSales = {};
    allSales.forEach(venda => {
      const itens = venda.itens || [];
      itens.forEach(item => {
        const jogoId = item.jogo_id;
        const quantidade = item.quantidade || 1;
        const precoUnitario = item.preco_unitario || 0;

        if (!gameSales[jogoId]) {
          const jogo = item.jogo || allGames.find(g => g.id === jogoId) || {};
          gameSales[jogoId] = {
            gameId: jogoId,
            title: jogo.titulo || jogo.nome || 'Desconhecido',
            quantity: 0,
            revenue: 0
          };
        }
        gameSales[jogoId].quantity += quantidade;
        gameSales[jogoId].revenue += precoUnitario * quantidade;
      });
    });

    const topGames = Object.values(gameSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate sales by category
    const categorySales = {};
    allSales.forEach(venda => {
      const itens = venda.itens || [];
      itens.forEach(item => {
        const jogo = item.jogo || allGames.find(g => g.id === item.jogo_id);
        if (jogo) {
          const categoria = jogo.categoria || 'Outros';
          if (!categorySales[categoria]) {
            categorySales[categoria] = {
              name: categoria,
              quantity: 0,
              revenue: 0
            };
          }
          categorySales[categoria].quantity += item.quantidade || 1;
          categorySales[categoria].revenue += (item.preco_unitario || 0) * (item.quantidade || 1);
        }
      });
    });

    const topCategories = Object.values(categorySales)
      .sort((a, b) => b.quantity - a.quantity);

    // Calculate sales by brand (empresa)
    const brandSales = {};
    allSales.forEach(venda => {
      const itens = venda.itens || [];
      itens.forEach(item => {
        const jogo = item.jogo || allGames.find(g => g.id === item.jogo_id);
        if (jogo && jogo.empresa_id) {
          const empresaNome = jogo.empresa_nome || `Empresa ${jogo.empresa_id}`;

          if (!brandSales[empresaNome]) {
            brandSales[empresaNome] = {
              name: empresaNome,
              quantity: 0,
              revenue: 0
            };
          }
          brandSales[empresaNome].quantity += item.quantidade || 1;
          brandSales[empresaNome].revenue += (item.preco_unitario || 0) * (item.quantidade || 1);
        }
      });
    });

    const topBrands = Object.values(brandSales)
      .sort((a, b) => b.quantity - a.quantity);

    // Render charts
    renderTopGamesChart(topGames);
    renderCategoriesChart(topCategories);
    renderBrandsChart(topBrands);
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    showError('Erro ao carregar dashboard');
  }
}

// Render Top Games Chart (Horizontal Bar)
function renderTopGamesChart(topGames) {
  const ctx = document.getElementById('topGamesChart');

  if (topGamesChart) {
    topGamesChart.destroy();
  }

  if (topGames.length === 0) {
    ctx.parentElement.innerHTML = '<div class="empty-state">Nenhuma venda registrada</div>';
    return;
  }

  topGamesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topGames.map(g => g.title),
      datasets: [{
        label: 'Unidades Vendidas',
        data: topGames.map(g => g.quantity),
        backgroundColor: 'rgba(189, 178, 255, 0.8)',
        borderColor: 'rgba(189, 178, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(44, 44, 46, 0.95)',
          titleColor: '#BDB2FF',
          bodyColor: '#FFFFFF',
          callbacks: {
            afterLabel: function(context) {
              const revenue = topGames[context.dataIndex].revenue;
              return 'Receita: ' + formatCurrency(revenue);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#E0E0E0'
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: '#E0E0E0'
          }
        }
      }
    }
  });
}

// Render Categories Chart (Pie)
function renderCategoriesChart(categories) {
  const ctx = document.getElementById('categoriesChart');

  if (categoriesChart) {
    categoriesChart.destroy();
  }

  if (categories.length === 0) {
    ctx.parentElement.innerHTML = '<div class="empty-state">Nenhuma venda registrada</div>';
    return;
  }

  const colors = [
    'rgba(189, 178, 255, 0.8)',
    'rgba(255, 178, 189, 0.8)',
    'rgba(178, 255, 189, 0.8)',
    'rgba(255, 220, 178, 0.8)',
    'rgba(178, 220, 255, 0.8)',
    'rgba(255, 178, 220, 0.8)'
  ];

  categoriesChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.quantity),
        backgroundColor: colors.slice(0, categories.length),
        borderColor: '#2C2C2E',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#E0E0E0',
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(44, 44, 46, 0.95)',
          titleColor: '#BDB2FF',
          bodyColor: '#FFFFFF',
          callbacks: {
            afterLabel: function(context) {
              const revenue = categories[context.dataIndex].revenue;
              return 'Receita: ' + formatCurrency(revenue);
            }
          }
        }
      }
    }
  });
}

// Render Brands Chart (Vertical Bar)
function renderBrandsChart(brands) {
  const ctx = document.getElementById('brandsChart');

  if (brandsChart) {
    brandsChart.destroy();
  }

  if (brands.length === 0) {
    ctx.parentElement.innerHTML = '<div class="empty-state">Nenhuma venda registrada</div>';
    return;
  }

  brandsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: brands.map(b => b.name),
      datasets: [{
        label: 'Unidades Vendidas',
        data: brands.map(b => b.quantity),
        backgroundColor: 'rgba(189, 178, 255, 0.8)',
        borderColor: 'rgba(189, 178, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(44, 44, 46, 0.95)',
          titleColor: '#BDB2FF',
          bodyColor: '#FFFFFF',
          callbacks: {
            afterLabel: function(context) {
              const revenue = brands[context.dataIndex].revenue;
              return 'Receita: ' + formatCurrency(revenue);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#E0E0E0',
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#E0E0E0'
          }
        }
      }
    }
  });
}

// ==================== USER MANAGEMENT ====================

// Load all users
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');

  try {
    // Mostrar loading
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Carregando usuários...</td></tr>';

    // Extrair IDs únicos de usuários através das vendas
    const userIds = new Set();
    allSales.forEach(venda => {
      const userId = venda.fk_usuario || venda.fkUsuario;
      if (userId) {
        userIds.add(userId);
      }
    });

    if (userIds.size === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum usuário encontrado (sem vendas registradas)</td></tr>';
      allUsers = [];
      return;
    }

    // Buscar dados completos de cada usuário fazendo loop em GET /usuarios/:id
    const userPromises = Array.from(userIds).map(async (id) => {
      try {
        const result = await UserAPI.getById(id);
        return result;
      } catch (error) {
        console.error(`Erro ao buscar usuário ${id}:`, error);
        return { success: false };
      }
    });

    const userResults = await Promise.all(userPromises);

    // Filtrar apenas resultados bem-sucedidos
    allUsers = userResults
      .filter(result => result.success && result.data)
      .map(result => result.data);

    if (allUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum usuário encontrado</td></tr>';
      return;
    }

    // Renderizar tabela com usuários
    tbody.innerHTML = allUsers.map(user => `
      <tr>
        <td>${user.id}</td>
        <td><img src="${generateAvatar(user.nome)}" alt="${user.nome}" class="user-avatar"></td>
        <td>${user.nome}</td>
        <td>${user.email}</td>
        <td>${user.telefone || '-'}</td>
        <td><span class="role-badge ${user.perfil || 'Cliente'}">${user.perfil === 'Administrador' ? 'Admin' : 'Usuário'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view" onclick="viewUser(${user.id})">Ver</button>
            <button class="action-btn edit" onclick="editUser(${user.id})">Editar</button>
            <button class="action-btn delete" onclick="deleteUser(${user.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Erro ao conectar com servidor</td></tr>';
    allUsers = [];
  }
}

// View user details
async function viewUser(userId) {
  try {
    const result = await UserAPI.getById(userId);

    if (!result.success || !result.data) {
      showError('Usuário não encontrado');
      return;
    }

    const user = result.data;

    // Filtrar vendas deste usuário
    const userOrders = allSales.filter(venda => venda.usuario_id === userId);

    // Por enquanto, não vamos buscar reviews do usuário (simplificação)

    // Usar campos do backend
    const content = `
      <div class="detail-section">
        <img src="${user.avatar || 'https://i.pravatar.cc/150?img=1'}" alt="${user.nome}" class="detail-avatar">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Nome</div>
            <div class="detail-value">${user.nome}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${user.email}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Telefone</div>
            <div class="detail-value">${user.telefone || '-'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Tipo</div>
            <div class="detail-value">${user.perfil === 'Administrador' ? 'Administrador' : 'Cliente'}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Histórico de Compras (${userOrders.length})</h3>
        ${userOrders.length === 0 ? '<div class="empty-state">Nenhuma compra realizada</div>' : userOrders.map(venda => `
          <div class="order-card">
            <div class="order-header">
              <span class="order-id">Pedido #${venda.id}</span>
              <span class="badge badge-${venda.status === 'Entregue' ? 'success' : 'warning'}">${venda.status}</span>
            </div>
            <div><strong>Data:</strong> ${formatDate(venda.data_venda)}</div>
            <div><strong>Pagamento:</strong> ${venda.forma_pagamento}</div>
            <ul class="order-items">
              ${(venda.itens || []).map(item => {
                const jogo = item.jogo || {};
                return `<li>${jogo.titulo || 'Jogo'} - ${item.quantidade}x ${formatCurrency(item.preco_unitario || 0)}</li>`;
              }).join('')}
            </ul>
            <div style="text-align: right; font-size: 18px; font-weight: 700; color: var(--color-accent);">
              Total: ${formatCurrency(venda.valor_total)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('viewUserContent').innerHTML = content;
    openModal('viewUserModal');
  } catch (error) {
    console.error('Erro ao visualizar usuário:', error);
    showError('Erro ao carregar dados do usuário');
  }
}

// Edit user
function editUser(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) {
    showError('Usuário não encontrado');
    return;
  }

  // Usar campos do backend
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserName').value = user.nome;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserPassword').value = '';
  document.getElementById('editUserPhone').value = user.telefone || '';
  document.getElementById('editUserAvatar').value = user.avatar || '';
  document.getElementById('editUserRole').value = user.perfil;

  openModal('editUserModal');
}

// Delete user
async function deleteUser(userId) {
  if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const result = await UserAPI.delete(userId);

    if (result.success) {
      showSuccess('Usuário excluído com sucesso');
      await loadUsers();
      await loadDashboard(); // Reload charts
    } else {
      showError(result.error || 'Erro ao excluir usuário');
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    showError('Erro ao conectar com servidor');
  }
}

// ==================== GAME MANAGEMENT ====================

// Load all games
async function loadGames() {
  const tbody = document.getElementById('gamesTableBody');

  try {
    const result = await GameAPI.getAll();

    if (result.success && result.data) {
      // Normalizar dados dos jogos
      allGames = result.data.map(jogo => normalizeGame(jogo));

      // Adicionar empresa_nome aos jogos usando allCompanies
      allGames = allGames.map(jogo => {
        const empresa = allCompanies.find(e => e.id === jogo.empresa_id);
        return {
          ...jogo,
          empresa_nome: empresa ? empresa.nome : '-'
        };
      });

      if (allGames.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum jogo encontrado</td></tr>';
        return;
      }

      // Renderizar jogos com dados normalizados
      tbody.innerHTML = allGames.map(jogo => {
        const imagemUrl = jogo.imagem || 'images/default.jpg';
        const avaliacaoMedia = jogo.avaliacao_media || 0;
        const empresaNome = jogo.empresa_nome || '-';

        return `
          <tr>
            <td>${jogo.id}</td>
            <td><img src="${imagemUrl}" alt="${jogo.titulo}" class="game-image"></td>
            <td>${jogo.titulo}</td>
            <td>${formatCurrency(jogo.preco)}</td>
            <td>${jogo.categoria}</td>
            <td>${empresaNome}</td>
            <td>${avaliacaoMedia.toFixed(1)} ⭐</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn view" onclick="viewGame(${jogo.id})">Ver</button>
                <button class="action-btn edit" onclick="editGame(${jogo.id})">Editar</button>
                <button class="action-btn delete" onclick="deleteGame(${jogo.id})">Excluir</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Erro ao carregar jogos</td></tr>';
    }
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Erro ao conectar com servidor</td></tr>';
  }
}

// View game details
async function viewGame(gameId) {
  try {
    const result = await GameAPI.getById(gameId);

    if (!result.success || !result.data) {
      showError('Jogo não encontrado');
      return;
    }

    const jogo = result.data;

    // Carregar avaliações do jogo
    const reviewsResult = await ReviewAPI.getByGame(gameId);
    const reviews = reviewsResult.success && reviewsResult.data ? reviewsResult.data : [];

    // Calcular estatísticas de vendas
    let totalSales = 0;
    let totalRevenue = 0;
    allSales.forEach(venda => {
      const itens = venda.itens || [];
      itens.forEach(item => {
        if (item.jogo_id === gameId) {
          totalSales += item.quantidade || 0;
          totalRevenue += (item.preco_unitario || 0) * (item.quantidade || 0);
        }
      });
    });

    const imagemUrl = jogo.imagem || jogo.imagens || 'images/default.jpg';
    const avaliacaoMedia = jogo.avaliacao_media || 0;
    const empresaNome = jogo.empresa_nome || jogo.empresa?.nome || '-';

    const content = `
      <div class="detail-section">
        <img src="${imagemUrl}" alt="${jogo.titulo}" class="detail-game-image">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Título</div>
            <div class="detail-value">${jogo.titulo}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Preço</div>
            <div class="detail-value">${formatCurrency(jogo.preco)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Categoria</div>
            <div class="detail-value">${jogo.categoria}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Empresa</div>
            <div class="detail-value">${empresaNome}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Ano</div>
            <div class="detail-value">${jogo.ano || '-'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Avaliação Média</div>
            <div class="detail-value">${avaliacaoMedia.toFixed(1)} ⭐</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Destaque</div>
            <div class="detail-value">${jogo.destaque ? 'Sim' : 'Não'}</div>
          </div>
        </div>
        <div class="detail-item" style="margin-top: var(--spacing-lg);">
          <div class="detail-label">Descrição</div>
          <div class="detail-value" style="font-weight: normal; line-height: 1.6;">${jogo.descricao}</div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Estatísticas de Vendas</h3>
        <div class="stats-summary">
          <div class="stat-box">
            <div class="stat-box-label">Unidades Vendidas</div>
            <div class="stat-box-value">${totalSales}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">Receita Total</div>
            <div class="stat-box-value">${formatCurrency(totalRevenue)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">Total de Avaliações</div>
            <div class="stat-box-value">${reviews.length}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Avaliações (${reviews.length})</h3>
        ${reviews.length === 0 ? '<div class="empty-state">Nenhuma avaliação ainda</div>' : reviews.map(review => {
          const avatarUrl = review.avatar_usuario || generateAvatar(review.nome_usuario);
          const nomeUsuario = review.nome_usuario || 'Usuário';
          const nota = review.nota || 0;
          const comentario = review.comentario || '';
          const dataCriacao = review.data_criacao || new Date().toISOString();

          return `
            <div class="review-card">
              <div class="review-header">
                <img src="${avatarUrl}" alt="${nomeUsuario}" class="review-avatar">
                <div class="review-info">
                  <div class="review-user">${nomeUsuario}</div>
                  <div class="review-date">${formatDate(dataCriacao)}</div>
                </div>
                <div class="review-rating">${generateStarRating(nota)}</div>
              </div>
              <div class="review-comment">${comentario}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('viewGameContent').innerHTML = content;
    openModal('viewGameModal');
  } catch (error) {
    console.error('Erro ao visualizar jogo:', error);
    showError('Erro ao carregar dados do jogo');
  }
}

// Create game
async function createGame() {
  document.getElementById('gameFormTitle').textContent = 'Criar Novo Jogo';
  document.getElementById('gameFormSubmitBtn').textContent = 'Criar Jogo';
  document.getElementById('gameForm').reset();
  document.getElementById('gameFormId').value = '';

  // Load companies into dropdown
  await loadCompaniesDropdown();

  openModal('gameFormModal');
}

// Edit game
async function editGame(gameId) {
  const jogo = allGames.find(g => g.id === gameId);
  if (!jogo) {
    showError('Jogo não encontrado');
    return;
  }

  document.getElementById('gameFormTitle').textContent = 'Editar Jogo';
  document.getElementById('gameFormSubmitBtn').textContent = 'Salvar Alterações';
  document.getElementById('gameFormId').value = jogo.id;
  document.getElementById('gameTitle').value = jogo.titulo;
  document.getElementById('gamePrice').value = jogo.preco;
  document.getElementById('gameYear').value = jogo.ano || new Date().getFullYear();
  document.getElementById('gameCategory').value = jogo.fk_categoria || jogo.categoria_id || '';
  document.getElementById('gameImage').value = jogo.imagem || jogo.imagens || '';
  document.getElementById('gameDescription').value = jogo.descricao;
  document.getElementById('gameFeatured').checked = jogo.destaque || false;

  // Load companies and set selected
  await loadCompaniesDropdown();
  document.getElementById('gameCompany').value = jogo.fk_empresa || jogo.empresa_id || '';

  openModal('gameFormModal');
}

// Load companies into dropdown
async function loadCompaniesDropdown() {
  const select = document.getElementById('gameCompany');

  try {
    const result = await CompanyAPI.getAll();

    if (result.success && result.data) {
      allCompanies = result.data;

      select.innerHTML = '<option value="">Selecione...</option>' +
        allCompanies.map(empresa => `<option value="${empresa.id}">${empresa.nome}</option>`).join('');
    } else {
      select.innerHTML = '<option value="">Erro ao carregar empresas</option>';
    }
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    select.innerHTML = '<option value="">Erro ao carregar empresas</option>';
  }
}

// Delete game
async function deleteGame(gameId) {
  if (!confirm('Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const result = await GameAPI.delete(gameId);

    if (result.success) {
      showSuccess('Jogo excluído com sucesso');
      await loadGames();
      await loadDashboard(); // Reload charts
    } else {
      showError(result.error || 'Erro ao excluir jogo');
    }
  } catch (error) {
    console.error('Erro ao excluir jogo:', error);
    showError('Erro ao conectar com servidor');
  }
}

// ==================== MODAL MANAGEMENT ====================

// Setup all modals
function setupModals() {
  // Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
      closeModal(this.dataset.modal);
    });
  });

  // Cancel buttons
  document.querySelectorAll('.btn-secondary[data-modal]').forEach(btn => {
    btn.addEventListener('click', function() {
      closeModal(this.dataset.modal);
    });
  });

  // Click outside to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Open create user modal
  document.getElementById('openCreateUserModal').addEventListener('click', function() {
    document.getElementById('createUserForm').reset();
    openModal('createUserModal');
  });

  // Open create game modal
  document.getElementById('openCreateGameModal').addEventListener('click', createGame);

  // Open create company modal
  document.getElementById('openCreateCompanyModal').addEventListener('click', createCompany);

  // Form submissions
  document.getElementById('createUserForm').addEventListener('submit', handleCreateUser);
  document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
  document.getElementById('gameForm').addEventListener('submit', handleGameForm);
  document.getElementById('companyForm').addEventListener('submit', handleCompanyForm);
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.body.style.overflow = '';
}

// Handle create user form
async function handleCreateUser(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Usar apenas campos suportados por /auth/register
  const userData = {
    nome: formData.get('name'),
    email: formData.get('email'),
    senha: formData.get('password')
    // Telefone e perfil removidos - não suportados por /auth/register
  };

  try {
    const result = await UserAPI.create(userData);

    if (result.success) {
      showSuccess('Usuário criado com sucesso (perfil: Cliente)');
      closeModal('createUserModal');
      e.target.reset();
      await loadUsers();
    } else {
      showError(result.error || result.message || 'Erro ao criar usuário');
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    showError('Erro ao conectar com servidor');
  }
}

// Handle edit user form
async function handleEditUser(e) {
  e.preventDefault();
  const userId = parseInt(document.getElementById('editUserId').value);
  const formData = new FormData(e.target);

  // Usar campos do backend
  const userData = {
    nome: formData.get('name'),
    email: formData.get('email'),
    telefone: formData.get('phone'),
    perfil: formData.get('role')
  };

  // Only update password if provided
  const password = formData.get('password');
  if (password) {
    userData.senha = password;
  }

  try {
    const result = await UserAPI.update(userId, userData);

    if (result.success) {
      showSuccess('Usuário atualizado com sucesso');
      closeModal('editUserModal');
      await loadUsers();
    } else {
      showError(result.error || 'Erro ao atualizar usuário');
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    showError('Erro ao conectar com servidor');
  }
}

// Handle game form (create/edit)
async function handleGameForm(e) {
  e.preventDefault();
  const gameId = document.getElementById('gameFormId').value;
  const formData = new FormData(e.target);

  // Preparar dados no formato do backend
  const gameData = {
    nome: formData.get('title'),
    descricao: formData.get('description'),
    preco: parseFloat(formData.get('price')),
    ano: parseInt(formData.get('year')),
    fkCategoria: parseInt(formData.get('category')),
    fkEmpresa: parseInt(formData.get('company')),
    imagem: formData.get('image'),
    destaque: formData.get('featured') === 'on'
  };

  try {
    let result;
    if (gameId) {
      // Edit existing game
      result = await GameAPI.update(parseInt(gameId), gameData);
    } else {
      // Create new game
      result = await GameAPI.create(gameData);
    }

    if (result.success) {
      showSuccess(gameId ? 'Jogo atualizado com sucesso' : 'Jogo criado com sucesso');
      closeModal('gameFormModal');
      await loadGames();
      await loadDashboard(); // Reload charts
    } else {
      showError(result.error || 'Erro ao salvar jogo');
    }
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    showError('Erro ao conectar com servidor');
  }
}

// ==================== COMPANY MANAGEMENT ====================

// Load all companies
async function loadCompanies() {
  const tbody = document.getElementById('companiesTableBody');

  try {
    const result = await CompanyAPI.getAll();

    if (result.success && result.data) {
      allCompanies = result.data;

      if (allCompanies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhuma empresa encontrada</td></tr>';
        return;
      }

      // Backend retorna apenas: id, nome
      tbody.innerHTML = allCompanies.map(empresa => `
        <tr>
          <td>${empresa.id}</td>
          <td>${empresa.nome}</td>
          <td>
            <div class="action-buttons">
              <button class="action-btn view" onclick="viewCompany(${empresa.id})">Ver</button>
              <button class="action-btn edit" onclick="editCompany(${empresa.id})">Editar</button>
              <button class="action-btn delete" onclick="deleteCompany(${empresa.id})">Excluir</button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Erro ao carregar empresas</td></tr>';
    }
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Erro ao conectar com servidor</td></tr>';
  }
}

// View company details
async function viewCompany(companyId) {
  try {
    const result = await CompanyAPI.getById(companyId);

    if (!result.success || !result.data) {
      showError('Empresa não encontrada');
      return;
    }

    const empresa = result.data;

    // Filtrar jogos desta empresa
    const jogosEmpresa = allGames.filter(jogo =>
      jogo.fk_empresa === companyId || jogo.empresa_id === companyId
    );

    const content = `
      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">ID</div>
            <div class="detail-value">${empresa.id}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Nome</div>
            <div class="detail-value">${empresa.nome}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Jogos da Empresa (${jogosEmpresa.length})</h3>
        ${jogosEmpresa.length === 0 ? '<div class="empty-state">Nenhum jogo cadastrado</div>' : `
          <div class="games-list">
            ${jogosEmpresa.map(jogo => `
              <div class="game-item">
                <strong>${jogo.titulo}</strong> - ${formatCurrency(jogo.preco)}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    document.getElementById('viewCompanyContent').innerHTML = content;
    openModal('viewCompanyModal');
  } catch (error) {
    console.error('Erro ao visualizar empresa:', error);
    showError('Erro ao carregar dados da empresa');
  }
}

// Create company
function createCompany() {
  document.getElementById('companyFormTitle').textContent = 'Criar Nova Empresa';
  document.getElementById('companyFormSubmitBtn').textContent = 'Criar Empresa';
  document.getElementById('companyForm').reset();
  document.getElementById('companyFormId').value = '';
  openModal('companyFormModal');
}

// Edit company
function editCompany(companyId) {
  const empresa = allCompanies.find(c => c.id === companyId);
  if (!empresa) {
    showError('Empresa não encontrada');
    return;
  }

  document.getElementById('companyFormTitle').textContent = 'Editar Empresa';
  document.getElementById('companyFormSubmitBtn').textContent = 'Salvar Alterações';
  document.getElementById('companyFormId').value = empresa.id;
  document.getElementById('companyName').value = empresa.nome;

  openModal('companyFormModal');
}

// Delete company
async function deleteCompany(companyId) {
  if (!confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const result = await CompanyAPI.delete(companyId);

    if (result.success) {
      showSuccess('Empresa excluída com sucesso');
      await loadCompanies();
    } else {
      showError(result.error || 'Erro ao excluir empresa');
    }
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    showError('Erro ao conectar com servidor');
  }
}

// Handle company form (create/edit)
async function handleCompanyForm(e) {
  e.preventDefault();
  const companyId = document.getElementById('companyFormId').value;
  const formData = new FormData(e.target);

  // Backend espera apenas: { nome: "..." }
  const companyData = {
    nome: formData.get('name')
  };

  try {
    let result;
    if (companyId) {
      // Edit existing company
      result = await CompanyAPI.update(parseInt(companyId), companyData);
    } else {
      // Create new company
      result = await CompanyAPI.create(companyData);
    }

    if (result.success) {
      showSuccess(companyId ? 'Empresa atualizada com sucesso' : 'Empresa criada com sucesso');
      closeModal('companyFormModal');
      await loadCompanies();
    } else {
      showError(result.error || 'Erro ao salvar empresa');
    }
  } catch (error) {
    console.error('Erro ao salvar empresa:', error);
    showError('Erro ao conectar com servidor');
  }
}
