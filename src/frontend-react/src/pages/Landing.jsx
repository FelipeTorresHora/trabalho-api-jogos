import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { formatCurrency, getGameImage } from '../utils/helpers';
import axios from 'axios';
import './Landing.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Landing() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [featuredGames, setFeaturedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedGames();
  }, []);

  const loadFeaturedGames = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/public/jogos`);
      // Get first 3 games for featured section
      setFeaturedGames(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading featured games:', error);
      showError('Erro ao carregar jogos em destaque');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameClick = (gameId) => {
    // Redirect to login with return URL to game details
    navigate(`/login?returnUrl=/game/${gameId}`);
  };

  return (
    <PublicLayout>
      <div className="landing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <h1 className="hero-title">
                O Site Mais Seguro para Comprar Jogos
              </h1>
            </div>
            <div className="hero-right">
              <p className="hero-subtitle">
                Lançamento Oficial da Plataforma
              </p>
              <p className="hero-description">
                Descubra os melhores jogos com entrega instantânea
              </p>
              <div className="hero-ctas">
                <Button
                  size="large"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="cta-secondary"
                >
                  Entrar
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate('/register')}
                  className="cta-primary"
                >
                  Criar Conta Grátis
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">Jogos em Destaque</h2>
            {isLoading ? (
              <div className="loading-state">Carregando jogos...</div>
            ) : (
              <div className="featured-games">
                {featuredGames.map((game) => (
                  <div
                    key={game.nome}
                    className="featured-game-card"
                    onClick={() => handleGameClick(game.nome)}
                  >
                    <div className="game-image-container">
                      <img
                        src={getGameImage(game.nome)}
                        alt={game.nome}
                        className="game-image"
                      />
                    </div>
                    <div className="game-details">
                      <h3 className="game-title">{game.nome}</h3>
                      <p className="game-category">{game.categoria}</p>
                      <p className="game-company">{game.empresa}</p>
                      {game.desconto > 0 ? (
                        <div className="game-pricing">
                          <span className="original-price">
                            {formatCurrency(game.preco)}
                          </span>
                          <span className="discounted-price">
                            {formatCurrency(game.preco * (1 - game.desconto / 100))}
                          </span>
                          <span className="discount-badge">-{game.desconto}%</span>
                        </div>
                      ) : (
                        <div className="game-price">{formatCurrency(game.preco)}</div>
                      )}
                      <Button
                        size="small"
                        className="game-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGameClick(game.nome);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="container">
            <h2 className="section-title">Por Que Comprar Conosco?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🔐</div>
                <h3 className="benefit-title">Segurança Garantida</h3>
                <p className="benefit-description">
                  Chaves de ativação originais para máxima segurança e tranquilidade
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">⚡</div>
                <h3 className="benefit-title">Entrega Instantânea</h3>
                <p className="benefit-description">
                  Receba sua chave de ativação imediatamente após a compra
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🎮</div>
                <h3 className="benefit-title">Biblioteca Extensa</h3>
                <p className="benefit-description">
                  Centenas de jogos disponíveis para todos os gostos e estilos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Pronto para Começar?</h2>
            <p className="cta-subtitle">
              Junte-se a milhares de jogadores e comece sua aventura hoje mesmo
            </p>
            <Button
              size="large"
              onClick={() => navigate('/register')}
              className="cta-button"
            >
              Criar Conta Grátis
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
