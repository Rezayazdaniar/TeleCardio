import React, { useState } from 'react';
import { 
  Heart, ShieldAlert, ArrowLeft, XCircle, CheckCircle, 
  Sparkles, FileText, Smartphone, Eye, Hospital, PhoneCall
} from 'lucide-react';

interface Props {
  onStartLogin: () => void;
  onExit: () => void;
  onOpenPatentCompare: () => void;
}

export const PatentPageOne: React.FC<Props> = ({
  onStartLogin,
  onExit,
  onOpenPatentCompare,
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'sketch_frame'>('app');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Top Banner identifying Page 1 of the Patent */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
          <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            ص ۱
          </span>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">
              صفحه ابتدایی پتنت (صفحه اول - ص ۱)
            </h2>
            <p className="text-xs text-slate-500">
              ورودی اولیه سامانه Tele D: تعهدنامه و تفکیک مشاوره غیرحضوری از اورژانس
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setViewMode(viewMode === 'app' ? 'sketch_frame' : 'app')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            <span>{viewMode === 'app' ? 'نمایش در قالب فریم گوشی (مشابه اسکچ)' : 'نمایش استاندارد تمام صفحه'}</span>
          </button>

          <button
            onClick={onOpenPatentCompare}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>بررسی ایده پتنت</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`transition-all duration-300 mx-auto ${
        viewMode === 'sketch_frame' 
          ? 'max-w-md bg-slate-900 p-4 rounded-[42px] shadow-2xl border-4 border-slate-700' 
          : 'w-full'
      }`}>
        
        {/* Device speaker & camera notch if sketch_frame */}
        {viewMode === 'sketch_frame' && (
          <div className="w-full flex justify-center mb-3">
            <div className="w-20 h-4 bg-slate-800 rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-8 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Card Body directly representing Sketch Page 1 */}
        <div className={`bg-white overflow-hidden shadow-xl border border-slate-200 flex flex-col justify-between ${
          viewMode === 'sketch_frame' 
            ? 'rounded-[30px] min-h-[580px] p-5 sm:p-6 text-right' 
            : 'rounded-3xl p-6 sm:p-10'
        }`}>

          {/* Header section from sketch */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md mb-3">
              <Heart className="w-8 h-8 fill-white text-rose-600 animate-pulse" />
            </div>
            
            {/* Exactly as written on top of sketch Page 1: Tele D */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tele D
            </h1>
            
            {/* Sub-header from sketch: مشاوره پزشکی از راه دور */}
            <p className="text-sm sm:text-base font-bold text-rose-600 mt-1">
              مشاوره پزشکی از راه دور
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              واحد تریاژ و تله‌کاردیولوژی مرکز خدمات جامع سلامت
            </p>
          </div>

          {/* Core Text Clauses from Sketch Page 1 */}
          <div className="py-6 space-y-5 text-slate-700 flex-1">
            
            {/* Clause 1 from sketch: * این سامانه در حال حاضر تنها مشاوره‌های پزشکی در خصوص بیماری‌های ... را قبول می‌کند */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3 text-right">
              <span className="text-rose-600 font-bold text-lg leading-none mt-1 shrink-0">*</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                این سامانه در حال حاضر تنها مشاوره‌های پزشکی در خصوص{' '}
                <span className="font-extrabold text-rose-700 underline decoration-rose-400">
                  بیماری‌ها و علائم قلبی و عروقی
                </span>{' '}
                را قبول می‌کند.
              </p>
            </div>

            {/* Clause 2 from sketch: // * این نوع از مشاوره می‌تواند به پزشک معالج در روند تشخیص و درمان را تسهیل کند و هرگز جایگزین اقدامات اورژانسی و حضور فیزیکی در موارد اورژانسی نیست و نمی‌توان بر اساس آن اقدام به خوددرمانی کرد */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-right">
              <span className="text-amber-600 font-bold text-lg leading-none mt-1 shrink-0">// *</span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                این نوع از مشاوره می‌تواند به پزشک معالج در روند{' '}
                <span className="font-bold text-slate-900">تشخیص و درمان</span> را تسهیل کند و{' '}
                <span className="font-extrabold text-red-700 underline decoration-red-400">
                  هرگز جایگزین اقدامات اورژانسی و حضور فیزیکی در موارد اورژانسی نیست
                </span>{' '}
                و نمی‌توان بر اساس آن اقدام به خوددرمانی کرد.
              </p>
            </div>

            {/* Emergency Hotline Alert */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>درد شدید قفسه سینه یا تنگی نفس حاد؟ فوراً تماس بگیرید:</span>
              </div>
              <a
                href="tel:115"
                className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1 shrink-0 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>اورژانس ۱۱۵</span>
              </a>
            </div>

            {/* Checkbox agreement */}
            <label
              onClick={() => setAcceptedDisclaimer(!acceptedDisclaimer)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors select-none"
            >
              <input
                type="checkbox"
                checked={acceptedDisclaimer}
                onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                مفاد تعهدنامه صفحه اول را مطالعه کرده و می‌پذیرم.
              </span>
            </label>

          </div>

          {/* Bottom Buttons - EXACTLY from Sketch Page 1:
              Right button: "شروع شدم ، ورود"
              Left button: "نمی‌پذیرم ، خروج"
          */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            
            {/* Left Button from sketch: "نمی‌پذیرم ، خروج" */}
            <button
              type="button"
              onClick={onExit}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>نمی‌پذیرم ، خروج</span>
            </button>

            {/* Right Button from sketch: "شروع شدم ، ورود" */}
            <button
              type="button"
              onClick={onStartLogin}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md transition-all ${
                acceptedDisclaimer
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer hover:shadow-lg scale-102'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              <span>شروع شدم ، ورود</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Physical Home Button simulation if sketch_frame */}
        {viewMode === 'sketch_frame' && (
          <div className="w-full flex justify-center mt-3">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center">
              <div className="w-4 h-4 rounded-md border border-slate-600" />
            </div>
          </div>
        )}

      </div>

      {/* Footer annotation identifying the patent origin */}
      <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
        <FileText className="w-4 h-4 text-slate-400" />
        <span>منطبق با اسکچ دست‌نویس صفحه ۱ پتنت (ص ۱) — عنوان سامانه: Tele D</span>
      </div>

    </div>
  );
};
