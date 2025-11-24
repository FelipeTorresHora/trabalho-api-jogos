import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { UserAPI, AuthAPI } from '../services/api';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    birthDate: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const result = await UserAPI.getProfile();

      if (result.success && result.data) {
        setProfileData({
          name: result.data.nome || '',
          email: result.data.email || '',
          birthDate: result.data.data_nascimento || ''
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo ao digitar
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter pelo menos 8 caracteres';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...passwordErrors };

    if (name === 'currentPassword' && !value) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    } else if (name === 'newPassword') {
      if (!value) {
        newErrors.newPassword = 'Nova senha é obrigatória';
      } else if (value.length < 8) {
        newErrors.newPassword = 'A senha deve ter pelo menos 8 caracteres';
      }
    } else if (name === 'confirmPassword' && value !== passwordData.newPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setPasswordErrors(newErrors);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
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
        setPasswordErrors({
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
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <h1 className="profile-title">Meu Perfil</h1>

          <div className="profile-content">
            {/* Profile Info Section */}
            <section className="profile-section">
              <h2>Informações Pessoais</h2>
              {isLoadingProfile ? (
                <div className="loading-state">Carregando...</div>
              ) : (
                <div className="profile-form">
                  <Input
                    label="Nome"
                    type="text"
                    name="name"
                    value={profileData.name}
                    disabled
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    disabled
                  />
                </div>
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
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.currentPassword}
                  required
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.newPassword}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.confirmPassword}
                  required
                />
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
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
