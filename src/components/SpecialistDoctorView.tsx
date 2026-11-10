import React, { useEffect, useRef, useState } from 'react';
import { 
  Heart, User, Calendar, Clock, FileText, Activity, CheckSquare, 
  Square, Send, Eye, EyeOff, AlertCircle, Plus, Trash2, CheckCircle2, Shield,
  Pill, AlertTriangle, Mic, MicOff, Loader2
} from 'lucide-react';
import { ConsultationInquiry, Doctor, CardiacDocument } from '../types';
import { DrugInteractionChecker } from './DrugInteractionChecker';

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

interface Props {
  consultations: ConsultationInquiry[];
  doctor: Doctor;
  onUpdateConsultation: (
    updated: ConsultationInquiry
  ) => Promise<boolean>;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const SpecialistDoctorView: React.FC<Props> = ({
  consultations,
  doctor,
  onUpdateConsultation,
  onOpenECGModal,
}) => {
  // Filter inquiries assigned to this cardiologist or in progress
  const assignedList = consultations.filter(
    (c) => c.targetDoctorId === doctor.id
  );

  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(new Set());
  const pendingReadIds = useRef(new Set<string>());

  const isInquiryRead = (item: ConsultationInquiry) =>
    item.isRead === true || locallyReadIds.has(item.id);

  const visibleAssignedList = assignedList.filter((item) => {
    const read = isInquiryRead(item);
    return readFilter === 'all' ||
      (readFilter === 'read' && read) ||
      (readFilter === 'unread' && !read);
  });

  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    assignedList[0]?.id || ''
  );

  const selectedInquiry = assignedList.find((c) => c.id === selectedInquiryId);
  const selectedInquiryIdRef = useRef(selectedInquiryId);
  selectedInquiryIdRef.current = selectedInquiryId;

  type DetailTab = 'overview' | 'documents' | 'response';
  const [activeDetailTab, setActiveDetailTab] =
    useState<DetailTab>('overview');


