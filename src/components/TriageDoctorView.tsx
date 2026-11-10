import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldAlert, Activity, CheckCircle, AlertTriangle, ArrowRight, 
  Send, User, FileText, Eye, EyeOff, BookOpen, Clock,
  PhoneCall, ExternalLink, ChevronDown, Mic, MicOff
} from 'lucide-react';
import { ConsultationInquiry, Doctor, TriageSeverity, CardiacDocument } from '../types';

interface Props {
  consultations: ConsultationInquiry[];
  triageDoctor: Doctor;
  specialists: Array<{ id: string; name: string }>;
  onSubmitTriage: (
    consultationId: string,
    payload: {
      action: 'refer' | 'resolve' | 'emergency';
      severity: 'low' | 'moderate' | 'high' | 'critical';
      triageNotes: string;
      initialGuidance: string;
      specialistDoctorId?: string;
    }
  ) => Promise<boolean>;
  onUpdateConsultation: (updated: ConsultationInquiry) => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

const escapeWordHtml = (value: string): string => {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
};

const downloadIntakeAnswersAsWord = (inquiry: ConsultationInquiry) => {
  const answers = inquiry.intakeAnswers || [];
  const sections = Array.from(
    new Map(answers.map((item) => [item.section, item.sectionTitle])).entries()
  );

  const content = sections.map(([section, sectionTitle]) => {
    const questions = answers
      .filter((item) => item.section === section)
      .map((item) => {
        const answer = Array.isArray(item.answer)
          ? item.answer.join('، ')
          : item.answer || 'پاسخی ثبت نشده است';
        return `<div class="question"><p class="question-title">${escapeWordHtml(item.question)}</p><p class="answer">${escapeWordHtml(answer)}</p></div>`;
      }).join('');
    return `<section><h2>${escapeWordHtml(String(section))}. ${escapeWordHtml(sectionTitle)}</h2>${questions}</section>`;
  }).join('');

  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>پاسخ کامل پرسش‌نامه</title><style>body{font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;line-height:1.9;color:#172033}h1{font-size:20pt}h2{font-size:14pt;background:#eef2f7;padding:8px;border-bottom:1px solid #cbd5e1}section{margin:22px 0}.question{margin:12px 0;padding:8px 12px;border:1px solid #dbe2ea;border-radius:6px}.question-title{font-weight:bold;margin:0 0 5px}.answer{white-space:pre-wrap;margin:0;color:#334155}</style></head><body><h1>پاسخ کامل پرسش‌نامه بیمار</h1><p>شناسه پرونده: ${escapeWordHtml(inquiry.id)}</p>${content}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeId = inquiry.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.href = url;
  link.download = `پاسخ-کامل-پرسشنامه-${safeId || 'پرونده'}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const TriageDoctorView: React.FC<Props> = ({
  consultations,
  triageDoctor,
  specialists,
  onSubmitTriage,
  onUpdateConsultation,
  onOpenECGModal,
}) => {
  // صندوق ورودی فقط پرونده‌های در انتظار تریاژ را شامل می‌شود.
  const pendingList = consultations.filter(
    (c) => c.status === 'triage_pending'
  );

  // پرونده‌های خارج‌شده از صف که همین پزشک تریاژ بررسی کرده است.
  const handledList = consultations.filter(
    (c) =>
      c.status !== 'triage_pending' &&
      c.triage?.doctorId === triageDoctor.id
  );

  const statusLabel = (status: ConsultationInquiry['status']) => {
    switch (status) {
      case 'referred_to_specialist':
        return 'ارجاع‌شده به متخصص';
      case 'additional_info_requested':
        return 'در انتظار اطلاعات تکمیلی بیمار';
      case 'completed':
        return 'تکمیل‌شده';
      case 'emergency_redirect':
        return 'هدایت فوری به اورژانس';
      default:
        return 'در انتظار تریاژ';
    }
  };

  const statusClass = (status: ConsultationInquiry['status']) => {
    switch (status) {
      case 'referred_to_specialist':
        return 'bg-blue-100 text-blue-800';
      case 'additional_info_requested':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'emergency_redirect':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(
    () => new Set()
  );

  const isInquiryRead = (inquiry: ConsultationInquiry) =>
    inquiry.isRead === true || locallyReadIds.has(inquiry.id);

  const unreadCount = pendingList.filter((c) => !isInquiryRead(c)).length;
  const readCount = pendingList.length - unreadCount;
  const visiblePendingList = pendingList.filter((c) => {
    if (readFilter === 'read') return isInquiryRead(c);
    if (readFilter === 'unread') return !isInquiryRead(c);
    return true;
  });

  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    pendingList[0]?.id || ''
  );

  const selectedInquiry = consultations.find((c) => c.id === selectedInquiryId);

  const [activeDetailTab, setActiveDetailTab] = useState<
    'history' | 'summary' | 'documents' | 'triage'
  >('history');

  // Form states for triage assessment
  const [severity, setSeverity] = useState<TriageSeverity>('moderate');
  const [triageNotes, setTriageNotes] = useState<string>('');
  const [initialGuidance, setInitialGuidance] = useState<string>('');
  const [speechTarget, setSpeechTarget] = useState<'notes' | 'guidance' | null>(null);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
  } | null>(null);

  const speechSupported = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  const stopSpeechInput = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setSpeechTarget(null);
  };

  const startSpeechInput = (target: 'notes' | 'guidance') => {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
      webkitSpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setSpeechError('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. از Chrome استفاده کنید.');
      return;
    }

    recognitionRef.current?.stop();
    setSpeechError('');

    const recognition = new Recognition();
    recognition.lang = 'fa-IR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(
        { length: event.results.length - event.resultIndex },
        (_, index) => {
          const result = event.results[event.resultIndex + index];
          return result.isFinal ? result[0].transcript.trim() : '';
        }
      ).filter(Boolean).join(' ');

      if (!transcript) return;

      if (target === 'notes') {
        setTriageNotes((previous) => `${previous}${previous.trim() ? ' ' : ''}${transcript}`);
      } else {
        setInitialGuidance((previous) => `${previous}${previous.trim() ? ' ' : ''}${transcript}`);
      }
    };

    recognition.onerror = (event) => {
      setSpeechError(
        event.error === 'not-allowed'
          ? 'دسترسی میکروفون داده نشده است؛ مجوز میکروفون مرورگر را فعال کنید.'
          : `خطا در تشخیص گفتار: ${event.error}`
      );
      setSpeechTarget(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setSpeechTarget(null);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setSpeechTarget(target);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setSpeechTarget(null);
      setSpeechError('شروع میکروفون ناموفق بود. دوباره تلاش کنید.');
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');

  // Helper when user selects a different item
  const handleSelectInquiry = (inquiry: ConsultationInquiry) => {
    setSelectedInquiryId(inquiry.id);
    setActiveDetailTab('history');
    setSelectedSpecialistId('');
    setSeverity(inquiry.triage?.severity || 'moderate');
    setTriageNotes(inquiry.triage?.triageNotes || '');
    setInitialGuidance(inquiry.triage?.initialGuidance || '');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // اگر پرونده انتخاب‌شده از صف انتظار خارج شد، انتخاب را هماهنگ کن.
  useEffect(() => {
    const selectionIsPending = pendingList.some(
      (inquiry) => inquiry.id === selectedInquiryId
    );

    if (selectionIsPending) return;

    const nextInquiry = pendingList[0];
    setSelectedInquiryId(nextInquiry?.id || '');
    setSelectedSpecialistId('');
    setSeverity(nextInquiry?.triage?.severity || 'moderate');
    setTriageNotes(nextInquiry?.triage?.triageNotes || '');
    setInitialGuidance(nextInquiry?.triage?.initialGuidance || '');
  }, [pendingList.map((inquiry) => inquiry.id).join('|'), selectedInquiryId]);

  useEffect(() => {
    const inquiry = pendingList.find((item) => item.id === selectedInquiryId);
    if (!inquiry || isInquiryRead(inquiry)) return;

    let cancelled = false;

    fetch(`/api/consultations/${encodeURIComponent(inquiry.id)}/read`, {
      method: 'POST',
      credentials: 'same-origin',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('ثبت وضعیت مشاهده انجام نشد.');
        }
        if (!cancelled) {
          setLocallyReadIds((previous) => {
            const next = new Set(previous);
            next.add(inquiry.id);
            return next;
          });
        }
      })
      .catch((error) => {
        console.error('Could not mark consultation as read:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedInquiryId, consultations, locallyReadIds]);

  const submitTriage = async (action: 'refer' | 'resolve' | 'emergency') => {
    if (!selectedInquiry || isSubmitting) return;

    if (!triageNotes.trim() || triageNotes.trim().length > 3000) {
      alert('یادداشت تریاژ الزامی است و نباید بیش از ۳۰۰۰ نویسه باشد.');
      return;
    }
    if (
      action !== 'emergency' &&
      (!initialGuidance.trim() || initialGuidance.trim().length > 3000)
    ) {
      alert('راهنمایی اولیه الزامی است و نباید بیش از ۳۰۰۰ نویسه باشد.');
      return;
    }
    if (action === 'emergency' && initialGuidance.trim().length > 3000) {
      alert('راهنمایی اولیه نباید بیش از ۳۰۰۰ نویسه باشد.');
      return;
    }
    if (action === 'refer' && !selectedSpecialistId) {
      alert('برای ارجاع، ابتدا متخصص قلب مقصد را انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const refreshed = await onSubmitTriage(selectedInquiry.id, {
        action,
        severity: action === 'emergency' || severity === 'emergency' ? 'critical' : severity,
        triageNotes: triageNotes.trim(),
        initialGuidance: initialGuidance.trim(),
        ...(action === 'refer'
          ? { specialistDoctorId: selectedSpecialistId }
          : {}),
      });

      const successMessage = action === 'refer'
        ? 'ارجاع پرونده در سرور ثبت شد.'
        : action === 'emergency'
          ? 'ثبت هدایت فوری به اورژانس در سرور انجام شد. این ثبت به‌معنای تماس خودکار با اورژانس نیست.'
          : 'تصمیم تریاژ در سرور ثبت شد.';

      alert(refreshed
        ? successMessage
        : `${successMessage}\n\nهشدار: فهرست پرونده‌ها تازه نشد. برای مشاهده وضعیت فعلی، فهرست را دوباره بارگذاری کنید.`);

      setSelectedSpecialistId('');
    } catch (error) {
      alert(error instanceof Error
        ? error.message
        : 'ثبت تصمیم تریاژ ناموفق بود؛ وضعیت پرونده را از سرور بررسی کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForwardToSpecialist = () => submitTriage('refer');
  const handleDirectTriageResolution = () => submitTriage('resolve');
  const handleEmergencyRedirect = () => submitTriage('emergency');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header Banner - Page 3 Patent Philosophy */}
      <div className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-lg border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-700/80 rounded-xl shadow-inner">
            <ShieldAlert className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                پزشک تریاژ سطح اول
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-1">
              کارتابل تریاژ و غربالگری مراجعین قلبی — {triageDoctor.name}
            </h1>
            <p className="text-xs text-blue-200/90 mt-0.5">
              غربالگری شدت علائم، تفکیک موارد اورژانس از الکتیو و ارجاع هدفمند به متخصص قلب
            </p>
          </div>
        </div>

        <div className="text-xs bg-blue-950/70 border border-blue-700/60 p-2.5 rounded-xl text-right">
          <span className="text-blue-300 block">تعداد پرونده‌های در انتظار تریاژ:</span>
          <span className="text-xl font-mono font-bold text-amber-300">
            {pendingList.length} مورد
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">کل پرونده‌های منتظر</span>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-700">
              <BookOpen size={20} />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{pendingList.length}</div>
          <div className="mt-1 text-xs text-slate-500">پرونده در صف تریاژ</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-900">خوانده‌نشده</span>
            <span className="rounded-xl bg-white p-2 text-amber-700">
              <EyeOff size={20} />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-900">{unreadCount}</div>
          <div className="mt-1 text-xs text-amber-800">نیازمند بررسی پزشک</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-900">خوانده‌شده</span>
            <span className="rounded-xl bg-white p-2 text-emerald-700">
              <Eye size={20} />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">{readCount}</div>
          <div className="mt-1 text-xs text-emerald-800">بازشده توسط شما</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of consultations in inbox */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between px-1">
            <span>صندوق ورودی تریاژ:</span>
            <span className="text-[11px] text-slate-500">{pendingList.length} پرونده در انتظار</span>
          </h3>

          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {([
              { id: 'all', label: 'همه', count: pendingList.length },
              { id: 'unread', label: 'نخوانده', count: unreadCount },
              { id: 'read', label: 'خوانده', count: readCount },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setReadFilter(filter.id)}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
                  readFilter === filter.id
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-slate-600 hover:bg-white/70'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pl-1">
            {visiblePendingList.map((item) => {
              const isSelected = item.id === selectedInquiryId;
              const isPending = item.status === 'triage_pending';
              const isRead = isInquiryRead(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectInquiry(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                      : isPending
                      ? 'border-amber-300 bg-amber-50/30 hover:bg-slate-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.patientName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-1 mb-2">
                    {item.chiefComplaint}
                  </p>

                  <div className="mb-2 flex items-center gap-1.5">
                    {isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        <Eye size={12} /> خوانده‌شده
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                        <EyeOff size={12} /> جدید · خوانده‌نشده
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'referred_to_specialist'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isPending ? 'نیازمند تریاژ' : item.status === 'referred_to_specialist' ? 'ارجاع به متخصص' : 'تکمیل شده'}
                    </span>
                    <span className="text-slate-400 text-[10px]">{item.createdAt.split(' - ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Consultation Details & Triage Actions */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden space-y-6">
              
              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                    {selectedInquiry.patientName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedInquiry.patientName}</h4>
                    <p className="text-slate-500 break-words">
                      {selectedInquiry.patientAge != null && <>سن: {selectedInquiry.patientAge} سال • </>}
                      {selectedInquiry.patientGender && <>جنسیت: {selectedInquiry.patientGender} • </>}
                      تماس: {selectedInquiry.patientPhone || 'ثبت نشده'}
                    </p>
                  </div>
                </div>
                <div className="text-left text-slate-400 font-mono text-[11px]">
                  <div>زمان ثبت: {selectedInquiry.createdAt}</div>
                  <div>پزشک هدف: {selectedInquiry.targetDoctorName}</div>
                </div>
              </div>

              <div
                role="tablist"
                aria-label="بخش‌های پرونده بیمار"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 pt-4"
              >
                {([
                  ['history', 'شرح حال'],
                  ['summary', 'خلاصه هوش مصنوعی'],
                  ['documents', 'مدارک پزشکی'],
                  ['triage', 'تصمیم تریاژ'],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeDetailTab === tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${
                      activeDetailTab === tab
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6">
                
                {activeDetailTab === 'history' && (
                <div id="triage-panel-history" className="space-y-3">
                {/* شرح مختصر؛ پاسخ‌های خام در فایل مستقل ارائه می‌شوند. */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>شکایت اصلی و شرح حال مراجع:</span>
                    </h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <p className="font-bold text-slate-800 text-sm whitespace-pre-wrap">
                        {selectedInquiry.chiefComplaint || 'شکایت اصلی ثبت نشده است.'}
                      </p>
                      {selectedInquiry.symptomsDuration && (
                        <p className="text-slate-600">
                          <span className="font-bold">مدت علائم: </span>
                          {selectedInquiry.symptomsDuration}
                        </p>
                      )}
                      {selectedInquiry.intakeAnswers && selectedInquiry.intakeAnswers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => downloadIntakeAnswersAsWord(selectedInquiry)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
                        >
                          <FileText className="h-4 w-4" />
                          دریافت پاسخ کامل پرسش‌نامه (Word)
                        </button>
                      ) : (
                        <p className="text-slate-500">پاسخ ساختاریافته‌ای برای این پرونده ثبت نشده است.</p>
                      )}
                    </div>
                  </div>

                  </div>
                  )}

                  {activeDetailTab === 'summary' && selectedInquiry.aiIntakeSummary && (
                  <section
                    id="triage-panel-summary"
                    className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2"
                    aria-label="خلاصه تولیدشده توسط هوش مصنوعی"
                  >
                    <h4 className="text-sm font-bold text-amber-950">
                      خلاصهٔ تولیدشده توسط هوش مصنوعی
                    </h4>
                    <p className="text-xs leading-6 text-amber-950 whitespace-pre-wrap">
                      {selectedInquiry.aiIntakeSummary}
                    </p>
                    <p className="border-t border-amber-200 pt-2 text-[11px] leading-5 text-amber-900">
                      این خلاصه صرفاً ابزار کمکی است؛ پزشک باید آن را با پاسخ‌های اصلی بیمار تطبیق دهد. این متن تشخیص پزشکی نیست و ممکن است ناقص یا نادرست باشد.
                    </p>
                  </section>
                )}

                {activeDetailTab === 'summary' && !selectedInquiry.aiIntakeSummary && (
                  <section
                    id="triage-panel-summary"
                    className="rounded-xl border border-amber-300 bg-amber-50 p-4"
                  >
                    <h4 className="text-sm font-bold text-amber-950">
                      خلاصه هوش مصنوعی در دسترس نیست
                    </h4>
                    <p className="mt-2 text-xs leading-6 text-amber-900">
                      برای این پرونده خلاصه‌ای تولید نشده است. ارزیابی را بر اساس شرح حال و پاسخ‌های اصلی بیمار انجام دهید.
                    </p>
                  </section>
                )}

                {activeDetailTab === 'documents' && (
                <div id="triage-panel-documents" className="space-y-3">
                {/* Attached Medical Documents */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>مدارک پاراکلینیکی ارسالی ({selectedInquiry.documents.length} مدرک):</span>
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedInquiry.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 block">{doc.date} • {doc.fileSize}</span>
                        </div>
                        {doc.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => onOpenECGModal(doc)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده / دریافت</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                </div>
                )}

                {activeDetailTab === 'triage' && (
                <div id="triage-panel-triage">
                {/* بخش تصمیم‌گیری تریاژ */}
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-blue-700" />
                      <span>ارزیابی تریاژ سطح اول مرکز بهداشت:</span>
                    </span>
                    <span className="text-[10px] font-mono bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded">
                      Level 1 Triage Screening
                    </span>
                  </div>

                  {/* Urgency classification */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      تعیین سطح ریسک قلبی بیمار:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSeverity('low')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          severity === 'low'
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        کم‌خطر (پاسخ در مرکز)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeverity('moderate')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          severity === 'moderate'
                            ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        متوسط (ارجاع به متخصص)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeverity('high')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          severity === 'high'
                            ? 'bg-red-600 text-white font-bold border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        پرخطر (شدت بالا)
                      </button>
                    </div>
                  </div>

                  {/* فهرست متخصصان تأییدشده از API تریاژ */}
                  <div>
                    <label htmlFor="triage-specialist" className="block text-[11px] font-bold text-slate-700 mb-1">
                      متخصص قلب مقصد ارجاع:
                    </label>
                    <select
                      id="triage-specialist"
                      value={selectedSpecialistId}
                      onChange={(e) => setSelectedSpecialistId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="">انتخاب متخصص...</option>
                      {specialists.map((specialist) => (
                        <option key={specialist.id} value={specialist.id}>
                          {specialist.name || "متخصص بدون نام"}
                        </option>
                      ))}
                    </select>
                    {specialists.length === 0 && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        متخصص تأییدشده‌ای در پاسخ فعلی سرور موجود نیست.
                      </p>
                    )}
                  </div>

                  {/* Triage notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      یادداشت تشخیصی تریاژ (جهت ارسال به متخصص):
                    </label>
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={triageNotes}
                        onChange={(e) => setTriageNotes(e.target.value)}
                        placeholder="مثال: نوار قلب فاقد تغییرات قطعه ST، آنزیم‌ها منفی، شرح حال آریتمی متناوب نیازمند هولتر و معاینه تخصصی..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speechTarget === 'notes' ? stopSpeechInput() : startSpeechInput('notes')}
                          disabled={!speechSupported || (speechTarget !== null && speechTarget !== 'notes') || isSubmitting}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${speechTarget === 'notes' ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                        >
                          {speechTarget === 'notes' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {speechTarget === 'notes' ? 'توقف ضبط' : 'ثبت صوتی یادداشت'}
                        </button>
                        {speechTarget === 'notes' && <span className="text-[11px] text-red-600">در حال شنیدن صدای پزشک...</span>}
                      </div>
                    </div>
                  </div>

                  {/* Guidance for patient if low severity */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      راهنمایی اولیه پزشک تریاژ برای بیمار:
                    </label>
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={initialGuidance}
                        onChange={(e) => setInitialGuidance(e.target.value)}
                        placeholder="مثال: پرهیز از محرک‌ها، کنترل فشار خون و استراحت..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speechTarget === 'guidance' ? stopSpeechInput() : startSpeechInput('guidance')}
                          disabled={!speechSupported || (speechTarget !== null && speechTarget !== 'guidance') || isSubmitting}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${speechTarget === 'guidance' ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                        >
                          {speechTarget === 'guidance' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {speechTarget === 'guidance' ? 'توقف ضبط' : 'ثبت صوتی راهنمایی'}
                        </button>
                        {speechTarget === 'guidance' && <span className="text-[11px] text-red-600">در حال شنیدن صدای پزشک...</span>}
                      </div>
                    </div>
                  </div>

                  {speechError && (
                    <p role="status" className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800">
                      {speechError}
                    </p>
                  )}
                  {!speechSupported && (
                    <p className="text-[11px] text-slate-500">
                      ورود صوتی در این مرورگر پشتیبانی نمی‌شود؛ برای استفاده از میکروفون، Chrome را امتحان کنید.
                    </p>
                  )}

                  {/* دکمه‌های اقدام تریاژ */}
                  <div className="pt-3 border-t border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleDirectTriageResolution}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold"
                    >
                      پاسخ و رفع نیاز در سطح اول تریاژ
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleForwardToSpecialist}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>تأیید تریاژ و ارجاع پرونده به متخصص قلب</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleEmergencyRedirect}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>ثبت هدایت فوری به اورژانس</span>
                    </button>
                  </div>

                </div>

                </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              پرونده‌ای انتخاب نشده است.
            </div>
          )}
        </div>

      </div>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ارجاع‌ها و پیگیری پرونده‌ها
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              پرونده‌هایی که قبلاً توسط شما بررسی شده‌اند؛ وضعیت پس از تازه‌سازی نیز حفظ می‌شود.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {handledList.length} پرونده
          </span>
        </div>

        {handledList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            هنوز پرونده‌ای برای پیگیری ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {handledList.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {item.patientName}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {item.chiefComplaint}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p>
                    <span className="font-bold">متخصص مقصد: </span>
                    {item.targetDoctorName || 'هنوز تعیین نشده'}
                  </p>
                  {item.triage?.severity && (
                    <p>
                      <span className="font-bold">سطح فوریت: </span>
                      {item.triage.severity}
                    </p>
                  )}
                  {item.specialistReview?.reviewedAt && (
                    <p>
                      <span className="font-bold">آخرین بررسی متخصص: </span>
                      {new Date(item.specialistReview.reviewedAt).toLocaleString('fa-IR')}
                    </p>
                  )}
                  <p>
                    <span className="font-bold">آخرین به‌روزرسانی: </span>
                    {new Date(item.updatedAt).toLocaleString('fa-IR')}
                  </p>
                  <p className="break-all text-[10px] text-slate-400">
                    شناسه پرونده: {item.id}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
