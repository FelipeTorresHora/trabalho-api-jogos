// Aventurem - API Module
// Módulo responsável por fazer todas as requisições HTTP para o backend

const API = {
  /**
   * Faz uma requisição HTTP para a API
   * @param {string} endpoint - Endpoint da API (ex: '/auth/login')
   * @param {object} options - Opções da requisição (method, body, headers, etc.)
   * @returns {Promise<object>} Resposta da API
   */
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = this.getToken();

    // Configuração padrão das requisições
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Adiciona o token JWT se estiver disponível (exceto para login/register)
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Adiciona o body se existir
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    debugLog('Request:', { url, config });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      debugLog('Response:', { status: response.status, data });

      // Se a resposta não for OK, lança um erro
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || data.error || 'Erro na requisição',
          data: data
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);

      // Se for erro 401 (não autorizado), faz logout
      if (error.status === 401) {
        this.clearToken();
        Storage.remove('currentUser');

        // Redireciona para login apenas se não estiver na página de login
        if (!window.location.pathname.includes('index.html') &&
            !window.location.pathname.endsWith('/')) {
          window.location.href = 'index.html';
        }
      }

      return {
        success: false,
        error: error.message || 'Erro de conexão com o servidor',
        status: error.status
      };
    }
  },

  /**
   * Faz uma requisição GET
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  /**
   * Faz uma requisição POST
   */
  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  /**
   * Faz uma requisição PUT
   */
  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  /**
   * Faz uma requisição DELETE
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  /**
   * Salva o token JWT no localStorage
   */
  setToken(token) {
    localStorage.setItem('jwt_token', token);
    debugLog('Token saved:', token);
  },

  /**
   * Recupera o token JWT do localStorage
   */
  getToken() {
    return localStorage.getItem('jwt_token');
  },

  /**
   * Remove o token JWT do localStorage
   */
  clearToken() {
    localStorage.removeItem('jwt_token');
    debugLog('Token cleared');
  },

  /**
   * Verifica se o usuário está autenticado (tem um token válido)
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Decodifica o token JWT (sem verificação de assinatura)
   * Retorna o payload do token ou null se houver erro
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }
};

// Serviços da API organizados por domínio

/**
 * Serviço de Autenticação
 */
const AuthAPI = {
  /**
   * Faz login do usuário
   */
  async login(email, password) {
    const result = await API.post('/auth/login', { email, senha: password });

    if (result.success && result.data.token) {
      API.setToken(result.data.token);
    }

    return result;
  },

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.name - Nome completo
   * @param {string} userData.email - Email
   * @param {string} userData.password - Senha
   * @param {number} userData.perfilId - ID do perfil (1=Admin, 2=Cliente)
   */
  async register(userData) {
    return await API.post('/auth/register', {
      nome: userData.name,
      email: userData.email,
      senha: userData.password,
      perfilId: userData.perfilId || 2 // Default: Cliente
    });
  },

  /**
   * Altera a senha do usuário
   */
  async changePassword(oldPassword, newPassword) {
    return await API.put('/auth/change-password', {
      currentPassword: oldPassword,
      newPassword: newPassword
    });
  },

  /**
   * Faz logout do usuário
   */
  logout() {
    API.clearToken();
    Storage.remove('currentUser');
  }
};

/**
 * Serviço de Jogos
 */
const GameAPI = {
  /**
   * Lista todos os jogos
   */
  async getAll(filters = {}) {
    let endpoint = '/jogos';
    const params = new URLSearchParams();

    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.busca) params.append('busca', filters.busca);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await API.get(endpoint);
  },

  /**
   * Busca um jogo por ID
   */
  async getById(id) {
    return await API.get(`/jogos/${id}`);
  },

  /**
   * Cria um novo jogo (apenas admin)
   */
  async create(gameData) {
    return await API.post('/jogos', gameData);
  },

  /**
   * Atualiza um jogo (apenas admin)
   */
  async update(id, gameData) {
    return await API.put(`/jogos/${id}`, gameData);
  },

  /**
   * Remove um jogo (apenas admin)
   */
  async delete(id) {
    return await API.delete(`/jogos/${id}`);
  }
};

/**
 * Serviço de Carrinho
 */
const CartAPI = {
  /**
   * Busca o carrinho do usuário
   */
  async getAll() {
    return await API.get('/carrinho');
  },

  /**
   * Adiciona um item ao carrinho
   */
  async add(jogoId) {
    return await API.post('/carrinho/add', {
      jogoId: jogoId
    });
  },

  /**
   * Remove um item do carrinho por ID do jogo
   */
  async remove(gameId) {
    return await API.delete(`/carrinho/${gameId}`);
  }
};

/**
 * Serviço de Lista de Desejos
 */
