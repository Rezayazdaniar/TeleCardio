import React from 'react';
import { Bell, X, ArrowLeft, Pill, FileText, CheckCircle2 } from 'lucide-react';
import { InAppNotification } from '../types';

interface Props {
  notification: InAppNotification | null;
  onDismiss: () => void;
  onAction: (notif: InAppNotification) => void;
}

export const NotificationToast: React.FC<Props> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-rose-500/40 relative overflow-hidden">
        
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-600 rounded-xl shrink-0 mt-0.5 shadow-md">
            {notification.type === 'prescription_added' ? (
              <Pill className="w-5 h-5 text-white" />
            ) : notification.type === 'additional_info_requested' ? (
              <FileText className="w-5 h-5 text-white" />
            ) : (
              <Bell className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-400 font-mono">
                اعلان فوری کلینیک مجازی
              </span>
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-slate-100 leading-tight">
              {notification.title}
            </h4>

            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{notification.timestamp}</span>

              <button
                onClick={() => onAction(notification)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <span>مشاهده در پرونده</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
