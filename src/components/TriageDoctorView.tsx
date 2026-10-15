import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, CheckCircle, AlertTriangle, ArrowRight, 
  Send, User, FileText, Eye, Clock, PhoneCall, ExternalLink, ChevronDown
} from 'lucide-react';
import { ConsultationInquiry, Doctor, TriageSeverity, CardiacDocument } from '../types';
import { DOCTORS } from '../data/mockData';

interface Props {
  consultations: ConsultationInquiry[];
  triageDoctor: Doctor;
  onUpdateConsultation: (updated: ConsultationInquiry) => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const TriageDoctorView: React.FC<Props> = ({
  consultations,
  triageDoctor,
  onUpdateConsultation,
  onOpenECGModal,
}) => {
  // Find pending or selected consultation
  const pendingList = consultations.filter((c) => c.status === 'triage_pending');
  const allList = consultations;

  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    pendingList[0]?.id || allList[0]?.id || ''
  );

  const selectedInquiry = consultations.find((c) => c.id === selectedInquiryId);

  // Form states for triage assessment
  const [severity, setSeverity] = useState<TriageSeverity>('moderate');
  const [triageNotes, setTriageNotes] = useState<string>('');
  const [initialGuidance, setInitialGuidance] = useState<string>('');
  const [targetSpecialistId, setTargetSpecialistId] = useState<string>(DOCTORS[1].id);

  // Helper when user selects a different item
  const handleSelectInquiry = (inquiry: ConsultationInquiry) => {
    setSelectedInquiryId(inquiry.id);
    setSeverity(inquiry.triage?.severity || 'moderate');
    setTriageNotes(inquiry.triage?.triageNotes || '');
    setInitialGuidance(inquiry.triage?.initialGuidance || '');
  };

  const handleForwardToSpecialist = () => {
    if (!selectedInquiry) return;
    const specialist = DOCTORS.find((d) => d.id === targetSpecialistId) || DOCTORS[1];

    const updated: ConsultationInquiry = {
      ...selectedInquiry,
      targetDoctorId: specialist.id,
      targetDoctorName: specialist.name,
      status: 'referred_to_specialist',
      updatedAt: 'هم‌اکنون',
      triage: {
        doctorId: triageDoctor.id,
        doctorName: triageDoctor.name,
        reviewedAt: 'هم‌اکنون',
        severity,
        triageNotes: triageNotes || 'غربالگری سطح اول تریاژ انجام شد. جهت بررسی تخصصی به کاردیولوژیست ارجاع گردید.',
        passedToSpecialist: true,
        initialGuidance: initialGuidance || 'پرونده با اولویت به متخصص ارجاع شد.',
      },
    };

    onUpdateConsultation(updated);
    alert(`درخواست با موفقیت توسط تریاژ بررسی و به ${specialist.name} ارجاع گردید.`);
  };

  const handleDirectTriageResolution = () => {
    if (!selectedInquiry) return;
    if (!initialGuidance) {
      alert('لطفاً پاسخ و راهنمایی سطح اول تریاژ را یادداشت فرمایید.');
      return;
    }

    const updated: ConsultationInquiry = {
      ...selectedInquiry,
      status: 'completed',
      updatedAt: 'هم‌اکنون',
      triage: {
        doctorId: triageDoctor.id,
        doctorName: triageDoctor.name,
        reviewedAt: 'هم‌اکنون',
        severity,
        triageNotes: triageNotes || 'مورد کم‌خطر ارزیابی شد و با راهنمایی اولیه مرکز بهداشت خاتمه یافت.',
        passedToSpecialist: false,
        initialGuidance,
      },
    };

    onUpdateConsultation(updated);
    alert('پاسخ اولیه پزشک تریاژ برای بیمار ارسال شد. (مطابق صفحه ۳ پتنت، بیمار در صورت نیاز می‌تواند درخواست مشاوره تخصصی دهد)');
  };

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
                صفحه ۳ پتنت: پزشک سطح اول (تریاژ مرکز بهداشت)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of consultations in inbox */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between px-1">
            <span>صندوق ورودی تریاژ:</span>
            <span className="text-[11px] text-slate-500">{allList.length} پرونده</span>
          </h3>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pl-1">
            {allList.map((item) => {
              const isSelected = item.id === selectedInquiryId;
              const isPending = item.status === 'triage_pending';

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
                    <p className="text-slate-500">
                      سن: {selectedInquiry.patientAge} سال • جنسیت: {selectedInquiry.patientGender} • تماس: {selectedInquiry.patientPhone}
                    </p>
                  </div>
                </div>
                <div className="text-left text-slate-400 font-mono text-[11px]">
                  <div>زمان ثبت: {selectedInquiry.createdAt}</div>
                  <div>پزشک هدف: {selectedInquiry.targetDoctorName}</div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Chief Complaint & Patient Narrative */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>شکایت اصلی و شرح حال مراجع:</span>
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <p className="font-bold text-slate-800 text-sm">{selectedInquiry.chiefComplaint}</p>
                    <p className="text-slate-600 leading-relaxed">{selectedInquiry.symptomsDescription}</p>
                    
                    {selectedInquiry.chestPainDetails && (
                      <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-bold">نوع احساس درد:</span> {selectedInquiry.chestPainDetails.painType}
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">انتشار:</span> {selectedInquiry.chestPainDetails.radiatingTo?.join('، ') || 'ندارد'}
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">محرک‌ها:</span> {selectedInquiry.chestPainDetails.triggers?.join('، ') || '-'}
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">علائم همراه:</span> {selectedInquiry.chestPainDetails.associatedSymptoms?.join('، ') || '-'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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
                        {doc.type === 'ecg' && (
                          <button
                            onClick={() => onOpenECGModal(doc)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده لیدها</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Triage Decision Section (Patent Page 3) */}
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
                        پرخطر / فوری (ارجاع اورژانس)
                      </button>
                    </div>
                  </div>

                  {/* Specialist selection for referral */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      پزشک متخصص قلب جهت ارجاع:
                    </label>
                    <select
                      value={targetSpecialistId}
                      onChange={(e) => setTargetSpecialistId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                    >
                      {DOCTORS.filter((d) => !d.isTriageDoctor).map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — {doc.subSpecialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Triage notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      یادداشت تشخیصی تریاژ (جهت ارسال به متخصص):
                    </label>
                    <textarea
                      rows={2}
                      value={triageNotes}
                      onChange={(e) => setTriageNotes(e.target.value)}
                      placeholder="مثال: نوار قلب فاقد تغییرات قطعه ST، آنزیم‌ها منفی، شرح حال آریتمی متناوب نیازمند هولتر و معاینه تخصصی..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Guidance for patient if low severity */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      راهنمایی اولیه سطح اول برای بیمار (مطابق صفحه ۳ پتنت):
                    </label>
                    <input
                      type="text"
                      value={initialGuidance}
                      onChange={(e) => setInitialGuidance(e.target.value)}
                      placeholder="مثال: پرهیز از محرک‌ها، کنترل فشار خون و استراحت..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Action buttons matching patent Page 3 */}
                  <div className="pt-3 border-t border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={handleDirectTriageResolution}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                    >
                      پاسخ و رفع نیاز در سطح اول تریاژ
                    </button>

                    <button
                      onClick={handleForwardToSpecialist}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>تأیید تریاژ و ارجاع پرونده به متخصص قلب</span>
                    </button>
                  </div>

                </div>

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
