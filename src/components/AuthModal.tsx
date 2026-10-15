import React, { useState } from 'react';
import { X, User, Lock, Phone, Mail, Check, LogIn, UserPlus, Heart, Sparkles, Shield } from 'lucide-react';
import { PatientUser, Doctor } from '../types';
import { CURRENT_PATIENT, DOCTORS } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginAsPatient: (patient: PatientUser) => void;
  onLoginAsDoctor: (doctor: Doctor) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginAsPatient, onLoginAsDoctor }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state (Patent Page 4 bottom)
  const [loginUsername, setLoginUsername] = useState('rezaei_heart');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true); // Default checked as in patent sketch: "آن تیک خورده باشد default"

  // Registration form state (Patent Page 4 top)
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  if (!isOpen) return null;

  // Auto-suggest username helper (From patent: "در صورت تمایل کاربر می‌تواند نام کاربری پیشنهادی به صورت default بدهد")
  const handleAutoSuggestUsername = () => {
    if (regPhone) {
      setRegUsername(`cardio_${regPhone.slice(-4)}`);
    } else if (regLastName) {
      setRegUsername(`p_${regLastName.toLowerCase().replace(/\s+/g, '')}_${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setRegUsername(`cardio_user_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regPhone) {
      alert('لطفاً فیلدهای ستاره‌دار الزامی را تکمیل کنید.');
      return;
    }

    const newPatient: PatientUser = {
      id: `pat-${Date.now()}`,
      firstName: regFirstName,
      lastName: regLastName,
      nationalCode: '۰۹۲xxxxxxx',
      phoneNumber: regPhone,
      email: regEmail,
      username: regUsername || `user_${Date.now()}`,
      age: 48,
      gender: 'مرد',
      medicalHistory: ['ثبت جدید در کلینیک مجازی'],
      currentMedications: [],
    };

    onLoginAsPatient(newPatient);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginAsPatient(CURRENT_PATIENT);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 rounded-xl">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                ورود و ثبت‌نام در TeleCardio (صفحه ۴ پتنت)
              </h3>
              <p className="text-xs text-slate-400">
                سامانه پرونده الکترونیک و مشاوره غیرحضوری قلب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-sm font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'login'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>صفحه ورود (Login)</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'register'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>صفحه ثبت‌نام بیمار جدید</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Quick Demo Access Bar */}
          <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                ورود سریع تستی (جهت بررسی کارکرد پتنت در تمام نقش‌ها):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  onLoginAsPatient(CURRENT_PATIENT);
                  onClose();
                }}
                className="p-2 rounded-lg bg-white hover:bg-rose-100/70 border border-rose-200 text-slate-800 font-semibold text-center transition-colors flex flex-col items-center gap-1"
              >
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>بیمار علیرضا</span>
              </button>
              <button
                onClick={() => {
                  onLoginAsDoctor(DOCTORS[0]); // Dr. Kazemi (Triage L1)
                  onClose();
                }}
                className="p-2 rounded-lg bg-white hover:bg-blue-100/70 border border-blue-200 text-slate-800 font-semibold text-center transition-colors flex flex-col items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>دکتر تریاژ (سطح ۱)</span>
              </button>
              <button
                onClick={() => {
                  onLoginAsDoctor(DOCTORS[1]); // Dr. Sohrabi (Cardiologist L2)
                  onClose();
                }}
                className="p-2 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-slate-800 font-semibold text-center transition-colors flex flex-col items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                <span>متخصص قلب (سطح ۲)</span>
              </button>
            </div>
          </div>

          {/* LOGIN TAB (Patent Page 4 Bottom) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام کاربری یا شماره پرونده سلامت
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                    placeholder="مثال: rezaei_heart یا شماره موبایل"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز ورود
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Patent Page 4 specific: "مرا به خاطر بسپار - آن تیک خورده باشد default" */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="text-slate-700 font-medium">
                    مرا به خاطر بسپار <span className="text-slate-400 text-[11px]">(پیش‌فرض فعال در پتنت)</span>
                  </span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('کد بازیابی به شماره همراه شما پیامک شد.'); }} className="text-rose-600 hover:underline">
                  فراموشی رمز عبور؟
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود به حساب کاربری</span>
              </button>
            </form>
          )}

          {/* REGISTER TAB (Patent Page 4 Top) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                    placeholder="مثال: رضا"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                    placeholder="مثال: محمدی"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شماره تلفن همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Patent suggestion: "در صورت تمایل کاربر می‌تواند نام کاربری پیشنهادی به صورت default بدهد" */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    نام کاربری انتخابی <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestUsername}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>پیشنهاد خودکار (Default)</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  placeholder="مثال: cardio_reza"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز ورود انتخابی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تکرار رمز ورود <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 mt-4"
              >
                <Check className="w-4 h-4" />
                <span>ثبت نام و ایجاد پرونده سلامت قلب</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
