import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

interface Props {
  onCallEmergency?: () => void;
  onOpenEmergencyContacts?: () => void;
}

export const CardiacEmergencyBanner: React.FC<Props> = ({ onOpenEmergencyContacts }) => {
  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md border-b border-red-800">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
          <div className="p-1.5 bg-red-800/80 rounded-lg shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          </div>
          <p className="leading-relaxed">
            <span className="font-bold text-amber-200 ml-1">هشدار علائم اورژانسی قلب:</span>
            در صورت بروز درد شدید فشاری قفسه سینه، انتشار درد به دست چپ، گردن یا فک، تنگی نفس حاد یا تعریق سرد ناگهانی، این سامانه جایگزین اورژانس نیست.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenEmergencyContacts && (
            <button
              type="button"
              onClick={onOpenEmergencyContacts}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-900/60 hover:bg-red-900 text-red-100 rounded-lg text-xs font-semibold border border-red-400/40 transition-colors"
            >
              <span>مخاطبین اضطراری بیمار</span>
            </button>
          )}
          <a
            href="tel:115"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>تماس با اورژانس ۱۱۵</span>
          </a>
        </div>
      </div>
    </div>
  );
};
