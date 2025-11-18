import { useAuthStore } from '../stores/authStore';
import { AuthAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { currentUser, isAuthenticated, setUser, logout: logoutStore, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email, password) => {
    const result = await AuthAPI.login(email, password);

    if (result.success && result.data) {
      const userData = result.data.usuario || result.data;
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const register = async (userData) => {
    const result = await AuthAPI.register(userData);
    return result;
  };

  const changePassword = async (oldPassword, newPassword) => {
    const result = await AuthAPI.changePassword(oldPassword, newPassword);
    return result;
  };

  const logout = () => {
    logoutStore();
    navigate('/');
  };

  return {
    currentUser,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    register,
    changePassword,
    logout
  };
}
