import { useState, useRef } from 'react';
import './FileInput.css';

function FileInput({
  label,
  onChange,
  error,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 5 * 1024 * 1024, // 5MB padrão
  required = false
}) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrorMsg('');

    if (!file) {
      setPreview(null);
      setFileName('');
      onChange(null);
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
      setPreview(null);
      setFileName('');
      onChange(null);
      return;
    }

    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setErrorMsg(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      setPreview(null);
      setFileName('');
      onChange(null);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFileName(file.name);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-input-wrapper">
      {label && (
        <label className="file-input-label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="file-input-hidden"
      />

      {!preview ? (
        <div className="file-input-dropzone" onClick={handleClick}>
          <div className="file-input-icon">📁</div>
          <div className="file-input-text">
            <span className="file-input-primary">Clique para selecionar imagem</span>
            <span className="file-input-secondary">JPG, PNG ou WEBP (máx. 5MB)</span>
          </div>
        </div>
      ) : (
        <div className="file-input-preview">
          <img src={preview} alt="Preview" className="file-input-preview-image" />
          <div className="file-input-preview-info">
            <span className="file-input-preview-name">{fileName}</span>
            <div className="file-input-preview-actions">
              <button
                type="button"
                onClick={handleClick}
                className="file-input-change-btn"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="file-input-remove-btn"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {(error || errorMsg) && (
        <span className="file-input-error">{error || errorMsg}</span>
      )}
    </div>
  );
}

export default FileInput;
