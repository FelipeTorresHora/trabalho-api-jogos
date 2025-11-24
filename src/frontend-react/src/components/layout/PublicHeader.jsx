import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useState } from 'react';
import Button from '../ui/Button';
import './PublicHeader.css';

function PublicHeader() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="public-header">
      <div className="public-header-content">
        <Link to="/" className="logo">
          Aventurem
        </Link>

        <button
          className="mobile-menu-toggle"
          aria-label="Menu"
          onClick={toggleMobileMenu}
        >
          ☰
        </button>

        <nav className={`public-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-left">
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Início
            </Link>
          </div>

          <div className="nav-right">
            <div className="theme-toggle-container">
              <label className="theme-toggle" htmlFor="publicThemeToggle">
                <span className="theme-option light-mode">🌙</span>
                <input
                  type="checkbox"
                  id="publicThemeToggle"
                  checked={theme === 'classic'}
                  onChange={toggleTheme}
                  aria-label="Alternar tema"
                />
                <span className="theme-slider"></span>
                <span className="theme-option dark-mode">☀️</span>
              </label>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              Entrar
            </Button>

            <Button
              variant="primary"
              size="small"
              onClick={() => navigate('/register')}
              className="register-btn"
            >
              Criar Conta
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default PublicHeader;
