import React, { useState, useEffect } from 'react';
import {
  X, User, Lock, Phone, Mail, LogIn, UserPlus, Heart, Check, Shield
} from 'lucide-react';
import type { AuthApiResponse, AuthUser } from '../types/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
  onPendingApproval: (message: string) => void;
}

const fieldClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none';

export const AuthModal: React.FC<Props> = ({
  isOpen, onClose, onAuthenticated, onPendingApproval,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [occupation, setOccupation] = useState('');
  const [email, setEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'patient' | 'doctor'>('patient');
  const [councilNumber, setCouncilNumber] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab('login');
      setError('');
      setNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const request = async (path: string, body: Record<string, string>) => {
    const response = await fetch(`/api/auth/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({})) as AuthApiResponse;
    if (!response.ok) {
      throw new Error(data.error || 'درخواست انجام نشد. دوباره تلاش کنید.');
    }
    return data;
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const data = await request('login', { username, password });
      if (!data.user) throw new Error('پاسخ معتبر از سرور دریافت نشد.');
      onAuthenticated(data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (regPassword.length < 10) {
      setError('رمز عبور باید حداقل ۱۰ نویسه داشته باشد.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    setBusy(true);
    try {
      const body: Record<string, string> = {
        firstName, lastName, phone, email, username: regUsername,
        password: regPassword, accountType,
      };
      if (accountType === 'patient') {
        body.birthDate = birthDate;
        if (gender) body.gender = gender;
        if (nationality.trim()) body.nationality = nationality.trim();
        if (occupation.trim()) body.occupation = occupation.trim();
      }
      if (accountType === 'doctor') body.councilNumber = councilNumber;

      const data = await request('register', body);
      if (data.pendingApproval) {
        onPendingApproval(
          data.message || 'درخواست ثبت‌نام پزشک ثبت شد؛ ورود پس از تأیید مدیر امکان‌پذیر است.'
        );
        onClose();
        return;
      }
      if (!data.user) throw new Error('پاسخ معتبر از سرور دریافت نشد.');
      onAuthenticated(data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت‌نام انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-xl"><Heart className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold">ورود و ثبت‌نام TeleCardio</h3>
              <p className="text-xs text-slate-400">حساب کاربری</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b bg-slate-50 text-sm font-bold">
          <button type="button" onClick={() => { setTab('login'); setError(''); setNotice(''); }}
            className={`flex-1 py-3 ${tab === 'login' ? 'bg-white text-rose-600 border-b-2 border-rose-600' : 'text-slate-500'}`}>
            <LogIn className="inline w-4 h-4 ml-1" /> ورود
          </button>
          <button type="button" onClick={() => { setTab('register'); setError(''); setNotice(''); }}
            className={`flex-1 py-3 ${tab === 'register' ? 'bg-white text-rose-600 border-b-2 border-rose-600' : 'text-slate-500'}`}>
            <UserPlus className="inline w-4 h-4 ml-1" /> ثبت‌نام
          </button>
        </div>

        <div className="p-6">
          {error && <p role="alert" className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</p>}
          {notice && <p role="status" className="mb-4 p-3 rounded-lg bg-sky-50 text-sky-800 text-sm">{notice}</p>}

          {tab === 'login' ? (
            <form onSubmit={submitLogin} className="space-y-4">
              <label className="block text-sm font-semibold">نام کاربری
                <span className="relative block mt-1.5">
                  <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input className={`${fieldClass} pr-10`} autoComplete="username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    required maxLength={100} />
                </span>
              </label>
              <label className="block text-sm font-semibold">رمز عبور
                <span className="relative block mt-1.5">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input className={`${fieldClass} pr-10`} type="password"
                    autoComplete="current-password" value={password}
                    onChange={e => setPassword(e.target.value)} required maxLength={256} />
                </span>
              </label>
              <p className="text-xs text-slate-500">
                فراموشی رمز عبور هنوز فعال نشده است؛ هیچ پیامک بازیابی ارسال نمی‌شود.
              </p>
              <button disabled={busy} className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold">
                {busy ? 'در حال بررسی…' : 'ورود به حساب'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="space-y-3">
              <label className="block text-sm font-semibold">نوع حساب
                <select className={`${fieldClass} mt-1.5`} value={accountType}
                  onChange={e => setAccountType(e.target.value as 'patient' | 'doctor')}>
                  <option value="patient">بیمار</option>
                  <option value="doctor">پزشک — نیازمند تأیید مدیر</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">نام
                  <input className={`${fieldClass} mt-1.5`} value={firstName}
                    onChange={e => setFirstName(e.target.value)} required maxLength={100} />
                </label>
                <label className="text-sm font-semibold">نام خانوادگی
                  <input className={`${fieldClass} mt-1.5`} value={lastName}
                    onChange={e => setLastName(e.target.value)} required maxLength={100} />
                </label>
              </div>

              <label className="block text-sm font-semibold">شماره همراه
                <span className="relative block mt-1.5">
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input className={`${fieldClass} pr-10`} type="tel" autoComplete="tel"
                    value={phone} onChange={e => setPhone(e.target.value)} required maxLength={24} />
                </span>
              </label>

              {accountType === 'patient' && (
                <>
                  <label className="block text-sm font-semibold">تاریخ تولد
                    <input className={`${fieldClass} mt-1.5`} type="date"
                      value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)} required />
                  </label>

                  <label className="block text-sm font-semibold">جنسیت (اختیاری)
                    <select className={`${fieldClass} mt-1.5`} value={gender}
                      onChange={e => setGender(e.target.value)}>
                      <option value="">انتخاب نشده</option>
                      <option value="مرد">مرد</option>
                      <option value="زن">زن</option>
                      <option value="ترجیح می‌دهم پاسخ ندهم">ترجیح می‌دهم پاسخ ندهم</option>
                      <option value="سایر">سایر</option>
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">ملیت (اختیاری)
                    <input className={`${fieldClass} mt-1.5`} value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      maxLength={100} />
                  </label>

                  <label className="block text-sm font-semibold">شغل (اختیاری)
                    <input className={`${fieldClass} mt-1.5`} value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      maxLength={100} />
                  </label>
                </>
              )}

              <label className="block text-sm font-semibold">ایمیل (اختیاری)
                <span className="relative block mt-1.5">
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input className={`${fieldClass} pr-10`} type="email" autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)} maxLength={254} />
                </span>
              </label>

              {accountType === 'doctor' && (
                <label className="block text-sm font-semibold">شماره نظام پزشکی
                  <span className="relative block mt-1.5">
                    <Shield className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <input className={`${fieldClass} pr-10`} value={councilNumber}
                      onChange={e => setCouncilNumber(e.target.value)} required maxLength={80} />
                  </span>
                </label>
              )}

              <label className="block text-sm font-semibold">نام کاربری
                <input className={`${fieldClass} mt-1.5`} autoComplete="username"
                  value={regUsername} onChange={e => setRegUsername(e.target.value)}
                  required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]{3,32}"
                  title="۳ تا ۳۲ نویسه انگلیسی، عدد، نقطه، خط تیره یا زیرخط" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">رمز عبور (حداقل ۱۰ نویسه)
                  <input className={`${fieldClass} mt-1.5`} type="password"
                    autoComplete="new-password" value={regPassword}
                    onChange={e => setRegPassword(e.target.value)} required minLength={10} maxLength={256} />
                </label>
                <label className="text-sm font-semibold">تکرار رمز
                  <input className={`${fieldClass} mt-1.5`} type="password"
                    autoComplete="new-password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required minLength={10} maxLength={256} />
                </label>
              </div>

              {accountType === 'doctor' && (
                <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-3">
                  ثبت‌نام پزشک به‌تنهایی مجوز دسترسی ایجاد نمی‌کند. حساب باید توسط مدیر تأیید و سطح دسترسی آن تعیین شود.
                </p>
              )}

              <button disabled={busy} className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold">
                <Check className="inline w-4 h-4 ml-1" />
                {busy ? 'در حال ثبت…' : 'ایجاد حساب'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
