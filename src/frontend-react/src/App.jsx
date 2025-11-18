import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import './styles/global.css';

function App() {
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return <AppRoutes />;
}

export default App;
