import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

const toastStyles = {
  success: {
    bg: 'bg-emerald-500/90',
    border: 'border-emerald-400/50',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-yellow-500/90',
    border: 'border-yellow-400/50',
    icon: AlertCircle,
    iconColor: 'text-yellow-400',
  },
  danger: {
    bg: 'bg-rose-500/90',
    border: 'border-rose-400/50',
    icon: XCircle,
    iconColor: 'text-rose-400',
  },
  info: {
    bg: 'bg-sky-500/90',
    border: 'border-sky-400/50',
    icon: Info,
    iconColor: 'text-sky-400',
  },
};

export function Toast({ 
  type, 
  title, 
  message, 
  isVisible, 
  onClose, 
  autoHide = true, 
  duration = 4000 
}: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHide, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const style = toastStyles[type];
  const IconComponent = style.icon;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="pt-safe-top px-4 py-3">
        <div 
          className={`
            ${style.bg} ${style.border} backdrop-blur-md border rounded-2xl p-4 shadow-lg shadow-black/20 pointer-events-auto
            transform transition-all duration-300 ease-out
            ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          `}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">
                {title}
              </h3>
              {message && (
                <p className="text-white/90 text-sm mt-1">
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Banner component for persistent messages
interface BannerProps {
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export function Banner({ type, title, message, action, onClose }: BannerProps) {
  const style = toastStyles[type];
  const IconComponent = style.icon;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pt-safe-top px-4 py-3">
        <div className={`${style.bg} ${style.border} backdrop-blur-md border rounded-2xl p-4 shadow-lg shadow-black/20 pointer-events-auto`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">
                {title}
              </h3>
              {message && (
                <p className="text-white/90 text-sm mt-1">
                  {message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-white font-medium text-sm px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {action.label}
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}