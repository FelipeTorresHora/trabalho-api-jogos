import { create } from 'zustand';
import { Storage } from '../utils/helpers';

export const useThemeStore = create((set) => ({
  theme: Storage.get('theme') || 'dark',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'classic' : 'dark';
      Storage.set('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    Storage.set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  }
}));
