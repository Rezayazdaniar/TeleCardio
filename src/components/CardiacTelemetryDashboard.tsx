import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { 
  Activity, Heart, TrendingUp, AlertCircle, Plus, Calendar, 
  CheckCircle2, Clock, Filter, Sparkles, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import { PatientUser } from '../types';

export interface VitalsRecord {
  id: string;
  date: string;
  time: string;
  dayLabel: string;
  systolic: number;     // mmHg (فشار سیستولیک)
  diastolic: number;    // mmHg (فشار دیاستولیک)
  heartRate: number;    // bpm (ضربان قلب)
  pvcsCount?: number;   // تعداد ضربان نامنظم/PVC در ساعت
  condition: string;    // شرایط سنجش (استراحت، بعد از فعالیت، صبح ناشتا)
  notes?: string;
}

const INITIAL_VITALS: VitalsRecord[] = [
  { id: 'v-1', date: '۱۴۰۳/۰۷/۱۵', time: '۰۸:۳۰', dayLabel: 'شنبه ۱۵', systolic: 138, diastolic: 88, heartRate: 82, pvcsCount: 3, condition: 'صبح ناشتا' },
  { id: 'v-2', date: '۱۴۰۳/۰۷/۱۶', time: '۱۹:۱۵', dayLabel: 'یکشنبه ۱۶', systolic: 142, diastolic: 90, heartRate: 98, pvcsCount: 7, condition: 'بعد از استرس کاری' },
  { id: 'v-3', date: '۱۴۰۳/۰۷/۱۷', time: '۰۹:۰۰', dayLabel: 'دوشنبه ۱۷', systolic: 134, diastolic: 85, heartRate: 78, pvcsCount: 2, condition: 'استراحت' },
  { id: 'v-4', date: '۱۴۰۳/۰۷/۱۸', time: '۲۱:۰۰', dayLabel: 'سه‌شنبه ۱۸', systolic: 136, diastolic: 86, heartRate: 85, pvcsCount: 4, condition: 'قبل از خواب' },
  { id: 'v-5', date: '۱۴۰۳/۰۷/۱۹', time: '۰۸:۴۵', dayLabel: 'چهارشنبه ۱۹', systolic: 130, diastolic: 82, heartRate: 74, pvcsCount: 1, condition: 'صبح ناشتا' },
  { id: 'v-6', date: '۱۴۰۳/۰۷/۲۰', time: '۱۴:۳۰', dayLabel: 'پنج‌شنبه ۲۰', systolic: 145, diastolic: 92, heartRate: 104, pvcsCount: 9, condition: 'حین تپش قلب شدید (لحظه ثبت ECG)' },
  { id: 'v-7', date: '۱۴۰۳/۰۷/۲۱', time: '۱۰:۰۰', dayLabel: 'جمعه ۲۱', systolic: 132, diastolic: 84, heartRate: 80, pvcsCount: 3, condition: 'استراحت در منزل' },
  { id: 'v-8', date: '۱۴۰3/۰۷/۲۲', time: '۰۸:۳۰', dayLabel: 'شنبه ۲۲', systolic: 128, diastolic: 82, heartRate: 76, pvcsCount: 1, condition: 'بعد از شروع داروی جدید' },
  { id: 'v-9', date: '۱۴۰۳/۰۷/۲۳', time: '۲۰:۰۰', dayLabel: 'یکشنبه ۲۳', systolic: 125, diastolic: 80, heartRate: 72, pvcsCount: 0, condition: 'استراحت شبانه' },
  { id: 'v-10', date: '۱۴۰۳/۰۷/۲۴', time: '۰۹:۱۵', dayLabel: 'دوشنبه ۲۴', systolic: 126, diastolic: 81, heartRate: 73, pvcsCount: 1, condition: 'صبح بعد از مصرف لوزارتان' },
];

interface Props {
  patient: PatientUser;
  onOpenLogModal?: () => void;
}

export const CardiacTelemetryDashboard: React.FC<Props> = ({ patient }) => {
  const [records, setRecords] = useState<VitalsRecord[]>(INITIAL_VITALS);
  const [selectedRange, setSelectedRange] = useState<'7d' | 'all'>('7d');
  const [chartType, setChartType] = useState<'bp' | 'hr' | 'combined'>('combined');
  
  // New record form modal
  const [showLogForm, setShowLogForm] = useState(false);
  const [newSystolic, setNewSystolic] = useState('125');
  const [newDiastolic, setNewDiastolic] = useState('80');
  const [newHeartRate, setNewHeartRate] = useState('72');
  const [newCondition, setNewCondition] = useState('استراحت صبحگاهی');

  const displayedRecords = selectedRange === '7d' ? records.slice(-7) : records;

  // Calculate statistics
  const avgSystolic = Math.round(displayedRecords.reduce((acc, r) => acc + r.systolic, 0) / displayedRecords.length);
  const avgDiastolic = Math.round(displayedRecords.reduce((acc, r) => acc + r.diastolic, 0) / displayedRecords.length);
  const avgHeartRate = Math.round(displayedRecords.reduce((acc, r) => acc + r.heartRate, 0) / displayedRecords.length);
  const maxHeartRate = Math.max(...displayedRecords.map((r) => r.heartRate));

  const handleAddNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(newSystolic) || 120;
    const dia = parseInt(newDiastolic) || 80;
    const hr = parseInt(newHeartRate) || 75;

    const newRecord: VitalsRecord = {
      id: `v-${Date.now()}`,
      date: '۱۴۰۳/۰۷/۲۵',
      time: '۱۲:۳۰',
      dayLabel: 'امروز ۲۵',
      systolic: sys,
      diastolic: dia,
      heartRate: hr,
      pvcsCount: sys > 140 ? 4 : 0,
      condition: newCondition,
    };

    setRecords([...records, newRecord]);
    setShowLogForm(false);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as VitalsRecord;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 text-right font-['Vazirmatn']">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{data.dayLabel} ({data.date})</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.time}</span>
          </div>
          <div className="text-rose-400 font-semibold flex items-center justify-between gap-3">
            <span>فشار خون سیستولیک:</span>
            <span className="font-bold font-mono text-sm">{data.systolic} mmHg</span>
          </div>
          <div className="text-amber-400 font-semibold flex items-center justify-between gap-3">
            <span>فشار خون دیاستولیک:</span>
            <span className="font-bold font-mono text-sm">{data.diastolic} mmHg</span>
          </div>
          <div className="text-emerald-400 font-semibold flex items-center justify-between gap-3">
            <span>ضربان قلب:</span>
            <span className="font-bold font-mono text-sm">{data.heartRate} bpm</span>
          </div>
          <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            شرایط سنجش: <span className="text-slate-100 font-medium">{data.condition}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 rounded-2xl shadow-inner text-white">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                پایش پیوسته تله‌متری قلب
              </span>
              <span className="text-xs text-slate-400">بیمار: {patient.firstName} {patient.lastName}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black mt-1 text-slate-100">
              داشبورد بصری روند فشار خون و ضربان قلب (Recharts)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              ترسیم نمودارهای دینامیک علائم حیاتی جهت ارزیابی اثربخشی داروها و تریاژ دقیق‌تر
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLogForm(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت اندازه‌گیری جدید فشار خون/نبض</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">میانگین فشار سیستولیک</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-rose-600">{avgSystolic}</span>
            <span className="text-xs font-mono text-slate-400">mmHg</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>هدف بالینی: کمتر از ۱۲۰</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">میانگین فشار دیاستولیک</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-600">{avgDiastolic}</span>
            <span className="text-xs font-mono text-slate-400">mmHg</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>هدف بالینی: کمتر از ۸۰</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">میانگین ضربان قلب استراحت</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-600">{avgHeartRate}</span>
            <span className="text-xs font-mono text-slate-400">bpm</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>محدوده نرمال: ۶۰ الی ۱۰۰</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">حداکثر ضربان حین حمله تپش</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-purple-600">{maxHeartRate}</span>
            <span className="text-xs font-mono text-slate-400">bpm</span>
          </div>
          <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>ثبت شده در روز ۲۰ مهر (تاکی‌کاردی)</span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartType('combined')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  chartType === 'combined' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نمودار ترکیبی (فشار خون + ضربان)
              </button>
              <button
                onClick={() => setChartType('bp')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  chartType === 'bp' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                صرفاً فشار خون
              </button>
              <button
                onClick={() => setChartType('hr')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  chartType === 'hr' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                صرفاً ریتم و ضربان
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">بازه زمانی:</span>
            <button
              onClick={() => setSelectedRange('7d')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedRange === '7d' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-600'
              }`}
            >
              ۷ روز اخیر
            </button>
            <button
              onClick={() => setSelectedRange('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedRange === 'all' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-600'
              }`}
            >
              تمام داده‌ها ({records.length} سنجش)
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-[360px] w-full pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayedRecords} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <defs>
                <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis 
                yAxisId="left" 
                domain={[50, 160]} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              {chartType === 'combined' && (
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[50, 130]} 
                  tick={{ fontSize: 11, fill: '#10b981' }}
                  stroke="#cbd5e1"
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
                formatter={(value) => {
                  if (value === 'systolic') return 'فشار سیستولیک (mmHg)';
                  if (value === 'diastolic') return 'فشار دیاستولیک (mmHg)';
                  if (value === 'heartRate') return 'ضربان قلب (bpm)';
                  return value;
                }}
              />

              {/* Reference threshold lines */}
              <ReferenceLine yAxisId="left" y={140} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'محدوده پرفشاری خون (140)', fill: '#f43f5e', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine yAxisId="left" y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'حد مجاز دیاستولیک (90)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />

              {(chartType === 'combined' || chartType === 'bp') && (
                <>
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="systolic"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#systolicGradient)"
                    dot={{ r: 4, stroke: '#e11d48', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#e11d48' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#d97706"
                    strokeWidth={2.2}
                    dot={{ r: 3.5, stroke: '#d97706', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 5, fill: '#d97706' }}
                  />
                </>
              )}

              {(chartType === 'combined' || chartType === 'hr') && (
                <Line
                  yAxisId={chartType === 'combined' ? 'right' : 'left'}
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Clinical Interpretation for Triage & Specialist */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-950 block">تحلیل روند بالینی تله‌متری:</span>
            <p className="text-emerald-900 leading-relaxed">
              پس از اوج تاکی‌کاردی و فشار خون در تاریخ ۲۰ مهر (۱۰۴ ضربان و ۱۴۵/۹۲ mmHg حین حمله تپش)، با شروع مصرف داروی تنظیم‌کننده بتابلوکر، فشار خون به محدوده ۱۲۵/۸۰ و ضربان قلب به ۷۲ bpm کاهش یافته و ثبات همودینامیک برقرار شده است.
            </p>
          </div>
        </div>

      </div>

      {/* Log Form Modal */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>ثبت اندازه‌گیری جدید علائم حیاتی</span>
              </h3>
              <button
                onClick={() => setShowLogForm(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                انصراف
              </button>
            </div>

            <form onSubmit={handleAddNewRecord} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">فشار سیستولیک (بالا):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={newSystolic}
                      onChange={(e) => setNewSystolic(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center font-bold"
                    />
                    <span className="text-slate-400 text-[10px]">mmHg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">فشار دیاستولیک (پایین):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={newDiastolic}
                      onChange={(e) => setNewDiastolic(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center font-bold"
                    />
                    <span className="text-slate-400 text-[10px]">mmHg</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ضربان قلب (نبض):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center font-bold"
                  />
                  <span className="text-slate-400 text-[10px]">bpm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شرایط اندازه‌گیری:</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="صبح ناشتا و استراحت">صبح ناشتا و استراحت</option>
                  <option value="بعد از مصرف داروی قلبی">بعد از مصرف داروی قلبی</option>
                  <option value="بعد از پیاده‌روی یا فعالیت">بعد از پیاده‌روی یا فعالیت</option>
                  <option value="حین احساس تپش یا اضطراب">حین احساس تپش یا اضطراب</option>
                  <option value="قبل از خواب شبانه">قبل از خواب شبانه</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  افزودن به نمودار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
