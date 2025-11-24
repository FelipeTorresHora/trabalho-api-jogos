import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import Modal from '../components/ui/Modal';
import SpoilerText from '../components/ui/SpoilerText';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { GameAPI, ReviewAPI, UserAPI } from '../services/api';
import { formatCurrency, formatDate, getGameImage, generateAvatar } from '../utils/helpers';
import './GameDetails.css';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();
  const { currentUser: user } = useAuth();
  const { getCategoryName } = useCategory();
  const { getCompanyName } = useCompany();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);

  // Estados para avaliação
  const [userOwnsGame, setUserOwnsGame] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ nota: 0, comentario: '' });

  useEffect(() => {
    const initializePage = async () => {
      await loadGameDetails();
      await loadReviews();
      await updateGameRating();
      if (user) {
        await checkGameOwnership();
        await checkUserReview();
      }
    };

    initializePage();
  }, [id, user]);

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

  const checkGameOwnership = async () => {
    try {
      const result = await UserAPI.getMyGames();
      if (result.success && result.data) {
        const owns = result.data.some(item => item.jogo.id === parseInt(id));
        setUserOwnsGame(owns);
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      setUserOwnsGame(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const result = await ReviewAPI.getByGame(id);
      if (result.success && result.data) {
        const reviewsArray = Array.isArray(result.data) ? result.data : [result.data];
        const myReview = reviewsArray.find(r => r.fk_usuario === user?.id);
        setUserReview(myReview || null);
        if (myReview) {
          setReviewForm({
            nota: myReview.nota,
            comentario: myReview.comentario || ''
          });
        }
      }
    } catch (error) {
      console.error('Error checking user review:', error);
      setUserReview(null);
    }
  };

  const updateGameRating = async () => {
    try {
      const ratingResult = await ReviewAPI.getGameRating(id);
      if (ratingResult.success && ratingResult.data) {
        setGame(prev => ({
          ...prev,
          avaliacao_media: ratingResult.data.media || 0
        }));
      }
    } catch (error) {
      console.error('Error updating game rating:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewForm.nota === 0) {
      showError('Selecione uma nota de 1 a 5 estrelas');
      return;
    }

    try {
      const result = userReview
        ? await ReviewAPI.update(id, reviewForm.nota, reviewForm.comentario)
        : await ReviewAPI.create(id, reviewForm.nota, reviewForm.comentario);

      if (result.success) {
        showSuccess(userReview ? 'Avaliação atualizada!' : 'Avaliação criada!');
        setShowReviewModal(false);
        setReviewForm({ nota: 0, comentario: '' });
        await loadReviews();
        await checkUserReview();
        await updateGameRating();
      } else {
        showError(result.error || 'Erro ao salvar avaliação');
      }
    } catch (error) {
      showError('Erro ao salvar avaliação');
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
    const isInWishlist = wishlistItems.some(item => item.id === game.id);

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

  const isInWishlist = wishlistItems.some(item => item.id === game.id);
  const imagemUrl = getGameImage(game.nome || game.titulo);

  return (
    <Layout>
      <div className="game-details-page">
        <div className="container">
          <div className="game-details-content">
            {/* Gallery Section */}
            <div className="gallery-section">
              <button className="back-button" onClick={() => navigate(-1)}>
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
                <div className="game-company-name">{getCompanyName(game.fkEmpresa)}</div>
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
                      {/* Botão de avaliar */}
                      {user && userOwnsGame && (
                        <div className="review-actions">
                          <Button onClick={() => setShowReviewModal(true)}>
                            {userReview ? '✏️ Editar Minha Avaliação' : '⭐ Avaliar Este Jogo'}
                          </Button>
                        </div>
                      )}

                      {/* Mensagem para quem não possui o jogo */}
                      {user && !userOwnsGame && (
                        <div className="no-ownership-message">
                          💡 Você precisa comprar este jogo para poder avaliá-lo.
                        </div>
                      )}

                      {/* Lista de avaliações */}
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
                              <div className="review-comment">
                                <SpoilerText text={review.comentario || ''} />
                              </div>
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

      {/* Modal de Avaliação */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={userReview ? 'Editar Avaliação' : 'Avaliar Jogo'}
      >
        <div className="review-form">
          <div className="rating-section">
            <label>Sua Nota:</label>
            <StarRating
              rating={reviewForm.nota}
              interactive={true}
              onRate={(value) => setReviewForm({ ...reviewForm, nota: value })}
            />
          </div>

          <div className="comment-section">
            <label>Comentário (opcional):</label>
            <textarea
              value={reviewForm.comentario}
              onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })}
              placeholder="Compartilhe sua experiência com este jogo..."
              rows={5}
            />
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview}>
              {userReview ? 'Atualizar' : 'Enviar'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