const WishlistAPI = {
  /**
   * Busca a lista de desejos do usuário
   */
  async getAll() {
    return await API.get('/lista-desejo');
  },

  /**
   * Adiciona um jogo à lista de desejos
   */
  async add(jogoId) {
    return await API.post('/lista-desejo', { jogoId: jogoId });
  },

  /**
   * Remove um jogo da lista de desejos
   * Nota: O backend usa DELETE com body (não path param)
   */
  async remove(jogoId) {
    return await API.request('/lista-desejo', {
      method: 'DELETE',
      body: { jogoId: jogoId }
    });
  }
};

/**
 * Serviço de Vendas
 */
const SaleAPI = {
  /**
   * Finaliza uma venda (checkout)
   * Nota: O backend processa o carrinho automaticamente
   * @param {Object} paymentData - Dados de pagamento e entrega (opcional, backend atual ignora)
   */
  async create(paymentData) {
    return await API.post('/vendas/checkout', paymentData);
  },

  /**
   * Busca o histórico de vendas do usuário
   */
  async getAll() {
    return await API.get('/vendas');
  },

  /**
   * Busca uma venda específica
   */
  async getById(id) {
    return await API.get(`/vendas/${id}`);
  }
};

/**
 * Serviço de Avaliações
 */
const ReviewAPI = {
  /**
   * Lista todas as avaliações
   */
  async getAll() {
    return await API.get('/avaliacoes');
  },

  /**
   * Lista as avaliações de um jogo usando query param
   */
  async getByGame(jogoId) {
    return await API.get(`/avaliacoes?jogoId=${jogoId}`);
  },

  /**
   * Busca a média de avaliações de um jogo
   */
  async getAverage(jogoId) {
    return await API.get(`/avaliacoes/media/${jogoId}`);
  },

  /**
   * Cria uma nova avaliação
   */
  async create(jogoId, nota, comentario) {
    return await API.post('/avaliacoes', {
      jogoId: jogoId,
      nota: nota,
      comentario: comentario
    });
  },

  /**
   * Atualiza uma avaliação existente
   */
  async update(jogoId, nota, comentario) {
    return await API.put('/avaliacoes', {
      jogoId: jogoId,
      nota: nota,
      comentario: comentario
    });
  },

  /**
   * Remove uma avaliação
   */
  async delete(id) {
    return await API.delete(`/avaliacoes/${id}`);
  }
};

/**
 * Serviço de Usuários
 */
const UserAPI = {
  /**
   * Lista todos os usuários (apenas admin)
   */
  async getAll() {
    return await API.get('/usuarios');
  },

  /**
   * Busca um usuário por ID
   */
  async getById(id) {
    return await API.get(`/usuarios/${id}`);
  },

  /**
   * Cria um novo usuário (apenas admin)
   */
  async create(userData) {
    return await API.post('/usuarios', userData);
  },

  /**
   * Atualiza um usuário
   */
  async update(id, userData) {
    return await API.put(`/usuarios/${id}`, userData);
  },

  /**
   * Remove um usuário (apenas admin)
   */
  async delete(id) {
    return await API.delete(`/usuarios/${id}`);
  },

  /**
   * Busca o perfil do usuário logado
   */
  async getProfile() {
    // Obter ID do usuário do localStorage
    const currentUser = Storage.get('currentUser');
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return await API.get(`/usuarios/${currentUser.id}`);
  },

  /**
   * Atualiza o perfil do usuário logado
   */
  async updateProfile(userData) {
    // Obter ID do usuário do localStorage
    const currentUser = Storage.get('currentUser');
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return await API.put(`/usuarios/${currentUser.id}`, userData);
  }
};

/**
 * Serviço de Empresas
 */
const CompanyAPI = {
  /**
   * Lista todas as empresas
   */
  async getAll() {
    return await API.get('/empresas');
  },

  /**
   * Busca uma empresa por ID
   */
  async getById(id) {
    return await API.get(`/empresas/${id}`);
  },

  /**
   * Cria uma nova empresa (apenas admin)
   */
  async create(companyData) {
    return await API.post('/empresas', companyData);
  },

  /**
   * Atualiza uma empresa (apenas admin)
   */
  async update(id, companyData) {
    return await API.put(`/empresas/${id}`, companyData);
  },

  /**
   * Remove uma empresa (apenas admin)
   */
  async delete(id) {
    return await API.delete(`/empresas/${id}`);
  }
};

/**
 * Serviço de Relatórios
 */
const ReportAPI = {
  /**
   * Busca relatório de jogos mais vendidos
   * @param {number} top - Número de jogos no ranking (padrão: 5)
   * @param {number} empresa - Filtrar por ID da empresa (opcional)
   */
  async topGames(top = 5, empresa = null) {
    let endpoint = `/relatorios/games-most-sell?top=${top}`;
    if (empresa) {
      endpoint += `&empresa=${empresa}`;
    }
    return await API.get(endpoint);
  },

  /**
   * Busca jogos mais vendidos por empresa
   */
  async topGamesByCompany(empresaId, top = 5) {
    return await API.get(`/relatorios/jogos-mais-vendidos?top=${top}&empresa=${empresaId}`);
  }
};
