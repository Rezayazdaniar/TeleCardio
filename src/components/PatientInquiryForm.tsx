import React, { useState } from 'react';
import { 
  Heart, User, Stethoscope, FileText, Upload, Plus, Trash2, 
  Eye, CheckCircle, Activity, AlertTriangle, ArrowRight, ArrowLeft,
  FileCheck, Sparkles, Clock, ShieldCheck
} from 'lucide-react';
import { PatientUser, CardiacDocument, ConsultationInquiry } from '../types';

export interface ConsultationCreateInput {
  chiefComplaint: string;
  symptomsDuration: string;
  symptomsDescription: string;
  chestPainDetails: {
    painType: string;
    radiatingTo: string[];
    triggers: string[];
    associatedSymptoms: string[];
  };
}

export interface PendingMedicalDocument extends CardiacDocument {
  file: File;
  documentDate: string;
}

interface Props {
  patient: PatientUser;
  onSubmit: (
    inquiry: ConsultationCreateInput,
    documents: PendingMedicalDocument[]
  ) => void | Promise<void>;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const PatientInquiryForm: React.FC<Props> = ({ patient, onSubmit, onOpenECGModal }) => {
  // Step in the form: 1 = Doctor Selection & Question (Page 2), 2 = Medical Documents Upload (Page 5)
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // Form states (Page 2)
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [symptomsDuration, setSymptomsDuration] = useState<string>('کمتر از یک هفته');
  const [symptomsDescription, setSymptomsDescription] = useState<string>('');
  
  // Structured cardiac symptoms
  const [chestPainType, setChestPainType] = useState<string>('احساس سنگینی و فشار در قفسه سینه');
  const [radiatingTo, setRadiatingTo] = useState<string[]>(['شانه یا دست چپ']);
  const [triggers, setTriggers] = useState<string[]>(['فعالیت بدنی یا بالا رفتن از پله']);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>(['تپش قلب']);

  // فایل‌های واقعی انتخاب‌شده برای بارگذاری
  const [attachedDocs, setAttachedDocs] = useState<PendingMedicalDocument[]>([]);
  const [documentType, setDocumentType] = useState<PendingMedicalDocument['type']>('ecg');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentNotes, setDocumentNotes] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    if (!chiefComplaint.trim() || !symptomsDescription.trim()) {
      setSubmitError('لطفاً عنوان اصلی و شرح کامل علائم را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(
        {
          chiefComplaint: chiefComplaint.trim(),
          symptomsDuration,
          symptomsDescription: symptomsDescription.trim(),
          chestPainDetails: {
            painType: chestPainType,
            radiatingTo,
            triggers,
            associatedSymptoms,
          },
        },
        attachedDocs
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      
      {/* Patent Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          <button
            onClick={() => setFormStep(1)}
            className={`relative z-10 flex flex-col items-center gap-1.5 transition-colors ${
              formStep === 1 ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
              formStep === 1 ? 'bg-rose-600 text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-700'
            }`}>
              ۱
            </div>
            <span className="text-xs">ثبت شرح حال و پرسش</span>
          </button>

          <button
            onClick={() => {
              if (chiefComplaint && symptomsDescription) setFormStep(2);
              else alert('ابتدا شرح حال را بنویسید.');
            }}
            className={`relative z-10 flex flex-col items-center gap-1.5 transition-colors ${
              formStep === 2 ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
              formStep === 2 ? 'bg-rose-600 text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-700'
            }`}>
              ۲
            </div>
            <span className="text-xs">ثبت و بارگذاری مدارک قلب</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Card Header (Matches Patent Header: Tele D - مشاوره پزشکی از راه دور) */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/90 text-white rounded-xl shadow-inner">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                  TeleCardio
                </span>
                <span className="text-xs text-slate-400">| کاربر: {patient.firstName} {patient.lastName}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
                {formStep === 1 ? 'مشاوره پزشکی از راه دور - ثبت سوال و شرح حال' : 'بارگذاری مدارک پاراکلینیکی قلب و عروق'}
              </h2>
            </div>
          </div>


        </div>

        {/* STEP 1: ثبت شرح حال و پرسش */}
        {formStep === 1 && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Structured Cardiovascular Symptoms Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600" />
                  بررسی چک‌لیست علائم قلبی:
                </span>
                <span className="text-[11px] text-slate-500">جهت تسهیل تریاژ و ارجاع سریع</span>
              </div>

              {/* Chest pain characteristics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع احساس در قفسه سینه:</label>
                  <select
                    value={chestPainType}
                    onChange={(e) => setChestPainType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-rose-500"
                  >
                    <option value="بدون درد قفسه سینه (صرفاً تپش قلب یا تنگی نفس)">بدون درد سینه (صرفاً تپش یا تنگی نفس)</option>
                    <option value="احساس سنگینی و فشار در قفسه سینه">احساس سنگینی و فشار مبهم</option>
                    <option value="تیر کشیدن تیز و خنجری گذرا">تیر کشیدن تیز و خنجری گذرا</option>
                    <option value="سوزش سر دل یا پشت جناغ">سوزش سر دل یا پشت جناغ سینه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">مدت زمان شروع علائم:</label>
                  <select
                    value={symptomsDuration}
                    onChange={(e) => setSymptomsDuration(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-rose-500"
                  >
                    <option value="کمتر از چند ساعت اخیر">کمتر از چند ساعت اخیر (امروز)</option>
                    <option value="کمتر از یک هفته">طی چند روز تا یک هفته گذشته</option>
                    <option value="۱ الی ۴ هفته اخیر">۱ الی ۴ هفته اخیر</option>
                    <option value="بیش از یک ماه به صورت مزمن">بیش از یک ماه (علائم مزمن)</option>
                  </select>
                </div>
              </div>

              {/* Associated symptoms checkboxes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">علائم همراه (انتخاب چندگانه):</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['تپش قلب تند یا نامنظم', 'تنگی نفس در حین فعالیت', 'تنگی نفس در حالت خوابیده', 'ورم و ادم ساق یا مچ پا', 'سرگیجه یا سیاهی رفتن چشم', 'تعریق زیاد', 'سابقه فشار خون بالا'].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleArrayItem(associatedSymptoms, item, setAssociatedSymptoms)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        associatedSymptoms.includes(item)
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question text box */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  عنوان اصلی پرسش و شکایت اصلی:
                </span>
                <span className="text-xs text-rose-500 font-normal">* الزامی</span>
              </label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                required
                placeholder="مثال: تپش قلب ناگهانی در حالت نشسته به همراه سنگینی خفیف قفسه سینه"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>شرح کامل وضعیت، داروها و سوال شما از پزشک:</span>
                <span className="text-xs text-slate-400">حداقل توضیحات جهت بررسی دقیق</span>
              </label>
              <textarea
                rows={4}
                value={symptomsDescription}
                onChange={(e) => setSymptomsDescription(e.target.value)}
                required
                placeholder="لطفاً شرح دهید که علائم از چه زمانی آغاز شده، شدت آن چگونه است، چه داروهایی مصرف می‌کنید و پزشک در مورد چه موردی نظر بدهد..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none leading-relaxed"
              />
            </div>

            {/* Next button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!chiefComplaint || !symptomsDescription) {
                    alert('لطفاً عنوان سوال و شرح کامل علائم خود را بنویسید.');
                    return;
                  }
                  setFormStep(2);
                }}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center gap-2 transition-all"
              >
                <span>مرحله بعد: ثبت و بارگذاری مدارک پزشکی</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: ثبت مدارک پزشکی قلب */}
        {formStep === 2 && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Summary preview of step 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-bold text-slate-700">موضوع درخواست:</span> {chiefComplaint || 'هنوز وارد نشده است'}
              </div>
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="shrink-0 text-rose-600 hover:underline font-semibold"
              >
                ویرایش شرح حال
              </button>
            </div>

            {/* نمایش مدارک پیوست‌شده */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-rose-600" />
                  <span>مدارک پزشکی تخصصی قلب:</span>
                </label>
                <span className="text-xs text-slate-500">
                  {attachedDocs.length} مدرک پیوست شده
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                در صورت نیاز، مدارک مرتبط با ارزیابی قلب از جمله نوار قلب (ECG)، اکوکاردیوگرافی، آزمایش‌های مرتبط، هولتر و آنژیوگرافی را پیوست کنید.
              </p>

              <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <p className="text-xs leading-6 text-slate-600">
                  فایل واقعی آزمایش، نوار قلب یا گزارش پزشکی را انتخاب کنید.
                  فرمت‌های PDF، JPG، PNG و WebP تا سقف ۲۰ مگابایت پشتیبانی می‌شوند.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    نوع مدرک
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as PendingMedicalDocument['type'])}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5"
                    >
                      <option value="ecg">نوار قلب (ECG)</option>
                      <option value="echo">اکوکاردیوگرافی</option>
                      <option value="lab_enzymes">آزمایش خون و آنزیم‌های قلبی</option>
                      <option value="holter">هولتر</option>
                      <option value="angio">آنژیوگرافی</option>
                      <option value="prescription">نسخه پزشکی</option>
                      <option value="other">سایر مدارک</option>
                    </select>
                  </label>

                  <label className="block text-xs font-semibold text-slate-700">
                    عنوان مدرک (اختیاری)
                    <input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      maxLength={200}
                      placeholder="مثلاً نوار قلب امروز"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-slate-700">
                    تاریخ مدرک (اختیاری)
                    <input
                      type="date"
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-slate-700">
                    توضیحات (اختیاری)
                    <input
                      value={documentNotes}
                      onChange={(e) => setDocumentNotes(e.target.value)}
                      maxLength={1000}
                      placeholder="توضیح کوتاه درباره مدرک"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5"
                    />
                  </label>
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-700 hover:bg-rose-100">
                  <Upload className="h-4 w-4" />
                  انتخاب فایل پزشکی
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;

                      if (file.size === 0 || file.size > 20 * 1024 * 1024) {
                        setSubmitError('حجم فایل باید بیشتر از صفر و حداکثر ۲۰ مگابایت باشد.');
                        return;
                      }

                      const allowed = /\.(pdf|jpe?g|png|webp)$/i;
                      if (!allowed.test(file.name)) {
                        setSubmitError('فقط فایل‌های PDF، JPG، PNG و WebP مجاز هستند.');
                        return;
                      }

                      if (attachedDocs.length >= 10) {
                        setSubmitError('حداکثر ۱۰ مدرک را می‌توانید در این فرم انتخاب کنید.');
                        return;
                      }

                      setSubmitError('');
                      const title = documentTitle.trim() ||
                        file.name.replace(/\.[^.]+$/, '');

                      setAttachedDocs((previous) => [
                        ...previous,
                        {
                          id: crypto.randomUUID(),
                          type: documentType,
                          title,
                          date: documentDate,
                          documentDate,
                          fileName: file.name,
                          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                          notes: documentNotes.trim(),
                          file,
                        },
                      ]);
                      setDocumentTitle('');
                    }}
                  />
                </label>
              </div>

              {/* List of currently attached documents */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">مدارک پیوست شده به این پرونده:</span>
                {attachedDocs.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    هیچ مدرکی پیوست نشده است. توصیه می‌شود حداقل یک نوار قلب یا آزمایش پیوست نمایید.
                  </div>
                ) : (
                  attachedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-rose-600 shrink-0">
                          {doc.type === 'ecg' ? <Activity className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 truncate">{doc.title}</h5>
                          <p className="text-[11px] text-slate-500 truncate">
                            {doc.fileName} • تاریخ: {doc.date} {doc.notes ? `• ${doc.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">

                        <button
                          type="button"
                          onClick={() => setAttachedDocs(attachedDocs.filter((d) => d.id !== doc.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                          title="حذف مدرک"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              {submitError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {submitError}
                </div>
              )}

              <p className="text-xs leading-5 text-slate-600">
                پس از ثبت پرونده، فایل‌های انتخاب‌شده جداگانه بارگذاری می‌شوند.
                اگر بارگذاری مدرکی شکست بخورد، شناسه پرونده برای پیگیری حفظ خواهد شد.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>بازگشت به مرحله قبلی</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت درخواست مشاوره'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
