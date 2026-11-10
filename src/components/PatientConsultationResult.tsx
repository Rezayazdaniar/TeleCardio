import React, { useState } from 'react';
import { 
  Heart, User, Calendar, FileText, CheckCircle2, AlertCircle, 
  Upload, Send, Printer, ArrowRight, Activity, Download, Plus,
  ShieldCheck, Pill
} from 'lucide-react';
import { ConsultationInquiry, CardiacDocument, PatientUser } from '../types';
import { MedicalReportPDFModal } from './MedicalReportPDFModal';

interface Props {
  consultation: ConsultationInquiry;
  patient: PatientUser;
  onBack: () => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
  onSubmitSupplementalDocs: (
    consultationId: string,
    notes: string,
    docs: CardiacDocument[]
  ) => Promise<boolean>;
}

export const PatientConsultationResult: React.FC<Props> = ({
  consultation,
  patient,
  onBack,
  onOpenECGModal,
  onSubmitSupplementalDocs,
}) => {
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [supplementalNotes, setSupplementalNotes] = useState('');
  const [isSubmittingSupplemental, setIsSubmittingSupplemental] = useState(false);
  const [supplementalMessage, setSupplementalMessage] = useState('');

  const specialist = consultation.specialistReview;
  const triage = consultation.triage;
  const hasAdditionalInfoReq =
    consultation.status === 'additional_info_requested';
  const isPending = consultation.status === 'triage_pending';
  const isReferred = consultation.status === 'referred_to_specialist';
  const isCompleted = consultation.status === 'completed';
  const isEmergencyRedirect = consultation.status === 'emergency_redirect';
  const hasClinicalResponse = Boolean(
    specialist?.diagnosis ||
    specialist?.clinicalGuidance ||
    triage?.initialGuidance
  );

  const handlePrintSummary = () => {
    setShowPDFModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به سوابق و پرونده‌ها</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowPDFModal(true)}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>دانلود گزارش اطلاعات ثبت‌شده (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main consultation result sheet */}
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
              {hasAdditionalInfoReq
                ? 'نیازمند تکمیل اطلاعات'
                : isPending
                  ? 'در انتظار بررسی اولیه'
                  : isReferred
                    ? 'ارجاع‌شده برای بررسی متخصص'
                    : isEmergencyRedirect
                      ? 'نیازمند توجه فوری طبق وضعیت ثبت‌شده'
                      : isCompleted && hasClinicalResponse
                        ? 'بررسی تکمیل شده'
                        : 'پاسخ معتبر پزشک هنوز ثبت نشده'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Patient greeting and doctor notice */}
          <div className="p-4 bg-slate-50 border-r-4 border-rose-600 rounded-xl space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              کاربر گرامی: {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              درخواست شما در تاریخ <span className="font-bold text-slate-800">{consultation.createdAt}</span> ثبت شده است.
              {hasClinicalResponse ? (
                <> پاسخ ثبت‌شده از سوی <span className="font-bold text-slate-900">
                  {specialist?.doctorName || triage?.doctorName || 'ارائه‌دهنده ثبت‌شده در سامانه'}
                </span> در ادامه نمایش داده می‌شود.</>
              ) : (
                <> در حال حاضر پاسخ بالینی تأییدشده‌ای در این پرونده موجود نیست.</>
              )}
            </p>
          </div>

          {/* خلاصه پرسش بیمار */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>خلاصه پرسش و شرح حال شما:</span>
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900">{consultation.chiefComplaint}</div>
              <p className="leading-relaxed text-slate-600">{consultation.symptomsDescription}</p>
            </div>
          </div>

          {/* پاسخ پزشک */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{hasClinicalResponse ? "پاسخ بالینی ثبت‌شده:" : "وضعیت پاسخ بالینی:"}</span>
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
                {specialist?.clinicalGuidance || triage?.initialGuidance || 'هنوز پاسخی از سوی پزشک در سامانه ثبت نشده است.'}
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

          {/* درخواست مدارک تکمیلی برای ادامه بررسی */}
          {hasAdditionalInfoReq && (
            <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    برای بررسی دقیق‌تر، پزشک مدارک زیر را درخواست کرده است:
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

              <form
                className="space-y-3 rounded-xl border border-amber-200 bg-white p-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (isSubmittingSupplemental) return;

                  setIsSubmittingSupplemental(true);
                  setSupplementalMessage('');

                  try {
                    const refreshed = await onSubmitSupplementalDocs(
                      consultation.id,
                      supplementalNotes,
                      []
                    );

                    setSupplementalMessage(
                      refreshed
                        ? 'اطلاعات تکمیلی ثبت شد و فهرست پرونده‌ها به‌روز شد.'
                        : 'اطلاعات تکمیلی در سرور ثبت شد، اما تازه‌سازی پرونده ناموفق بود. برای مشاهده وضعیت جدید، صفحه را دوباره بارگذاری کنید.'
                    );

                    if (refreshed) setSupplementalNotes('');
                  } catch (error) {
                    setSupplementalMessage(
                      error instanceof Error
                        ? error.message
                        : 'ثبت اطلاعات تکمیلی ناموفق بود.'
                    );
                  } finally {
                    setIsSubmittingSupplemental(false);
                  }
                }}
              >
                <label
                  htmlFor="supplemental-patient-notes"
                  className="block text-xs font-bold text-slate-800"
                >
                  متن اطلاعات تکمیلی برای پزشک
                </label>
                <textarea
                  id="supplemental-patient-notes"
                  value={supplementalNotes}
                  onChange={(event) => setSupplementalNotes(event.target.value)}
                  maxLength={5000}
                  rows={4}
                  required
                  disabled={isSubmittingSupplemental}
                  placeholder="اطلاعات درخواستی پزشک را اینجا بنویسید..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-amber-500 disabled:bg-slate-100"
                />
                <p className="text-xs text-slate-500">
                  حداکثر ۵۰۰۰ نویسه. بارگذاری فایل در حال حاضر فعال نیست.
                </p>
                <button
                  type="submit"
                  disabled={isSubmittingSupplemental || !supplementalNotes.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingSupplemental ? 'در حال ثبت...' : 'ثبت و ارسال متن برای پزشک'}
                </button>
                {supplementalMessage && (
                  <p role="status" aria-live="polite" className="text-sm text-slate-700">
                    {supplementalMessage}
                  </p>
                )}
              </form>

            </div>
          )}

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

      {/* Official Medical Report PDF Export Modal */}
      <MedicalReportPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        consultation={consultation}
        patient={patient}
      />

    </div>
  );
};
