import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StarRating from '../components/ui/StarRating';
import { useToast } from '../hooks/useToast';
import { SaleAPI, GameAPI, CartAPI, ReviewAPI } from '../services/api';
import { formatCurrency, formatDateTime, formatDate, getGameImage, getPaymentMethodIcon, generateAvatar } from '../utils/helpers';
import './History.css';

const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function History() {
  const { showSuccess, showError } = useToast();

  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewGame, setReviewGame] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const salesResult = await SaleAPI.getAll();

      if (salesResult.success && salesResult.data) {
        let userOrders = salesResult.data;

        // Load cart items for each sale
        const cartsResult = await CartAPI.getAll();
        let finalizedCarts = [];

        if (cartsResult.success && cartsResult.data?.carrinhosComItens) {
          finalizedCarts = cartsResult.data.carrinhosComItens.filter(c => c.status === 'F');
        }

        // Combine sales with cart items
        const ordersWithItems = await Promise.all(
          userOrders.map(async (venda) => {
            const cart = finalizedCarts.find(c => c.fkVenda === venda.id);
            const items = cart?.itens || [];

            // Load game details for each item
            const itemsWithGames = await Promise.all(
              items.map(async (item) => {
                try {
                  const gameResult = await GameAPI.getById(item.fkJogo);
                  return {
                    ...item,
                    jogo: gameResult.success ? gameResult.data : null
                  };
                } catch (error) {
                  return { ...item, jogo: null };
                }
              })
            );

            return { ...venda, itens: itemsWithGames };
          })
        );

        // Sort by date (most recent first)
        ordersWithItems.sort((a, b) => new Date(b.data) - new Date(a.data));

        setOrders(ordersWithItems);
      } else {
        showError('Erro ao carregar histórico de pedidos');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleOpenReviewModal = async (gameId) => {
    try {
      const result = await GameAPI.getById(gameId);

      if (result.success && result.data) {
        setReviewGame(result.data);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewModal(true);
      } else {
        showError('Jogo não encontrado');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      showError('Erro ao carregar dados do jogo');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewRating) {
      showError('Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    if (!reviewComment.trim()) {
      showError('Por favor, escreva um comentário sobre o jogo');
      return;
    }

    try {
      const result = await ReviewAPI.create(reviewGame.id, reviewRating, reviewComment);

      if (result.success) {
        showSuccess('Avaliação enviada com sucesso!');
        setShowReviewModal(false);
        await loadOrders();
      } else {
        showError(result.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Erro ao conectar com servidor');
    }
  };

  const renderStatusBadge = (status) => {
    const displayStatus = status || 'Aprovado';
    let badgeClass = 'badge';

    switch (displayStatus.toLowerCase()) {
      case 'entregue':
      case 'aprovado':
        badgeClass += ' badge-success';
        break;
      case 'processando':
      case 'pendente':
        badgeClass += ' badge-warning';
        break;
      case 'cancelado':
        badgeClass += ' badge-error';
        break;
      default:
        badgeClass += ' badge-success';
    }

    return <span className={badgeClass}>{displayStatus}</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">Carregando histórico...</div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2>Nenhuma compra realizada</h2>
          <p>Você ainda não realizou nenhuma compra. Explore nossa loja e encontre jogos incríveis!</p>
          <Button onClick={() => window.location.href = '/home'}>
            Explorar Jogos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="history-page">
        <div className="container">
          <h1 className="history-title">Histórico de Compras</h1>

          <div className="orders-container">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const itemsCount = order.quantidade || order.itens?.length || 0;

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">Pedido #{order.id}</div>
                      <div className="order-date">{formatDateTime(order.data)}</div>
                    </div>
                    <div className="order-meta">
                      <div className="order-total">{formatCurrency(order.valor_total)}</div>
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="order-details-summary">
                    <div className="detail-item">
                      <span className="detail-label">Data/Hora:</span>
                      <span className="detail-value">{formatDateTime(order.data)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pagamento:</span>
                      <span className="detail-value">
                        {order.forma_pagamento
                          ? `${getPaymentMethodIcon(order.forma_pagamento)} ${order.forma_pagamento}`
                          : 'Não especificado'}
                      </span>
                    </div>
                  </div>

                  {order.itens && order.itens.length > 0 && (
                    <>
                      <div className="order-items">
                        <div className="order-items-summary">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                        </div>

                        <div className={`order-items-list ${isExpanded ? 'expanded' : ''}`}>
                          {order.itens.map((item, index) => {
                            const jogo = item.jogo || {};
                            const titulo = jogo.nome || jogo.titulo || 'Jogo';
                            const categoria = getCategoryName(jogo.fkCategoria);
                            const precoUnitario = item.preco_unitario || jogo.preco || 0;
                            const jogoId = item.fkJogo || item.jogo_id || jogo.id;

                            return (
                              <div key={index} className="order-item">
                                <div className="order-item-info">
                                  <div className="order-item-title">{titulo}</div>
                                  <div className="order-item-details">
                                    {categoria} • Quantidade: 1
                                  </div>
                                  {jogoId && (
                                    <Button
                                      size="small"
                                      onClick={() => handleOpenReviewModal(jogoId)}
                                    >
                                      ⭐ Avaliar Jogo
                                    </Button>
                                  )}
                                </div>
                                <div className="order-item-price">
                                  {formatCurrency(precoUnitario)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="order-actions">
                        <button
                          className="toggle-details-btn"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Avaliar Jogo"
      >
        {reviewGame && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="review-game-info">
              <img
                src={getGameImage(reviewGame.nome || reviewGame.titulo)}
                alt={reviewGame.nome || reviewGame.titulo}
              />
              <div className="game-info-text">
                <h3>{reviewGame.nome || reviewGame.titulo}</h3>
                <p>{getCategoryName(reviewGame.fkCategoria)}</p>
              </div>
            </div>

            <div className="form-group">
              <label>Avaliação</label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star-select ${star <= reviewRating ? 'selected' : ''}`}
                    onClick={() => setReviewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reviewComment">Comentário</label>
              <textarea
                id="reviewComment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Escreva sua avaliação sobre o jogo..."
                rows={4}
                required
              />
            </div>

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowReviewModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Enviar Avaliação</Button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
