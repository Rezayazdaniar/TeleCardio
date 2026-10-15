import React, { useState } from 'react';
import { 
  Pill, Calendar, CheckSquare, Square, Clock, Sparkles, 
  CheckCircle2, AlertCircle, RefreshCw, Stethoscope, Heart, 
  ChevronRight, ChevronLeft, Plus, ShieldCheck, User
} from 'lucide-react';
import { PatientUser, ConsultationInquiry } from '../types';
import { MedicationReminderScheduler, MedicationReminder } from './MedicationReminderScheduler';

export interface PrescribedDrug {
  id: string;
  name: string;
  dose: string;
  timing: 'صبح' | 'ظهر' | 'شب' | 'صبح و شب';
  instructions: string;
  prescribedBy: string;
  diagnosisContext: string;
  datePrescribed: string;
  pillColor: string;
  // Adherence tracking for 7 days: index 0 = شنبه, ..., 6 = جمعه
  adherence: boolean[];
}

interface Props {
  patient: PatientUser;
  recentConsultation?: ConsultationInquiry;
  onUpdatePatientMeds?: (meds: string[]) => void;
  onTriggerPushAlert?: (title: string, message: string) => void;
}

const DAYS_OF_WEEK = [
  { key: 0, fa: 'شنبه', short: 'ش' },
  { key: 1, fa: 'یکشنبه', short: 'ی' },
  { key: 2, fa: 'دوشنبه', short: 'د' },
  { key: 3, fa: 'سه‌شنبه', short: 'س' },
  { key: 4, fa: 'چهارشنبه', short: 'چ' },
  { key: 5, fa: 'پنج‌شنبه', short: 'پ' },
  { key: 6, fa: 'جمعه', short: 'ج' },
];

