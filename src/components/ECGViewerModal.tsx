import React, { useState } from 'react';
import { X, Activity, ZoomIn, ZoomOut, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { CardiacDocument } from '../types';

interface Props {
  document: CardiacDocument;
  onClose: () => void;
}

export const ECGViewerModal: React.FC<Props> = ({ document, onClose }) => {
  const [selectedLead, setSelectedLead] = useState<string>('II');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const leads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
  const ecgData = document.ecgData || {
    heartRate: 78,
    rhythm: 'Normal Sinus Rhythm (ریتم نرمال سینوسی)',
    prInterval: '150 ms',
    qrsDuration: '85 ms',
    qtc: '405 ms',
    stChanges: 'No ST deviation detected',
  };

  // Helper to render an SVG ECG rhythm wave
  const renderECGPath = (lead: string) => {
    // Generate simulated rhythm vectors
    const isLeadII = lead === 'II';
    const isV1 = lead === 'V1';
    const isAVR = lead === 'aVR';

    // Different lead vector representations
    const inverted = isAVR ? -1 : 1;
    const rHeight = isLeadII ? 65 : isV1 ? 30 : 50;
    const sDepth = isV1 ? 50 : 25;

    let path = 'M 0 100 ';
    for (let i = 0; i < 6; i++) {
      const offset = i * 140;
      path += `L ${offset + 25} 100 `;
      // P wave
      path += `C ${offset + 35} ${100 - 14 * inverted}, ${offset + 45} ${100 - 14 * inverted}, ${offset + 55} 100 `;
      // PR segment
      path += `L ${offset + 70} 100 `;
      // Q wave
      path += `L ${offset + 73} ${100 + 8 * inverted} `;
      // R wave spike
      path += `L ${offset + 80} ${100 - rHeight * inverted} `;
      // S wave dip
      path += `L ${offset + 87} ${100 + sDepth * inverted} `;
      // ST segment
      path += `L ${offset + 105} 100 `;
      // T wave
      path += `C ${offset + 115} ${100 - 20 * inverted}, ${offset + 128} ${100 - 20 * inverted}, ${offset + 138} 100 `;
    }
    return path;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>نمایشگر تخصصی نوار قلب (ECG Viewer)</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                  ۱۲ لید استاندارد
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {document.title} • تاریخ ثبت: {document.date} • منبع: مرکز بهداشت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 ml-1">انتخاب لید:</span>
            {leads.map((lead) => (
              <button
                key={lead}
                onClick={() => setSelectedLead(lead)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedLead === lead
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Lead {lead}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.2))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.8, prev + 0.2))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ECG Paper & Canvas */}
        <div className="p-6 bg-[#2a0e14] relative overflow-x-auto flex justify-center items-center select-none min-h-[300px]">
          {/* Pink Medical ECG Grid Background */}
          <div 
            className="w-full h-64 border-2 border-red-900/60 rounded-xl relative shadow-inner overflow-hidden"
            style={{
              backgroundColor: '#1a080d',
              backgroundImage: `
                linear-gradient(to right, rgba(244, 63, 94, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(244, 63, 94, 0.15) 1px, transparent 1px),
                linear-gradient(to right, rgba(244, 63, 94, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(244, 63, 94, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px, 8px 8px, 40px 40px, 40px 40px',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Lead label on grid */}
            <div className="absolute top-3 left-4 bg-red-950/80 backdrop-blur-xs border border-red-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold text-red-200">
              LEAD: {selectedLead} (25mm/s, 10mm/mV)
            </div>

            {/* Simulated Live Rhythm Line */}
            <svg className="w-full h-full" viewBox="0 0 850 200" preserveAspectRatio="none">
              <path
                d={renderECGPath(selectedLead)}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
              />
            </svg>
          </div>
        </div>

        {/* ECG Measurements & Diagnostic Parameters */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">ضربان قلب (Heart Rate)</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{ecgData.heartRate} bpm</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">فاصله PR</span>
              <span className="text-lg font-bold font-mono text-slate-200">{ecgData.prInterval || '150 ms'}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">پهنای QRS</span>
              <span className="text-lg font-bold font-mono text-slate-200">{ecgData.qrsDuration || '88 ms'}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">شاخص QTc اصلاح‌شده</span>
              <span className="text-lg font-bold font-mono text-slate-200">{ecgData.qtc || '410 ms'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-200">تحلیل ریتم و تفسیر مقدماتی نوار قلب:</span>
              <p className="text-slate-300 leading-relaxed">
                {ecgData.rhythm} — {document.notes || 'تغییرات حاد بالا یا پایین‌افتادگی قطعه ST مشاهده نشد. تاکی‌کاردی سینوسی با ضربان بالای ۱۰۰ مشهود است.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              File: {document.fileName} ({document.fileSize})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`دانلود فایل مدرک پزشکی: ${document.fileName}`);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود نسخه چاپی PDF</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
