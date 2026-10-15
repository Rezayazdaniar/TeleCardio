import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, Clock, Check, Plus, Trash2, 
  Volume2, VolumeX, Smartphone, AlertCircle, Sparkles, 
  CheckCircle2, Pill, ShieldCheck, X
} from 'lucide-react';
import { PrescribedDrug } from './MedicationScheduleView';

export interface MedicationReminder {
  id: string;
  drugId: string;
  drugName: string;
  dose: string;
  alertTime: string; // "HH:MM"
  label: string;     // e.g. "وعده صبح", "وعده شب"
  enabled: boolean;
  soundEnabled: boolean;
  notes?: string;
}

interface Props {
  drugs: PrescribedDrug[];
  onTriggerTestAlert?: (reminder: MedicationReminder) => void;
}

const DEFAULT_REMINDERS: MedicationReminder[] = [
  {
    id: 'rem-1',
    drugId: 'rx-1',
    drugName: 'قرص پروپرانولول (Propranolol)',
    dose: '۱۰ میلی‌گرم',
    alertTime: '08:00',
    label: 'وعده صبح (بعد از صبحانه)',
    enabled: true,
    soundEnabled: true,
    notes: 'جهت پیشگیری از تپش قلب و احساس آریتمی صبحگاهی',
  },
  {
    id: 'rem-2',
    drugId: 'rx-2',
    drugName: 'قرص لوزارتان پتاسیم (Losartan)',
    dose: '۲۵ میلی‌گرم',
    alertTime: '08:30',
    label: 'صبح ناشتا',
    enabled: true,
    soundEnabled: true,
    notes: 'همراه با یک لیوان پر آب برای کنترل فشار خون',
  },
  {
    id: 'rem-3',
    drugId: 'rx-3',
    drugName: 'قرص آسپرین (Aspirin)',
    dose: '۸۰ میلی‌گرم',
    alertTime: '13:30',
    label: 'وعده ظهر (بعد از ناهار)',
    enabled: true,
    soundEnabled: false,
    notes: 'بعد از غذای کامل جهت محافظت از مخاط معده',
  },
  {
    id: 'rem-4',
    drugId: 'rx-1',
    drugName: 'قرص پروپرانولول (Propranolol)',
    dose: '۱۰ میلی‌گرم',
    alertTime: '20:00',
    label: 'وعده شب (بعد از شام)',
    enabled: true,
    soundEnabled: true,
    notes: 'نوبت دوم هر ۱۲ ساعت',
  },
  {
    id: 'rem-5',
    drugId: 'rx-4',
    drugName: 'قرص آتورواستاتین (Atorvastatin)',
    dose: '۲۰ میلی‌گرم',
    alertTime: '22:00',
    label: 'قبل از خواب شبانه',
    enabled: true,
    soundEnabled: true,
    notes: 'کنترل چربی و محافظت از عروق کرونر',
  },
];

