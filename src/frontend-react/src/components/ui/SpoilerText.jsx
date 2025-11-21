import React, { useState } from 'react';
import './SpoilerText.css';

/**
 * Componente para exibir texto com spoiler
 * O texto é oculto por padrão e pode ser revelado pelo usuário
 */
const SpoilerText = ({ text }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Parse text to find spoilers marked with [SPOILER]...[/SPOILER]
  const parseText = (content) => {
    if (!content) return [];

    const regex = /\[SPOILER\](.*?)\[\/SPOILER\]/gs;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before spoiler
      if (match.index > lastIndex) {
        parts.push({
          type: 'normal',
          text: content.substring(lastIndex, match.index)
        });
      }

      // Add spoiler content
      parts.push({
        type: 'spoiler',
        text: match[1]
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text after last spoiler
    if (lastIndex < content.length) {
      parts.push({
        type: 'normal',
        text: content.substring(lastIndex)
      });
    }

    return parts;
  };

  const parts = parseText(text);
  const hasSpoilers = parts.some(part => part.type === 'spoiler');

  // If no spoilers found, render normally
  if (!hasSpoilers) {
    return <div className="spoiler-text">{text}</div>;
  }

  return (
    <div className="spoiler-text">
      {parts.map((part, index) => {
        if (part.type === 'spoiler') {
          return (
            <span key={index} className="spoiler-container">
              <button
                className={`spoiler ${isRevealed ? 'revealed' : 'hidden'}`}
                onClick={() => setIsRevealed(!isRevealed)}
                aria-label={isRevealed ? 'Ocultar spoiler' : 'Revelar spoiler'}
                title={isRevealed ? 'Clique para ocultar' : 'Clique para revelar spoiler'}
              >
                {isRevealed ? (
                  <span className="spoiler-text-revealed">{part.text}</span>
                ) : (
                  <span className="spoiler-text-hidden">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                    </svg>
                    Contém Spoiler (clique para revelar)
                  </span>
                )}
              </button>
            </span>
          );
        }

        return <span key={index}>{part.text}</span>;
      })}
    </div>
  );
};

export default SpoilerText;
