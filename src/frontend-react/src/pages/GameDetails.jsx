import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { GameAPI, ReviewAPI } from '../services/api';
import { formatCurrency, formatDate, getGameImage, generateAvatar } from '../utils/helpers';
import './GameDetails.css';

const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameDetails();
    loadReviews();
  }, [id]);

  const loadGameDetails = async () => {
    setIsLoading(true);
    try {
      const result = await GameAPI.getById(id);

      if (result.success && result.data) {
        setGame(result.data);
      } else {
        showError('Jogo não encontrado');
        setTimeout(() => navigate('/home'), 2000);
      }
    } catch (error) {
      console.error('Error loading game:', error);
      showError('Erro ao carregar detalhes do jogo');
      setTimeout(() => navigate('/home'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const result = await ReviewAPI.getByGame(id);

      if (result.success && result.data) {
        const reviewsArray = Array.isArray(result.data) ? result.data : [result.data];
        setReviews(reviewsArray);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(game.id);
      showSuccess('Jogo adicionado ao carrinho!');
    } catch (error) {
      showError('Erro ao adicionar ao carrinho');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(game.id);
      navigate('/cart');
    } catch (error) {
      showError('Erro ao adicionar ao carrinho');
    }
  };

  const handleToggleWishlist = async () => {
    const isInWishlist = wishlistItems.some(item => item.fkJogo === game.id);

    try {
      if (isInWishlist) {
        await removeFromWishlist(game.id);
        showSuccess('Removido da lista de desejos');
      } else {
        await addToWishlist(game.id);
        showSuccess('Adicionado à lista de desejos!');
      }
    } catch (error) {
      showError('Erro ao atualizar lista de desejos');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">Carregando...</div>
      </Layout>
    );
  }

  if (!game) {
    return (
      <Layout>
        <div className="error-container">Jogo não encontrado</div>
      </Layout>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.fkJogo === game.id);
  const imagemUrl = getGameImage(game.nome || game.titulo);

  return (
    <Layout>
      <div className="game-details-page">
        <div className="container">
          <div className="game-details-content">
            {/* Gallery Section */}
            <div className="gallery-section">
              <button className="back-button" onClick={() => navigate('/home')}>
                ← Voltar
              </button>
              <img
                src={imagemUrl}
                alt={game.nome || game.titulo}
                className="main-image"
              />
            </div>

            {/* Info Section */}
            <div className="info-section">
              <div className="game-header">
                <span className="game-category-badge">
                  {getCategoryName(game.fkCategoria)}
                </span>
                <h1 className="game-details-title">{game.nome || game.titulo}</h1>
                <div className="game-details-rating">
                  <StarRating rating={game.avaliacao_media || 0} />
                  <span>{(game.avaliacao_media || 0).toFixed(1)} estrelas</span>
                </div>
                <div className="game-details-price">{formatCurrency(game.preco)}</div>
                <div className="add-to-cart-section">
                  <Button onClick={handleAddToCart} fullWidth>
                    Adicionar ao Carrinho
                  </Button>
                  <Button variant="secondary" onClick={handleBuyNow} fullWidth>
                    Comprar Agora
                  </Button>
                  <Button
                    variant={isInWishlist ? 'primary' : 'secondary'}
                    onClick={handleToggleWishlist}
                    fullWidth
                  >
                    {isInWishlist ? '❤️ Na Lista de Desejos' : '🤍 Adicionar à Lista'}
                  </Button>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="tabs-section">
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Descrição
                  </button>
                  <button
                    className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Avaliações ({reviews.length})
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'description' && (
                    <div className="description-content">
                      <p>{game.descricao}</p>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="reviews-content">
                      {reviews.length === 0 ? (
                        <div className="no-reviews">
                          <p>Ainda não há avaliações para este jogo.</p>
                          <p>Seja o primeiro a avaliar!</p>
                        </div>
                      ) : (
                        <div className="reviews-list">
                          {reviews.map((review, index) => (
                            <div key={index} className="review-card">
                              <div className="review-header">
                                <img
                                  src={review.avatar_usuario || generateAvatar(review.nome_usuario)}
                                  alt={review.nome_usuario}
                                  className="review-avatar"
                                />
                                <div className="review-user-info">
                                  <div className="review-user-name">
                                    {review.nome_usuario || 'Usuário'}
                                  </div>
                                  <div className="review-date">
                                    {formatDate(review.data_criacao || new Date().toISOString())}
                                  </div>
                                </div>
                                <div className="review-rating">
                                  <StarRating rating={review.nota || 0} />
                                </div>
                              </div>
                              <p className="review-comment">{review.comentario || ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
