import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { GameAPI, UserAPI, CompanyAPI, SaleAPI, CartAPI, ReviewAPI } from '../services/api';
import { formatCurrency, formatDate, getGameImage, generateAvatar } from '../utils/helpers';
import { Chart } from 'chart.js/auto';
import './Admin.css';

const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function Admin() {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sales, setSales] = useState([]);

  // Charts
  const [topGamesChart, setTopGamesChart] = useState(null);
  const [categoriesChart, setCategoriesChart] = useState(null);
  const [brandsChart, setBrandsChart] = useState(null);

  // Modals
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);

  // Form data
  const [gameFormData, setGameFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    ano: new Date().getFullYear(),
    fkCategoria: '',
    fkEmpresa: '',
    destaque: false
  });

  const [companyFormData, setCompanyFormData] = useState({
    nome: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' && sales.length > 0 && games.length > 0) {
      renderCharts();
    }
  }, [activeTab, sales, games, companies]);

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadGames(),
      loadCompanies(),
      loadSales()
    ]);
  };

  const loadUsers = async () => {
    try {
      // Get all sales to extract user IDs
      const salesResult = await SaleAPI.getAll();
      if (!salesResult.success) return;

      const userIds = new Set();
      salesResult.data.forEach(venda => {
        const userId = venda.fk_usuario || venda.fkUsuario;
        if (userId) userIds.add(userId);
      });

      // Fetch each user
      const userPromises = Array.from(userIds).map(id => UserAPI.getById(id));
      const userResults = await Promise.all(userPromises);

      const validUsers = userResults
        .filter(result => result.success && result.data)
        .map(result => result.data);

      setUsers(validUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadGames = async () => {
    try {
      const result = await GameAPI.getAll();
      if (result.success) {
        setGames(result.data);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const result = await CompanyAPI.getAll();
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadSales = async () => {
    try {
      const salesResult = await SaleAPI.getAll();
      if (!salesResult.success) return;

      const cartsResult = await CartAPI.getAll();
      let finalizedCarts = [];

      if (cartsResult.success && cartsResult.data?.carrinhosComItens) {
        finalizedCarts = cartsResult.data.carrinhosComItens.filter(c => c.status === 'F');
      }

      const salesWithItems = salesResult.data.map(venda => {
        const cart = finalizedCarts.find(c => c.fkVenda === venda.id);
        const items = cart?.itens || [];

        const itemsWithGames = items.map(item => {
          const jogo = games.find(g => g.id === item.fkJogo);
          return {
            ...item,
            jogo,
            jogo_id: item.fkJogo,
            quantidade: 1,
            preco_unitario: jogo?.preco || 0
          };
        });

        return { ...venda, itens: itemsWithGames };
      });

      setSales(salesWithItems);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const renderCharts = () => {
    // Calculate top games
    const gameSales = {};
    sales.forEach(venda => {
      venda.itens?.forEach(item => {
        const jogoId = item.jogo_id;
        if (!gameSales[jogoId]) {
          const jogo = item.jogo || games.find(g => g.id === jogoId) || {};
          gameSales[jogoId] = {
            title: jogo.nome || jogo.titulo || 'Desconhecido',
            quantity: 0,
            revenue: 0
          };
        }
        gameSales[jogoId].quantity += item.quantidade || 1;
        gameSales[jogoId].revenue += (item.preco_unitario || 0) * (item.quantidade || 1);
      });
    });

    const topGames = Object.values(gameSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate by category
    const categorySales = {};
    sales.forEach(venda => {
      venda.itens?.forEach(item => {
        const jogo = item.jogo || games.find(g => g.id === item.jogo_id);
        if (jogo) {
          const categoria = getCategoryName(jogo.fkCategoria);
          if (!categorySales[categoria]) {
            categorySales[categoria] = { name: categoria, quantity: 0, revenue: 0 };
          }
          categorySales[categoria].quantity += item.quantidade || 1;
          categorySales[categoria].revenue += (item.preco_unitario || 0) * (item.quantidade || 1);
        }
      });
    });

    const topCategories = Object.values(categorySales).sort((a, b) => b.quantity - a.quantity);

    // Calculate by brand
    const brandSales = {};
    sales.forEach(venda => {
      venda.itens?.forEach(item => {
        const jogo = item.jogo || games.find(g => g.id === item.jogo_id);
        if (jogo && jogo.fkEmpresa) {
          const empresa = companies.find(e => e.id === jogo.fkEmpresa);
          const empresaNome = empresa?.nome || `Empresa ${jogo.fkEmpresa}`;
          if (!brandSales[empresaNome]) {
            brandSales[empresaNome] = { name: empresaNome, quantity: 0, revenue: 0 };
          }
          brandSales[empresaNome].quantity += item.quantidade || 1;
          brandSales[empresaNome].revenue += (item.preco_unitario || 0) * (item.quantidade || 1);
        }
      });
    });

    const topBrands = Object.values(brandSales).sort((a, b) => b.quantity - a.quantity);

    // Render charts
    renderTopGamesChart(topGames);
    renderCategoriesChart(topCategories);
    renderBrandsChart(topBrands);
  };

  const renderTopGamesChart = (data) => {
    const canvas = document.getElementById('topGamesChart');
    if (!canvas) return;

    if (topGamesChart) topGamesChart.destroy();

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(g => g.title),
        datasets: [{
          label: 'Unidades Vendidas',
          data: data.map(g => g.quantity),
          backgroundColor: 'rgba(189, 178, 255, 0.8)',
          borderColor: 'rgba(189, 178, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

    setTopGamesChart(chart);
  };

  const renderCategoriesChart = (data) => {
    const canvas = document.getElementById('categoriesChart');
    if (!canvas) return;

    if (categoriesChart) categoriesChart.destroy();

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(c => c.name),
        datasets: [{
          data: data.map(c => c.quantity),
          backgroundColor: [
            'rgba(189, 178, 255, 0.8)',
            'rgba(255, 178, 189, 0.8)',
            'rgba(178, 255, 189, 0.8)',
            'rgba(255, 220, 178, 0.8)',
            'rgba(178, 220, 255, 0.8)',
            'rgba(255, 178, 220, 0.8)'
          ],
          borderColor: '#2C2C2E',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    setCategoriesChart(chart);
  };

  const renderBrandsChart = (data) => {
    const canvas = document.getElementById('brandsChart');
    if (!canvas) return;

    if (brandsChart) brandsChart.destroy();

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(b => b.name),
        datasets: [{
          label: 'Unidades Vendidas',
          data: data.map(b => b.quantity),
          backgroundColor: 'rgba(189, 178, 255, 0.8)',
          borderColor: 'rgba(189, 178, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

    setBrandsChart(chart);
  };

  // Game CRUD
  const handleOpenGameModal = (game = null) => {
    if (game) {
      setEditingGame(game);
      setGameFormData({
        nome: game.nome || game.titulo || '',
        descricao: game.descricao || '',
        preco: game.preco || '',
        ano: game.ano || new Date().getFullYear(),
        fkCategoria: game.fkCategoria || '',
        fkEmpresa: game.fkEmpresa || '',
        destaque: game.destaque || false
      });
    } else {
      setEditingGame(null);
      setGameFormData({
        nome: '',
        descricao: '',
        preco: '',
        ano: new Date().getFullYear(),
        fkCategoria: '',
        fkEmpresa: '',
        destaque: false
      });
    }
    setShowGameModal(true);
  };

  const handleSaveGame = async (e) => {
    e.preventDefault();

    try {
      const data = {
        nome: gameFormData.nome,
        descricao: gameFormData.descricao,
        preco: parseFloat(gameFormData.preco),
        ano: parseInt(gameFormData.ano),
        fkCategoria: parseInt(gameFormData.fkCategoria),
        fkEmpresa: parseInt(gameFormData.fkEmpresa),
        destaque: gameFormData.destaque
      };

      let result;
      if (editingGame) {
        result = await GameAPI.update(editingGame.id, data);
      } else {
        result = await GameAPI.create(data);
      }

      if (result.success) {
        showSuccess(editingGame ? 'Jogo atualizado!' : 'Jogo criado!');
        setShowGameModal(false);
        await loadGames();
        await loadSales();
      } else {
        showError(result.error || 'Erro ao salvar jogo');
      }
    } catch (error) {
      showError('Erro ao salvar jogo');
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este jogo?')) return;

    try {
      const result = await GameAPI.delete(id);
      if (result.success) {
        showSuccess('Jogo excluído!');
        await loadGames();
      } else {
        showError(result.error || 'Erro ao excluir jogo');
      }
    } catch (error) {
      showError('Erro ao excluir jogo');
    }
  };

  // Company CRUD
  const handleOpenCompanyModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setCompanyFormData({ nome: company.nome });
    } else {
      setEditingCompany(null);
      setCompanyFormData({ nome: '' });
    }
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (editingCompany) {
        result = await CompanyAPI.update(editingCompany.id, companyFormData);
      } else {
        result = await CompanyAPI.create(companyFormData);
      }

      if (result.success) {
        showSuccess(editingCompany ? 'Empresa atualizada!' : 'Empresa criada!');
        setShowCompanyModal(false);
        await loadCompanies();
      } else {
        showError(result.error || 'Erro ao salvar empresa');
      }
    } catch (error) {
      showError('Erro ao salvar empresa');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      const result = await CompanyAPI.delete(id);
      if (result.success) {
        showSuccess('Empresa excluída!');
        await loadCompanies();
      } else {
        showError(result.error || 'Erro ao excluir empresa');
      }
    } catch (error) {
      showError('Erro ao excluir empresa');
    }
  };

  return (
    <Layout>
      <div className="admin-page">
        <div className="container">
          <h1 className="admin-title">Painel Administrativo</h1>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Usuários
            </button>
            <button
              className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
              onClick={() => setActiveTab('games')}
            >
              Jogos
            </button>
            <button
              className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveTab('companies')}
            >
              Empresas
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="admin-tab-content">
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Top 5 Jogos Mais Vendidos</h3>
                  <canvas id="topGamesChart" height="300"></canvas>
                </div>
                <div className="chart-card">
                  <h3>Vendas por Categoria</h3>
                  <canvas id="categoriesChart" height="300"></canvas>
                </div>
                <div className="chart-card">
                  <h3>Vendas por Empresa</h3>
                  <canvas id="brandsChart" height="300"></canvas>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="admin-tab-content">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Avatar</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Perfil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <img
                            src={generateAvatar(user.nome)}
                            alt={user.nome}
                            className="user-avatar"
                          />
                        </td>
                        <td>{user.nome}</td>
                        <td>{user.email}</td>
                        <td>{user.telefone || '-'}</td>
                        <td>
                          <span className="role-badge">
                            {user.perfil === 'Administrador' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="admin-tab-content">
              <Button onClick={() => handleOpenGameModal()}>Criar Novo Jogo</Button>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagem</th>
                      <th>Título</th>
                      <th>Preço</th>
                      <th>Categoria</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game.id}>
                        <td>{game.id}</td>
                        <td>
                          <img
                            src={getGameImage(game.nome || game.titulo)}
                            alt={game.nome || game.titulo}
                            className="game-image"
                          />
                        </td>
                        <td>{game.nome || game.titulo}</td>
                        <td>{formatCurrency(game.preco)}</td>
                        <td>{getCategoryName(game.fkCategoria)}</td>
                        <td>
                          <div className="action-buttons">
                            <Button size="small" onClick={() => handleOpenGameModal(game)}>
                              Editar
                            </Button>
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() => handleDeleteGame(game.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="admin-tab-content">
              <Button onClick={() => handleOpenCompanyModal()}>Criar Nova Empresa</Button>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company.id}>
                        <td>{company.id}</td>
                        <td>{company.nome}</td>
                        <td>
                          <div className="action-buttons">
                            <Button size="small" onClick={() => handleOpenCompanyModal(company)}>
                              Editar
                            </Button>
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Modal */}
      <Modal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        title={editingGame ? 'Editar Jogo' : 'Criar Novo Jogo'}
      >
        <form onSubmit={handleSaveGame} className="admin-form">
          <Input
            label="Título"
            value={gameFormData.nome}
            onChange={(e) => setGameFormData({ ...gameFormData, nome: e.target.value })}
            required
          />
          <Input
            label="Preço"
            type="number"
            step="0.01"
            value={gameFormData.preco}
            onChange={(e) => setGameFormData({ ...gameFormData, preco: e.target.value })}
            required
          />
          <Input
            label="Ano"
            type="number"
            value={gameFormData.ano}
            onChange={(e) => setGameFormData({ ...gameFormData, ano: e.target.value })}
            required
          />
          <Select
            label="Categoria"
            value={gameFormData.fkCategoria}
            onChange={(e) => setGameFormData({ ...gameFormData, fkCategoria: e.target.value })}
            options={Object.entries(CATEGORIAS).map(([id, name]) => ({ value: id, label: name }))}
            required
          />
          <Select
            label="Empresa"
            value={gameFormData.fkEmpresa}
            onChange={(e) => setGameFormData({ ...gameFormData, fkEmpresa: e.target.value })}
            options={companies.map(c => ({ value: c.id, label: c.nome }))}
            required
          />
          <textarea
            placeholder="Descrição"
            value={gameFormData.descricao}
            onChange={(e) => setGameFormData({ ...gameFormData, descricao: e.target.value })}
            rows={4}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={gameFormData.destaque}
              onChange={(e) => setGameFormData({ ...gameFormData, destaque: e.target.checked })}
            />
            Destaque
          </label>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowGameModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Company Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title={editingCompany ? 'Editar Empresa' : 'Criar Nova Empresa'}
      >
        <form onSubmit={handleSaveCompany} className="admin-form">
          <Input
            label="Nome"
            value={companyFormData.nome}
            onChange={(e) => setCompanyFormData({ ...companyFormData, nome: e.target.value })}
            required
          />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowCompanyModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
