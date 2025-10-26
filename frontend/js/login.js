// Login Page JavaScript

// Check if user is already logged in
if (Auth.isLoggedIn()) {
  window.location.href = 'home.html';
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form values
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Clear previous errors
  clearFieldError(document.getElementById('email'));
  clearFieldError(document.getElementById('password'));

  // Validate form
  const validation = validateForm(
    { email, password },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    }
  );

  if (!validation.isValid) {
    // Show field errors
    if (validation.errors.email) {
      showFieldError(document.getElementById('email'), validation.errors.email);
    }
    if (validation.errors.password) {
      showFieldError(document.getElementById('password'), validation.errors.password);
    }
    return;
  }

  // Disable submit button during login
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Entrando...';

  try {
    // Attempt login via API
    const result = await AuthAPI.login(email, password);

    if (result.success) {
      // Decodificar token para obter o ID do usuário
      const token = result.data.token;
      const decoded = API.decodeToken(token);

      if (decoded && decoded.id) {
        // Buscar dados completos do usuário (para dados extras como email, data_nascimento)
        const userResult = await UserAPI.getById(decoded.id);

        if (userResult.success && userResult.data) {
          // Combinar dados da API com dados do token (token tem prioridade no perfil)
          const userToStore = {
            id: decoded.id,
            nome: decoded.nome,
            perfil: decoded.perfil,  // Usar perfil do token (sempre correto)
            email: userResult.data.email,
            data_nascimento: userResult.data.data_nascimento,
            telefone: userResult.data.telefone
          };
          Storage.set('currentUser', userToStore);
          debugLog('User data saved:', userToStore);
        } else {
          // Se falhar ao buscar dados, salvar apenas dados do token
          const userToStore = {
            id: decoded.id,
            nome: decoded.nome,
            perfil: decoded.perfil
          };
          Storage.set('currentUser', userToStore);
          debugLog('User data from token saved:', userToStore);
        }
      }

      showSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 500);
    } else{
      // Show error banner
      showError(result.error || 'Email ou senha incorretos');

      // Add error styling to fields
      document.getElementById('email').classList.add('error');
      document.getElementById('password').classList.add('error');

      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Erro ao conectar com o servidor');

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Clear error styling when user starts typing
document.getElementById('email').addEventListener('input', function() {
  clearFieldError(this);
});

document.getElementById('password').addEventListener('input', function() {
  clearFieldError(this);
});
