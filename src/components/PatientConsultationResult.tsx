import React, { useState } from 'react';
import { 
  Heart, User, Calendar, FileText, CheckCircle2, AlertCircle, 
  Upload, Send, Printer, ArrowRight, Activity, Download, Plus, HelpCircle, ExternalLink
} from 'lucide-react';
import { ConsultationInquiry, CardiacDocument, PatientUser } from '../types';

interface Props {
  consultation: ConsultationInquiry;
  patient: PatientUser;
  onBack: () => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
  onSubmitSupplementalDocs: (consultationId: string, notes: string, docs: CardiacDocument[]) => void;
  onNavigateToSpecialistClinic?: () => void;
}

export const PatientConsultationResult: React.FC<Props> = ({
  consultation,
  patient,
  onBack,
  onOpenECGModal,
  onSubmitSupplementalDocs,
  onNavigateToSpecialistClinic,
}) => {
  const [supplementalNotes, setSupplementalNotes] = useState('');
  const [uploadedSupplementalDocs, setUploadedSupplementalDocs] = useState<CardiacDocument[]>([]);
  const [supplementalSent, setSupplementalSent] = useState(false);

  const specialist = consultation.specialistReview;
  const triage = consultation.triage;
  const hasAdditionalInfoReq = specialist?.requestedAdditionalInfo;

  const handleAddSampleSupplementalDoc = (type: 'ecg' | 'lab_enzymes' | 'holter') => {
    const newDoc: CardiacDocument = {
      id: `suppl-${Date.now()}`,
      type,
      title: type === 'ecg' ? 'نوار قلب مجدد حین تپش (لیدهای ۱۲ گانه)' : type === 'holter' ? 'گزارش هولتر ریتم ۲۴ ساعته جدید' : 'آزمایش خون الکترولیت و آنزیم تروپونین',
      date: '۱۴۰۳/۰۷/۲۵',
      fileName: `Suppl_${type.toUpperCase()}_Result.pdf`,
      fileSize: '۲.۱ مگابایت',
      notes: 'پاسخ به درخواست پزشک در سامانه TeleCardio',
    };
    setUploadedSupplementalDocs([...uploadedSupplementalDocs, newDoc]);
  };

  const handleSendSupplemental = () => {
    if (!supplementalNotes && uploadedSupplementalDocs.length === 0) {
      alert('لطفاً یادداشت یا مدرک درخواستی را وارد فرمایید.');
      return;
    }
    onSubmitSupplementalDocs(consultation.id, supplementalNotes, uploadedSupplementalDocs);
    setSupplementalSent(true);
    alert('مدارک تکمیلی با موفقیت برای پزشک مشاوره ارسال شد.');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به سوابق و پرونده‌ها</span>
        </button>

        <button
          onClick={handlePrintSummary}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>چاپ برگه خلاصه مشاوره پزشکی</span>
        </button>
      </div>

      {/* Main Result Sheet - Direct Reflection of Patent Page 7 & Page 3 */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-6">
        
        {/* Header - TeleCardio (Tele D) */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/90 rounded-2xl shadow-md">
              <Heart className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                  TeleCardio (Tele D)
                </span>
                <span className="text-xs text-slate-300">| کارتابل پاسخ مراجعین</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mt-1 text-slate-100">
                نتیجه بررسی و پاسخ مشاوره پزشکی قلب
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                پرونده شماره: <span className="font-mono">{consultation.id}</span> • مرکز خدمات جامع سلامت
              </p>
            </div>
          </div>

          <div className="text-left bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl text-xs">
            <span className="text-slate-400 block">وضعیت فعلی پرونده:</span>
            <span className={`font-bold mt-0.5 inline-block ${
              hasAdditionalInfoReq ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {hasAdditionalInfoReq ? 'نیازمند تکمیل مدارک درخواستی پزشک' : 'پاسخ داده شده و تکمیل'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Patient Salutation & Doctor Notice (Exact text structure from Patent Page 7) */}
          <div className="p-4 bg-slate-50 border-r-4 border-rose-600 rounded-xl space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              کاربر گرامی: {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              در پاسخ به سوال شما که در تاریخ <span className="font-bold text-slate-800">{consultation.createdAt}</span> در سامانه ثبت گردیده است،{' '}
              <span className="font-bold text-slate-900">
                {specialist ? specialist.doctorName : triage?.doctorName || 'پزشک مرکز سلامت'}
              </span>{' '}
              پاسخ زیر را ارائه کرده‌اند:
            </p>
          </div>

          {/* خلاصه پرسش (Patent Page 3: خلاصه پرسش) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>خلاصه پرسش و شرح حال شما (ص ۳ پتنت):</span>
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900">{consultation.chiefComplaint}</div>
              <p className="leading-relaxed text-slate-600">{consultation.symptomsDescription}</p>
            </div>
          </div>

          {/* پاسخ پزشک (Patent Page 7 & Page 3: کادر پاسخ پزشک) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>پاسخ بالینی پزشک معالج (کادر پاسخ ص ۷ پتنت):</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {specialist?.reviewedAt || triage?.reviewedAt || 'ثبت شده'}
              </span>
            </div>

            <div className="p-5 bg-emerald-50/40 rounded-2xl border-2 border-emerald-200 space-y-4">
              {specialist?.diagnosis && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                  <span>تشخیص و ارزیابی اولیه:</span>
                  <span>{specialist.diagnosis}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {specialist?.clinicalGuidance || triage?.initialGuidance || 'پاسخ در دست تنظیم است.'}
              </p>

              {/* Prescriptions and actionable guidance */}
              {specialist?.prescriptionsOrRecommendations && specialist.prescriptionsOrRecommendations.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">دستورات مراقبتی و درمانی:</span>
                  <div className="space-y-1.5">
                    {specialist.prescriptionsOrRecommendations.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* THE PATENT PAGE 7 CORE: "ضمناً برای دریافت راهنمایی بهتر، پزشک مشاوره مدارک زیر را درخواست کرده است" */}
          {hasAdditionalInfoReq && (
            <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    ضمناً برای دریافت راهنمایی بهتر، پزشک مشاوره مدارک زیر را درخواست کرده است (ص ۷ پتنت):
                  </h4>
                  <p className="text-xs text-amber-900 mt-1">
                    {specialist?.additionalInfoDescription || 'جهت تشخیص نهایی، نیاز به بارگذاری مدارک تکمیلی زیر است:'}
                  </p>
                </div>
              </div>

              {/* List of requested items */}
              {specialist?.additionalDocumentsNeeded && specialist.additionalDocumentsNeeded.length > 0 && (
                <div className="space-y-1.5 pl-2">
                  {specialist.additionalDocumentsNeeded.map((docReq, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-amber-950 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>{docReq}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Supplemental Upload Form */}
              <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  ارسال مدارک تکمیلی درخواستی به پزشک:
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSampleSupplementalDoc('ecg')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>پیوست نوار قلب جدید</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleSupplementalDoc('holter')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>پیوست هولتر ریتم ۲۴ ساعته</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleSupplementalDoc('lab_enzymes')}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>پیوست آزمایش تروپونین / پتاسیم</span>
                  </button>
                </div>

                {/* Uploaded items list */}
                {uploadedSupplementalDocs.length > 0 && (
                  <div className="space-y-1.5">
                    {uploadedSupplementalDocs.map((doc) => (
                      <div key={doc.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-800">📎 {doc.title} ({doc.fileSize})</span>
                        <span className="text-[10px] text-emerald-600 font-bold">آماده ارسال</span>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={supplementalNotes}
                  onChange={(e) => setSupplementalNotes(e.target.value)}
                  placeholder="پاسخ به سوالات پزشک یا توضیحات درباره مدارک تکمیلی..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-amber-500"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSendSupplemental}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال مدارک تکمیلی برای پزشک مشاوره</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PATENT PAGE 3 FEATURE: "چنانچه این پاسخ برای شما کافی نیست، برای ورود به سامانه تخصصی مشاوره وارد شوید" */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-1.5 justify-center sm:justify-start">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>نیاز به بررسی تخصصی‌تر یا ویزیت حضوری در کلینیک قلب؟ (ص ۳ پتنت)</span>
              </h4>
              <p className="text-xs text-blue-800/80">
                چنانچه احساس می‌کنید علائم شما همچنان نیازمند بررسی حضوری، آنژیوگرافی یا مشاوره فوق‌تخصصی است:
              </p>
            </div>

            <button
              onClick={() => {
                if (onNavigateToSpecialistClinic) {
                  onNavigateToSpecialistClinic();
                } else {
                  alert('ارجاع به سامانه نوبت‌دهی کلینیک تخصصی قلب مرکز جامع سلامت ثبت گردید.');
                }
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-md transition-colors"
            >
              <span>ورود به سامانه تخصصی مشاوره و نوبت‌دهی (ص ۳)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Attached documents review bar */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">مدارک ثبت‌شده در این پرونده:</span>
            <div className="flex flex-wrap gap-2">
              {consultation.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs flex items-center gap-2"
                >
                  <span className="text-slate-800 font-medium">{doc.title}</span>
                  {doc.type === 'ecg' && (
                    <button
                      onClick={() => onOpenECGModal(doc)}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      (مشاهده لیدها)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
