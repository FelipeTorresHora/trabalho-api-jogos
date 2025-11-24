import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { GameAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './Wishlist.css';

export default function Wishlist() {
  const navigate = useNavigate();
  const { getCategoryName } = useCategory();
  const { getCompanyName } = useCompany();
  const { addToCart } = useCart();
  const { wishlist: wishlistItems, removeFromWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();

  const [wishlistWithDetails, setWishlistWithDetails] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    loadWishlistDetails();
  }, [wishlistItems]);

  const loadWishlistDetails = async () => {
    setIsLoadingWishlist(true);
    try {
      const wishlistWithGames = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            // Se item não tem fkEmpresa, buscar dados completos do jogo
            if (!item.fkEmpresa) {
              const result = await GameAPI.getById(item.id);
              return result.success ? result.data : item;
            }
            return item;
          } catch (error) {
            console.error(`Error loading game ${item.id}:`, error);
            return item;
          }
        })
      );

      setWishlistWithDetails(wishlistWithGames);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleMoveToCart = async (jogoId) => {
    try {
      await addToCart(jogoId);
      await removeFromWishlist(jogoId);
      showSuccess('Jogo adicionado ao carrinho!');
    } catch (error) {
      showError('Erro ao mover para carrinho');
    }
  };

  const handleRemoveFromWishlist = (jogoId, jogoNome) => {
    setItemToRemove({ id: jogoId, nome: jogoNome });
    setShowRemoveDialog(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      await removeFromWishlist(itemToRemove.id);
      showSuccess('Removido da lista de desejos');
    } catch (error) {
      showError('Erro ao remover da lista');
    } finally {
      setShowRemoveDialog(false);
      setItemToRemove(null);
    }
  };

  const cancelRemoveItem = () => {
    setShowRemoveDialog(false);
    setItemToRemove(null);
  };

  const handleViewDetails = (jogoId) => {
    navigate(`/game/${jogoId}`);
  };

  return (
    <Layout>
      <div className="wishlist-page">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <h1 className="wishlist-title">Minha Lista de Desejos</h1>

          {isLoadingWishlist ? (
            <div className="loading-state">Carregando...</div>
          ) : wishlistWithDetails.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-wishlist-icon">🤍</div>
              <p>Sua lista de desejos está vazia</p>
              <p className="text-secondary">
                Adicione jogos que você deseja comprar mais tarde!
              </p>
              <Button onClick={() => navigate('/home')}>
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistWithDetails.map((item) => {
                const titulo = item.nome || item.titulo || 'Jogo';
                const imagemUrl = getGameImage(titulo);
                const categoria = getCategoryName(item.fkCategoria);
                const preco = item.preco || 0;

                return (
                  <div
                    key={item.id}
                    className="wishlist-card"
                    onClick={() => handleViewDetails(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={imagemUrl} alt={titulo} className="wishlist-image" />
                    <div className="wishlist-info">
                      <h3 className="wishlist-title">{titulo}</h3>
                      <p className="wishlist-price">{formatCurrency(preco)}</p>
                      <p className="wishlist-company">{getCompanyName(item.fkEmpresa)}</p>
                      <div className="wishlist-actions">
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToCart(item.id);
                          }}
                        >
                          🛒 Adicionar ao Carrinho
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWishlist(item.id, titulo);
                          }}
                        >
                          🗑️ Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRemoveDialog}
        title="Remover da Lista de Desejos"
        message={`Deseja remover "${itemToRemove?.nome}" da sua lista de desejos?`}
        onConfirm={confirmRemoveItem}
        onCancel={cancelRemoveItem}
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </Layout>
  );
}
