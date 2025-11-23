import { useEffect } from 'react';
import './ErrorModal.css';

function ErrorModal({ isOpen, errors, onClose, title = 'Erros no Formulário' }) {
  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Não renderiza se não está aberto ou não há erros
  if (!isOpen || !errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="error-modal-header">
          <div className="error-icon">⚠️</div>
          <h2>{title}</h2>
          <button
            className="error-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="error-modal-body">
          <ul className="error-list">
            {errors.map((error, index) => (
              <li key={index}>
                <span className="error-bullet">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="error-modal-footer">
          <button className="error-modal-button" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
