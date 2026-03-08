'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const toastContext = new Map<string, ToastContextType>();

export function createToastContext(): ToastContextType {
  const contextId = Date.now().toString();
  const context: ToastContextType = {
    toasts: [],
    addToast: (toast) => {
      const id = Date.now().toString() + Math.random();
      context.toasts.push({ ...toast, id });

      if (toast.duration !== -1) {
        setTimeout(() => {
          context.removeToast(id);
        }, toast.duration || 5000);
      }
    },
    removeToast: (id) => {
      context.toasts = context.toasts.filter((t) => t.id !== id);
    },
  };
  toastContext.set(contextId, context);
  return context;
}

export function useToast(): ToastContextType['addToast'] {
  const [context] = useState(() => createToastContext());

  return (toast) => context.addToast(toast);
}

/**
 * Toast Container Component - displays all active toasts
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update toasts from context
      const allToasts: Toast[] = [];
      toastContext.forEach((ctx) => {
        allToasts.push(...ctx.toasts);
      });
      setToasts(allToasts);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const removeToast = (id: string) => {
    toastContext.forEach((ctx) => {
      ctx.removeToast(id);
    });
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const typeIcons = {
    success: <CheckCircle size={20} className="text-green-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    warning: <AlertCircle size={20} className="text-yellow-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const typeBgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const typeTextColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 flex items-start gap-3 animate-in slide-in-from-right ${
            typeBgColors[toast.type]
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">{typeIcons[toast.type]}</div>

          <div className="flex-1">
            <p className={`font-medium ${typeTextColors[toast.type]}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`text-sm mt-1 ${typeTextColors[toast.type]}`}>
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Hook for simple toast notifications
 */
export function useSimpleToast() {
  const addToast = useToast();

  return {
    success: (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    error: (title: string, message?: string) => {
      addToast({ type: 'error', title, message });
    },
    info: (title: string, message?: string) => {
      addToast({ type: 'info', title, message });
    },
    warning: (title: string, message?: string) => {
      addToast({ type: 'warning', title, message });
    },
  };
}