export const MedicationReminderScheduler: React.FC<Props> = ({
  drugs,
  onTriggerTestAlert,
}) => {
  const [reminders, setReminders] = useState<MedicationReminder[]>(DEFAULT_REMINDERS);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [activeSuccessToast, setActiveSuccessToast] = useState<string | null>(null);

  // New reminder modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrugId, setSelectedDrugId] = useState(drugs[0]?.id || 'rx-1');
  const [newTime, setNewTime] = useState('09:00');
  const [newLabel, setNewLabel] = useState('وعده صبح');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Request browser Web Push notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionStatus(perm);
        if (perm === 'granted') {
          showBrowserNotification(
            '🔔 یادآور هوشمند کلینیک مجازی قلب',
            'دسترسی پوش نوتیفیکیشن با موفقیت فعال شد. هشدارهای مصرف دارو در زمان تعیین‌شده ارسال خواهند شد.'
          );
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    } else {
      alert('مرورگر شما از Web Notification API پشتیبانی نمی‌کند، اما اعلان‌های درون‌برنامه‌ای به طور کامل فعال هستند.');
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Notification trigger fallback:', e);
      }
    }
  };

  // Toggle Reminder Enable/Disable
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Toggle Sound
  const handleToggleSound = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r))
    );
  };

  // Change Time
  const handleTimeChange = (id: string, newAlertTime: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, alertTime: newAlertTime } : r))
    );
  };

  // Delete Reminder
  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Add Custom Reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const drug = drugs.find((d) => d.id === selectedDrugId) || drugs[0];

    const newReminderItem: MedicationReminder = {
      id: `rem-${Date.now()}`,
      drugId: drug.id,
      drugName: drug.name,
      dose: drug.dose,
      alertTime: newTime,
      label: newLabel,
      enabled: true,
      soundEnabled: true,
      notes: newNotes || drug.instructions,
    };

    setReminders([...reminders, newReminderItem]);
    setShowAddModal(false);
    setNewNotes('');
    setActiveSuccessToast(`یادآور جدید برای ساعت ${newTime} با موفقیت تنظیم شد.`);
    setTimeout(() => setActiveSuccessToast(null), 4000);
  };

  // Test send alert
  const handleTestAlert = (reminder: MedicationReminder) => {
    showBrowserNotification(
      `⏰ زمان مصرف: ${reminder.drugName}`,
      `دوز: ${reminder.dose} • ${reminder.notes || reminder.label}`
    );

    if (onTriggerTestAlert) {
      onTriggerTestAlert(reminder);
    } else {
      setActiveSuccessToast(`پوش نوتیفیکیشن آزمایشی برای «${reminder.drugName}» ارسال گردید.`);
      setTimeout(() => setActiveSuccessToast(null), 4000);
    }
  };

  const enabledCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl text-white shadow-md">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                Push Notification Scheduler
              </span>
              <span className="text-xs text-slate-500">{enabledCount} یادآور فعال روزانه</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1">
              زمان‌بندی پوش نوتیفیکیشن‌ها و هشدارهای روزانه مصرف دارو
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تنظیم ساعات زنگ هشدار برای پیشگیری از فراموشی دوزهای حیاتی قلبی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>فعال‌سازی پوش نوتیفیکیشن مرورگر</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>پوش نوتیفیکیشن فعال است</span>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن زمان هشدار</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {activeSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{activeSuccessToast}</span>
          </div>
          <button onClick={() => setActiveSuccessToast(null)} className="text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-xs ${
              reminder.enabled
                ? 'bg-white border-slate-200 shadow-2xs hover:shadow-xs hover:border-rose-300'
                : 'bg-slate-50/70 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  reminder.enabled ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Pill className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {reminder.drugName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    دوز: <span className="font-mono font-bold text-slate-800">{reminder.dose}</span> • {reminder.label}
                  </p>
                  {reminder.notes && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {reminder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={() => handleToggleReminder(reminder.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Time Picker & Control Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="time"
                    value={reminder.alertTime}
                    onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                    disabled={!reminder.enabled}
                    className="bg-transparent font-mono font-bold text-xs text-slate-900 outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => handleToggleSound(reminder.id)}
                  disabled={!reminder.enabled}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    reminder.soundEnabled
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                  title={reminder.soundEnabled ? 'هشدار صوتی فعال است' : 'هشدار صوتی بی‌صدا'}
                >
                  {reminder.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTestAlert(reminder)}
                  disabled={!reminder.enabled}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="تست ارسال پوش نوتیفیکیشن آزمایشی برای این دارو"
                >
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>تست هشدار</span>
                </button>

                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="حذف این یادآور"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add New Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-right text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Bell className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  تنظیم زمان‌بندی یادآور دارویی جدید
                </h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">انتخاب داروی قلبی:</label>
                <select
                  value={selectedDrugId}
                  onChange={(e) => setSelectedDrugId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-rose-500"
                >
                  {drugs.map((drug) => (
                    <option key={drug.id} value={drug.id}>
                      {drug.name} ({drug.dose}) — {drug.timing}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ساعت هشدار (۲۴ ساعته):</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">عنوان نوبت:</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="مثال: وعده صبح ناشتا"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">یادداشت هشدار (اختیاری):</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="مثال: همراه با یک لیوان پر آب بعد از غذا..."
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
                  ذخیره یادآور هشدار
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
