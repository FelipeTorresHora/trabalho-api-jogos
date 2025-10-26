// Aventurem - Configuration

// API Configuration
const API_CONFIG = {
  // URL base da API - altere conforme necessário
  BASE_URL: 'http://localhost:3000/api/v1',

  // Timeout para requisições (em milissegundos)
  TIMEOUT: 30000,

  // Modo de desenvolvimento - mostra logs detalhados
  DEBUG: true
};

// Função para fazer log apenas em modo debug
function debugLog(...args) {
  if (API_CONFIG.DEBUG) {
    console.log('[API Debug]', ...args);
  }
}
