import './Spinner.css';

function Spinner({ size = 'medium' }) {
  return <div className={`spinner spinner-${size}`}></div>;
}

export default Spinner;
