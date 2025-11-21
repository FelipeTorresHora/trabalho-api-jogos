import { create } from 'zustand';
import { CategoryAPI } from '../services/api';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  categoryMap: {},

  fetchCategories: async () => {
    set({ isLoading: true });
    const result = await CategoryAPI.getAll();

    if (result.success && result.data) {
      // Limpar caracteres \r, \n e espaços extras dos nomes
      const cleanCategories = result.data.map(cat => ({
        ...cat,
        nome: cat.nome.trim().replace(/[\r\n]/g, '')
      }));

      // Criar mapa ID -> Nome para lookup rápido
      const categoryMap = cleanCategories.reduce((map, cat) => {
        map[cat.id] = cat.nome;
        return map;
      }, {});

      set({
        categories: cleanCategories,
        categoryMap,
        isLoading: false
      });
    } else {
      set({ categories: [], categoryMap: {}, isLoading: false });
    }
  },

  getCategoryName: (fkCategoria) => {
    const { categoryMap } = get();
    return categoryMap[fkCategoria] || 'Outros';
  }
}));
