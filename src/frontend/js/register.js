// Register Page JavaScript

// Check if user is already logged in
if (Auth.isLoggedIn()) {
  window.location.href = 'home.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  setupPhoneFormatting();
  setupFormHandling();
});

// Setup phone formatting
function setupPhoneFormatting() {
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 10) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
      }
      e.target.value = value;
    });
  }
}

// Setup form handling
function setupFormHandling() {
  const form = document.getElementById('registerForm');

  // Clear errors on input
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      clearFieldError(this);
    });
  });

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleRegister();
  });
}

// Handle registration
async function handleRegister() {
  // Get form values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const birthDate = document.getElementById('birthDate').value;
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Clear previous errors
  document.querySelectorAll('input').forEach(input => clearFieldError(input));

  let hasErrors = false;

  // Validate name
  if (!name || name.length < 3) {
    showFieldError(document.getElementById('name'), 'Nome deve ter pelo menos 3 caracteres');
    hasErrors = true;
  }

  // Validate email
  if (!validateEmail(email)) {
    showFieldError(document.getElementById('email'), 'Email inválido');
    hasErrors = true;
  }

  // Validate birth date
  if (!birthDate) {
    showFieldError(document.getElementById('birthDate'), 'Data de nascimento é obrigatória');
    hasErrors = true;
  } else {
    const age = calculateAge(birthDate);
    if (age < 13) {
      showFieldError(document.getElementById('birthDate'), 'Você deve ter pelo menos 13 anos');
      hasErrors = true;
    } else if (age > 120) {
      showFieldError(document.getElementById('birthDate'), 'Data de nascimento inválida');
      hasErrors = true;
    }
  }

  // Validate password
  if (password.length < 8) {
    showFieldError(document.getElementById('password'), 'Senha deve ter pelo menos 8 caracteres');
    hasErrors = true;
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    showFieldError(document.getElementById('confirmPassword'), 'As senhas não coincidem');
    hasErrors = true;
  }

  // Stop if there are errors
  if (hasErrors) {
    showError('Por favor, corrija os erros no formulário');
    return;
  }

  // Disable submit button
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Criando conta...';

  try {
    // Create user via API
    const userData = {
      name: name,
      email: email,
      password: password,
      perfilId: 2 // 2 = Cliente (usuário comum)
    };

    const result = await AuthAPI.register(userData);

    if (result.success) {
      showSuccess('Conta criada com sucesso! Fazendo login...');

      // Auto-login after registration
      setTimeout(async () => {
        const loginResult = await AuthAPI.login(email, password);
        if (loginResult.success) {
          // Save user data
          const userDataReceived = loginResult.data.usuario || loginResult.data.user;
          if (userDataReceived) {
            const userToStore = { ...userDataReceived };
            delete userToStore.senha;

            // Salvar usando campos do backend diretamente
            Storage.set('currentUser', userToStore);
            debugLog('User data saved after registration:', userToStore);
          }
          window.location.href = 'home.html';
        }
      }, 1500);
    } else {
      showError(result.error || 'Erro ao criar conta');

      // Check if email already exists error
      if (result.error && result.error.includes('email')) {
        showFieldError(document.getElementById('email'), 'Email já cadastrado');
      }

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('Erro ao conectar com o servidor');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Calculate age from birth date
function calculateAge(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
