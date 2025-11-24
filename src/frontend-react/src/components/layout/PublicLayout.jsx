import PublicHeader from './PublicHeader';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import './Layout.css';

function PublicLayout({ children }) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="app-layout">
      <PublicHeader />
      <main className="main-content">{children}</main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default PublicLayout;
