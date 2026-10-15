import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Check, FileText, Pill, Shield, Activity, 
  ExternalLink, Sparkles, CheckCheck, X
} from 'lucide-react';
import { InAppNotification } from '../types';

interface Props {
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: InAppNotification) => void;
  onTriggerSimulatedNotif?: () => void;
}

export const NotificationBell: React.FC<Props> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
  onTriggerSimulatedNotif,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconForType = (type: InAppNotification['type']) => {
    switch (type) {
      case 'additional_info_requested':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'prescription_added':
        return <Pill className="w-4 h-4 text-rose-600" />;
      case 'specialist_reply':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'triage_approved':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        title="اعلان‌ها و پیام‌های بالینی"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-right animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-600/80 rounded-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-100">
                  صندوق اعلان‌های پزشکی
                </h4>
                <p className="text-[10px] text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} پیام خوانده نشده` : 'همه پیام‌ها خوانده شده است'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-rose-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                title="علامت‌گذاری همه به عنوان خوانده شده"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>خواندن همه</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                هیچ اعلانی یافت نشد.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onSelectNotification(notif);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                    !notif.read ? 'bg-rose-50/40' : 'bg-white'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                    !notif.read ? 'bg-white border-rose-200 shadow-2xs' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {getIconForType(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className={`text-xs truncate ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </h5>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{notif.timestamp}</span>
                      {notif.highlightBadge && (
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          {notif.highlightBadge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Simulation Trigger */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            {onTriggerSimulatedNotif && (
              <button
                type="button"
                onClick={onTriggerSimulatedNotif}
                className="inline-flex items-center gap-1.5 text-[11px] text-rose-700 hover:text-rose-900 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>شبیه‌سازی دریافت پاسخ جدید پزشک</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-[11px]"
            >
              بستن
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
