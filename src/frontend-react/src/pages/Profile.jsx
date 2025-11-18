import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { UserAPI, AuthAPI, GameAPI, CartAPI } from '../services/api';
import { formatCurrency, getGameImage, validateEmail } from '../utils/helpers';
import './Profile.css';

const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { addItem: addToCart } = useCart();
  const { items: wishlistItems, removeItem: removeFromWishlist, refreshWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [wishlistWithDetails, setWishlistWithDetails] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadWishlistDetails();
  }, []);

  useEffect(() => {
    loadWishlistDetails();
  }, [wishlistItems]);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const result = await UserAPI.getProfile();

      if (result.success && result.data) {
        setProfileData({
          name: result.data.nome || '',
          email: result.data.email || '',
          phone: result.data.telefone || ''
        });
      } else {
        showError('Erro ao carregar perfil');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadWishlistDetails = async () => {
    setIsLoadingWishlist(true);
    try {
      const wishlistWithGames = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            // item já é o jogo completo retornado pela API
            return item;
          } catch (error) {
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    // Format phone
    if (name === 'phone') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length >= 10) {
        formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2, 7)}-${formatted.slice(7, 11)}`;
      }
      setProfileData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateEmail(profileData.email)) {
      showError('Por favor, insira um email válido');
      return;
    }

    setIsSavingProfile(true);

    try {
      const result = await UserAPI.updateProfile({
        nome: profileData.name,
        email: profileData.email,
        telefone: profileData.phone
      });

      if (result.success) {
        showSuccess('Perfil atualizado com sucesso!');
        await refreshUser();
      } else {
        showError(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await AuthAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        showSuccess('Senha alterada com sucesso!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showError(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsChangingPassword(false);
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

  const handleRemoveFromWishlist = async (jogoId) => {
    if (!window.confirm('Deseja remover este jogo da lista de desejos?')) return;

    try {
      await removeFromWishlist(jogoId);
      showSuccess('Removido da lista de desejos');
    } catch (error) {
      showError('Erro ao remover da lista');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="container">
          <h1 className="profile-title">Meu Perfil</h1>

          <div className="profile-content">
            {/* Profile Info Section */}
            <section className="profile-section">
              <h2>Informações Pessoais</h2>
              {isLoadingProfile ? (
                <div className="loading-state">Carregando...</div>
              ) : (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <Input
                    label="Nome"
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Telefone"
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="(00) 00000-0000"
                  />
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              )}
            </section>

            {/* Change Password Section */}
            <section className="profile-section">
              <h2>Alterar Senha</h2>
              <form onSubmit={handleChangePassword} className="password-form">
                <Input
                  label="Senha Atual"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </section>

            {/* Wishlist Section */}
            <section className="profile-section">
              <h2>Lista de Desejos</h2>
              {isLoadingWishlist ? (
                <div className="loading-state">Carregando...</div>
              ) : wishlistWithDetails.length === 0 ? (
                <div className="empty-wishlist">
                  <div className="empty-wishlist-icon">🤍</div>
                  <p>Sua lista de desejos está vazia</p>
                  <p className="text-secondary">
                    Adicione jogos que você deseja comprar mais tarde!
                  </p>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlistWithDetails.map((item) => {
                    const titulo = item.nome || item.titulo || 'Jogo';
                    const imagemUrl = getGameImage(titulo);
                    const categoria = getCategoryName(item.fkCategoria);
                    const preco = item.preco || 0;

                    return (
                      <div key={item.id} className="wishlist-card">
                        <img src={imagemUrl} alt={titulo} className="wishlist-image" />
                        <div className="wishlist-info">
                          <h3 className="wishlist-title">{titulo}</h3>
                          <p className="wishlist-category">{categoria}</p>
                          <p className="wishlist-price">{formatCurrency(preco)}</p>
                          <div className="wishlist-actions">
                            <Button
                              size="small"
                              onClick={() => handleMoveToCart(item.id)}
                            >
                              🛒 Adicionar ao Carrinho
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleRemoveFromWishlist(item.id)}
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
            </section>

            {/* Logout Section */}
            <section className="profile-section">
              <Button variant="danger" onClick={handleLogout}>
                Sair da Conta
              </Button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
