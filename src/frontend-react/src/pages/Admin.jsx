import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import FileInput from '../components/ui/FileInput';
import { useToast } from '../hooks/useToast';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { GameAPI, UserAPI, CompanyAPI, SaleAPI, CartAPI, ReviewAPI } from '../services/api';
import { formatCurrency, formatDate, getGameImage, generateAvatar, setGameImage, toSnakeCase, debugGameImages, clearDynamicImages } from '../utils/helpers';
import { Chart } from 'chart.js/auto';
import './Admin.css';

export default function Admin() {
  const { showSuccess, showError } = useToast();
  const { getCategoryName, categories } = useCategory();
  const { getCompanyName, companies, fetchCompanies } = useCompany();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [sales, setSales] = useState([]);

  // Charts
  const [topGamesChart, setTopGamesChart] = useState(null);
  const [categoriesChart, setCategoriesChart] = useState(null);
  const [brandsChart, setBrandsChart] = useState(null);

  // Modals
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Confirm Dialogs
  const [showDeleteGameDialog, setShowDeleteGameDialog] = useState(false);
  const [showDeleteCompanyDialog, setShowDeleteCompanyDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [gamesPage, setGamesPage] = useState(1);
  const [companiesPage, setCompaniesPage] = useState(1);
  const itemsPerPage = 10;

  // Paginated data
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * itemsPerPage;
    return users.slice(start, start + itemsPerPage);
  }, [users, usersPage]);

  const paginatedGames = useMemo(() => {
    const start = (gamesPage - 1) * itemsPerPage;
    return games.slice(start, start + itemsPerPage);
  }, [games, gamesPage]);

  const paginatedCompanies = useMemo(() => {
    const start = (companiesPage - 1) * itemsPerPage;
    return companies.slice(start, start + itemsPerPage);
  }, [companies, companiesPage]);

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

  const [selectedGameImage, setSelectedGameImage] = useState(null);

  const [companyFormData, setCompanyFormData] = useState({
    nome: ''
  });

  const [userFormData, setUserFormData] = useState({
    nome: '',
    fkPerfil: 2
  });

  // Helper function to get profile name from ID
  const getProfileName = (fkPerfil) => {
    return fkPerfil === 1 ? 'Administrador' : 'Cliente';
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' && sales.length > 0 && games.length > 0) {
      renderCharts();
    }
  }, [activeTab, sales, games]);

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadGames(),
      loadSales()
    ]);
  };

  const loadUsers = async () => {
    try {
      const result = await UserAPI.getAll();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        showError('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Erro ao conectar com servidor');
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
          const empresaNome = getCompanyName(jogo.fkEmpresa);
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
    setSelectedGameImage(null);
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
        // Processar imagem se foi selecionada
        if (selectedGameImage) {
          const gameName = gameFormData.nome;
          const fileExtension = selectedGameImage.name.split('.').pop();
          const snakeCaseName = toSnakeCase(gameName);
          const newFileName = `${snakeCaseName}.${fileExtension}`;
          const imagePath = `/uploaded-games/${newFileName}`;

          // Fazer download automático da imagem renomeada
          const url = URL.createObjectURL(selectedGameImage);
          const a = document.createElement('a');
          a.href = url;
          a.download = newFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Salvar mapeamento no localStorage
          setGameImage(gameName, imagePath);

          // Mostrar instrução
          showSuccess(
            `Jogo ${editingGame ? 'atualizado' : 'criado'}! ` +
            `IMPORTANTE: Mova o arquivo "${newFileName}" para a pasta "public/uploaded-games/"`
          );
        } else {
          showSuccess(editingGame ? 'Jogo atualizado!' : 'Jogo criado!');
        }

        setShowGameModal(false);
        setSelectedGameImage(null);
        await loadGames();
        await loadSales();
      } else {
        showError(result.error || 'Erro ao salvar jogo');
      }
    } catch (error) {
      showError('Erro ao salvar jogo');
    }
  };

  const handleDeleteGame = (game) => {
    setItemToDelete({ type: 'game', id: game.id, name: game.nome || game.titulo });
    setShowDeleteGameDialog(true);
  };

  const confirmDeleteGame = async () => {
    if (!itemToDelete) return;

    try {
      const result = await GameAPI.delete(itemToDelete.id);
      if (result.success) {
        showSuccess('Jogo excluído!');
        await loadGames();
        setShowDeleteGameDialog(false);
        setItemToDelete(null);
      } else {
        showError(result.error || 'Erro ao excluir jogo');
        setShowDeleteGameDialog(false);
        setItemToDelete(null);
      }
    } catch (error) {
      showError('Erro ao excluir jogo');
      setShowDeleteGameDialog(false);
      setItemToDelete(null);
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
        await fetchCompanies();
      } else {
        showError(result.error || 'Erro ao salvar empresa');
      }
    } catch (error) {
      showError('Erro ao salvar empresa');
    }
  };

  const handleDeleteCompany = (company) => {
    setItemToDelete({ type: 'company', id: company.id, name: company.nome });
    setShowDeleteCompanyDialog(true);
  };

  const confirmDeleteCompany = async () => {
    if (!itemToDelete) return;

    try {
      const result = await CompanyAPI.delete(itemToDelete.id);
      if (result.success) {
        showSuccess('Empresa excluída!');
        await fetchCompanies();
        setShowDeleteCompanyDialog(false);
        setItemToDelete(null);
      } else {
        showError(result.error || 'Erro ao excluir empresa');
        setShowDeleteCompanyDialog(false);
        setItemToDelete(null);
      }
    } catch (error) {
      showError('Erro ao excluir empresa');
      setShowDeleteCompanyDialog(false);
      setItemToDelete(null);
    }
  };

  // User Management
  const handleOpenUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      nome: user.nome,
      fkPerfil: user.fkPerfil
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      const result = await UserAPI.update(editingUser.id, userFormData);

      if (result.success) {
        showSuccess('Usuário atualizado!');
        setShowUserModal(false);
        await loadUsers();
      } else {
        showError(result.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      showError('Erro ao atualizar usuário');
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const newProfileId = user.fkPerfil === 1 ? 2 : 1;
      const profileName = newProfileId === 1 ? 'Administrador' : 'Cliente';

      const result = await UserAPI.update(user.id, {
        nome: user.nome,
        fkPerfil: newProfileId
      });

      if (result.success) {
        showSuccess(`Usuário ${newProfileId === 1 ? 'promovido' : 'despromovido'} para ${profileName}!`);
        await loadUsers();
      } else {
        showError(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      showError('Erro ao atualizar perfil');
    }
  };

  const cancelDelete = () => {
    setShowDeleteGameDialog(false);
    setShowDeleteCompanyDialog(false);
    setItemToDelete(null);
  };

  // Debug functions for images
  const handleDebugImages = () => {
    const mappings = debugGameImages();
    showSuccess(`Debug completo! Verifique o console (F12) para detalhes. Total: ${Object.keys(mappings).length} mapeamentos`);
  };

  const handleClearImages = () => {
    if (window.confirm('Tem certeza que deseja limpar TODOS os mapeamentos de imagens dinâmicas?')) {
      clearDynamicImages();
      showSuccess('Mapeamentos de imagens limpos! Recarregue a página.');
    }
  };

  return (
    <Layout>
      <div className="admin-page">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
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
                  <div className="chart-wrapper">
                    <canvas id="topGamesChart"></canvas>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Vendas por Categoria</h3>
                  <div className="chart-wrapper">
                    <canvas id="categoriesChart"></canvas>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Vendas por Empresa</h3>
                  <div className="chart-wrapper">
                    <canvas id="brandsChart"></canvas>
                  </div>
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
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(user => (
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
                            {user.fkPerfil === 1 ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Button
                              size="small"
                              onClick={() => handleOpenUserModal(user)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="small"
                              variant={user.fkPerfil === 1 ? "secondary" : "primary"}
                              onClick={() => handleToggleAdmin(user)}
                            >
                              {user.fkPerfil === 1 ? 'Despromover' : 'Promover'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 0 && (
                  <Pagination
                    currentPage={usersPage}
                    totalPages={Math.ceil(users.length / itemsPerPage)}
                    onPageChange={setUsersPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={users.length}
                  />
                )}
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="admin-tab-content">
              <div style={{ marginBottom: '16px' }}>
                <Button onClick={() => handleOpenGameModal()}>Criar Novo Jogo</Button>
              </div>
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
                    {paginatedGames.map(game => (
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
                              onClick={() => handleDeleteGame(game)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {games.length > 0 && (
                  <Pagination
                    currentPage={gamesPage}
                    totalPages={Math.ceil(games.length / itemsPerPage)}
                    onPageChange={setGamesPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={games.length}
                  />
                )}
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
                    {paginatedCompanies.map(company => (
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
                              onClick={() => handleDeleteCompany(company)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {companies.length > 0 && (
                  <Pagination
                    currentPage={companiesPage}
                    totalPages={Math.ceil(companies.length / itemsPerPage)}
                    onPageChange={setCompaniesPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={companies.length}
                  />
                )}
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
            options={categories.map(cat => ({ value: cat.id, label: cat.nome }))}
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
          <FileInput
            label="Imagem do Jogo"
            onChange={setSelectedGameImage}
          />
          {selectedGameImage && (
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginTop: '-8px',
              marginBottom: '12px',
              padding: '8px',
              background: 'var(--bg-secondary)',
              borderRadius: '4px'
            }}>
              ℹ️ A imagem será baixada automaticamente. Mova-a para a pasta <code>public/uploaded-games/</code>
            </div>
          )}
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

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Editar Usuário' : 'Gerenciar Usuário'}
      >
        <form onSubmit={handleSaveUser} className="admin-form">
          <Input
            label="Nome"
            value={userFormData.nome}
            onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
            required
          />
          <Select
            label="Perfil"
            value={userFormData.fkPerfil}
            onChange={(e) => setUserFormData({ ...userFormData, fkPerfil: Number(e.target.value) })}
            options={[
              { value: 1, label: 'Administrador' },
              { value: 2, label: 'Cliente' }
            ]}
            required
          />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog - Delete Game */}
      <ConfirmDialog
        isOpen={showDeleteGameDialog}
        onConfirm={confirmDeleteGame}
        onCancel={cancelDelete}
        title="Excluir Jogo"
        message={`Tem certeza que deseja excluir o jogo "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Confirm Dialog - Delete Company */}
      <ConfirmDialog
        isOpen={showDeleteCompanyDialog}
        onConfirm={confirmDeleteCompany}
        onCancel={cancelDelete}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${itemToDelete?.name}"? Esta ação não pode ser desfeita e pode afetar jogos associados.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </Layout>
  );
}
