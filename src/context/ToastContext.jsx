import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'success', title = '', message = '', duration = 3500 }) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Success') => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((message, title = 'Error') => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((message, title = 'Warning') => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((message, title = 'Notice') => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  // SweetAlert-like luxury custom confirmation dialog
  const confirm = useCallback(({ 
    title = 'Are you sure?', 
    message = 'This action cannot be undone.', 
    confirmText = 'Yes, Confirm', 
    cancelText = 'Cancel', 
    type = 'danger',
    onConfirm, 
    onCancel 
  }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: () => {
        setConfirmDialog(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(null);
        if (onCancel) onCancel();
      }
    });
  }, []);

  const toast = {
    show: addToast,
    success,
    error,
    warning,
    info,
    confirm
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toasts Container (Top-Right / Bottom-Right) */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3.5 transform transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-500/10'
                : t.type === 'warning'
                ? 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-500/10'
                : 'bg-slate-900/95 text-white border-blue-500/40 shadow-blue-500/10'
            }`}
          >
            {/* Icon */}
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {t.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-pulse">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              {t.type === 'warning' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {t.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  {t.title}
                </h4>
              )}
              <p className="text-xs font-semibold text-slate-300 leading-relaxed break-words">
                {t.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* SweetAlert-Style Luxury Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-5 animate-scale-up text-slate-100">
            
            {/* Modal Icon */}
            <div className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl border bg-rose-500/10 border-rose-500/30 text-rose-400">
              {confirmDialog.type === 'danger' ? (
                <Trash2 className="w-8 h-8 animate-bounce" />
              ) : (
                <ShieldAlert className="w-8 h-8 animate-pulse text-amber-400" />
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white tracking-tight">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>

              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-[#e2f896] hover:bg-[#d4ed83] text-slate-950 shadow-lime-500/20'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>

          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