export const MedicationScheduleView: React.FC<Props> = ({
  patient,
  recentConsultation,
  onTriggerPushAlert,
}) => {
  // Extract specialist diagnosis and recommendations if available
  const specialist = recentConsultation?.specialistReview;
  const specialistDiagnosis = specialist?.diagnosis || 'آریتمی فوق بطنی و کنترل فشار خون';
  const specialistDoctor = specialist?.doctorName || 'دکتر کامران سهرابی (فوق تخصص قلب)';

  // Initial prescribed drugs integrated with specialist diagnosis and current patient medications
  const [drugs, setDrugs] = useState<PrescribedDrug[]>([
    {
      id: 'rx-1',
      name: 'قرص پروپرانولول (Propranolol)',
      dose: '۱۰ میلی‌گرم',
      timing: 'صبح و شب',
      instructions: 'هر ۱۲ ساعت یک عدد بعد از غذا جهت مهار تپش قلب و پیشگیری از PVC',
      prescribedBy: specialistDoctor,
      diagnosisContext: specialistDiagnosis,
      datePrescribed: specialist?.reviewedAt || '۱۴۰۳/۰۷/۲۲',
      pillColor: 'rose',
      // Saturday to Thursday taken, Friday pending
      adherence: [true, true, true, true, true, false, false],
    },
    {
      id: 'rx-2',
      name: 'قرص لوزارتان پتاسیم (Losartan)',
      dose: '۲۵ میلی‌گرم',
      timing: 'صبح',
      instructions: 'صبح‌ها ناشتا همراه با یک لیوان پر آب برای کنترل فشار خون',
      prescribedBy: 'دکتر مریم کاظمی (مرکز جامع سلامت)',
      diagnosisContext: 'سابقه پرفشاری خون اولیه (Stage 1 HTN)',
      datePrescribed: '۱۴۰۳/۰۶/۱۰',
      pillColor: 'blue',
      adherence: [true, true, true, true, true, true, false],
    },
    {
      id: 'rx-3',
      name: 'قرص آسپرین (Aspirin 81)',
      dose: '۸۰ میلی‌گرم',
      timing: 'ظهر',
      instructions: 'روزانه یک عدد بعد از ناهار به منظور پیشگیری قلبی-عروقی',
      prescribedBy: specialistDoctor,
      diagnosisContext: 'پیشگیری اولیه با توجه به سابقه فامیلی CAD',
      datePrescribed: '۱۴۰۳/۰۷/۲۰',
      pillColor: 'amber',
      adherence: [true, true, true, true, false, false, false],
    },
    {
      id: 'rx-4',
      name: 'قرص آتورواستاتین (Atorvastatin)',
      dose: '۲۰ میلی‌گرم',
      timing: 'شب',
      instructions: 'شب‌ها قبل از خواب جهت تنظیم چربی خون و محافظت اندوتلیوم',
      prescribedBy: specialistDoctor,
      diagnosisContext: 'کنترل LDL و پلاک‌های چربی',
      datePrescribed: '۱۴۰۳/۰۷/۲۲',
      pillColor: 'emerald',
      adherence: [true, true, true, true, true, false, false],
    },
  ]);

  const [currentWeekLabel, setCurrentWeekLabel] = useState('هفته چهارم مهر ۱۴۰۳ (۲۱ الی ۲۷ مهر)');
  const [selectedTimingFilter, setSelectedTimingFilter] = useState<'all' | 'صبح' | 'ظهر' | 'شب'>('all');

  // Toggle adherence checkbox for a drug on a given day
  const handleToggleDay = (drugId: string, dayIndex: number) => {
    setDrugs((prev) =>
      prev.map((drug) => {
        if (drug.id === drugId) {
          const newAdherence = [...drug.adherence];
          newAdherence[dayIndex] = !newAdherence[dayIndex];
          return { ...drug, adherence: newAdherence };
        }
        return drug;
      })
    );
  };

  // Mark all drugs for today (e.g. Wednesday = index 4) as taken
  const handleQuickMarkToday = () => {
    const todayIndex = 4; // Wednesday as today in current simulation
    setDrugs((prev) =>
      prev.map((drug) => {
        const newAdherence = [...drug.adherence];
        newAdherence[todayIndex] = true;
        return { ...drug, adherence: newAdherence };
      })
    );
  };

  // Calculate overall adherence stats
  const totalDoses = drugs.length * 7;
  const takenDoses = drugs.reduce(
    (acc, drug) => acc + drug.adherence.filter(Boolean).length,
    0
  );
  const adherencePercentage = Math.round((takenDoses / totalDoses) * 100);

  const filteredDrugs = selectedTimingFilter === 'all' 
    ? drugs 
    : drugs.filter(d => d.timing.includes(selectedTimingFilter));

  return (
    <div className="space-y-6">
      
      {/* Specialist Diagnosis Context Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl border border-rose-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-600 rounded-2xl shadow-inner text-white">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                همگام‌سازی شده با تشخیص اخیر متخصص قلب
              </span>
              <span className="text-xs text-slate-300">{specialistDoctor}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
              برنامه دارویی بر مبنای تشخیص: {specialistDiagnosis}
            </h3>
            <p className="text-xs text-rose-200 mt-0.5">
              تنظیم دقیق ساعات مصرف جهت پایداری فشار خون و پیشگیری از ضربان‌های زودرس بطنی (PVC)
            </p>
          </div>
        </div>

        {/* Adherence Gauge Metric */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl text-center self-stretch md:self-auto min-w-[140px]">
          <span className="text-[11px] text-rose-200 block">پایبندی هفتگی بیمار</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
            {adherencePercentage}٪
          </div>
          <span className="text-[10px] text-slate-300">
            {takenDoses} از {totalDoses} نوبت مصرف‌شده
          </span>
        </div>
      </div>

      {/* Week Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-600" />
          <span className="font-bold text-xs sm:text-sm text-slate-800">
            تقویم هفتگی مصرف دارو:
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {currentWeekLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Timing filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedTimingFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedTimingFilter === 'all' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              همه وعده‌ها
            </button>
            <button
              onClick={() => setSelectedTimingFilter('صبح')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                selectedTimingFilter === 'صبح' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              صبح
            </button>
            <button
              onClick={() => setSelectedTimingFilter('ظهر')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                selectedTimingFilter === 'ظهر' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              ظهر
            </button>
            <button
              onClick={() => setSelectedTimingFilter('شب')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                selectedTimingFilter === 'شب' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              شب
            </button>
          </div>

          <button
            onClick={handleQuickMarkToday}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            title="علامت‌گذاری تمامی داروهای وعده امروز به عنوان مصرف‌شده"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">ثبت مصرف نوبت امروز</span>
            <span className="sm:hidden">ثبت امروز</span>
          </button>
        </div>
      </div>

      {/* Main Weekly Schedule Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-4 pr-6 min-w-[220px]">نام دارو، دوز و دستور پزشک</th>
                <th className="p-4 text-center min-w-[80px]">وعده</th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day.key} className="p-3 text-center min-w-[65px]">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-800">{day.fa}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {day.key === 4 ? '(امروز)' : ''}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center min-w-[90px]">درصد مصرف</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDrugs.map((drug) => {
                const drugTakenCount = drug.adherence.filter(Boolean).length;
                const drugPercent = Math.round((drugTakenCount / 7) * 100);

                return (
                  <tr key={drug.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Drug info column */}
                    <td className="p-4 pr-6">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                          drug.pillColor === 'rose'
                            ? 'bg-rose-100 text-rose-700'
                            : drug.pillColor === 'blue'
                            ? 'bg-blue-100 text-blue-700'
                            : drug.pillColor === 'amber'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {drug.name} <span className="font-mono text-slate-500 font-normal">({drug.dose})</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {drug.instructions}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <span className="font-semibold text-rose-600">پزشک معالج:</span>
                            <span>{drug.prescribedBy}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Timing badge */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{drug.timing}</span>
                      </span>
                    </td>

                    {/* 7 Days Adherence Checkboxes */}
                    {DAYS_OF_WEEK.map((day) => {
                      const isChecked = drug.adherence[day.key];
                      const isToday = day.key === 4;

                      return (
                        <td key={day.key} className={`p-3 text-center ${isToday ? 'bg-rose-50/30' : ''}`}>
                          <button
                            type="button"
                            onClick={() => handleToggleDay(drug.id, day.key)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto ${
                              isChecked
                                ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600 transform scale-105'
                                : isToday
                                ? 'border-2 border-rose-300 text-slate-300 hover:border-rose-500 bg-white'
                                : 'border border-slate-200 text-slate-200 hover:border-slate-400 bg-slate-50'
                            }`}
                            title={`علامت‌گذاری مصرف ${drug.name} در روز ${day.fa}`}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-400">{day.short}</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Adherence Score */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-mono font-bold text-xs ${
                          drugPercent >= 80 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {drugPercent}٪
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              drugPercent >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${drugPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Adherence Summary Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">توصیه بالینی کلینیک مجازی قلب:</span>
            <span>قطع ناگهانی داروهای قلبی (بخصوص پروپرانولول و لوزارتان) می‌تواند موجب بازگشت جهشی تپش و فشار خون شود.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">راهنما:</span>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>مصرف شده</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="w-3 h-3 rounded border border-slate-300 bg-white inline-block" />
              <span>مصرف نشده / در انتظار</span>
            </div>
          </div>
        </div>

      </div>

      {/* Daily Push Notification Scheduler Component */}
      <MedicationReminderScheduler
        drugs={drugs}
        onTriggerTestAlert={(reminder) => {
          if (onTriggerPushAlert) {
            onTriggerPushAlert(
              `⏰ زمان مصرف: ${reminder.drugName} (${reminder.dose})`,
              reminder.notes || `نوبت ${reminder.label} — همراه با آب فراوان میل شود.`
            );
          }
        }}
      />

    </div>
  );
};
