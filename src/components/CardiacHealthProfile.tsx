import React, { useState } from 'react';
import { 
  User, Heart, Activity, Pill, ShieldAlert, FileText, Plus, 
  Trash2, Check, Eye, AlertCircle, Calendar, Sparkles
} from 'lucide-react';
import { PatientUser, CardiacDocument } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/mockData';

interface Props {
  patient: PatientUser;
  onUpdatePatient: (updated: PatientUser) => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const CardiacHealthProfile: React.FC<Props> = ({
  patient,
  onUpdatePatient,
  onOpenECGModal,
}) => {
  const [bloodPressure, setBloodPressure] = useState(patient.bloodPressure || '۱۳۵ / ۸۵ mmHg');
  const [medications, setMedications] = useState<string[]>(patient.currentMedications);
  const [newMedInput, setNewMedInput] = useState('');
  
  const [medicalHistory, setMedicalHistory] = useState<string[]>(patient.medicalHistory);
  const [newHistoryInput, setNewHistoryInput] = useState('');

  const [savedDocs, setSavedDocs] = useState<CardiacDocument[]>(SAMPLE_DOCUMENTS);

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          پرونده الکترونیک سلامت قلب و مدارک من (ص ۵ پتنت)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          مدیریت سوابق بیماری‌های قلبی، داروهای مصرفی و آرشیو تست‌های پاراکلینیکی
        </p>
      </div>

      {/* Patient Vitals Card */}
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
  );
};
