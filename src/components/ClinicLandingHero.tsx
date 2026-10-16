import React, { useState } from 'react';
import { 
  Menu, User, Sparkles, ArrowRight, ArrowLeft, Clock, ChevronLeft, 
  Heart, ShieldAlert, PhoneCall, Activity, Stethoscope, ChevronRight, X
} from 'lucide-react';

interface Props {
  onStartTriageChat: () => void;
  onOpenChatHistory: () => void;
  onOpenLoginOrRoles: () => void;
  onOpenEmergencyContacts: () => void;
  activePatientName?: string;
  isDoctorMode?: boolean;
}

export const ClinicLandingHero: React.FC<Props> = ({
  onStartTriageChat,
  onOpenChatHistory,
  onOpenLoginOrRoles,
  onOpenEmergencyContacts,
  activePatientName = 'علیرضا رضایی',
  isDoctorMode = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100dvh-60px)] flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#e3f4fc] via-[#edf8fc] to-[#e1f5fb] px-4 py-4 sm:py-8 font-['Vazirmatn',system-ui,sans-serif] select-none">
      
      {/* Background Soft Wave Layers & Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
        <svg 
          viewBox="0 0 500 500" 
          className="w-[140%] max-w-[700px] h-auto text-sky-300 drop-shadow-sm" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Subtle curved wave outlines */}
          <path d="M-50,220 C120,180 180,310 320,240 C420,190 480,260 550,220" />
          <path d="M-50,280 C100,240 220,360 360,290 C450,240 500,310 550,280" />
          {/* Faint Center Heart Outline */}
          <path 
            d="M250,330 C200,270 160,220 160,170 C160,130 190,105 230,105 C245,105 255,115 250,125 C245,115 255,105 270,105 C310,105 340,130 340,170 C340,220 300,270 250,330 Z" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* Center Device Frame Container (optimized for mobile & desktop) */}
      <div className="relative z-10 w-full max-w-[420px] flex-1 flex flex-col justify-between py-2">
        
        {/* Top App Header: Menu on right (in RTL), Avatar on left (or vice versa matching the screenshot) */}
        <header className="w-full flex items-center justify-between px-2 pt-1 pb-3">
          {/* Hamburger / Menu */}
          <button 
            onClick={() => setDrawerOpen(true)}
            aria-label="منوی سامانه"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-white/70 active:scale-95 transition-all shadow-2xs"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Quick Emergency 115 badge */}
          <button
            onClick={onOpenEmergencyContacts}
            className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>اورژانس ۱۱۵</span>
          </button>

          {/* User Profile / Roles */}
          <button 
            onClick={onOpenLoginOrRoles}
            aria-label="ورود و پروفایل"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-white/70 active:scale-95 transition-all shadow-2xs relative"
          >
            <div className="w-9 h-9 rounded-full bg-white/90 border border-sky-200 flex items-center justify-center shadow-xs">
              {isDoctorMode ? (
                <Stethoscope className="w-5 h-5 text-sky-700" />
              ) : (
                <User className="w-5 h-5 text-sky-700" />
              )}
            </div>
          </button>
        </header>

        {/* Center Clinic Branding (Logo, Title, Subtitle) */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          
          {/* Heart Rhythm SVG Logo matching user's image */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="60%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Outer Blue Heart Outline */}
              <path 
                d="M50,86 C32,68 14,50 14,32 C14,18 25,12 36,12 C43,12 47,16 50,21 C53,16 57,12 64,12 C75,12 86,18 86,32 C86,50 68,68 50,86 Z" 
                fill="none" 
                stroke="url(#heartGradient)" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Inner Red Heartbeat ECG Rhythm */}
              <path 
                d="M18,48 L36,48 L41,34 L47,62 L53,28 L59,54 L63,48 L82,48" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#164e63] tracking-tight mb-1">
            کلینیک فوق تخصصی قلب
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide">
            — سلامت قلب، کیفیت زندگی —
          </p>
        </div>

        {/* Primary Interactive Triage Button: "بیا ببینیم توی چه ریسک قلبی هستی؟" */}
        <div className="w-full my-4 px-1">
          <button
            onClick={onStartTriageChat}
            className="w-full group bg-white hover:bg-sky-50/70 border border-sky-100 rounded-full py-3.5 px-4 sm:px-5 flex items-center justify-between shadow-[0_8px_25px_-5px_rgba(14,165,233,0.18)] hover:shadow-[0_10px_30px_-5px_rgba(14,165,233,0.28)] transition-all duration-300 active:scale-[0.98]"
          >
            {/* Left Sparkles Circle */}
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 fill-sky-500 text-sky-500" />
            </div>

            {/* Central Text */}
            <span className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight px-2 text-center">
              بیا ببینیم توی چه ریسک قلبی هستی؟
            </span>

            {/* Right Arrow Circle */}
            <div className="w-9 h-9 rounded-full bg-[#1b739e] text-white flex items-center justify-center shrink-0 group-hover:bg-[#155e82] transition-colors shadow-xs">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Center Watermark Heart & Waves Graphic matching image */}
        <div className="my-auto py-4 flex items-center justify-center relative pointer-events-none">
          <div className="w-48 h-24 relative opacity-60">
            <svg viewBox="0 0 200 100" className="w-full h-full text-sky-300/80">
              {/* Soft gentle wave */}
              <path 
                d="M0,50 Q50,20 100,50 T200,50" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
              />
              {/* Heart Outline with ECG rhythm */}
              <path 
                d="M100,75 C85,60 70,45 70,30 C70,18 80,12 90,12 C96,12 100,16 100,16 C100,16 104,12 110,12 C120,12 130,18 130,30 C130,45 115,60 100,75 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
              />
              <path 
                d="M80,40 L94,40 L97,28 L103,50 L107,32 L110,40 L120,40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Login / Switch Button: "ورود ←" */}
        <div className="w-full flex justify-center mb-6 px-1">
          <button
            onClick={onOpenLoginOrRoles}
            className="w-44 py-3 rounded-full bg-[#1b739e] hover:bg-[#155e82] text-white font-bold text-sm shadow-[0_4px_16px_rgba(27,115,158,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>ورود</span>
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Card: "سابقه چت / مشاهده گفتگوهای قبلی" */}
        <div className="w-full px-1 mb-4">
          <button
            onClick={onOpenChatHistory}
            className="w-full group bg-white/90 hover:bg-white rounded-2xl p-3.5 border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.12)] flex items-center justify-between transition-all active:scale-[0.99]"
          >
            {/* Clock Icon in circular background */}
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>

            {/* Labels */}
            <div className="text-right flex-1 pr-3">
              <div className="font-extrabold text-sm text-slate-800">
                سابقه چت
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                مشاهده گفتگوهای قبلی
              </div>
            </div>

            {/* Chevron Right (in RTL leads forward) */}
            <div className="text-slate-400 group-hover:text-sky-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Bottom Accent: — ♡ — and home indicator */}
        <footer className="w-full flex flex-col items-center pt-2">
          {/* Heart divider */}
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-12 h-[1.5px] bg-slate-300/80 rounded-full" />
            <Heart className="w-3.5 h-3.5 text-slate-400" />
            <div className="w-12 h-[1.5px] bg-slate-300/80 rounded-full" />
          </div>

          {/* Mobile Home Bar Indicator */}
          <div className="w-28 h-1 bg-slate-800/80 rounded-full mt-4" />
        </footer>

      </div>

      {/* Slide-out Navigation Drawer for Clinic Options */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between p-5 text-right font-['Vazirmatn']">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">کلینیک فوق تخصصی قلب</span>
                  <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-white">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onStartTriageChat();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>شروع چت تریاژ هوشمند</span>
                  </span>
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenChatHistory();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>سوابق گفتگوها و مشاوره‌ها</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenLoginOrRoles();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>کارتابل پزشک متخصص</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenEmergencyContacts();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>مخاطبین اضطراری و تماس ۱۱۵</span>
                  </span>
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              سامانه تله‌کاردیولوژی مرکز خدمات جامع سلامت
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
