import React, { useState } from 'react';
import { 
  Heart, Menu, X, User, Shield, Stethoscope, Sparkles, 
  FileText, Activity, LogOut, LogIn, ChevronDown, BookOpen
} from 'lucide-react';
import { Doctor, PatientUser, InAppNotification } from '../types';
import { DOCTORS } from '../data/mockData';
import { NotificationBell } from './NotificationBell';

export type ActiveRole = 'patient' | 'triage_doctor' | 'specialist_doctor';

interface Props {
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  currentPatient: PatientUser;
  currentDoctor: Doctor;
  onOpenAuthModal: () => void;
  onOpenPatentModal: () => void;
  onNavigateTab: (tab: 'landing' | 'ai_chat' | 'doctor_referrals' | 'page_one' | 'inquiry_form' | 'history' | 'profile' | 'telemetry' | 'disclaimer') => void;
  currentTab: string;
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: InAppNotification) => void;
  onTriggerSimulatedNotif?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  onRoleChange,
  currentPatient,
  currentDoctor,
  onOpenAuthModal,
  onOpenPatentModal,
  onNavigateTab,
  currentTab,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
  onTriggerSimulatedNotif,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Right side: Logo & Brand (RTL: rightmost) */}
          {/* Right side: Logo & Brand (RTL: rightmost) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('landing')}
              className="flex items-center gap-2.5 text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white text-sky-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    کلینیک فوق تخصصی قلب
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">
                    TeleCardio
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  سلامت قلب، کیفیت زندگی
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Patient view) */}
          {activeRole === 'patient' && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
              <button
                onClick={() => onNavigateTab('landing')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  currentTab === 'landing'
                    ? 'bg-sky-100 text-sky-800 font-extrabold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-sky-600" />
                <span>صفحه اصلی (عکس)</span>
              </button>
              <button
                onClick={() => onNavigateTab('ai_chat')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  currentTab === 'ai_chat'
                    ? 'bg-sky-100 text-sky-800 font-extrabold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>چت تریاژ هوشمند قلب</span>
              </button>
              <button
                onClick={() => onNavigateTab('doctor_referrals')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  currentTab === 'doctor_referrals'
                    ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>کارتابل ارجاعات پزشک</span>
              </button>
              <button
                onClick={() => onNavigateTab('history')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  currentTab === 'history' || currentTab === 'result'
                    ? 'bg-rose-50 text-rose-700 font-extrabold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                سوابق و پاسخ پزشکان
              </button>
              <button
                onClick={() => onNavigateTab('profile')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  currentTab === 'profile'
                    ? 'bg-rose-50 text-rose-700 font-extrabold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                پرونده سلامت قلب
              </button>
            </nav>
          )}

          {/* Left Actions: Patent Blueprint Button, Role Switcher, Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Patent Explorer Button */}
            <button
              onClick={onOpenPatentModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 transition-all shadow-2xs hover:shadow-xs"
              title="بررسی تطبیق ۷ برگ اسکچ پتنت پروژه با صفحات این سامانه"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">ایده و تطبیق با پتنت اولیه</span>
              <span className="sm:hidden">پتنت</span>
            </button>

            {/* Notification Bell with Badge */}
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onSelectNotification={onSelectNotification}
              onTriggerSimulatedNotif={onTriggerSimulatedNotif}
            />

            {/* Interactive Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
              >
                {activeRole === 'patient' && (
                  <>
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    <span>نمای بیمار ({currentPatient.firstName})</span>
                  </>
                )}
                {activeRole === 'triage_doctor' && (
                  <>
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>پزشک تریاژ (ص ۳)</span>
                  </>
                )}
                {activeRole === 'specialist_doctor' && (
                  <>
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>متخصص قلب (ص ۶)</span>
                  </>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
                    تغییر زاویه دید سامانه:
                  </div>
                  
                  <button
                    onClick={() => onRoleChange('patient')}
                    className={`w-full text-right px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      activeRole === 'patient' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-bold">بیمار (صفحات ۱، ۲، ۴، ۵، ۷)</div>
                      <span className="text-[10px] text-slate-500">ثبت شرح حال و مشاهده پاسخ</span>
                    </div>
                  </button>

                  <button
                    onClick={() => onRoleChange('triage_doctor')}
                    className={`w-full text-right px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      activeRole === 'triage_doctor' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">پزشک تریاژ سطح اول (صفحه ۳)</div>
                      <span className="text-[10px] text-slate-500">غربالگری و ارجاع در مرکز بهداشت</span>
                    </div>
                  </button>

                  <button
                    onClick={() => onRoleChange('specialist_doctor')}
                    className={`w-full text-right px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      activeRole === 'specialist_doctor' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">پزشک متخصص قلب (صفحه ۶)</div>
                      <span className="text-[10px] text-slate-500">تحلیل نوار قلب و درخواست مدرک</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Button (Matches Patent Page 5 Hamburger menu) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="منوی اصلی سامانه (صفحه ۵ پتنت)"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Hamburger Drawer / Dropdown Menu (Patent Page 5: "منوی اصلی می‌تواند شامل موارد زیر باشد: پروفایل شخصی، ثبت مدارک پزشکی، سوابق مشاوره") */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-3 sm:px-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900">منوی اصلی سامانه (مطابق صفحه ۵ پتنت)</span>
            <span className="text-slate-400 font-mono text-[11px]">TeleCardio Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onNavigateTab('landing');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-right font-bold flex items-center gap-2.5 transition-colors border border-sky-200"
            >
              <Heart className="w-4 h-4 text-sky-600" />
              <span>صفحه اصلی کلینیک (عکس اپ)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('ai_chat');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-right font-bold flex items-center gap-2.5 transition-colors border border-sky-200"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>چت تریاژ هوشمند قلب (ChatGPT Style)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('doctor_referrals');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-right font-bold flex items-center gap-2.5 transition-colors border border-emerald-200"
            >
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>کارتابل ارجاعات پزشک متخصص</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('profile');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-800 text-right font-semibold flex items-center gap-2.5 transition-colors border border-slate-200/80"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>ثبت مدارک پزشکی من (Cardiac Records)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('history');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-800 text-right font-semibold flex items-center gap-2.5 transition-colors border border-slate-200/80"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>سوابق مشاوره (Consultation History)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('telemetry');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-800 text-right font-semibold flex items-center gap-2.5 transition-colors border border-slate-200/80"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>داشبورد روند علائم حیاتی (Recharts)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('inquiry_form');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-rose-50 text-rose-800 text-right font-bold flex items-center gap-2.5 transition-colors border border-rose-200"
            >
              <Heart className="w-4 h-4 text-rose-600" />
              <span>ثبت مشاوره قلبی جدید (صفحه ۲ و ۵ پتنت)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود / خروج و تعویض کاربر (صفحه ۴)</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('page_one');
                setMobileMenuOpen(false);
              }}
              className="text-xs text-rose-700 font-bold hover:text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
            >
              صفحه اول پتنت (ص ۱)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
