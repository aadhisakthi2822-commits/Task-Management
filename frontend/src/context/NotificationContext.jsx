import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const openEmailDrawer = () => setIsEmailDrawerOpen(true);
  const closeEmailDrawer = () => setIsEmailDrawerOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        isEmailDrawerOpen,
        openEmailDrawer,
        closeEmailDrawer,
      }}
    >
      {children}

      {/* Floating Toasts Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-violet-50 border-violet-200 text-violet-900'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              {toast.type === 'warning' && (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-violet-600" />
              )}
            </div>
            <div className="flex-1 font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
