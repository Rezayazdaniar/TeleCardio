import React, { useState } from 'react';
import { 
  User, Heart, Activity, Pill, ShieldAlert, FileText, Plus, 
  Trash2, Check, Eye, AlertCircle, Calendar, Sparkles, PhoneCall, Siren, Phone
} from 'lucide-react';
import { PatientUser, CardiacDocument, ConsultationInquiry } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/mockData';
import { MedicationScheduleView } from './MedicationScheduleView';
import { DrugInteractionChecker } from './DrugInteractionChecker';
import { EmergencyContactsSection } from './EmergencyContactsSection';

interface Props {
  patient: PatientUser;
  onUpdatePatient: (updated: PatientUser) => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
  onNavigateToTelemetry?: () => void;
  recentConsultation?: ConsultationInquiry;
  onTriggerPushAlert?: (title: string, message: string) => void;
}

export const CardiacHealthProfile: React.FC<Props> = ({
  patient,
  onUpdatePatient,
  onOpenECGModal,
  onNavigateToTelemetry,
  recentConsultation,
  onTriggerPushAlert,
}) => {
  const [profileActiveTab, setProfileActiveTab] = useState<'records' | 'medication_schedule' | 'chronic_meds' | 'emergency'>('medication_schedule');
  const [bloodPressure, setBloodPressure] = useState(patient.bloodPressure || '۱۳۵ / ۸۵ mmHg');
  const [medications, setMedications] = useState<string[]>(patient.currentMedications);
  const [newMedInput, setNewMedInput] = useState('');
  
  const [medicalHistory, setMedicalHistory] = useState<string[]>(patient.medicalHistory);
  const [newHistoryInput, setNewHistoryInput] = useState('');

  const [savedDocs, setSavedDocs] = useState<CardiacDocument[]>(SAMPLE_DOCUMENTS);

  const primaryEmergencyContact = patient.emergencyContacts?.find(c => c.isPrimary) || patient.emergencyContacts?.[0];

  const handleAddMed = () => {
    if (!newMedInput.trim()) return;
    const updated = [...medications, newMedInput.trim()];
    setMedications(updated);
    onUpdatePatient({ ...patient, currentMedications: updated });
    setNewMedInput('');
  };

  const handleRemoveMed = (idx: number) => {
    const updated = medications.filter((_, i) => i !== idx);
    setMedications(updated);
    onUpdatePatient({ ...patient, currentMedications: updated });
  };

  const handleAddHistory = () => {
    if (!newHistoryInput.trim()) return;
    const updated = [...medicalHistory, newHistoryInput.trim()];
    setMedicalHistory(updated);
    onUpdatePatient({ ...patient, medicalHistory: updated });
    setNewHistoryInput('');
  };

  const handleRemoveHistory = (idx: number) => {
    const updated = medicalHistory.filter((_, i) => i !== idx);
    setMedicalHistory(updated);
    onUpdatePatient({ ...patient, medicalHistory: updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            پرونده الکترونیک سلامت قلب و داروهای من (ص ۵ پتنت)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مدیریت سوابق بیماری‌های قلبی، برنامه زمان‌بندی هفتگی داروها، مخاطبین اضطراری و تست‌های پاراکلینیکی
          </p>
        </div>

        {/* Profile Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setProfileActiveTab('medication_schedule')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              profileActiveTab === 'medication_schedule'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>برنامه هفتگی داروها</span>
          </button>

          <button
            onClick={() => setProfileActiveTab('chronic_meds')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              profileActiveTab === 'chronic_meds'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>سوابق دارویی مزمن (DDI)</span>
          </button>

          <button
            onClick={() => setProfileActiveTab('emergency')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              profileActiveTab === 'emergency'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200/80'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>مخاطبین اضطراری و ۱۱۵</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>
          
          <button
            onClick={() => setProfileActiveTab('records')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              profileActiveTab === 'records'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>سوابق و مدارک پزشکی</span>
          </button>
        </div>
      </div>

      {/* Persistent Emergency Quick Bar across all tabs */}
      {profileActiveTab !== 'emergency' && (
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 rounded-2xl border border-red-200/90 p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Siren className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-right">
              <span className="font-bold text-xs text-red-900 block">
                دسترسی سریع فوریت‌های قلبی (Urgent Cardiac Action):
              </span>
              <span className="text-[11px] text-red-700">
                درد شدید قفسه سینه یا تنگی نفس حاد؟ فوراً با ۱۱۵ تماس بگیرید یا مخاطبان اضطراری خود را مطلع کنید.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setProfileActiveTab('emergency')}
              className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 border border-red-200 rounded-xl font-bold text-xs transition-colors"
            >
              مدیریت مخاطبین اضطراری
            </button>
            <a
              href="tel:115"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>تماس فوری ۱۱۵</span>
            </a>
          </div>
        </div>
      )}

      {/* TAB 1: MEDICATION SCHEDULE */}
      {profileActiveTab === 'medication_schedule' && (
        <MedicationScheduleView
          patient={patient}
          recentConsultation={recentConsultation}
          onTriggerPushAlert={onTriggerPushAlert}
        />
      )}

      {/* TAB 2: CHRONIC MEDS & DRUG INTERACTIONS (DDI ENGINE) */}
      {profileActiveTab === 'chronic_meds' && (
        <div className="space-y-4">
          <DrugInteractionChecker />
        </div>
      )}

      {/* TAB 3: EMERGENCY CONTACTS & CALL 115 */}
      {profileActiveTab === 'emergency' && (
        <EmergencyContactsSection
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onTriggerPushAlert={onTriggerPushAlert}
        />
      )}

      {/* TAB 2: OVERVIEW & PARACLINICAL RECORDS */}
      {profileActiveTab === 'records' && (
        <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-lg">
              {patient.firstName.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-xs text-slate-400">
                نام کاربری: {patient.username} • کد ملی: {patient.nationalCode} • شماره تماس: {patient.phoneNumber}
              </p>
            </div>
          </div>

          <div className="text-left text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">سن و جنسیت:</span>
            <span className="font-bold text-slate-200">{patient.age} سال — {patient.gender}</span>
          </div>
        </div>

        {/* Quick vitals metrics */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
            <span className="text-xs text-slate-500 block font-medium">آخرین فشار خون ثبت‌شده</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-rose-700 font-mono">{bloodPressure}</span>
              <span className="text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded font-bold">
                پایش منظم
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
            <span className="text-xs text-slate-500 block font-medium">میانگین ضربان قلب استراحت</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-700 font-mono">۷۴ bpm</span>
              <span className="text-[10px] bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded font-bold">
                طبیعی
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-xs text-slate-500 block font-medium">قدرت پمپاژ قلب (EF) در آخرین اکو</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-700 font-mono">۵۵٪ (نرمال)</span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded font-bold">
                اکو دکتر افشار
              </span>
            </div>
          </div>
        </div>

        {/* Visual Recharts Dashboard Prompt */}
        {onNavigateToTelemetry && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 text-white rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    مشاهده داشبورد بصری روند فشار خون و ضربان قلب (Recharts)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    نمایش تغییرات ۱۰ نوبت سنجش اخیر با نمودارهای تعاملی ComposedChart
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToTelemetry}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                <span>باز کردن نمودارهای بصری</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Medications */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-rose-600" />
              <span>داروهای فعلی بیمار:</span>
            </h3>
            <span className="text-[11px] text-slate-400">{medications.length} قلم</span>
          </div>

          <div className="space-y-2">
            {medications.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-medium text-slate-800">💊 {med}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMed(idx)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newMedInput}
              onChange={(e) => setNewMedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMed())}
              placeholder="مثال: آتورواستاتین ۲۰ میلی‌گرم شب‌ها..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddMed}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              افزودن
            </button>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>سوابق پزشکی و ریسک‌فاکتورها:</span>
            </h3>
            <span className="text-[11px] text-slate-400">{medicalHistory.length} مورد</span>
          </div>

          <div className="space-y-2">
            {medicalHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-medium text-slate-800">• {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHistory(idx)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newHistoryInput}
              onChange={(e) => setNewHistoryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHistory())}
              placeholder="مثال: سابقه آنژیوپلاستی یا دیابت..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddHistory}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              افزودن
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Quick Snapshot in Records Tab */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-5 rounded-2xl shadow-xs border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-red-950">
                  مخاطب اصلی اضطراری: {primaryEmergencyContact ? `${primaryEmergencyContact.name} (${primaryEmergencyContact.relationship})` : 'ثبت نشده'}
                </h4>
                {primaryEmergencyContact && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-200/80 text-red-900 font-mono">
                    {primaryEmergencyContact.phoneNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-red-700 mt-0.5">
                دسترسی سریع به شماره‌های امدادی ۱۱۵ و مخاطبین محلی در زمان بروز علائم حاد قلبی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {primaryEmergencyContact && (
              <a
                href={`tel:${primaryEmergencyContact.phoneNumber}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>تماس با {primaryEmergencyContact.relationship}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setProfileActiveTab('emergency')}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>مشاهده و ویرایش مخاطبین</span>
            </button>
          </div>
        </div>

      {/* Saved Cardiac Documents Repository */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <span>آرشیو مدارک پاراکلینیکی قلب من (ثبت مدارک ص ۵ پتنت):</span>
          </h3>
          <span className="text-xs text-slate-500">{savedDocs.length} سند در پرونده</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <h5 className="font-bold text-slate-900 truncate">{doc.title}</h5>
                <p className="text-[11px] text-slate-500 truncate">{doc.fileName} • {doc.date}</p>
                {doc.notes && <p className="text-[10px] text-slate-600 truncate mt-0.5">{doc.notes}</p>}
              </div>

              {doc.type === 'ecg' && (
                <button
                  type="button"
                  onClick={() => onOpenECGModal(doc)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهده نوار قلب</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
        </div>
      )}

    </div>
  );
};
