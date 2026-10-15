import React, { useState } from 'react';
import { 
  Heart, User, Stethoscope, FileText, Upload, Plus, Trash2, 
  Eye, CheckCircle, Activity, AlertTriangle, ArrowRight, ArrowLeft,
  FileCheck, Sparkles, Clock, ShieldCheck
} from 'lucide-react';
import { Doctor, PatientUser, CardiacDocument, ConsultationInquiry } from '../types';
import { DOCTORS, SAMPLE_DOCUMENTS } from '../data/mockData';

interface Props {
  patient: PatientUser;
  onSubmit: (inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const PatientInquiryForm: React.FC<Props> = ({ patient, onSubmit, onOpenECGModal }) => {
  // Step in the form: 1 = Doctor Selection & Question (Page 2), 2 = Medical Documents Upload (Page 5)
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // Form states (Page 2)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DOCTORS[1].id); // Default: Dr. Sohrabi or Triage
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [symptomsDuration, setSymptomsDuration] = useState<string>('کمتر از یک هفته');
  const [symptomsDescription, setSymptomsDescription] = useState<string>('');
  
  // Structured cardiac symptoms
  const [chestPainType, setChestPainType] = useState<string>('احساس سنگینی و فشار در قفسه سینه');
  const [radiatingTo, setRadiatingTo] = useState<string[]>(['شانه یا دست چپ']);
  const [triggers, setTriggers] = useState<string[]>(['فعالیت بدنی یا بالا رفتن از پله']);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>(['تپش قلب']);

  // Document states (Page 5)
  const [attachedDocs, setAttachedDocs] = useState<CardiacDocument[]>([SAMPLE_DOCUMENTS[0]]); // Preloaded with ECG

  // Custom document upload draft modal
  const [showUploadDraft, setShowUploadDraft] = useState(false);
  const [docCategory, setDocCategory] = useState<CardiacDocument['type']>('ecg');
  const [docTitle, setDocTitle] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleAddSampleDoc = (doc: CardiacDocument) => {
    if (!attachedDocs.some((d) => d.id === doc.id)) {
      setAttachedDocs([...attachedDocs, doc]);
    }
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: CardiacDocument = {
      id: `doc-user-${Date.now()}`,
      type: docCategory,
      title: docTitle,
      date: '۱۴۰۳/۰۷/۲۵',
      fileName: `${docTitle.replace(/\s+/g, '_')}.pdf`,
      fileSize: '۱.۸ مگابایت',
      notes: docNotes || 'مدارک بارگذاری شده توسط بیمار در مرکز سلامت',
    };

    setAttachedDocs([...attachedDocs, newDoc]);
    setDocTitle('');
    setDocNotes('');
    setShowUploadDraft(false);
  };

  const handleFinalSubmit = () => {
    if (!chiefComplaint || !symptomsDescription) {
      alert('لطفاً عنوان سوال و شرح حال علائم خود را کامل بنویسید.');
      setFormStep(1);
      return;
    }

    onSubmit({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phoneNumber,
      patientAge: patient.age,
      patientGender: patient.gender,
      targetDoctorId: selectedDoctor.id,
      targetDoctorName: selectedDoctor.name,
      chiefComplaint,
      symptomsDuration,
      symptomsDescription,
      chestPainDetails: {
        painType: chestPainType,
        radiatingTo,
        triggers,
        associatedSymptoms,
      },
      documents: attachedDocs,
    });
  };

  // Quick preset helper for fast testing
  const applyPresetScenario = () => {
    setChiefComplaint('احساس تپش قلب ناگهانی و تیر کشیدن سینه حین استرس');
    setSymptomsDuration('حدود ۲ هفته به صورت متناوب');
    setSymptomsDescription('در زمان‌های استرس کاری یا بعد از پیاده‌روی سریع احساس می‌کنم قلبم تند می‌زند و گاهی ضربان محکم می‌کوبد. نوار قلب و آزمایش آنزیم‌های قلبی در درمانگاه گرفتم که پیوست می‌کنم.');
    setChestPainType('احساس تیر کشیدن خنجری گذرا و تپش سریع');
    setRadiatingTo(['ندارد']);
    setTriggers(['استرس روحی', 'هوای گرم']);
    setAssociatedSymptoms(['تپش قلب', 'اضطراب']);
    setAttachedDocs([SAMPLE_DOCUMENTS[0], SAMPLE_DOCUMENTS[1], SAMPLE_DOCUMENTS[2]]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
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
            <span className="text-xs">صفحه ۲ پتنت: انتخاب پزشک و ثبت سوال</span>
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
            <span className="text-xs">صفحه ۵ پتنت: ثبت و آپلود مدارک قلب</span>
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

          {/* Preset helper button */}
          <button
            type="button"
            onClick={applyPresetScenario}
            className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>تکمیل خودکار سناریوی نمونه (جهت تست)</span>
          </button>
        </div>

        {/* STEP 1: PATENT PAGE 2 (انتخاب پزشک و سوال) */}
        {formStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Doctor Selection (from Patent Page 2: "انتخاب پزشک - وقتی کلیک کنند اسم های دکترها و دسترسیشان می آید") */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <span>انتخاب پزشک مشاوره (مطابق صفحه ۲ پتنت):</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOCTORS.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/60 shadow-sm ring-1 ring-rose-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                          {doc.isTriageDoctor && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                              پزشک تریاژ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-rose-700 font-semibold truncate">{doc.subSpecialty}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          سابقه: {doc.experienceYears} سال • ن.پ: {doc.medicalCouncilNumber}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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

            {/* Question Text Box (Patent Page 2: سوال / شرح حال) */}
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
                <span>مرحله بعد: ثبت و آپلود مدارک پزشکی (صفحه ۵ پتنت)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: PATENT PAGE 5 (ثبت مدارک پزشکی قلب) */}
        {formStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Summary preview of step 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700">پزشک انتخابی:</span> {selectedDoctor.name} ({selectedDoctor.title})
                <div className="text-slate-500 mt-0.5 truncate max-w-lg">
                  <span className="font-bold">موضوع:</span> {chiefComplaint}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="text-rose-600 hover:underline font-semibold"
              >
                ویرایش شرح حال
              </button>
            </div>

            {/* Patent Page 5 Documents mapping */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-rose-600" />
                  <span>مدارک پزشکی تخصصی قلب (بر اساس طراحی صفحه ۵ پتنت):</span>
                </label>
                <span className="text-xs text-slate-500">
                  {attachedDocs.length} مدرک پیوست شده
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                در پتنت اولیه مدارک مربوط به ماموگرافی و سونوگرافی پستان بود؛ در این سامانه کلینیک قلب، مدارک تخصصی شامل نوار قلب (ECG)، اکوکاردیوگرافی، آنزیم‌های قلبی، هولتر و آنژیوگرافی پیوست می‌گردد.
              </p>

              {/* Document upload quick add grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { type: 'ecg', label: 'نوار قلب (ECG)', sample: SAMPLE_DOCUMENTS[0] },
                  { type: 'echo', label: 'اکوکاردیوگرافی (Echo)', sample: SAMPLE_DOCUMENTS[1] },
                  { type: 'lab_enzymes', label: 'آنزیم‌های قلبی و آزمایش', sample: SAMPLE_DOCUMENTS[2] },
                  { type: 'holter', label: 'هولتر ریتم / فشار خون', sample: SAMPLE_DOCUMENTS[3] },
                  { type: 'angio', label: 'سی‌تی آنژیو / آنژیوگرافی', sample: null },
                  { type: 'other', label: 'سایر مدارک یا عکس نسخه', sample: null },
                ].map((item) => {
                  const isAttached = attachedDocs.some((d) => d.type === item.type);
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        if (item.sample) {
                          handleAddSampleDoc(item.sample);
                        } else {
                          setDocCategory(item.type as any);
                          setDocTitle(item.label);
                          setShowUploadDraft(true);
                        }
                      }}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isAttached
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        {isAttached ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isAttached ? 'پیوست شده (مشاهده)' : '+ افزودن مدرک'}
                      </span>
                    </button>
                  );
                })}
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
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
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
                        {doc.type === 'ecg' && (
                          <button
                            type="button"
                            onClick={() => onOpenECGModal(doc)}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>نمایشگر لیدهای نوار قلب</span>
                          </button>
                        )}
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

              {/* Add custom document button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadDraft(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>آپلود مدرک جدید از دستگاه شما...</span>
                </button>
              </div>
            </div>

            {/* Custom upload modal form */}
            {showUploadDraft && (
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>افزودن مدرک پزشکی جدید:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع مدرک:</label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="ecg">نوار قلب (ECG)</option>
                      <option value="echo">اکوکاردیوگرافی</option>
                      <option value="lab_enzymes">آزمایش خون / آنزیم قلبی</option>
                      <option value="holter">هولتر مانیتورینگ ۲۴ ساعته</option>
                      <option value="angio">آنژیوگرافی / سی‌تی</option>
                      <option value="other">سایر مدارک</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان مدرک:</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="مثال: آزمایش جدید تروپونین"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">توضیحات کوتاه یا نتیجه گزارش:</label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="مثال: نوار قلب گرفته شده در ساعت ۱۲ ظهر درمانگاه"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUploadDraft(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomDoc}
                    className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                  >
                    افزودن مدرک به لیست
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به مرحله قبلی</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ثبت نهایی و ارسال به تریاژ مرکز سلامت</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
