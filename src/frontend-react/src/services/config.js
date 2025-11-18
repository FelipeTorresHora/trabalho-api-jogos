// Aventurem - Configuration

// API Configuration
export const API_CONFIG = {
  // URL base da API - altere conforme necessário
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',

  // Timeout para requisições (em milissegundos)
  TIMEOUT: 30000,

  // Modo de desenvolvimento - mostra logs detalhados
  DEBUG: import.meta.env.DEV
};

// Função para fazer log apenas em modo debug
export function debugLog(...args) {
  if (API_CONFIG.DEBUG) {
    console.log('[API Debug]', ...args);
  }
}
