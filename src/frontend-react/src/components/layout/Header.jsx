import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useTheme } from '../../hooks/useTheme';
import { useDebounce } from '../../hooks/useDebounce';
import { useState, useEffect } from 'react';
import './Header.css';

function Header({ onSearch }) {
  const { isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length || 0;
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Call onSearch when debouncedSearch changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/home" className="logo">
          Aventurem
        </Link>

        <button
          className="mobile-menu-toggle"
          aria-label="Menu"
          onClick={toggleMobileMenu}
        >
          ☰
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/home" onClick={() => setMobileMenuOpen(false)}>
                Início
              </Link>
            </li>
            <li>
              <Link to="/home#games" onClick={() => setMobileMenuOpen(false)}>
                Jogos
              </Link>
            </li>
            <li>
              <Link to="/my-games" onClick={() => setMobileMenuOpen(false)}>
                Meus Jogos
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          {onSearch && (
            <div className="search-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Busca de Jogo e Empresa"
              />
            </div>
          )}

          <div className="theme-toggle-container">
            <label className="theme-toggle" htmlFor="themeToggle">
              <span className="theme-option light-mode">🌙</span>
              <input
                type="checkbox"
                id="themeToggle"
                checked={theme === 'classic'}
                onChange={toggleTheme}
                aria-label="Alternar tema"
              />
              <span className="theme-slider"></span>
              <span className="theme-option dark-mode">☀️</span>
            </label>
          </div>

          <Link to="/wishlist" className="icon-btn" aria-label="Lista de Desejos">
            ❤️
            {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="icon-btn" aria-label="Carrinho">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <Link to="/profile" className="icon-btn" aria-label="Perfil">
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
