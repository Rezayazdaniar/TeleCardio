import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, AlertCircle, ArrowLeft, CheckSquare, Square, Hospital, HelpCircle } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
  onViewPatentNotes?: () => void;
}

export const DisclaimerStep: React.FC<Props> = ({ onAccept, onDecline, onViewPatentNotes }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedNotEmergency, setAgreedNotEmergency] = useState(false);

  const canProceed = agreedToTerms && agreedNotEmergency;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Patent Badge Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 mb-3 shadow-xs">
          <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
          <span>برگرفته از ایده و پتنت سامانه Tele D برای کلینیک مجازی قلب و عروق</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          مرکز مشاوره پزشکی از راه دور قلب و عروق
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          واحد تریاژ و تله‌کاردیولوژی مرکز خدمات جامع سلامت
        </p>
      </div>

      {/* Main Disclaimer Card - Replicating Patent Page 1 (صفحه اول پتنت) */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden relative">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-rose-200" />
            <div>
              <h2 className="font-bold text-base sm:text-lg">قرارداد و تعهدنامه اولیه مشاوره (صفحه اول پتنت)</h2>
              <span className="text-xs text-rose-100">سامانه پایش غیرحضوری علائم قلبی و ارجاع تریاژ</span>
            </div>
          </div>
          <span className="text-xs font-mono bg-rose-800/60 px-2.5 py-1 rounded-md border border-rose-400/30">
            TeleCardio (Tele D)
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-slate-700">
          
          {/* Exact clauses from the user's patent sketch */}
          <div className="space-y-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-2" />
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                این سامانه در حال حاضر تنها مشاوره‌های پزشکی در خصوص <span className="text-rose-700 font-extrabold underline decoration-rose-400">بیماری‌ها و علائم قلبی و عروقی</span> را قبول می‌کند.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-2" />
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                این نوع از مشاوره می‌تواند به پزشک معالج در روند <span className="font-bold text-slate-900">تشخیص و راهنمایی درمان</span> تسهیل نماید و <span className="font-extrabold text-red-700 underline">هرگز جایگزین اقدامات اورژانسی و حضور فیزیکی فوری نیست</span> و نمی‌توان بر اساس آن اقدام به خوددرمانی یا تغییر خودسرانه دوز داروهای قلبی کرد.
              </p>
            </div>
          </div>

          {/* Clinical Health Center Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-rose-600" />
                <span>نقش مرکز بهداشت و پزشک تریاژ</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                سوالات ابتدا توسط پزشک سطح اول (تریاژ مرکز بهداشت) غربالگری شده و در صورت نیاز، مستقیماً به متخصص یا فوق‌تخصص قلب ارجاع می‌گردد.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>پروتکل شرایط بحرانی</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                در صورت بروز هرگونه درد تیرکشنده شدید، تنگی نفس حاد استراحتی یا بیهوشی، ثبت درخواست را متوقف نموده و سریعاً با ۱۱۵ تماس بگیرید.
              </p>
            </div>
          </div>

          {/* Interactive Checkbox Confirmations */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors select-none"
            >
              <div className="mt-0.5 text-rose-600">
                {agreedToTerms ? <CheckSquare className="w-5 h-5 fill-rose-600 text-white" /> : <Square className="w-5 h-5 text-slate-400" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-800">
                متن تعهدنامه فوق را به دقت مطالعه کرده و شرایط خدمات مشاوره غیرحضوری قلب را می‌پذیرم.
              </span>
            </label>

            <label
              onClick={() => setAgreedNotEmergency(!agreedNotEmergency)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors select-none"
            >
              <div className="mt-0.5 text-rose-600">
                {agreedNotEmergency ? <CheckSquare className="w-5 h-5 fill-rose-600 text-white" /> : <Square className="w-5 h-5 text-slate-400" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-800">
                تأیید می‌کنم که هم‌اکنون دچار وضعیت اورژانسی حاد، درد شدید قفسه سینه یا تنگی نفس ناگهانی نیستم.
              </span>
            </label>
          </div>

          {/* Bottom Action Buttons (Directly from patent: شروع شدم / ورود | نمی‌پذیرم / خروج) */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              onClick={onDecline}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              نمی‌پذیرم، انصراف و خروج
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onViewPatentNotes && (
                <button
                  onClick={onViewPatentNotes}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>ایده‌های معماری پتنت</span>
                </button>
              )}

              <button
                onClick={onAccept}
                disabled={!canProceed}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  canProceed
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer hover:shadow-lg transform active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>شروع، تایید و ورود به سامانه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
