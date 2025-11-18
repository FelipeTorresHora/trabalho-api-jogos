import Header from './Header';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import './Layout.css';

function Layout({ children, showSearch = false, onSearch }) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="app-layout">
      <Header onSearch={showSearch ? onSearch : null} />
      <main className="main-content">{children}</main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Layout;
