import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Pill, Plus, 
  Trash2, Info, Search, Sparkles, X, ShieldCheck, ArrowRight
} from 'lucide-react';
import { 
  ChronicMedication, 
  INITIAL_CHRONIC_MEDICATIONS, 
  checkDrugInteractions, 
  DrugInteractionRule 
} from '../data/drugInteractions';

interface Props {
  candidateDrug?: string;
  onSelectWarning?: (rule: DrugInteractionRule) => void;
  onApplyRecommendation?: (recommendation: string) => void;
  compactView?: boolean;
}

export const DrugInteractionChecker: React.FC<Props> = ({
  candidateDrug = '',
  onSelectWarning,
  onApplyRecommendation,
  compactView = false,
}) => {
  const [chronicMeds, setChronicMeds] = useState<ChronicMedication[]>(INITIAL_CHRONIC_MEDICATIONS);
  const [testDrugInput, setTestDrugInput] = useState<string>(candidateDrug);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Sync candidateDrug from parent if it changes
  React.useEffect(() => {
    if (candidateDrug) {
      setTestDrugInput(candidateDrug);
    }
  }, [candidateDrug]);

  // New chronic medication modal form states
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('');
  const [newMedDoctor, setNewMedDoctor] = useState('');

  // Auto-evaluate interactions based on candidateDrug or testDrugInput
  const activeQuery = candidateDrug || testDrugInput;
  const detectedInteractions = checkDrugInteractions(activeQuery, chronicMeds);

  // Check chronic-to-chronic interactions within the existing list itself (e.g. Aspirin + Naproxen!)
  const internalInteractions: DrugInteractionRule[] = [];
  const activeMedNames = chronicMeds.filter((m) => m.status === 'active').map((m) => m.name.toLowerCase());
  
  if (activeMedNames.some(n => n.includes('آسپرین')) && activeMedNames.some(n => n.includes('ناپروکسن'))) {
    internalInteractions.push({
      id: 'internal-1',
      drugA: 'آسپرین',
      drugB: 'ناپروکسن',
      severity: 'high',
      title: 'تداخل فعال در سوابق بیمار: مصرف هم‌زمان آسپرین و ناپروکسن (NSAID)',
      clinicalEffect: 'افزایش چشمگیر ریسک خونریزی گوارشی و تضعیف اثر ضدپلاکتی آسپرین.',
      mechanism: 'رقابت ناپروکسن با آسپرین در مهار استیلاسیون COX-1.',
      recommendation: 'متخصص قلب: توصیه به قطع ناپروکسن و جایگزینی با استامینوفن ساده یا پماد موضعی.',
    });
  }

  const handleAddChronicMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;

    const newMed: ChronicMedication = {
      id: `chr-${Date.now()}`,
      name: newMedName,
      dose: newMedDose || 'طبق دستور',
      category: newMedCategory || 'داروی عمومی',
      startDate: '۱۴۰۳/۰۷/۲۵',
      prescribingDoctor: newMedDoctor || 'پزشک معالج قبلی',
      status: 'active',
      indication: 'سوابق ثبت‌شده توسط بیمار یا تریاژ',
    };

    setChronicMeds([...chronicMeds, newMed]);
    setNewMedName('');
    setNewMedDose('');
    setShowAddModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setChronicMeds((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'discontinued' : 'active' } : m
      )
    );
  };

  const handleApplyPreset = (drugName: string) => {
    setTestDrugInput(drugName);
  };

  return (
    <div className={`rounded-3xl border transition-all ${
      detectedInteractions.length > 0 || internalInteractions.length > 0
        ? 'bg-rose-50/50 border-rose-300 shadow-sm'
        : 'bg-white border-slate-200 shadow-2xs'
    } p-5 sm:p-6 space-y-5 text-right font-['Vazirmatn']`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl text-white shadow-sm ${
            detectedInteractions.length > 0 || internalInteractions.length > 0
              ? 'bg-red-600 animate-pulse'
              : 'bg-indigo-600'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full border border-indigo-200">
                سامانه غربالگری تداخلات دارویی (DDI Engine)
              </span>
              <span className="text-xs text-slate-500">
                {chronicMeds.filter(m => m.status === 'active').length} داروی مزمن فعال در پرونده
              </span>
            </div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
              سوابق دارویی مزمن بیمار و هشدار تداخل قبل از تجویز
            </h4>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-rose-600" />
          <span>+ ثبت داروی مزمن جدید</span>
        </button>
      </div>

      {/* Internal Existing Chronic Conflicts Banner */}
      {internalInteractions.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-100/80 border-2 border-red-400 text-red-950 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-extrabold flex items-center gap-1.5 text-red-900 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              هشدار بالینی: تداخل موجود بین داروهای مصرفی فعلی بیمار!
            </span>
            <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-bold text-[10px] rounded">
              SEVERE INTERACTION
            </span>
          </div>
          {internalInteractions.map((rule) => (
            <div key={rule.id} className="space-y-1 bg-white/80 p-3 rounded-xl border border-red-300">
              <p className="font-bold text-red-900">{rule.title}</p>
              <p className="text-slate-700 leading-relaxed">{rule.clinicalEffect}</p>
              <p className="text-rose-800 font-semibold pt-1 border-t border-red-200">
                💡 راهکار بالینی متخصص: {rule.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Patient's Chronic Medications Chips */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          داروهای مزمن ثبت‌شده در پرونده سلامت:
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {chronicMeds.map((med) => {
            const isActive = med.status === 'active';
            const hasConflict = med.name.includes('ناپروکسن') || med.name.includes('آسپرین');

            return (
              <div
                key={med.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                  !isActive
                    ? 'bg-slate-100 border-slate-200 opacity-50'
                    : hasConflict
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    hasConflict ? 'bg-amber-200 text-amber-900' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-900 truncate">{med.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({med.dose})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {med.indication} • دستور: {med.prescribingDoctor}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(med.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors shrink-0 ${
                    isActive
                      ? 'bg-slate-200 text-slate-700 hover:bg-red-100 hover:text-red-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                  title={isActive ? 'تغییر به وضعیت قطع‌شده' : 'فعال‌سازی مجدد'}
                >
                  {isActive ? 'قطع دارو' : 'فعال'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Interaction Checker Input Bar */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-indigo-600" />
            <span>بررسی خودکار تداخل داروی مدنظر قبل از ثبت در نسخه:</span>
          </label>

          <span className="text-[11px] text-slate-500">
            نام داروی تجویزی را تایپ یا انتخاب کنید
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={testDrugInput}
              onChange={(e) => setTestDrugInput(e.target.value)}
              placeholder="مثال: وراپامیل، اسپیرونولاکتون، پروپرانولول، کلاریترومایسین..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            {testDrugInput && (
              <button
                onClick={() => setTestDrugInput('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Presets for Doctor Demo */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 ml-1">تست سریع سناریوهای تداخل شایع:</span>
          
          <button
            type="button"
            onClick={() => handleApplyPreset('وراپامیل')}
            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-900 border border-red-200 text-[11px] font-bold hover:bg-red-200 transition-colors"
          >
            ⚠️ تست وراپامیل (تداخل با پروپرانولول)
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('اسپیرونولاکتون')}
            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-200 transition-colors"
          >
            ⚠️ تست اسپیرونولاکتون (خطر با لوزارتان)
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('کلاریترومایسین')}
            className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold hover:bg-purple-200 transition-colors"
          >
            ⚠️ تست کلاریترومایسین (تداخل با آتورواستاتین)
          </button>
        </div>

        {/* Evaluated Interaction Results */}
        {testDrugInput.trim() && (
          <div className="pt-2">
            {detectedInteractions.length > 0 ? (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {detectedInteractions.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border-2 text-xs space-y-2 ${
                      rule.severity === 'high'
                        ? 'bg-red-50 border-red-500 text-red-950'
                        : 'bg-amber-50 border-amber-400 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertTriangle className={`w-5 h-5 ${rule.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`} />
                        <span>{rule.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        rule.severity === 'high' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {rule.severity === 'high' ? 'HIGH RISK' : 'MODERATE RISK'}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed font-medium">
                      <span className="font-bold">پیامد بالینی:</span> {rule.clinicalEffect}
                    </p>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-bold">مکانیسم فارماکولوژیک:</span> {rule.mechanism}
                    </p>

                    <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200 text-slate-900 font-semibold text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="leading-relaxed">🛡️ توصیه جایگزین متخصص: {rule.recommendation}</span>
                      {onApplyRecommendation && (
                        <button
                          type="button"
                          onClick={() => onApplyRecommendation(rule.recommendation)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer flex items-center justify-center gap-1 shadow-2xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>افزودن داروی ایمن به نسخه</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  تداخل دارویی شناخته‌شده‌ای بین «{testDrugInput}» و داروهای مزمن بیمار یافت نشد. تجویز ایمن ارزیابی می‌شود.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Chronic Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-rose-600" />
                <span>ثبت داروی مزمن جدید در پرونده بیمار</span>
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddChronicMed} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نام ژنریک یا تجاری دارو:</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  required
                  placeholder="مثال: قرص دیلتیازم یا اسپیرونولاکتون"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">دوز و نحوه مصرف:</label>
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="مثال: ۲۵ میلی‌گرم روزانه"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">دسته دارویی:</label>
                  <input
                    type="text"
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    placeholder="مثال: بلوک‌کننده کانال کلسیم"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">پزشک یا تخصص تجویزکننده:</label>
                <input
                  type="text"
                  value={newMedDoctor}
                  onChange={(e) => setNewMedDoctor(e.target.value)}
                  placeholder="مثال: متخصص داخلی / مرکز جامع سلامت"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
                >
                  افزودن به پرونده
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
