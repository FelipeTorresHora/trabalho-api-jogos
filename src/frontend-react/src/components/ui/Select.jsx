import './Select.css';

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error = null,
  disabled = false,
  placeholder = 'Selecione...'
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={error ? 'error' : ''}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="field-error text-error">{error}</div>}
    </div>
  );
}

export default Select;