  // Specialist reply form states (Page 6 Patent)
  const [diagnosisText, setDiagnosisText] = useState<string>(
    selectedInquiry?.specialistReview?.diagnosis || ''
  );
  const [clinicalGuidance, setClinicalGuidance] = useState<string>(
    selectedInquiry?.specialistReview?.clinicalGuidance || ''
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingInquiryIdRef = useRef('');
  const [prescriptions, setPrescriptions] = useState<string[]>(
    selectedInquiry?.specialistReview?.prescriptionsOrRecommendations || [
      'قرص متوپرولول تارتارات ۲۵ میلی‌گرم (نصف قرص هر ۱۲ ساعت)',
      'پرهیز جدی از مصرف قهوه غلیظ و مواد کافئین‌دار',
      'ثبت روزانه فشار خون و نبض',
    ]
  );
  const [newPrescriptionInput, setNewPrescriptionInput] = useState('');

  // درخواست تکمیل اطلاعات از بیمار
  const [requestAdditionalInfo, setRequestAdditionalInfo] = useState<boolean>(
    selectedInquiry?.specialistReview?.requestedAdditionalInfo ?? true
  );
  const [additionalDescription, setAdditionalDescription] = useState<string>(
    selectedInquiry?.specialistReview?.additionalInfoDescription || 
    'جهت بررسی دقیق‌تر نوع آریتمی و احتمال PVCهای مکرر، نیاز به بررسی مدارک زیر داریم:'
  );
  const [additionalDocsNeeded, setAdditionalDocsNeeded] = useState<string[]>(
    selectedInquiry?.specialistReview?.additionalDocumentsNeeded || [
      'نوار قلب مجدد دقیقاً در زمان احساس تپش و جا افتادن ضربان',
      'انجام هولتر مانیتورینگ ریتم ۲۴ یا ۴۸ ساعته',
      'آزمایش الکترولیت‌های خون (پتاسیم، منیزیم) و هورمون TSH',
    ]
  );
  const [newDocNeedInput, setNewDocNeedInput] = useState('');



  // Reset every case-specific field when switching patients.
  const handleSelectInquiry = (inquiry: ConsultationInquiry) => {
    const review = inquiry.specialistReview;

    setSelectedInquiryId(inquiry.id);
    setActiveDetailTab('overview');
    setDiagnosisText(review?.diagnosis || '');
    setClinicalGuidance(review?.clinicalGuidance || '');
    setPrescriptions(review?.prescriptionsOrRecommendations || []);
    setNewPrescriptionInput('');
    setRequestAdditionalInfo(review?.requestedAdditionalInfo ?? false);
    setAdditionalDescription(review?.additionalInfoDescription || '');
    setAdditionalDocsNeeded(review?.additionalDocumentsNeeded || []);
    setNewDocNeedInput('');
  };

  const handleAddPrescription = () => {
    if (!newPrescriptionInput.trim()) return;
    setPrescriptions([...prescriptions, newPrescriptionInput.trim()]);
    setNewPrescriptionInput('');
  };

  const handleRemovePrescription = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleAddDocNeed = () => {
    if (!newDocNeedInput.trim()) return;
    setAdditionalDocsNeeded([...additionalDocsNeeded, newDocNeedInput.trim()]);
    setNewDocNeedInput('');
  };

  const handleRemoveDocNeed = (idx: number) => {
    setAdditionalDocsNeeded(additionalDocsNeeded.filter((_, i) => i !== idx));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep the selection valid after the specialist queue refreshes.
  useEffect(() => {
    if (assignedList.length === 0) {
      if (selectedInquiryId !== '') setSelectedInquiryId('');
      setDiagnosisText('');
      setClinicalGuidance('');
      setPrescriptions([]);
      setNewPrescriptionInput('');
      setRequestAdditionalInfo(false);
      setAdditionalDescription('');
      setAdditionalDocsNeeded([]);
      setNewDocNeedInput('');
      return;
    }

    const selectionStillExists = assignedList.some(
      (inquiry) => inquiry.id === selectedInquiryId
    );

    if (!selectionStillExists) {
      const nextInquiry = assignedList[0];
      setSelectedInquiryId(nextInquiry.id);
      setActiveDetailTab('overview');
      setDiagnosisText(nextInquiry.specialistReview?.diagnosis || '');
      setClinicalGuidance(nextInquiry.specialistReview?.clinicalGuidance || '');
      setPrescriptions(
        nextInquiry.specialistReview?.prescriptionsOrRecommendations || []
      );
      setRequestAdditionalInfo(
        nextInquiry.specialistReview?.requestedAdditionalInfo ?? false
      );
      setAdditionalDescription(
        nextInquiry.specialistReview?.additionalInfoDescription || ''
      );
      setAdditionalDocsNeeded(
        nextInquiry.specialistReview?.additionalDocumentsNeeded || []
      );
      setNewPrescriptionInput('');
      setNewDocNeedInput('');
    }
  }, [
    assignedList.map((inquiry) => inquiry.id).join('|'),
    selectedInquiryId,
  ]);

  // ضبط صدای پزشک و افزودن متن تبدیل‌شده به شرح راهنمایی بالینی
  const handleVoiceInput = async () => {
    setVoiceError('');

    if (isTranscribing) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!selectedInquiryId || !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined') {
      setVoiceError(
        !selectedInquiryId
          ? 'ابتدا یک پرونده را انتخاب کنید.'
          : 'ضبط صدا در این مرورگر پشتیبانی نمی‌شود.'
      );
      return;
    }

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      recordingInquiryIdRef.current = selectedInquiryId;

      const mimeCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const mimeType = mimeCandidates.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setVoiceError('هنگام ضبط صدا خطایی رخ داد. دوباره تلاش کنید.');
        setIsRecording(false);
      };

      recorder.onstop = async () => {
        setIsRecording(false);

        const actualType = recorder.mimeType || 'audio/webm';
        const extension = actualType.includes('mp4') ? 'm4a'
          : actualType.includes('ogg') ? 'ogg'
          : actualType.includes('wav') ? 'wav'
          : 'webm';

        const blob = new Blob(audioChunksRef.current, { type: actualType });
        audioChunksRef.current = [];

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;

        if (!blob.size) {
          setVoiceError('صدایی ضبط نشد. دوباره تلاش کنید.');
          return;
        }

        if (blob.size > 20 * 1024 * 1024) {
          setVoiceError('حجم فایل صوتی بیش از ۲۰ مگابایت است.');
          return;
        }

        if (selectedInquiryIdRef.current !== recordingInquiryIdRef.current) {
          setVoiceError('پرونده تغییر کرده است؛ متن صوتی ثبت نشد.');
          return;
        }

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append('file', blob, `recording.${extension}`);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(140000),
          });

