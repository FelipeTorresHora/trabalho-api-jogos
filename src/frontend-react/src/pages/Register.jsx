import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordStrength from '../components/ui/PasswordStrength';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateAge,
  formatPhone
} from '../utils/validators';
import { AuthAPI } from '../services/api';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Format phone number
    if (name === 'phone') {
      newValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Validate password in real-time
    if (name === 'password') {
      const validation = validatePassword(newValue);
      setPasswordValidation(validation);
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    if (name === 'name') {
      const nameValidation = validateFullName(value);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.message;
      }
    } else if (name === 'email') {
      const emailValidation = validateEmail(value);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message;
      }
    } else if (name === 'password') {
      const validation = validatePassword(value);
      if (!validation.valid) {
        newErrors.password = validation.message;
      }
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    } else if (name === 'birthDate' && value) {
      const ageValidation = validateAge(value, 13, 120);
      if (!ageValidation.valid) {
        newErrors.birthDate = ageValidation.message;
      }
    }

    setErrors(newErrors);
  };

  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const validate = () => {
    const newErrors = {};

    // Validate full name
    const nameValidation = validateFullName(formData.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.message;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    // Validate birth date
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const ageValidation = validateAge(formData.birthDate, 13, 120);
      if (!ageValidation.valid) {
        newErrors.birthDate = ageValidation.message;
      }
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        telefone: formData.phone,
        dataNascimento: formData.birthDate,
        perfilId: 2 // 2 = Cliente (usuário comum)
      };

      const result = await AuthAPI.register(userData);

      if (result.success) {
        showSuccess('Conta criada com sucesso! Fazendo login...');

        // Auto-login after registration
        setTimeout(async () => {
          const loginResult = await login(formData.email, formData.password);
          if (loginResult.success) {
            navigate('/home');
          }
        }, 1500);
      } else {
        showError(result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Aventurem</h1>
          <p>Crie sua conta</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <Input
            label="Nome Completo"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Digite seu nome"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Telefone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="(00) 00000-0000"
          />

          <Input
            label="Data de Nascimento"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            error={errors.birthDate}
            required
          />

          <div>
            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Mínimo 8 caracteres"
              required
            />
            {passwordValidation && (
              <PasswordStrength
                password={formData.password}
                validation={passwordValidation}
              />
            )}
          </div>

          <Input
            label="Confirmar Senha"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Digite a senha novamente"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/" className="link">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
