import { create } from 'zustand';
import { API } from '../services/api';
import { Storage } from '../utils/helpers';

export const useAuthStore = create((set, get) => ({
  currentUser: Storage.get('currentUser'),
  isAuthenticated: !!API.getToken(),

  setUser: (user) => {
    Storage.set('currentUser', user);
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    API.clearToken();
    Storage.remove('currentUser');
    set({ currentUser: null, isAuthenticated: false });
  },

  isAdmin: () => {
    const { currentUser } = get();
    return currentUser?.perfil === 'Administrador';
  },

  updateUser: (userData) => {
    const { currentUser } = get();
    const updatedUser = { ...currentUser, ...userData };
    Storage.set('currentUser', updatedUser);
    set({ currentUser: updatedUser });
  }
}));
