import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GameAPI, SaleAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import './Checkout.css';

const CATEGORIAS = {
  1: 'Ação', 2: 'RPG', 3: 'Aventura', 4: 'Estratégia', 5: 'Esporte',
  6: 'Corrida', 7: 'Terror', 8: 'Puzzle', 9: 'Simulação', 10: 'Plataforma',
  11: 'Luta', 12: 'Tiro', 13: 'Musical', 14: 'Ação', 15: 'Casual'
};

const getCategoryName = (fkCategoria) => CATEGORIAS[fkCategoria] || 'Outros';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.telefone || '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    cep: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      showError('Seu carrinho está vazio!');
      setTimeout(() => navigate('/home'), 2000);
      return;
    }

    loadCartItems();
  }, [items]);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const result = await GameAPI.getById(item.fkJogo);
            return {
              ...item,
              jogo: result.success ? result.data : null
            };
          } catch (error) {
            return { ...item, jogo: null };
          }
        })
      );

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    // Format card number
    if (name === 'cardNumber') {
      formatted = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value;
    }

    // Format card expiry
    if (name === 'cardExpiry') {
      formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
    }

    // Format CEP
    if (name === 'cep') {
      formatted = value.replace(/\D/g, '');
      if (formatted.length >= 5) {
        formatted = formatted.slice(0, 5) + '-' + formatted.slice(5, 8);
      }
    }

    // Format phone
    if (name === 'phone') {
      formatted = value.replace(/\D/g, '');
      if (formatted.length >= 10) {
        formatted = `(${formatted.slice(0, 2)}) ${formatted.slice(2, 7)}-${formatted.slice(7, 11)}`;
      }
    }

    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const result = await SaleAPI.create({
        paymentMethod,
        ...formData
      });

      if (result.success) {
        showSuccess('Pedido realizado com sucesso!');
        setTimeout(() => {
          navigate('/history');
        }, 1500);
      } else {
        showError(result.error || 'Erro ao processar pedido');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showError('Erro ao conectar com servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.jogo?.preco || 0), 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-page">
        <div className="container">
          <h1 className="checkout-title">Finalizar Compra</h1>

          <div className="checkout-content">
            {/* Checkout Form */}
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit} className="checkout-form">
                {/* Contact Information */}
                <section className="form-section">
                  <h2>Informações de Contato</h2>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Telefone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </section>

                {/* Payment Method */}
                <section className="form-section">
                  <h2>Forma de Pagamento</h2>
                  <div className="payment-method-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>💳 Cartão de Crédito</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>📱 Pix</span>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="card-details">
                      <Input
                        label="Número do Cartão"
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                      />
                      <Input
                        label="Nome no Cartão"
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                      />
                      <div className="card-row">
                        <Input
                          label="Validade"
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                        />
                        <Input
                          label="CVV"
                          type="text"
                          name="cardCvv"
                          value={formData.cardCvv}
                          onChange={handleChange}
                          placeholder="000"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="pix-details">
                      <p>Você receberá um código Pix após confirmar o pedido.</p>
                    </div>
                  )}
                </section>

                {/* Address */}
                <section className="form-section">
                  <h2>Endereço de Cobrança</h2>
                  <Input
                    label="CEP"
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  <Input
                    label="Endereço"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <div className="address-row">
                    <Input
                      label="Cidade"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                    <Input
                      label="Estado"
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      maxLength={2}
                    />
                  </div>
                </section>

                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2>Resumo do Pedido</h2>

              <div className="order-items">
                {cartItems.map((item) => {
                  const jogo = item.jogo || {};
                  const titulo = jogo.nome || jogo.titulo || 'Jogo';
                  const imagemUrl = getGameImage(titulo);
                  const categoria = getCategoryName(jogo.fkCategoria);
                  const preco = jogo.preco || 0;

                  return (
                    <div key={item.fkJogo} className="order-item">
                      <img src={imagemUrl} alt={titulo} className="order-item-image" />
                      <div className="order-item-info">
                        <div className="order-item-title">{titulo}</div>
                        <div className="order-item-details">{categoria} • Qty: 1</div>
                        <div className="order-item-price">{formatCurrency(preco)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="order-total-row total">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
