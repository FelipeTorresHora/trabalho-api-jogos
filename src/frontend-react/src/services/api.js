// Aventurem - API Service
import axios from 'axios';
import { API_CONFIG, debugLog } from './config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adds JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    debugLog('Request:', { url: config.url, method: config.method, data: config.data });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors
apiClient.interceptors.response.use(
  (response) => {
    debugLog('Response:', { status: response.status, data: response.data });
    return response;
  },
  (error) => {
    debugLog('Error:', error.response || error);

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('currentUser');

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// Base API object
export const API = {
  // Get token
  getToken() {
    return localStorage.getItem('jwt_token');
  },

  // Set token
  setToken(token) {
    localStorage.setItem('jwt_token', token);
    debugLog('Token saved:', token);
  },

  // Clear token
  clearToken() {
    localStorage.removeItem('jwt_token');
    debugLog('Token cleared');
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Decode JWT token
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }
};

// Authentication API
export const AuthAPI = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        senha: password
      });

      if (response.data.token) {
        API.setToken(response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  },

  async register(userData) {
    try {
      // Converter data de YYYY-MM-DD para DD/MM/YYYY (formato esperado pelo backend)
      let dataNascimento = null;
      if (userData.dataNascimento) {
        const [ano, mes, dia] = userData.dataNascimento.split('-');
        dataNascimento = `${dia}/${mes}/${ano}`;
      }

      const response = await apiClient.post('/auth/register', {
        nome: userData.name,
        email: userData.email,
        senha: userData.password,
        dataNascimento: dataNascimento
        // Removido: telefone (não existe no backend)
        // Removido: perfilId (backend define automaticamente como "Cliente")
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao registrar'
      };
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: oldPassword,
        newPassword: newPassword
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar senha'
      };
    }
  },

  logout() {
    API.clearToken();
    localStorage.removeItem('currentUser');
  }
};

// Game API
export const GameAPI = {
  async getAll(filters = {}) {
    try {
      const params = {};
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.busca) params.busca = filters.busca;

      const response = await apiClient.get('/jogos', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar jogos'
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/jogos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar jogo'
      };
    }
  },

  async create(gameData) {
    try {
      const response = await apiClient.post('/jogos', gameData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar jogo'
      };
    }
  },

  async update(id, gameData) {
    try {
      const response = await apiClient.put(`/jogos/${id}`, gameData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar jogo'
      };
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/jogos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar jogo'
      };
    }
  }
};

// Cart API
export const CartAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/carrinho');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar carrinho'
      };
    }
  },

  async add(jogoId) {
    try {
      const response = await apiClient.post('/carrinho/add', { jogoId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao adicionar ao carrinho'
      };
    }
  },

  async remove(gameId) {
    try {
      const response = await apiClient.delete(`/carrinho/${gameId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao remover do carrinho'
      };
    }
  }
};

// Wishlist API
export const WishlistAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/lista-desejo');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar lista de desejos'
      };
    }
  },

  async add(jogoId) {
    try {
      const response = await apiClient.post('/lista-desejo', { jogoId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao adicionar à lista de desejos'
      };
    }
  },

  async remove(jogoId) {
    try {
      const response = await apiClient.delete('/lista-desejo', {
        data: { jogoId }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao remover da lista de desejos'
      };
    }
  }
};

// Sale API
export const SaleAPI = {
  async create(paymentData) {
    try {
      const response = await apiClient.post('/vendas/checkout', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao finalizar compra'
      };
    }
  },

  async getAll() {
    try {
      const response = await apiClient.get('/vendas');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar vendas'
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/vendas/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar venda'
      };
    }
  }
};

// Review API
export const ReviewAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/avaliacoes');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar avaliações'
      };
    }
  },

  async getByGame(jogoId) {
    try {
      const response = await apiClient.get(`/avaliacoes?jogoId=${jogoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar avaliações do jogo'
      };
    }
  },

  async getAverage(jogoId) {
    try {
      const response = await apiClient.get(`/avaliacoes/media/${jogoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar média de avaliações'
      };
    }
  },

  async create(jogoId, nota, comentario) {
    try {
      const response = await apiClient.post('/avaliacoes', {
        jogoId,
        nota,
        comentario
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar avaliação'
      };
    }
  },

  async update(jogoId, nota, comentario) {
    try {
      const response = await apiClient.put('/avaliacoes', {
        jogoId,
        nota,
        comentario
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar avaliação'
      };
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/avaliacoes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar avaliação'
      };
    }
  },

  async getGameRating(gameId) {
    try {
      const response = await apiClient.get(`/avaliacoes/media/${gameId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar média de avaliações'
      };
    }
  }
};

// User API
export const UserAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/usuarios');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuários'
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/usuarios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar usuário'
      };
    }
  },

  async create(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar usuário'
      };
    }
  },

  async update(id, userData) {
    try {
      const response = await apiClient.put(`/usuarios/${id}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar usuário'
      };
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/usuarios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar usuário'
      };
    }
  },

  async getProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return await this.getById(currentUser.id);
  },

  async updateProfile(userData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return await this.update(currentUser.id, userData);
  },

  async getMyGames() {
    try {
      const response = await apiClient.get('/usuarios/my/games');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar seus jogos'
      };
    }
  }
};

// Company API
export const CompanyAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/empresas');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar empresas'
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/empresas/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar empresa'
      };
    }
  },

  async create(companyData) {
    try {
      const response = await apiClient.post('/empresas', companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar empresa'
      };
    }
  },

  async update(id, companyData) {
    try {
      const response = await apiClient.put(`/empresas/${id}`, companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar empresa'
      };
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/empresas/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar empresa'
      };
    }
  }
};

// Report API
export const ReportAPI = {
  async topGames(top = 5, empresa = null) {
    try {
      const params = { top };
      if (empresa) params.empresa = empresa;

      const response = await apiClient.get('/relatorios/games-most-sell', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar relatório'
      };
    }
  }
};

// Category API
export const CategoryAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/categorias');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar categorias'
      };
    }
  }
};

export default apiClient;
