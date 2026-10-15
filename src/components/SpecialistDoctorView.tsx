import React, { useState } from 'react';
import { 
  Heart, User, Calendar, Clock, FileText, Activity, CheckSquare, 
  Square, Send, Eye, AlertCircle, Plus, Trash2, CheckCircle2, Shield
} from 'lucide-react';
import { ConsultationInquiry, Doctor, CardiacDocument } from '../types';

interface Props {
  consultations: ConsultationInquiry[];
  doctor: Doctor;
  onUpdateConsultation: (updated: ConsultationInquiry) => void;
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
    (c) => c.targetDoctorId === doctor.id || c.status === 'referred_to_specialist' || c.status === 'additional_info_requested'
  );

  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    assignedList[0]?.id || consultations[0]?.id || ''
  );

  const selectedInquiry = consultations.find((c) => c.id === selectedInquiryId);

  // Specialist reply form states (Page 6 Patent)
  const [diagnosisText, setDiagnosisText] = useState<string>(
    selectedInquiry?.specialistReview?.diagnosis || ''
  );
  const [clinicalGuidance, setClinicalGuidance] = useState<string>(
    selectedInquiry?.specialistReview?.clinicalGuidance || ''
  );
  const [prescriptions, setPrescriptions] = useState<string[]>(
    selectedInquiry?.specialistReview?.prescriptionsOrRecommendations || [
      'قرص متوپرولول تارتارات ۲۵ میلی‌گرم (نصف قرص هر ۱۲ ساعت)',
      'پرهیز جدی از مصرف قهوه غلیظ و مواد کافئین‌دار',
      'ثبت روزانه فشار خون و نبض',
    ]
  );
  const [newPrescriptionInput, setNewPrescriptionInput] = useState('');

  // Critical Patent Page 6 Feature: "چک باکس: [درخواست تکمیل اطلاعات از سوی بیمار]"
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

  // Handle switching patient
  const handleSelectInquiry = (inquiry: ConsultationInquiry) => {
    setSelectedInquiryId(inquiry.id);
    setDiagnosisText(inquiry.specialistReview?.diagnosis || '');
    setClinicalGuidance(inquiry.specialistReview?.clinicalGuidance || '');
    if (inquiry.specialistReview?.prescriptionsOrRecommendations) {
      setPrescriptions(inquiry.specialistReview.prescriptionsOrRecommendations);
    }
    setRequestAdditionalInfo(inquiry.specialistReview?.requestedAdditionalInfo ?? false);
    if (inquiry.specialistReview?.additionalInfoDescription) {
      setAdditionalDescription(inquiry.specialistReview.additionalInfoDescription);
    }
    if (inquiry.specialistReview?.additionalDocumentsNeeded) {
      setAdditionalDocsNeeded(inquiry.specialistReview.additionalDocumentsNeeded);
    }
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

  const handleSendResponse = () => {
    if (!selectedInquiry) return;
    if (!clinicalGuidance) {
      alert('لطفاً شرح راهنمایی و پاسخ بالینی را در کادر پاسخ بنویسید.');
      return;
    }

    const updated: ConsultationInquiry = {
      ...selectedInquiry,
      updatedAt: 'هم‌اکنون',
      status: requestAdditionalInfo ? 'additional_info_requested' : 'completed',
      specialistReview: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        reviewedAt: 'هم‌اکنون',
        diagnosis: diagnosisText || 'ارزیابی علائم قلبی عروقی',
        clinicalGuidance,
        prescriptionsOrRecommendations: prescriptions,
        requestedAdditionalInfo: requestAdditionalInfo,
        additionalInfoDescription: requestAdditionalInfo ? additionalDescription : undefined,
        additionalDocumentsNeeded: requestAdditionalInfo ? additionalDocsNeeded : undefined,
      },
    };

    onUpdateConsultation(updated);
    alert(
      requestAdditionalInfo
        ? 'پاسخ پزشک به همراه درخواست مدارک تکمیلی با موفقیت برای بیمار ارسال شد. (مطابق صفحه ۷ پتنت، کادر مدارک درخواستی در پنل بیمار نمایان می‌گردد)'
        : 'پاسخ نهایی پزشک با موفقیت در پرونده بیمار ثبت شد.'
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Patent Header Banner (مطابق صفحه ۶ پتنت: Tele D - پزشک: ...) */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-rose-950 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                صفحه ۶ پتنت: پنل پزشک متخصص (Tele D)
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
          <span className="text-xl font-mono font-bold text-rose-400">
            {assignedList.length} پرونده
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient queue column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between px-1">
            <span>لیست بیماران و مشاوره‌های ارجاعی:</span>
            <span className="text-[11px] text-slate-500">{consultations.length} مورد</span>
          </h3>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pl-1">
            {consultations.map((item) => {
              const isSelected = item.id === selectedInquiryId;
              const hasReqDocs = item.status === 'additional_info_requested';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectInquiry(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{item.patientName}</span>
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
                        : 'bg-rose-100 text-rose-800'
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

        {/* Doctor Consultation Workspace (Directly from Patent Page 6) */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-6">
              
              {/* Patient Banner - Patent Page 6: سوال کننده، تاریخ و زمان سوال */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                    <User className="w-4 h-4 text-rose-600" />
                    <span>سوال‌کننده: {selectedInquiry.patientName}</span>
                    <span className="text-slate-500 font-normal">({selectedInquiry.patientAge} ساله - {selectedInquiry.patientGender})</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">شماره تماس: {selectedInquiry.patientPhone}</p>
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

              <div className="p-6 space-y-6">
                
                {/* 1. پرسش (Patent Page 6) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>پرسش و شرح حال بیمار (مطابق صفحه ۶ پتنت):</span>
                  </label>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">
                      موضوع: {selectedInquiry.chiefComplaint}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedInquiry.symptomsDescription}
                    </p>
                    
                    {selectedInquiry.chestPainDetails && (
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px] text-slate-600">
                        <span className="bg-white px-2 py-1 rounded border">درد: {selectedInquiry.chestPainDetails.painType}</span>
                        <span className="bg-white px-2 py-1 rounded border">محرک: {selectedInquiry.chestPainDetails.triggers?.join('، ')}</span>
                        <span className="bg-white px-2 py-1 rounded border">علائم همراه: {selectedInquiry.chestPainDetails.associatedSymptoms?.join('، ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. مدارک (Patent Page 6: دکمه‌های مدارک: نوار قلب، اکو، آزمایشات) */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-600" />
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

                        {doc.type === 'ecg' ? (
                          <button
                            onClick={() => onOpenECGModal(doc)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>بررسی نوار قلب</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`نمایش گزارش: ${doc.title}\n${doc.notes || 'مدرک پیوست شده'}`)}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs shrink-0"
                          >
                            مشاهده گزارش
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. پاسخ پزشک (Patent Page 6: پاسخ) */}
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      پاسخ و راهنمایی بالینی پزشک (کادر پاسخ مطابق صفحه ۶ پتنت):
                    </label>
                    <textarea
                      rows={4}
                      value={clinicalGuidance}
                      onChange={(e) => setClinicalGuidance(e.target.value)}
                      placeholder="توضیحات کامل برای بیمار پیرامون یافته‌های نوار قلب، آزمایشات، توصیه‌های ورزشی و دارویی..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* Prescription recommendations */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      دستورات دارویی و توصیه‌های تکمیلی:
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {prescriptions.map((rx, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <span className="text-slate-800">• {rx}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(idx)}
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
                        value={newPrescriptionInput}
                        onChange={(e) => setNewPrescriptionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrescription())}
                        placeholder="افزودن دستور دارویی جدید..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPrescription}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                      >
                        افزودن
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
                        درخواست تکمیل اطلاعات از سوی بیمار (چک‌باکس ص ۶ پتنت)
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

                {/* 5. دکمه ارسال (Patent Page 6) */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSendResponse}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>ارسال پاسخ و ثبت در پرونده الکترونیک بیمار (دکمه ارسال ص ۶)</span>
                  </button>
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
