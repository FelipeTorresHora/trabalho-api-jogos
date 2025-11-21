import React from 'react';
import './PasswordStrength.css';

const PasswordStrength = ({ password, validation }) => {
  if (!password) return null;

  const getStrengthColor = () => {
    switch (validation.strengthLevel) {
      case 'strong':
        return 'var(--success-color, #10b981)';
      case 'medium':
        return 'var(--warning-color, #f59e0b)';
      case 'weak':
        return 'var(--error-color, #ef4444)';
      default:
        return 'var(--text-secondary, #666)';
    }
  };

  const getStrengthLabel = () => {
    switch (validation.strengthLevel) {
      case 'strong':
        return 'Forte';
      case 'medium':
        return 'Média';
      case 'weak':
        return 'Fraca';
      default:
        return '';
    }
  };

  const strengthPercentage = (validation.strength / 5) * 100;

  return (
    <div className="password-strength">
      <div className="password-strength-bar-container">
        <div
          className="password-strength-bar"
          style={{
            width: `${strengthPercentage}%`,
            backgroundColor: getStrengthColor()
          }}
        />
      </div>

      <div className="password-strength-info">
        <span className="password-strength-label" style={{ color: getStrengthColor() }}>
          Força da senha: {getStrengthLabel()}
        </span>

        {validation.strength < 5 && (
          <div className="password-requirements">
            <span className="requirements-title">Requisitos:</span>
            <ul className="requirements-list">
              {!validation.checks.minLength && (
                <li className="requirement-item incomplete">Mínimo 8 caracteres</li>
              )}
              {!validation.checks.hasUpperCase && (
                <li className="requirement-item incomplete">1 letra maiúscula</li>
              )}
              {!validation.checks.hasLowerCase && (
                <li className="requirement-item incomplete">1 letra minúscula</li>
              )}
              {!validation.checks.hasNumber && (
                <li className="requirement-item incomplete">1 número</li>
              )}
              {!validation.checks.hasSpecialChar && (
                <li className="requirement-item incomplete">1 caractere especial (!@#$%...)</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {validation.strengthLevel === 'strong' && (
        <div className="password-strength-success">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
          Senha forte! Sua conta está segura.
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
