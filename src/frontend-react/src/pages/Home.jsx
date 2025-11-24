import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { GameAPI, ReviewAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { getCategoryName } = useCategory();
  const { getCompanyName } = useCompany();

  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sorting states
  const [sortBy, setSortBy] = useState('name-asc');

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, sortBy]);

  const loadGameRatings = async (gamesToRate) => {
    try {
      const ratingsData = await Promise.all(
        gamesToRate.map(async (jogo) => {
          try {
            const ratingResult = await ReviewAPI.getGameRating(jogo.id);
            return ratingResult?.data?.media || 0;
          } catch (error) {
            console.error(`Error loading rating for game ${jogo.id}:`, error);
            return 0;
          }
        })
      );

      return gamesToRate.map((jogo, index) => ({
        ...jogo,
        avaliacao_media: ratingsData[index]
      }));
    } catch (error) {
      console.error('Error loading ratings:', error);
      return gamesToRate;
    }
  };

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const result = await GameAPI.getAll();

      if (result.success && result.data) {
        // Buscar ratings para todos os jogos
        const gamesWithRatings = await loadGameRatings(result.data);
        setAllGames(gamesWithRatings);

        // Featured games for carousel
        const featured = gamesWithRatings.filter(jogo => jogo.destaque || jogo.featured);
        setFeaturedGames(featured.length > 0 ? featured : gamesWithRatings.slice(0, 3));
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

    // Filter by search term (game name or company name)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter(jogo => {
        const gameName = (jogo.nome || jogo.titulo || '').toLowerCase();
        const companyName = getCompanyName(jogo.fkEmpresa).toLowerCase();
        return gameName.includes(lowerSearch) || companyName.includes(lowerSearch);
      });
    }

    setFilteredGames(filtered);
  }, [allGames, selectedCategory, debouncedSearch, getCompanyName]);

  // Sort games
  const sortedGames = useMemo(() => {
    const games = [...filteredGames];
    const [field, order] = sortBy.split('-');

    games.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = (a.nome || a.titulo || '').localeCompare(b.nome || b.titulo || '');
          break;
        case 'price':
          comparison = (a.preco || 0) - (b.preco || 0);
          break;
        case 'rating':
          comparison = (a.avaliacao_media || 0) - (b.avaliacao_media || 0);
          break;
        case 'year':
          comparison = (a.ano || 0) - (b.ano || 0);
          break;
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return games;
  }, [filteredGames, sortBy]);

  // Paginate games
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedGames.slice(startIndex, endIndex);
  }, [sortedGames, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedGames.length / itemsPerPage);

  const handleAddToCart = async (gameId) => {
    try {
      await addToCart(gameId);
      showSuccess('Jogo adicionado ao carrinho!');
      navigate('/cart');
    } catch (error) {
      showError('Erro ao adicionar ao carrinho');
    }
  };

  const handleViewDetails = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  // Sorting options
  const sortOptions = [
    { value: 'name-asc', label: 'Nome (A-Z)' },
    { value: 'name-desc', label: 'Nome (Z-A)' },
    { value: 'price-asc', label: 'Menor Preço' },
    { value: 'price-desc', label: 'Maior Preço' },
    { value: 'rating-desc', label: 'Melhor Avaliação' },
    { value: 'rating-asc', label: 'Pior Avaliação' },
    { value: 'year-desc', label: 'Mais Recente' },
    { value: 'year-asc', label: 'Mais Antigo' }
  ];

  // Get unique categories with game counts
  const getCategoriesWithCount = () => {
    // Count games per category
    const categoryCounts = {};

    allGames.forEach(jogo => {
      const categoryName = getCategoryName(jogo.fkCategoria);
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    // Create categories array with counts
    const categoriesArray = Object.keys(categoryCounts).sort().map(cat => ({
      value: cat,
      label: `${cat} (${categoryCounts[cat]})`
    }));

    // Add "Todos" at the beginning
    return [
      { value: 'Todos', label: `Todos (${allGames.length})` },
      ...categoriesArray
    ];
  };

  const categories = getCategoriesWithCount();

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
                      <Button variant="secondary" onClick={() => handleViewDetails(jogo.id)}>
                        Ver Detalhes
                      </Button>
                      <Button onClick={() => handleAddToCart(jogo.id)}>
                        Comprar
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

      {/* Category Filter and Sort */}
      <section className="category-filter-section">
        <div className="container">
          <div className="filters-wrapper">
            <div className="category-dropdown-wrapper">
              <label htmlFor="category-select" className="category-label">
                Filtrar por Categoria:
              </label>
              <Select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories}
              />
            </div>

            <div className="sort-dropdown-wrapper">
              <label htmlFor="sort-select" className="sort-label">
                Ordenar por:
              </label>
              <Select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
              />
            </div>
          </div>

          {sortedGames.length > 0 && (
            <div className="results-count">
              {sortedGames.length} {sortedGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
            </div>
          )}
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-section">
        <div className="container">
          {isLoading ? (
            <div className="loading-state">Carregando jogos...</div>
          ) : sortedGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎮</div>
              <h3>Nenhum jogo encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : (
            <>
              <div className="games-grid">
                {paginatedGames.map(jogo => (
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
                    <h3 className="game-title">{jogo.nome || jogo.titulo}</h3>
                    <div className="game-rating">
                      {renderStars(jogo.avaliacao_media || 0)}
                      <span>{(jogo.avaliacao_media || 0).toFixed(1)}</span>
                    </div>
                    <div className="game-price">{formatCurrency(jogo.preco)}</div>
                    <div className="game-company">
                      {getCompanyName(jogo.fkEmpresa)}
                    </div>
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

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={sortedGames.length}
              />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
