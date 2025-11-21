import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { UserAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './MyGames.css';

export default function MyGames() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getCategoryName } = useCategory();
  const { getCompanyName } = useCompany();

  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyGames();
  }, []);

  const loadMyGames = async () => {
    setIsLoading(true);
    try {
      const result = await UserAPI.getMyGames();

      if (result.success && result.data) {
        setGames(result.data);
      } else {
        showError('Erro ao carregar seus jogos');
      }
    } catch (error) {
      console.error('Error loading games:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = (key, gameName) => {
    navigator.clipboard.writeText(key);
    showSuccess(`Chave de ${gameName} copiada!`);
  };

  const handleViewDetails = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">Carregando seus jogos...</div>
      </Layout>
    );
  }

  if (games.length === 0) {
    return (
      <Layout>
        <div className="my-games-page">
          <div className="container">
            <div className="empty-games">
              <div className="empty-games-icon">🎮</div>
              <h2>Biblioteca Vazia</h2>
              <p>Você ainda não possui jogos. Explore nossa loja e comece sua coleção!</p>
              <Button onClick={() => navigate('/home')}>
                Explorar Jogos
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="my-games-page">
        <div className="container">
          <h1 className="page-title">Minha Biblioteca</h1>
          <p className="games-count">
            {games.length} {games.length === 1 ? 'jogo' : 'jogos'} na sua biblioteca
          </p>

          <div className="games-grid">
            {games.map((item) => {
              const jogo = item.jogo;
              const precoFinal = jogo.preco * (1 - (jogo.desconto || 0) / 100);
              const categoria = getCategoryName(jogo.fkCategoria);

              return (
                <div key={jogo.id} className="game-card">
                  <div
                    className="game-image"
                    onClick={() => handleViewDetails(jogo.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={getGameImage(jogo.nome)} alt={jogo.nome} />
                  </div>

                  <div className="game-info">
                    <h3
                      className="game-title"
                      onClick={() => handleViewDetails(jogo.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {jogo.nome}
                    </h3>

                    <div className="game-meta">
                      {jogo.ano && <span className="game-year">{jogo.ano}</span>}
                    </div>

                    {jogo.descricao && (
                      <p className="game-description">{jogo.descricao}</p>
                    )}

                    <div className="game-company">
                      {getCompanyName(jogo.fkEmpresa)}
                    </div>

                    <div className="activation-section">
                      <strong className="activation-label">Chave de Ativação:</strong>
                      <div className="activation-key-box">
                        <code className="activation-key">{item.chaveAtivacao}</code>
                        <button
                          className="copy-button"
                          onClick={() => handleCopyKey(item.chaveAtivacao, jogo.nome)}
                          title="Copiar chave"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="game-actions">
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(jogo.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
