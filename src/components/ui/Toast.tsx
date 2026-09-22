/**
 * PROJETO ARES — Toast Notification System
 */
import { useMission } from '../../store/missionStore';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export default function ToastContainer() {
  const { toasts } = useMission();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon size={16} />
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
