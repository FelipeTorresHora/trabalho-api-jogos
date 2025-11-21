/**
 * Validadores para formulários
 * Contém funções de validação reutilizáveis
 */

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, message: 'Email é obrigatório' };
  if (!emailRegex.test(email)) return { valid: false, message: 'Email inválido' };
  return { valid: true, message: '' };
};

/**
 * Valida força da senha
 * Regras: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Senha é obrigatória', strength: 0 };

  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  let messages = [];

  if (minLength) strength++;
  else messages.push('mínimo 8 caracteres');

  if (hasUpperCase) strength++;
  else messages.push('1 letra maiúscula');

  if (hasLowerCase) strength++;
  else messages.push('1 letra minúscula');

  if (hasNumber) strength++;
  else messages.push('1 número');

  if (hasSpecialChar) strength++;
  else messages.push('1 caractere especial');

  const strengthLevel = strength === 5 ? 'strong' : strength >= 3 ? 'medium' : 'weak';

  return {
    valid: strength >= 4, // Requer pelo menos 4 dos 5 critérios
    message: messages.length > 0 ? `Senha deve ter: ${messages.join(', ')}` : '',
    strength,
    strengthLevel,
    checks: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    }
  };
};

/**
 * Algoritmo de Luhn para validar número de cartão de crédito
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return { valid: false, message: 'Número do cartão é obrigatório' };

  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(cleaned)) {
    return { valid: false, message: 'Número do cartão deve ter 13-19 dígitos' };
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;

  return {
    valid: isValid,
    message: isValid ? '' : 'Número de cartão inválido'
  };
};

/**
 * Detecta a bandeira do cartão de crédito
 */
export const detectCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    elo: /^(4011|438935|45(1416|76)|50(4175|6699|67|90[4-7])|63(6297|6368))/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^35/,
    hipercard: /^(606282|3841)/
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return brand;
    }
  }

  return 'unknown';
};

/**
 * Valida data de validade do cartão (formato MM/YY ou MM/YYYY)
 */
export const validateCardExpiry = (expiry) => {
  if (!expiry) return { valid: false, message: 'Data de validade é obrigatória' };

  const cleaned = expiry.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/(\d{2}|\d{4})$/);

  if (!match) {
    return { valid: false, message: 'Formato inválido (use MM/YY)' };
  }

  const month = parseInt(match[1]);
  let year = parseInt(match[2]);

  if (year < 100) {
    year += 2000; // Converte YY para YYYY
  }

  if (month < 1 || month > 12) {
    return { valid: false, message: 'Mês inválido' };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expiryDate = new Date(year, month - 1);
  const currentDate = new Date(currentYear, currentMonth - 1);

  if (expiryDate < currentDate) {
    return { valid: false, message: 'Cartão vencido' };
  }

  return { valid: true, message: '' };
};

/**
 * Valida CVV do cartão
 */
export const validateCardCVV = (cvv, cardBrand = 'unknown') => {
  if (!cvv) return { valid: false, message: 'CVV é obrigatório' };

  const cleaned = cvv.replace(/\s/g, '');
  const isAmex = cardBrand === 'amex';
  const expectedLength = isAmex ? 4 : 3;

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'CVV deve conter apenas números' };
  }

  if (cleaned.length !== expectedLength) {
    return {
      valid: false,
      message: `CVV deve ter ${expectedLength} dígitos${isAmex ? ' (Amex)' : ''}`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Valida CEP brasileiro (formato 00000-000)
 */
export const validateCEP = (cep) => {
  if (!cep) return { valid: false, message: 'CEP é obrigatório' };

  const cleaned = cep.replace(/\D/g, '');

  if (cleaned.length !== 8) {
    return { valid: false, message: 'CEP deve ter 8 dígitos' };
  }

  return { valid: true, message: '' };
};

/**
 * Valida telefone brasileiro (formato (00) 00000-0000 ou (00) 0000-0000)
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Telefone é obrigatório' };

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, message: 'Telefone inválido' };
  }

  return { valid: true, message: '' };
};

/**
 * Valida CPF brasileiro
 */
export const validateCPF = (cpf) => {
  if (!cpf) return { valid: false, message: 'CPF é obrigatório' };

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return { valid: false, message: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: 'CPF inválido' };
  }

  // Valida dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return { valid: false, message: 'CPF inválido' };
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return { valid: false, message: 'CPF inválido' };
  }

  return { valid: true, message: '' };
};

/**
 * Valida nome completo (mínimo 2 palavras)
 */
export const validateFullName = (name) => {
  if (!name) return { valid: false, message: 'Nome é obrigatório' };

  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);

  if (words.length < 2) {
    return { valid: false, message: 'Digite nome e sobrenome' };
  }

  if (trimmed.length < 3) {
    return { valid: false, message: 'Nome muito curto' };
  }

  return { valid: true, message: '' };
};

/**
 * Valida idade (mínimo e máximo)
 */
export const validateAge = (birthDate, minAge = 13, maxAge = 120) => {
  if (!birthDate) return { valid: false, message: 'Data de nascimento é obrigatória' };

  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    return { valid: false, message: 'Data inválida' };
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < minAge) {
    return { valid: false, message: `Idade mínima: ${minAge} anos` };
  }

  if (age > maxAge) {
    return { valid: false, message: `Idade máxima: ${maxAge} anos` };
  }

  return { valid: true, message: '', age };
};

/**
 * Formata número de cartão (adiciona espaços a cada 4 dígitos)
 */
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

/**
 * Formata data de validade (adiciona / após 2 dígitos)
 */
export const formatCardExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  return cleaned;
};

/**
 * Formata CEP (adiciona hífen)
 */
export const formatCEP = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 5) {
    return cleaned.substring(0, 5) + '-' + cleaned.substring(5, 8);
  }
  return cleaned;
};

/**
 * Formata CPF
 */
export const formatCPF = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 9) {
    return cleaned.substring(0, 3) + '.' +
           cleaned.substring(3, 6) + '.' +
           cleaned.substring(6, 9) + '-' +
           cleaned.substring(9, 11);
  } else if (cleaned.length >= 6) {
    return cleaned.substring(0, 3) + '.' +
           cleaned.substring(3, 6) + '.' +
           cleaned.substring(6);
  } else if (cleaned.length >= 3) {
    return cleaned.substring(0, 3) + '.' + cleaned.substring(3);
  }
  return cleaned;
};

/**
 * Formata telefone brasileiro
 */
export const formatPhone = (value) => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length >= 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  } else if (cleaned.length >= 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length >= 6) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length >= 2) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  }

  return cleaned;
};
