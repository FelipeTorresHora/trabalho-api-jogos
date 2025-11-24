import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import CardBrandIcon from '../components/ui/CardBrandIcon';
import ErrorModal from '../components/ui/ErrorModal';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useCategory } from '../hooks/useCategory';
import { useCompany } from '../hooks/useCompany';
import { GameAPI, SaleAPI } from '../services/api';
import { formatCurrency, getGameImage } from '../utils/helpers';
import {
  validateEmail,
  validateCardNumber,
  validateCardExpiry,
  validateCardCVV,
  validateCEP,
  detectCardBrand,
  formatCardNumber,
  formatCardExpiry,
  formatCEP,
  formatPhone
} from '../utils/validators';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { getCategoryName } = useCategory();
  const { getCompanyName } = useCompany();
  const { showSuccess, showError } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardBrand, setCardBrand] = useState('unknown');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    phone: '',
    cardNumber: '',
    cardName: currentUser?.nome || '',
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

    // Format and validate card number
    if (name === 'cardNumber') {
      formatted = formatCardNumber(value);
      const brand = detectCardBrand(formatted);
      setCardBrand(brand);
    }

    // Format card expiry
    if (name === 'cardExpiry') {
      formatted = formatCardExpiry(value);
    }

    // Format CEP
    if (name === 'cep') {
      formatted = formatCEP(value);
    }

    // Format phone
    if (name === 'phone') {
      formatted = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: formatted }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    // Validate phone
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    // Validate card details only if payment method is card
    if (paymentMethod === 'card') {
      // Validate card number
      const cardValidation = validateCardNumber(formData.cardNumber);
      if (!cardValidation.valid) {
        newErrors.cardNumber = cardValidation.message;
      }

      // Validate card name
      if (!formData.cardName || formData.cardName.length < 3) {
        newErrors.cardName = 'Nome no cartão deve ter pelo menos 3 caracteres';
      }

      // Validate card expiry
      const expiryValidation = validateCardExpiry(formData.cardExpiry);
      if (!expiryValidation.valid) {
        newErrors.cardExpiry = expiryValidation.message;
      }

      // Validate CVV
      const cvvValidation = validateCardCVV(formData.cardCvv, cardBrand);
      if (!cvvValidation.valid) {
        newErrors.cardCvv = cvvValidation.message;
      }
    }

    // Validate CEP (optional but if filled, must be valid)
    if (formData.cep) {
      const cepValidation = validateCEP(formData.cep);
      if (!cepValidation.valid) {
        newErrors.cep = cepValidation.message;
      }
    }

    setErrors(newErrors);

    // Show modal if there are errors
    const errorMessages = Object.values(newErrors);
    if (errorMessages.length > 0) {
      setErrorList(errorMessages);
      setShowErrorModal(true);

      // Scroll to first error and focus
      const firstErrorField = Object.keys(newErrors)[0];
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

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
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Telefone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    error={errors.phone}
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
                      <div className="card-number-wrapper">
                        <Input
                          label="Número do Cartão"
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          error={errors.cardNumber}
                          required
                        />
                        {formData.cardNumber && (
                          <div className="card-brand-indicator">
                            <CardBrandIcon brand={cardBrand} size="medium" />
                          </div>
                        )}
                      </div>
                      <Input
                        label="Nome no Cartão"
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Como está escrito no cartão"
                        error={errors.cardName}
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
                          error={errors.cardExpiry}
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
                          error={errors.cardCvv}
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
                    error={errors.cep}
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
                  const empresa = getCompanyName(jogo.fkEmpresa);
                  const preco = jogo.preco || 0;

                  return (
                    <div key={item.fkJogo} className="order-item">
                      <img src={imagemUrl} alt={titulo} className="order-item-image" />
                      <div className="order-item-info">
                        <div className="order-item-title">{titulo}</div>
                        <div className="order-item-details">{empresa} • {categoria}</div>
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

      <ErrorModal
        isOpen={showErrorModal}
        errors={errorList}
        onClose={() => setShowErrorModal(false)}
        title="Corrija os erros abaixo"
      />
    </Layout>
  );
}
