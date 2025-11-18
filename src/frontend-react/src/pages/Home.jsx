import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { GameAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './Home.css';

// Category mapping
const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();

  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load all games
  useEffect(() => {
    loadGames();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredGames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredGames.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [featuredGames.length]);

  // Filter games when search or category changes
  useEffect(() => {
    filterGames();
  }, [debouncedSearch, selectedCategory, allGames]);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const result = await GameAPI.getAll();

      if (result.success && result.data) {
        setAllGames(result.data);

        // Featured games for carousel
        const featured = result.data.filter(jogo => jogo.destaque || jogo.featured);
        setFeaturedGames(featured.length > 0 ? featured : result.data.slice(0, 3));
      } else {
        showError('Erro ao carregar jogos');
      }
    } catch (error) {
      console.error('Error loading games:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const filterGames = useCallback(() => {
    let filtered = [...allGames];

    // Filter by category
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(jogo =>
        getCategoryName(jogo.fkCategoria) === selectedCategory
      );
    }

    // Filter by search term
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter(jogo =>
        (jogo.nome || jogo.titulo || '').toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredGames(filtered);
  }, [allGames, selectedCategory, debouncedSearch]);

  const handleAddToCart = async (gameId) => {
    try {
      await addItem(gameId);
      showSuccess('Jogo adicionado ao carrinho!');
      navigate('/cart');
    } catch (error) {
      showError('Erro ao adicionar ao carrinho');
    }
  };

  const handleViewDetails = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  // Get unique categories
  const categories = ['Todos', ...Array.from(new Set(
    allGames.map(jogo => getCategoryName(jogo.fkCategoria))
  )).sort()];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>★</span>
    ));
  };

  return (
    <Layout showSearch onSearch={setSearchTerm}>
      {/* Hero Carousel */}
      {featuredGames.length > 0 && (
        <section className="hero-carousel">
          <div className="hero-slides">
            {featuredGames.map((jogo, index) => (
              <div
                key={jogo.id}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div
                  className="hero-background"
                  style={{ backgroundImage: `url('${getGameImage(jogo.nome || jogo.titulo)}')` }}
                />
                <div className="hero-content">
                  <div className="hero-text">
                    <h2>Jogo em Destaque</h2>
                    <h1>{jogo.nome || jogo.titulo}</h1>
                    <p>{jogo.descricao ? jogo.descricao.substring(0, 150) + '...' : ''}</p>
                    <div className="hero-actions">
                      <Button onClick={() => handleViewDetails(jogo.id)}>
                        Ver Detalhes
                      </Button>
                      <Button variant="secondary" onClick={() => handleAddToCart(jogo.id)}>
                        Adicionar ao Carrinho
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="hero-nav prev"
            onClick={() => setCurrentSlide(prev =>
              (prev - 1 + featuredGames.length) % featuredGames.length
            )}
          >
            ‹
          </button>

          <button
            className="hero-nav next"
            onClick={() => setCurrentSlide(prev =>
              (prev + 1) % featuredGames.length
            )}
          >
            ›
          </button>

          <div className="hero-indicators">
            {featuredGames.map((_, index) => (
              <span
                key={index}
                className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="category-filter-section">
        <div className="container">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-section">
        <div className="container">
          {isLoading ? (
            <div className="loading-state">Carregando jogos...</div>
          ) : filteredGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎮</div>
              <h3>Nenhum jogo encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : (
            <div className="games-grid">
              {filteredGames.map(jogo => (
                <div
                  key={jogo.id}
                  className="game-card"
                  onClick={() => handleViewDetails(jogo.id)}
                >
                  <img
                    src={getGameImage(jogo.nome || jogo.titulo)}
                    alt={jogo.nome || jogo.titulo}
                    className="game-image"
                  />
                  <div className="game-info">
                    <div className="game-category">
                      {getCategoryName(jogo.fkCategoria)}
                    </div>
                    <h3 className="game-title">{jogo.nome || jogo.titulo}</h3>
                    <div className="game-rating">
                      {renderStars(jogo.avaliacao_media || 0)}
                      <span>{(jogo.avaliacao_media || 0).toFixed(1)}</span>
                    </div>
                    <div className="game-price">{formatCurrency(jogo.preco)}</div>
                    <div className="game-actions">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(jogo.id);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(jogo.id);
                        }}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
