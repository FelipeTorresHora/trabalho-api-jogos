import React from 'react';
import './CardBrandIcon.css';

const CardBrandIcon = ({ brand, size = 'medium' }) => {
  const getBrandInfo = (brandName) => {
    switch (brandName) {
      case 'visa':
        return {
          name: 'Visa',
          color: '#1A1F71',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#1A1F71"/>
              <path d="M20.5 11h-3.2l-2 10h2l2-10zm7.6 6.5l1-3.5 1.8 3.5h-2.8zm2.4 3.5h1.8l-1.6-10h-1.7c-.4 0-.7.2-.8.5l-2.8 9.5h2.1l.4-1.2h2.5l.1 1.2zm-5.8-3.2c0 2.6-3.5 2.7-3.5 3.9 0 .4.4.8 1.2.9.4 0 1.5.1 2.2-.4l.4 1.8c-.5.2-1.2.4-2.1.4-2.1 0-3.6-1.1-3.6-2.7 0-2.3 3.2-2.5 3.2-3.5 0-.3-.3-.7-1-.8-.7-.1-1.9.1-2.4.4l-.4-1.7c.6-.2 1.6-.4 2.7-.4 2.2-.1 3.3 1.1 3.3 2.1z" fill="white"/>
            </svg>
          )
        };
      case 'mastercard':
        return {
          name: 'Mastercard',
          color: '#EB001B',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#252525"/>
              <circle cx="18" cy="16" r="8" fill="#EB001B"/>
              <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
              <path d="M24 9.5c-1.3 1.5-2 3.4-2 5.5s.7 4 2 5.5c1.3-1.5 2-3.4 2-5.5s-.7-4-2-5.5z" fill="#FF5F00"/>
            </svg>
          )
        };
      case 'amex':
        return {
          name: 'American Express',
          color: '#006FCF',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#006FCF"/>
              <path d="M15 12h-4l-1 2h5l1-2zm-1.5 3h-4l-1 2h5l1-2zm11 2l-2-5h-2l-2 5h1.8l.4-1h2.6l.4 1h1.8zm-2.8-2.5l.8 2h-1.6l.8-2zM27 12l-1.5 2.5L24 12h-2l2 3-2 2h2l1.5-2 1.5 2h2l-2-2 2-3h-2zm5.5 0h-4v5h4v-1.2h-2.5v-.8h2.5v-1.2h-2.5v-.8h2.5V12z" fill="white"/>
            </svg>
          )
        };
      case 'elo':
        return {
          name: 'Elo',
          color: '#FFCB05',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#000"/>
              <circle cx="18" cy="16" r="6" fill="#FFCB05"/>
              <circle cx="30" cy="16" r="6" fill="#00A3E0"/>
              <path d="M24 12c-1 1.2-1.5 2.6-1.5 4s.5 2.8 1.5 4c1-1.2 1.5-2.6 1.5-4s-.5-2.8-1.5-4z" fill="#EE4023"/>
            </svg>
          )
        };
      case 'discover':
        return {
          name: 'Discover',
          color: '#FF6000',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#FF6000"/>
              <text x="24" y="20" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">DISCOVER</text>
            </svg>
          )
        };
      case 'diners':
        return {
          name: 'Diners Club',
          color: '#0079BE',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#0079BE"/>
              <circle cx="18" cy="16" r="7" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="30" cy="16" r="7" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          )
        };
      case 'jcb':
        return {
          name: 'JCB',
          color: '#0E4C96',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#0E4C96"/>
              <text x="24" y="20" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">JCB</text>
            </svg>
          )
        };
      case 'hipercard':
        return {
          name: 'Hipercard',
          color: '#C41E3A',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#C41E3A"/>
              <text x="24" y="20" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">HIPERCARD</text>
            </svg>
          )
        };
      default:
        return {
          name: 'Cartão',
          color: '#666',
          icon: (
            <svg viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#666"/>
              <rect x="4" y="14" width="40" height="4" fill="#999"/>
              <rect x="4" y="22" width="12" height="2" fill="#999"/>
              <rect x="18" y="22" width="12" height="2" fill="#999"/>
            </svg>
          )
        };
    }
  };

  const brandInfo = getBrandInfo(brand);

  return (
    <div className={`card-brand-icon card-brand-icon-${size}`} title={brandInfo.name}>
      {brandInfo.icon}
    </div>
  );
};

export default CardBrandIcon;
