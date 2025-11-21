import React, { useEffect } from 'react';
import Button from './Button';
import './ConfirmDialog.css';

/**
 * Componente de diálogo de confirmação
 * Substitui window.confirm com uma interface customizada
 *
 * @param {boolean} isOpen - Se o diálogo está aberto
 * @param {function} onConfirm - Callback quando confirmado
 * @param {function} onCancel - Callback quando cancelado
 * @param {string} title - Título do diálogo
 * @param {string} message - Mensagem do diálogo
 * @param {string} confirmText - Texto do botão de confirmação (padrão: "Confirmar")
 * @param {string} cancelText - Texto do botão de cancelar (padrão: "Cancelar")
 * @param {string} type - Tipo do diálogo: danger, warning, info, success (padrão: "warning")
 */
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  children
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(239, 68, 68, 0.1)" stroke="#EF4444" strokeWidth="2"/>
            <path d="M24 14v14m0 4h.01" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L44 40H4L24 4z" fill="rgba(245, 158, 11, 0.1)" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M24 18v10m0 4h.01" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(59, 130, 246, 0.1)" stroke="#3B82F6" strokeWidth="2"/>
            <path d="M24 22v12m0-16h.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'success':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(16, 185, 129, 0.1)" stroke="#10B981" strokeWidth="2"/>
            <path d="M14 24l8 8 16-16" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className={`confirm-dialog confirm-dialog-${type}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="confirm-dialog-icon">
          {getIcon()}
        </div>

        <div className="confirm-dialog-content">
          <h2 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h2>

          {message && (
            <p className="confirm-dialog-message">
              {message}
            </p>
          )}

          {children && (
            <div className="confirm-dialog-children">
              {children}
            </div>
          )}
        </div>

        <div className="confirm-dialog-actions">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="confirm-dialog-cancel-btn"
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="confirm-dialog-confirm-btn"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