          const data: { text?: string; error?: string } =
            await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data.error || 'تبدیل صدا به متن انجام نشد.');
          }

          if (typeof data.text !== 'string' || !data.text.trim()) {
            throw new Error('متنی از صدا تشخیص داده نشد.');
          }

          if (selectedInquiryIdRef.current !== recordingInquiryIdRef.current) {
            setVoiceError('پرونده تغییر کرده است؛ متن تبدیل‌شده ثبت نشد.');
            return;
          }

          setClinicalGuidance((previous) =>
            previous.trim()
              ? `${previous.trim()} ${data.text!.trim()}`
              : data.text!.trim()
          );
        } catch (error) {
          setVoiceError(
            error instanceof Error && error.name !== 'AbortError'
              ? error.message
              : 'تبدیل صدا به متن انجام نشد؛ دوباره تلاش کنید.'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      setIsRecording(false);

      setVoiceError(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'برای ضبط صدا، اجازه دسترسی به میکروفون را فعال کنید.'
          : 'دسترسی به میکروفون ممکن نشد. مجوز مرورگر و اتصال امن را بررسی کنید.'
      );
    }
  };

  // آزادسازی میکروفون هنگام خروج از صفحه
  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // ثبت مشاهده پرونده انتخاب‌شده برای همین متخصص
  useEffect(() => {
    if (!selectedInquiryId) return;

    const item = assignedList.find((inquiry) => inquiry.id === selectedInquiryId);
    if (!item || isInquiryRead(item) || pendingReadIds.current.has(item.id)) return;

    pendingReadIds.current.add(item.id);
    fetch(`/api/consultations/${item.id}/read`, {
      method: 'POST',
      credentials: 'same-origin',
    })
      .then((response) => {
        if (!response.ok) throw new Error('ثبت مشاهده ناموفق بود');
        setLocallyReadIds((previous) => new Set(previous).add(item.id));
      })
      .catch(() => {})
      .finally(() => pendingReadIds.current.delete(item.id));
  }, [selectedInquiryId, doctor.id, assignedList, locallyReadIds]);

  const handleSendResponse = async () => {
    if (!selectedInquiry || isSubmitting) return;
    if (!clinicalGuidance.trim()) {
      alert('لطفاً شرح راهنمایی و پاسخ بالینی را در کادر پاسخ بنویسید.');
      return;
    }
    if (requestAdditionalInfo && !additionalDescription.trim()) {
      alert('لطفاً شرح اطلاعات تکمیلی موردنیاز را وارد کنید.');
      return;
    }

    const updated: ConsultationInquiry = {
      ...selectedInquiry,
      updatedAt: new Date().toISOString(),
      status: requestAdditionalInfo ? 'additional_info_requested' : 'completed',
      specialistReview: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        reviewedAt: new Date().toISOString(),
        diagnosis: diagnosisText.trim() || 'ارزیابی علائم قلبی عروقی',
        clinicalGuidance: clinicalGuidance.trim(),
        prescriptionsOrRecommendations: prescriptions,
        requestedAdditionalInfo: requestAdditionalInfo,
        additionalInfoDescription: requestAdditionalInfo
          ? additionalDescription.trim()
          : undefined,
        additionalDocumentsNeeded: requestAdditionalInfo
          ? additionalDocsNeeded
          : undefined,
      },
    };

    setIsSubmitting(true);
    try {
      const refreshed = await onUpdateConsultation(updated);

      if (refreshed) {
        alert(
          requestAdditionalInfo
            ? 'پاسخ ثبت شد و درخواست اطلاعات تکمیلی در پرونده ذخیره شد.'
            : 'پاسخ نهایی در پرونده بیمار ثبت شد.'
        );
      } else {
        alert(
          'پاسخ در سرور ثبت شد، اما تازه‌سازی فهرست پرونده‌ها ناموفق بود. برای مشاهده وضعیت جدید، فهرست را دوباره بارگذاری کنید.'
        );
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'ثبت پاسخ با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-5 sm:py-7">
      
      {/* Patent Header Banner (مطابق صفحه ۶ پتنت: Tele D - پزشک: ...) */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                پنل پزشک متخصص قلب
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-1">
              {doctor.name} — {doctor.subSpecialty}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              نظام پزشکی: {doctor.medicalCouncilNumber} • کلینیک مجازی تخصصی قلب و عروق
            </p>
          </div>
        </div>

        <div className="text-xs bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-right">
          <span className="text-slate-400 block">پرونده‌های فعال در انتظار شما:</span>
          <span className="text-xl font-mono font-bold text-teal-400">
            {assignedList.length} پرونده
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient queue column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between px-1">
            <span>لیست بیماران و مشاوره‌های ارجاعی:</span>
            <span className="text-[11px] text-slate-500">
              {visibleAssignedList.length} از {assignedList.length} مورد
            </span>
          </h3>

          <div className="flex gap-1.5 text-xs">
            {([
              ['all', 'همه'],
              ['unread', 'خوانده‌نشده'],
              ['read', 'خوانده‌شده'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setReadFilter(value)}
                aria-pressed={readFilter === value}
                className={`rounded-lg px-2.5 py-1.5 border ${
                  readFilter === value
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pl-1">
            {visibleAssignedList.map((item) => {
              const isSelected = item.id === selectedInquiryId;
              const hasReqDocs = item.status === 'additional_info_requested';
              const isRead = isInquiryRead(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectInquiry(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{item.patientName}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] ${
                      isRead ? 'text-slate-500' : 'text-amber-700 font-bold'
                    }`}>
                      {isRead ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {isRead ? 'خوانده‌شده' : 'خوانده‌نشده'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-1 mb-2 font-medium">
                    {item.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hasReqDocs
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {hasReqDocs ? 'در انتظار تکمیل مدارک' : item.status === 'completed' ? 'پاسخ داده شده' : 'نیازمند بررسی متخصص'}
                    </span>
                    <span className="text-slate-400 text-[10px]">{item.createdAt.split(' - ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* فضای کاری مشاوره پزشک */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-6">
              
              {/* مشخصات بیمار، تاریخ و زمان پرسش */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>سوال‌کننده: {selectedInquiry.patientName}</span>
                    {(selectedInquiry.patientAge != null || selectedInquiry.patientGender) && (
                      <span className="text-slate-500 font-normal">
                        ({selectedInquiry.patientAge != null ? `${selectedInquiry.patientAge} ساله` : ''}
                        {selectedInquiry.patientAge != null && selectedInquiry.patientGender ? ' - ' : ''}
                        {selectedInquiry.patientGender || ''})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">شماره تماس: {selectedInquiry.patientPhone || 'ثبت نشده'}</p>
                </div>

                <div className="sm:text-left space-y-1 text-slate-600">
                  <div className="flex sm:justify-end items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاریخ و زمان سوال: {selectedInquiry.createdAt}</span>
                  </div>
                  {selectedInquiry.triage && (
                    <div className="text-[11px] text-blue-700 sm:text-left font-semibold">
                      تأیید شده در تریاژ توسط {selectedInquiry.triage.doctorName}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-b border-slate-200 bg-white px-3 sm:px-5 pt-3">
                <div
                  role="tablist"
                  aria-label="بخش‌های پرونده بیمار"
                  className="flex gap-2 overflow-x-auto pb-3"
                >
                  {([
                    { id: 'overview', label: 'شرح حال بیمار', icon: FileText },
                    { id: 'documents', label: 'مدارک و آزمایش‌ها', icon: Activity },
                    { id: 'response', label: 'پاسخ متخصص و داروها', icon: Pill },
                  ] as const).map((tab) => {
                    const TabIcon = tab.icon;
                    const active = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`specialist-tab-${tab.id}`}
                        aria-selected={active}
                        aria-controls={`specialist-panel-${tab.id}`}
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold transition-colors ${
                          active
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <TabIcon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {activeDetailTab === 'overview' && (
                  <div
                    role="tabpanel"
                    id="specialist-panel-overview"
                    aria-labelledby="specialist-tab-overview"
                    className="space-y-6"
                  >

                
                {/* 1. پرسش بیمار */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>پرسش و شرح حال بیمار:</span>
                  </label>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">
                      موضوع: {selectedInquiry.chiefComplaint}
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      مدت و زمان شروع علائم: {selectedInquiry.symptomsDuration || 'ثبت نشده'}
                    </p>
                    {selectedInquiry.intakeAnswers && selectedInquiry.intakeAnswers.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => downloadIntakeAnswersAsWord(selectedInquiry)}
                          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
                        >
                          <FileText className="h-4 w-4" />
                          دریافت پاسخ کامل پرسش‌نامه (.doc)
                        </button>
                      </div>
                    )}
                    
                    {selectedInquiry.chestPainDetails && (
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px] text-slate-600">
                        <span className="bg-white px-2 py-1 rounded border">درد: {selectedInquiry.chestPainDetails.painType}</span>
                        <span className="bg-white px-2 py-1 rounded border">محرک: {selectedInquiry.chestPainDetails.triggers?.join('، ')}</span>
                        <span className="bg-white px-2 py-1 rounded border">علائم همراه: {selectedInquiry.chestPainDetails.associatedSymptoms?.join('، ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* نمایش متن تکمیلی ثبت‌شده توسط بیمار */}
                {selectedInquiry.supplementalResponse?.patientNotes?.trim() && (
                  <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-blue-950">
                        اطلاعات تکمیلی ارسال‌شده توسط بیمار
                      </h3>
                      <span className="text-[11px] text-blue-700">
                        {selectedInquiry.supplementalResponse.submittedAt
                          ? new Date(
                              selectedInquiry.supplementalResponse.submittedAt
                            ).toLocaleString('fa-IR')
                          : ''}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                      {selectedInquiry.supplementalResponse.patientNotes}
                    </p>
                    <p className="text-[11px] text-blue-800">
                      نمایش متن ثبت‌شده؛ بارگذاری فایل هنوز فعال نیست.
                    </p>
                  </div>
                )}

                  </div>
                )}

                {activeDetailTab === 'documents' && (
                  <div
                    role="tabpanel"
                    id="specialist-panel-documents"
                    aria-labelledby="specialist-tab-documents"
                    className="space-y-6"
                  >
                {/* 2. مدارک پزشکی */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <span>مدارک پاراکلینیکی پیوست‌شده بیمار:</span>
                    </span>
                    <span className="text-[11px] text-slate-500">برای بررسی روی هر مدرک کلیک کنید</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedInquiry.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 truncate">{doc.title}</h5>
                          <p className="text-[11px] text-slate-500 truncate">{doc.date} • {doc.fileSize}</p>
                          {doc.notes && <p className="text-[10px] text-slate-600 truncate mt-0.5">{doc.notes}</p>}
                        </div>

                        {doc.downloadUrl ? (
                          <button
                            type="button"
                            onClick={() => onOpenECGModal(doc)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{doc.type === 'ecg' ? 'بررسی نوار قلب' : 'مشاهده / دریافت'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 shrink-0">فایل پیوست در دسترس نیست</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                  </div>
                )}

                {activeDetailTab === 'response' && (
                  <div
                    role="tabpanel"
                    id="specialist-panel-response"
                    aria-labelledby="specialist-tab-response"
                    className="space-y-6"
                  >
                {(selectedInquiry.triage?.triageNotes?.trim() || selectedInquiry.triage?.initialGuidance?.trim()) && (
                  <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                    <h3 className="text-sm font-bold text-amber-950">
                      خلاصهٔ ارزیابی و توضیحات پزشک تریاژ
                    </h3>
                    {selectedInquiry.triage?.triageNotes?.trim() && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 mb-1">معاینه و یادداشت پزشک تریاژ</h4>
                        <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{selectedInquiry.triage.triageNotes}</p>
                      </div>
                    )}
                    {selectedInquiry.triage?.initialGuidance?.trim() && (
                      <div className="border-t border-amber-200 pt-2">
                        <h4 className="text-xs font-bold text-slate-800 mb-1">راهنمایی اولیه</h4>
                        <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{selectedInquiry.triage.initialGuidance}</p>
                      </div>
                    )}
                  </section>
                )}
                {/* 3. پاسخ پزشک */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      تشخیص اولیه یا ارزیابی بالینی (Diagnosis):
                    </label>
                    <input
                      type="text"
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                      placeholder="مثال: آریتمی خوش‌خیم بطنی (PVC) در زمینه استرس و مصرف کافئین"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      پاسخ و راهنمایی بالینی پزشک:
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        disabled={isTranscribing || !selectedInquiry}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          isRecording
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                        }`}
                      >
                        {isTranscribing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isRecording ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                        {isTranscribing
                          ? 'در حال تبدیل صدا به متن...'
                          : isRecording
                            ? 'توقف ضبط'
                            : 'توضیح صوتی پزشک'}
                      </button>
                      {isRecording && (
                        <span className="text-xs text-red-600">
                          در حال ضبط؛ برای پایان، دکمه توقف را بزنید.
                        </span>
                      )}
                    </div>
                    {voiceError && (
                      <p role="alert" className="text-xs text-red-600 mb-2">
                        {voiceError}
                      </p>
                    )}
                    <textarea
                      rows={4}
                      value={clinicalGuidance}
                      onChange={(e) => setClinicalGuidance(e.target.value)}
                      placeholder="توضیحات کامل برای بیمار پیرامون یافته‌های نوار قلب، آزمایشات، توصیه‌های ورزشی و دارویی..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* بررسی سوابق دارویی مزمن و هشدارهای تداخل دارویی (DDI) قبل از تجویز */}
                  <div className="pt-2">
                    <DrugInteractionChecker
                      candidateDrug={newPrescriptionInput}
                      onApplyRecommendation={(rec) => {
                        setPrescriptions((prev) => [...prev, `توصیه ایمن پزشک: ${rec}`]);
                      }}
                    />
                  </div>

                  {/* Prescription recommendations */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        <span>دستورات دارویی نهایی و توصیه‌های تکمیلی نسخه:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({prescriptions.length} مورد ثبت‌شده)
                      </span>
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {prescriptions.map((rx, idx) => {
                        const hasInteractionRisk = 
                          (rx.includes('وراپامیل') && rx.includes('پروپرانولول')) ||
                          rx.includes('وراپامیل') ||
                          rx.includes('اسپیرونولاکتون') ||
                          rx.includes('ناپروکسن') ||
                          rx.includes('کلاریترومایسین');

                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                              hasInteractionRisk 
                                ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-200' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {hasInteractionRisk ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                              )}
                              <span className="text-slate-800 font-medium">{rx}</span>
                              {hasInteractionRisk && (
                                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">
                                  نیازمند توجه به تداخل
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePrescription(idx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="حذف از نسخه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPrescriptionInput}
                        onChange={(e) => setNewPrescriptionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrescription())}
                        placeholder="افزودن دستور دارویی جدید به نسخه (بررسی خودکار تداخلات در پنل بالا)..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPrescription}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                      >
                        افزودن به نسخه
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. THE CORE PATENT FEATURE: "چک باکس: [درخواست تکمیل اطلاعات از سوی بیمار]" */}
                <div className="p-4 bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl space-y-4">
                  <label 
                    onClick={() => setRequestAdditionalInfo(!requestAdditionalInfo)}
                    className="flex items-start gap-3 cursor-pointer select-none"
                  >
                    <div className="mt-0.5 text-amber-700">
                      {requestAdditionalInfo ? (
                        <CheckSquare className="w-5 h-5 fill-amber-600 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        درخواست تکمیل اطلاعات از سوی بیمار
                      </span>
                      <span className="text-[11px] text-slate-600">
                        با انتخاب این گزینه، صفحه درخواست مدارک اضافی برای بیمار باز شده و مدارک درخواستی به وی اعلام می‌گردد.
                      </span>
                    </div>
                  </label>

                  {/* Sub-panel dynamically visible when checkbox is checked (as specified in patent: "اگر این تیک بخورد، باید صفحه دیگری هم باز شود که طی آن شرح مدارک درخواستی به بیمار اطلاع داده شود") */}
                  {requestAdditionalInfo && (
                    <div className="pt-3 border-t border-amber-200 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          شرح پیام به بیمار جهت درخواست مدارک تکمیلی:
                        </label>
                        <input
                          type="text"
                          value={additionalDescription}
                          onChange={(e) => setAdditionalDescription(e.target.value)}
                          placeholder="ضمناً برای راهنمایی بهتر، نیاز به مدارک زیر داریم..."
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                          لیست مدارک یا آزمایشات درخواستی:
                        </label>
                        <div className="space-y-1.5 mb-2">
                          {additionalDocsNeeded.map((docItem, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs">
                              <span className="text-slate-800 font-medium">📋 {docItem}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocNeed(idx)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newDocNeedInput}
                            onChange={(e) => setNewDocNeedInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDocNeed())}
                            placeholder="مثال: نوار قلب جدید ۲۴ ساعت بعد یا آزمایش تیروئید..."
                            className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddDocNeed}
                            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                          >
                            + افزودن نیاز
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. دکمه ارسال پاسخ */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSendResponse}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'در حال ثبت پاسخ...' : 'ارسال پاسخ و ثبت در پرونده الکترونیک بیمار '}</span>
                  </button>
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
    </div>
  );
};
