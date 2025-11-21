import { create } from 'zustand';
import { CompanyAPI } from '../services/api';

export const useCompanyStore = create((set, get) => ({
  companies: [],
  isLoading: false,
  companyMap: {},

  fetchCompanies: async () => {
    set({ isLoading: true });
    const result = await CompanyAPI.getAll();

    if (result.success && result.data) {
      // Limpar caracteres \r, \n e espaços extras dos nomes
      const cleanCompanies = result.data.map(comp => ({
        ...comp,
        nome: comp.nome.trim().replace(/[\r\n]/g, '')
      }));

      // Criar mapa ID -> Nome para lookup rápido
      const companyMap = cleanCompanies.reduce((map, comp) => {
        map[comp.id] = comp.nome;
        return map;
      }, {});

      set({
        companies: cleanCompanies,
        companyMap,
        isLoading: false
      });
    } else {
      set({ companies: [], companyMap: {}, isLoading: false });
    }
  },

  getCompanyName: (fkEmpresa) => {
    const { companyMap } = get();
    return companyMap[fkEmpresa] || 'Desconhecida';
  }
}));
