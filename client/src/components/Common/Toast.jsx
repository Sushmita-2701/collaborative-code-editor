import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#1e293b]',
    error: 'border-rose-500/40 bg-[#1e293b]',
    info: 'border-sky-500/40 bg-[#1e293b]'
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white ${borders[type] || borders.info} animate-slide-up`}>
      {icons[type] || icons.info}
      <span className="text-xs font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
