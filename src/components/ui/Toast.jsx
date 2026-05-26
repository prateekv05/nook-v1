'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

export const ToastContext = createContext({ showToast: () => {} });

const TYPE_COLORS = {
  success: 'var(--fin-col)',
  error: 'var(--red-col)',
  info: 'var(--know-col)',
};

const TYPE_ICONS = {
  success: 'ph-check-circle',
  error: 'ph-x-circle',
  info: 'ph-info',
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      timers.current[id] = setTimeout(() => {
        removeToast(id);
        delete timers.current[id];
      }, 2500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item${toast.exiting ? ' toast-exit' : ' toast-enter'}`}
            style={{ '--toast-accent': TYPE_COLORS[toast.type] || TYPE_COLORS.success }}
            role="status"
          >
            <i className={`ph-bold ${TYPE_ICONS[toast.type] || TYPE_ICONS.success} toast-icon`} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default function Toast() {
  return null;
}
