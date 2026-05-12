import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastHostProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastHost({ toasts, onDismiss }: ToastHostProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 print:hidden"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
            t.variant === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950'
              : t.variant === 'error'
                ? 'border-red-200 bg-red-50/95 text-red-950'
                : 'border-slate-200 bg-white/95 text-slate-900'
          }`}
        >
          {t.variant === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : t.variant === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
          )}
          <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 rounded p-1 text-slate-500 hover:bg-black/5 hover:text-slate-800"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
