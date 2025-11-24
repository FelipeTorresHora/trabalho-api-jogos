import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useCategory } from '../hooks/useCategory';
import { GameAPI, ReviewAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './Cart.css';

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>★</span>
  ));
};

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, refreshCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { getCategoryName } = useCategory();

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      // Fetch game details for each cart item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const result = await GameAPI.getById(item.fkJogo);
            const jogo = result.success ? result.data : null;

            // Buscar rating do jogo
            let avaliacaoMedia = 0;
            if (jogo) {
              try {
                const ratingResult = await ReviewAPI.getGameRating(item.fkJogo);
                avaliacaoMedia = ratingResult?.data?.media || 0;
              } catch (error) {
                console.error(`Error loading rating for game ${item.fkJogo}:`, error);
              }
            }

            return {
              ...item,
              jogo: jogo ? { ...jogo, avaliacao_media: avaliacaoMedia } : null
            };
          } catch (error) {
            console.error(`Error fetching game ${item.fkJogo}:`, error);
            return {
              ...item,
              jogo: null
            };
          }
        })
      );

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error loading cart items:', error);
      showError('Erro ao carregar carrinho');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (gameId, gameName) => {
    setItemToRemove({ id: gameId, name: gameName });
    setShowRemoveDialog(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      await removeItem(itemToRemove.id);
      showSuccess('Item removido do carrinho');
      setShowRemoveDialog(false);
      setItemToRemove(null);
    } catch (error) {
      showError('Erro ao remover item');
      setShowRemoveDialog(false);
      setItemToRemove(null);
    }
  };

  const cancelRemoveItem = () => {
    setShowRemoveDialog(false);
    setItemToRemove(null);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleViewDetails = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    const preco = item.jogo?.preco || 0;
    return sum + preco;
  }, 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">Carregando carrinho...</div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione jogos incríveis ao seu carrinho e comece a jogar!</p>
          <Button onClick={() => navigate('/home')}>
            Continuar Comprando
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-page">
        <div className="container">
          <div className="cart-summary">
            <h1 className="cart-title">Resumo da Compra</h1>

            <div className="cart-items">
              {cartItems.map((item) => {
                const jogo = item.jogo || {};
                const nomeJogo = jogo.nome || jogo.titulo || 'Jogo';
                const imagemUrl = getGameImage(nomeJogo);
                const categoriaNome = getCategoryName(jogo.fkCategoria);
                const preco = jogo.preco || 0;
                const rating = jogo.avaliacao_media || 0;
                const descricao = jogo.descricao || '';
                const descricaoResumo = descricao.length > 100
                  ? descricao.substring(0, 100) + '...'
                  : descricao;

                return (
                  <div key={item.fkJogo} className="cart-item">
                    <img
                      src={imagemUrl}
                      alt={nomeJogo}
                      className="cart-item-image"
                      onClick={() => handleViewDetails(item.fkJogo)}
                      style={{ cursor: 'pointer' }}
                    />

                    <div className="cart-item-info">
                      <h3
                        className="cart-item-title"
                        onClick={() => handleViewDetails(item.fkJogo)}
                        style={{ cursor: 'pointer' }}
                      >
                        {nomeJogo}
                      </h3>
                      <p className="cart-item-platform">{categoriaNome}</p>

                      <div className="cart-item-rating">
                        {renderStars(rating)}
                        <span className="rating-value">{rating.toFixed(1)}</span>
                      </div>

                      {descricaoResumo && (
                        <p className="cart-item-description">{descricaoResumo}</p>
                      )}

                      <div className="cart-item-quantity">Quantidade: 1</div>

                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleViewDetails(item.fkJogo)}
                        className="view-details-btn"
                      >
                        Ver Detalhes
                      </Button>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-item-price">{formatCurrency(preco)}</div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.fkJogo, nomeJogo)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="cart-total-row total">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="payment-methods">
              <p className="payment-methods-title">Formas de pagamento aceitas:</p>
              <div className="payment-icons">
                <div className="payment-icon" title="Visa">💳</div>
                <div className="payment-icon" title="Mastercard">💳</div>
                <div className="payment-icon" title="American Express">💳</div>
                <div className="payment-icon" title="Pix">📱</div>
              </div>
            </div>

            <Button onClick={handleCheckout} fullWidth>
              Finalizar Compra
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onConfirm={confirmRemoveItem}
        onCancel={cancelRemoveItem}
        title="Remover item do carrinho"
        message={`Tem certeza que deseja remover "${itemToRemove?.name}" do carrinho?`}
        confirmText="Remover"
        cancelText="Cancelar"
        type="warning"
      />
    </Layout>
  );
}