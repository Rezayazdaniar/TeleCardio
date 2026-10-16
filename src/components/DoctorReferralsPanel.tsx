import React, { useState } from 'react';
import { 
  Stethoscope, Clock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Send,
  User, ChevronLeft, Search, Filter, FileText, Check, Activity,
  Phone, Calendar, Sparkles, MessageSquare, AlertCircle, Eye, ShieldAlert,
  Edit3, Plus, Trash2, Heart, RefreshCw
} from 'lucide-react';
import { Doctor, ConsultationInquiry, TriageSeverity, CardiacDocument } from '../types';
import { ChatSession, ChatMessage } from '../types/chat';

interface Props {
  doctor: Doctor;
  consultations: ConsultationInquiry[];
  chatSessions: ChatSession[];
  onBackToHome: () => void;
  onSendDoctorResponseToChat: (
    sessionId: string, 
    consultationId: string | undefined, 
    diagnosis: string, 
    prescriptions: string[], 
    clinicalGuidance: string, 
    nextStep: string
  ) => void;
  onOpenECGModal?: (doc: CardiacDocument) => void;
}

export const DoctorReferralsPanel: React.FC<Props> = ({
  doctor,
  consultations,
  chatSessions,
  onBackToHome,
  onSendDoctorResponseToChat,
  onOpenECGModal,
}) => {
  // Navigation State: 'inbox' (صفحه لیست پیام‌ها) or 'detail' (صفحه جزئیات و پاسخ)
  const [viewMode, setViewMode] = useState<'inbox' | 'detail'>('inbox');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Filter & Search
  const [filter, setFilter] = useState<'pending' | 'answered' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Doctor's reply
  const [diagnosis, setDiagnosis] = useState('');
  const [guidance, setGuidance] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [prescriptions, setPrescriptions] = useState<string[]>([]);
  const [nextStep, setNextStep] = useState('انجام نوار قلب ۱۲ لید و کنترل فشار خون طی ۴۸ ساعت آینده');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Selected Chat Session details
  const activeSession = chatSessions.find((s) => s.id === selectedSessionId);
  const relatedConsultation = consultations.find((c) => c.id === activeSession?.consultationId);

  // Quick diagnosis presets for easy mobile tap
  const DIAGNOSIS_PRESETS = [
    'آنژین صدری ناپایدار (Unstable Angina) نیازمند پایش فوری',
    'آریتمی فوق بطنی / اکستراسیستول بطنی (PVC) خوش‌خیم',
    'تنگی نفس فعالیتی نیازمند اکوکاردیوگرافی داپلر و بررسی حفرات قلبی',
    'افزایش فشار خون کنترل‌نشده با واکنش ثانویه تپش قلب',
    'درد قفسه سینه غیراسکمیک ناشی از اسپاسم عضلانی یا استرس'
  ];

  // Prescriptions presets
  const PRESCRIPTION_PRESETS = [
    'قرص متوپرولول (Metoprolol) ۲۵ میلی‌گرم - نصف قرص هر ۱۲ ساعت',
    'قرص آسپیرین (ASA) ۸۰ میلی‌گرم - روزی ۱ عدد بعد از ناهار',
    'قرص لوزارتان (Losartan) ۲۵ میلی‌گرم - روزی ۱ عدد صبح‌ها',
    'قرص نیتروکانتین (Nitrocontin) ۲.۶ میلی‌گرم - در صورت بروز درد سینه'
  ];

  // Filtered List
  const filteredSessions = chatSessions.filter((sess) => {
    const matchesSearch = 
      sess.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sess.consultationId && sess.consultationId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filter === 'pending') {
      return sess.status === 'referred' || sess.status === 'triage_ready' || sess.status === 'emergency';
    }
    if (filter === 'answered') {
      return sess.status === 'answered_by_doctor';
    }
    return true;
  });

  const pendingCount = chatSessions.filter(
    (s) => s.status === 'referred' || s.status === 'triage_ready' || s.status === 'emergency'
  ).length;

  const answeredCount = chatSessions.filter((s) => s.status === 'answered_by_doctor').length;
  const emergencyCount = chatSessions.filter((s) => s.urgencySeverity === 'emergency' || s.status === 'emergency').length;

  // Open detail view for a message
  const handleOpenDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setViewMode('detail');
    setIsEditingExisting(false);
    setFeedbackSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pre-populate if already answered
    const session = chatSessions.find((s) => s.id === sessionId);
    const existingDoctorMsg = session?.messages.find((m) => m.sender === 'doctor' && m.doctorResponse);
    if (existingDoctorMsg?.doctorResponse) {
      setDiagnosis(existingDoctorMsg.doctorResponse.diagnosis || '');
      setGuidance(existingDoctorMsg.doctorResponse.clinicalGuidance || '');
      setPrescriptions(existingDoctorMsg.doctorResponse.prescriptions || []);
      setNextStep(existingDoctorMsg.doctorResponse.nextStep || '');
    } else {
      // Default initial templates
      setDiagnosis('');
      setGuidance('');
      setPrescriptions([]);
      setNextStep('انجام نوار قلب ۱۲ لید و کنترل فشار خون طی ۴۸ ساعت آینده');
    }
  };

  // Add prescription helper
  const handleAddPrescription = (customText?: string) => {
    const text = (customText || prescriptionInput).trim();
    if (text) {
      setPrescriptions((prev) => [...prev, text]);
      setPrescriptionInput('');
    }
  };

  const handleRemovePrescription = (idx: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit doctor response to patient's chat
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    if (!diagnosis.trim() || !guidance.trim()) {
      alert('لطفاً تشخیص اولیه بالینی و توصیه‌های مراقبتی را وارد فرمایید.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSendDoctorResponseToChat(
        activeSession.id,
        activeSession.consultationId,
        diagnosis,
        prescriptions,
        guidance,
        nextStep
      );
      setIsSubmitting(false);
      setIsEditingExisting(false);
      setFeedbackSuccess(`پاسخ و نسخه شما با موفقیت به صفحه چت بیمار (${activeSession.patientName}) ارسال گردید.`);
    }, 600);
  };

  // Find existing doctor response if already answered
  const existingDocMsg = activeSession?.messages.find((m) => m.sender === 'doctor' && m.doctorResponse);

  return (
    <div className="w-full min-h-[calc(100dvh-60px)] bg-slate-100 flex flex-col font-['Vazirmatn',system-ui,sans-serif] text-slate-800">
      
      {/* ========================================================
          DOCTOR TOP BAR
         ======================================================== */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Doctor Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
              />
              <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {doctor.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                  فوق تخصص قلب
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {doctor.title} — ن.پ: {doctor.medicalCouncilNumber}
              </p>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'detail' ? (
              <button
                onClick={() => {
                  setViewMode('inbox');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>لیست پیام‌ها</span>
                <span className="hidden sm:inline">({filteredSessions.length})</span>
              </button>
            ) : (
              <button
                onClick={onBackToHome}
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>صفحه اصلی</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================
          SCREEN 1: INBOX / MESSAGES LIST PAGE (یک صفحه فقط پیام‌های رسیده)
         ======================================================== */}
      {viewMode === 'inbox' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4">
          
          {/* Quick Header Banner */}
          <div className="bg-gradient-to-l from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-1 sm:space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>کارتابل پیام‌های ارجاعی به پزشک</span>
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {new Date().toLocaleDateString('fa-IR')}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white">
                صندوق پیام‌ها و مشاوره‌های ارجاعی
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                تمام بیماران تریاژشده توسط هوش مصنوعی که بیشترین اولویت درمانی را نزد شما دارند در این صفحه لیست شده‌اند. برای مشاهده شرح حال کامل و ارسال پاسخ یا نسخه، روی هر پیام بزنید.
              </p>
            </div>

            {/* Subtle background pulse */}
            <div className="absolute left-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
              <Heart className="w-48 h-48 text-emerald-400" />
            </div>
          </div>

          {/* KPI Stat Cards (Responsive Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setFilter('all')}
              className={`p-3 rounded-2xl border text-right transition-all text-xs font-bold ${
                filter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] text-slate-400">کل پیام‌های دریافتی</div>
              <div className="text-lg sm:text-xl font-black mt-1">{chatSessions.length} پیام</div>
            </button>

            <button
              onClick={() => setFilter('pending')}
              className={`p-3 rounded-2xl border text-right transition-all text-xs font-bold ${
                filter === 'pending'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] text-rose-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>نیازمند بررسی</span>
              </div>
              <div className="text-lg sm:text-xl font-black mt-1 text-rose-600">
                {pendingCount} مورد
              </div>
            </button>

            <button
              onClick={() => setFilter('answered')}
              className={`p-3 rounded-2xl border text-right transition-all text-xs font-bold ${
                filter === 'answered'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>پاسخ‌داده‌شده</span>
              </div>
              <div className="text-lg sm:text-xl font-black mt-1 text-emerald-700">
                {answeredCount} مورد
              </div>
            </button>

            <div className="p-3 rounded-2xl border bg-white border-slate-200 text-right">
              <div className="text-[11px] text-amber-600 flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>اورژانسی / ۱۱۵</span>
              </div>
              <div className="text-lg sm:text-xl font-black mt-1 text-slate-900">
                {emergencyCount} مورد
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی نام بیمار، شکایت یا کد ارجاع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  پاک کردن
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه ({chatSessions.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'pending'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اقدام‌نشده ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'answered'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                پاسخ‌داده‌شده ({answeredCount})
              </button>
            </div>
          </div>

          {/* Messages List (Touch-Friendly Cards) */}
          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-700">پیامی با این مشخصات یافت نشد</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  می‌توانید فیلتر جستجو را پاک کنید یا تب دیگری را انتخاب نمایید.
                </p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  نمایش همه پیام‌ها
                </button>
              </div>
            ) : (
              filteredSessions.map((sess) => {
                const isPending = sess.status === 'referred' || sess.status === 'triage_ready' || sess.status === 'emergency';
                const isAnswered = sess.status === 'answered_by_doctor';
                const isEmergency = sess.urgencySeverity === 'emergency' || sess.status === 'emergency';

                return (
                  <div
                    key={sess.id}
                    onClick={() => handleOpenDetail(sess.id)}
                    role="button"
                    tabIndex={0}
                    className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] group text-right"
                  >
                    {/* Top Row: Patient Name, Badges, Time */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {sess.patientName}
                            </span>
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                <span>جدید / اقدام‌نشده</span>
                              </span>
                            )}
                            {isAnswered && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>اقدام‌شده ✓</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            کد ارجاع: {sess.consultationId || sess.id}
                          </span>
                        </div>
                      </div>

                      {/* Urgency Badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                          isEmergency
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : sess.urgencySeverity === 'high'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : sess.urgencySeverity === 'moderate'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {isEmergency && <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />}
                          <span>
                            {isEmergency && '🚨 اورژانسی'}
                            {sess.urgencySeverity === 'high' && 'اولویت بالا'}
                            {sess.urgencySeverity === 'moderate' && 'اولویت متوسط'}
                            {sess.urgencySeverity === 'low' && 'پایش مستمر'}
                          </span>
                        </span>
                        {sess.urgencyScore && (
                          <span className="text-[10px] font-bold text-slate-500 font-mono">
                            نمره فوریت: {sess.urgencyScore}٪
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Title & AI Referral Reason Snippet */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                        {sess.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        شکایت بیمار در چت تریاژ هوشمند: {sess.messages[sess.messages.length - 1]?.text || 'بدون پیام اولیه'}
                      </p>
                    </div>

                    {/* Bottom Row: Timestamp & Clear Touch Indicator */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{sess.createdAt}</span>
                        </span>
                        <span className="hidden sm:inline-block">•</span>
                        <span className="hidden sm:inline-block text-emerald-700 font-medium">
                          تطابق بالینی هوش مصنوعی: ارجاع به شما
                        </span>
                      </div>

                      {/* Explicit Click / Tap Button */}
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 font-bold text-xs transition-colors shadow-2xs">
                        <span>مشاهده جزئیات و پاسخ بالینی</span>
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </main>
      )}

      {/* ========================================================
          SCREEN 2: MESSAGE DETAIL & CLINICAL RESPONSE PAGE (صفحه بعدی با جزئیات کامل)
         ======================================================== */}
      {viewMode === 'detail' && activeSession && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4">
          
          {/* Top Return & Summary Navigation Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setViewMode('inbox');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shadow-2xs"
            >
              <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              <span>بازگشت به لیست پیام‌های پزشک</span>
            </button>

            <div className="text-left font-mono text-xs text-slate-400 hidden sm:block">
              {activeSession.createdAt}
            </div>
          </div>

          {/* Feedback Banner if submitted */}
          {feedbackSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
              <button
                onClick={() => setFeedbackSuccess(null)}
                className="text-emerald-700 hover:underline text-xs"
              >
                بستن
              </button>
            </div>
          )}

          {/* 1. Patient Profile Card & Vital Signs */}
          <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {activeSession.patientName}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeSession.status === 'answered_by_doctor'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {activeSession.status === 'answered_by_doctor' ? 'اقدام‌شده' : 'نیازمند اقدام پزشک'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    شناسه پیام: {activeSession.id} • پرونده: {activeSession.consultationId || 'ثبت آنلاین'}
                  </p>
                </div>
              </div>

              {/* Urgency Pill */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  activeSession.urgencySeverity === 'emergency'
                    ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                    : activeSession.urgencySeverity === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  نمره فوریت: {activeSession.urgencyScore || 85}٪
                </span>
              </div>
            </div>

            {/* Vitals & History Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">فشار خون بیمار (BP)</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">135/85 mmHg</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">ضربان قلب (Pulse)</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">88 bpm (نامنظم)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">اکسیژن خون (SpO2)</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">97%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-0.5">داروهای مزمن مصرفی</span>
                <span className="font-bold text-slate-800 text-xs">آسپرین ۸۰ + آتورواستاتین ۲۰</span>
              </div>
            </div>
          </section>

          {/* 2. AI Smart Triage Rationale Card */}
          <section className="bg-gradient-to-r from-sky-50 via-teal-50/60 to-blue-50 rounded-3xl p-4 sm:p-5 border border-sky-200 shadow-2xs space-y-2 text-right">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs sm:text-sm text-sky-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>تحلیل هوشمند تریاژ و علت انتخاب شما به عنوان پزشک معالج:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-sky-800 text-[11px] font-black border border-sky-200">
                تطابق ۹۶٪ با تخصص
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              بیمار با علائم تپش قلب و سنگینی قفسه سینه در گفتگوی آنلاین تریاژ شده است. با توجه به فاکتورهای خطر، سن بیمار و سوابق دارویی، تریاژ هوشمند بیمار را با اولویت بالا و مستقیم به کارتابل تخصصی جنابعالی ارجاع داده است.
            </p>
          </section>

          {/* 3. Full Chat Transcript between Patient and AI (شرح حال کامل) */}
          <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-3 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span>متن کامل گفتگوی بیمار با دستیار هوشمند تریاژ (شرح حال):</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeSession.messages.length} پیام مبادله‌شده
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-80 overflow-y-auto space-y-3 text-xs">
              {activeSession.messages.map((m) => {
                const isPatient = m.sender === 'patient';
                const isDoctor = m.sender === 'doctor';
                const isAi = m.sender === 'ai';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col space-y-1 ${isPatient ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold px-1">
                      {isPatient && <span>👤 {activeSession.patientName}</span>}
                      {isDoctor && <span className="text-emerald-700">👨‍⚕️ نظر شما ({doctor.name}):</span>}
                      {isAi && <span className="text-sky-700">🤖 دستیار هوشمند تریاژ:</span>}
                      <span className="text-[10px] text-slate-400 font-mono">({m.timestamp})</span>
                    </div>

                    <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                      isPatient
                        ? 'bg-sky-600 text-white rounded-br-none shadow-2xs'
                        : isDoctor
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-bl-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-2xs'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Attached Documents & ECG if available */}
          {relatedConsultation?.documents && relatedConsultation.documents.length > 0 && (
            <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 text-right">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>مدارک پاراکلینیک و نوار قلب ضمیمه‌شده:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relatedConsultation.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-800">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{doc.date}</div>
                    </div>
                    {onOpenECGModal && doc.type === 'ecg' && (
                      <button
                        onClick={() => onOpenECGModal(doc)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده نوار</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Existing Doctor Response Card if already answered */}
          {existingDocMsg?.doctorResponse && !isEditingExisting && (
            <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300 shadow-sm space-y-4 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-emerald-950">
                      پاسخ و دستورات بالینی ثبت‌شده شما (ارسال‌شده به چت بیمار)
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      ثبت‌شده در تاریخ: {existingDocMsg.doctorResponse.submittedAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingExisting(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش یا ارسال پیام تکمیلی</span>
                </button>
              </div>

              {/* Diagnosis */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">تشخیص بالینی:</span>
                <p className="font-extrabold text-sm text-slate-900 bg-white p-3 rounded-xl border border-emerald-100">
                  {existingDocMsg.doctorResponse.diagnosis}
                </p>
              </div>

              {/* Guidance */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">توصیه‌ها و تحلیل بالینی:</span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                  {existingDocMsg.doctorResponse.clinicalGuidance}
                </p>
              </div>

              {/* Prescriptions */}
              {existingDocMsg.doctorResponse.prescriptions && existingDocMsg.doctorResponse.prescriptions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">دستورات دارویی و نسخه:</span>
                  <div className="space-y-1">
                    {existingDocMsg.doctorResponse.prescriptions.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 font-bold text-xs text-emerald-900 flex items-center gap-2">
                        <span>💊</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next step */}
              {existingDocMsg.doctorResponse.nextStep && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">اقدام بعدی بیمار:</span>
                  <p className="text-xs font-bold text-slate-800 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                    {existingDocMsg.doctorResponse.nextStep}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 6. Form: Submit Clinical Opinion & Prescription (Pending or Editing) */}
          {(!existingDocMsg || isEditingExisting) && (
            <section className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-emerald-500/80 shadow-md space-y-4 text-right">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    {isEditingExisting ? 'ویرایش یا تکمیل نظر بالینی' : 'ثبت نظر، دستورات مراقبتی و نسخه دارویی'}
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                  ارسال مستقیم به صفحه چت بیمار
                </span>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                
                {/* 1. Clinical Diagnosis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    تشخیص اولیه بالینی:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: آنژین صدری ناپایدار با احتمال ایسکمی ساب‌اندوکارد..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />

                  {/* Quick Diagnosis Suggestion Chips */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">پیشنهاد سریع با یک کلیک:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {DIAGNOSIS_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDiagnosis(preset)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[10px] font-semibold transition-colors border border-slate-200"
                        >
                          + {preset.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Clinical Guidance & Care Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    توصیه‌ها و تحلیل بالینی برای بیمار (متن پیام چت):
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="توضیحات لازم، توصیه‌های استراحت، علائم هشداردهنده ۱۱۵، پرهیز از استرس یا فعالیت سنگین..."
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all leading-relaxed font-medium"
                  />
                </div>

                {/* 3. Prescription & Medications */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    دستورات دارویی و نسخه‌نویسی آنلاین:
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="نام دارو، دوز و نحوه مصرف..."
                      value={prescriptionInput}
                      onChange={(e) => setPrescriptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPrescription();
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPrescription()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {PRESCRIPTION_PRESETS.map((pPreset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPrescription(pPreset)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[10px] font-bold transition-colors border border-emerald-200"
                      >
                        + {pPreset.split(' - ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Prescriptions List */}
                  {prescriptions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {prescriptions.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950"
                        >
                          <div className="flex items-center gap-2">
                            <span>💊</span>
                            <span>{p}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف دارو"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Next Step */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    اقدام و مرحله بعدی درمان:
                  </label>
                  <input
                    type="text"
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                    <span>
                      {isSubmitting
                        ? 'در حال ثبت و ارسال به صفحه چت بیمار...'
                        : 'ارسال نظر و دستورات به صفحه چت بیمار'}
                    </span>
                  </button>

                  {isEditingExisting && (
                    <button
                      type="button"
                      onClick={() => setIsEditingExisting(false)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      انصراف
                    </button>
                  )}
                </div>

              </form>

            </section>
          )}

          {/* Bottom Back Button for comfortable mobile navigation */}
          <div className="pt-3 pb-8 flex justify-center">
            <button
              onClick={() => {
                setViewMode('inbox');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 active:scale-95 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all"
            >
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span>بازگشت به صندوق پیام‌های پزشک</span>
            </button>
          </div>

        </main>
      )}

    </div>
  );
};
