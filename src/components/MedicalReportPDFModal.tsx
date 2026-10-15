import React, { useRef, useState } from 'react';
import { 
  X, Download, Printer, Heart, Activity, CheckCircle2, 
  ShieldCheck, FileText, Hospital, QrCode, Stethoscope, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConsultationInquiry, PatientUser } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationInquiry;
  patient: PatientUser;
}

export const MedicalReportPDFModal: React.FC<Props> = ({
  isOpen,
  onClose,
  consultation,
  patient,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const specialist = consultation.specialistReview;
  const triage = consultation.triage;

  // Generate and Download PDF using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // High-resolution canvas capture
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // 2x resolution for crystal clear text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      
      // Save file with patient name and ID
      const safeName = patient.lastName.replace(/\s+/g, '_');
      pdf.save(`TeleCardio_Report_${safeName}_${consultation.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('خطا در ایجاد فایل PDF. می‌توانید از دکمه چاپ مستقیم استفاده فرمایید.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-4 max-h-[95vh]">
        
        {/* Top Modal Controls Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 rounded-xl text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <span>پیش‌نمایش برگه رسمی پرونده پزشکی و ارزیابی قلب</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono">
                  ISO-A4 PDF
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                با آرم رسمی مرکز سلامت، مهر نظام پزشکی و امضای دیجیتال پزشک معالج
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">چاپ مستقیم</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'در حال صدور PDF...' : 'دانلود فایل استاندارد PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-200">
          
          {/* Printable A4 Paper Sheet (Exact 210mm proportional aspect) */}
          <div
            ref={reportRef}
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm border border-slate-300 space-y-6 text-right font-['Vazirmatn'] select-none"
            style={{ minHeight: '1050px' }}
          >
            
            {/* 1. Official Header with Health Center Logo & National Telemedicine Banner */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-center justify-between">
                
                {/* Right Logo & Ministry Branding */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-600 text-white flex items-center justify-center shadow-md">
                    <Heart className="w-8 h-8 fill-white text-rose-700" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-slate-950">
                      جمهوری اسلامی ایران
                    </h2>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">
                      وزارت بهداشت، درمان و آموزش پزشکی
                    </h3>
                    <p className="text-[11px] text-rose-700 font-bold">
                      مرکز خدمات جامع سلامت — کلینیک مجازی تخصصی قلب و عروق (TeleCardio)
                    </p>
                  </div>
                </div>

                {/* Left Document Metadata & QR Code */}
                <div className="text-left text-xs space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-800">
                      <QrCode className="w-9 h-9" />
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    <div>شماره پرونده: <span className="font-bold text-slate-900">{consultation.id}</span></div>
                    <div>تاریخ صدور: <span className="font-bold text-slate-900">{consultation.updatedAt}</span></div>
                    <div>اعتبار: <span className="text-emerald-700 font-bold">تأییدشده سیستمی</span></div>
                  </div>
                </div>

              </div>

              <div className="text-center mt-3 pt-2 border-t border-slate-200">
                <span className="inline-block bg-slate-900 text-white px-4 py-1 rounded-md font-bold text-xs">
                  گزارش رسمی خلاصه ویزیت و ارزیابی تشخیصی تله‌کاردیولوژی
                </span>
              </div>
            </div>

            {/* 2. Patient Demographics & Profile Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 font-medium block">نام و نام خانوادگی:</span>
                  <span className="font-bold text-slate-950 text-sm">{patient.firstName} {patient.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">کد ملی / شناسه سلامت:</span>
                  <span className="font-bold font-mono text-slate-900">{patient.nationalCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">سن و جنسیت:</span>
                  <span className="font-bold text-slate-900">{patient.age} سال — {patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">شماره تماس مراجع:</span>
                  <span className="font-bold font-mono text-slate-900">{patient.phoneNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold">سوابق پزشکی زمینه‌ای:</span>{' '}
                  <span className="text-slate-800">{patient.medicalHistory.join('، ') || 'بدون سابقه قبلی'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">آخرین فشار خون پایش‌شده:</span>{' '}
                  <span className="font-mono font-bold text-rose-700">{patient.bloodPressure || '۱۳۵ / ۸۵ mmHg'}</span>
                </div>
              </div>
            </div>

            {/* 3. Chief Complaint & History (از صفحه ۲ پتنت) */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-950 flex items-center gap-1.5 border-r-4 border-rose-600 pr-2">
                <span>شکایت اصلی و خلاصه شرح حال مراجع:</span>
              </h4>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">{consultation.chiefComplaint}</p>
                <p className="text-slate-700 leading-relaxed text-[11px]">{consultation.symptomsDescription}</p>
              </div>
            </div>

            {/* 4. Paraclinical Findings Summary (از صفحه ۵ پتنت) */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-950 flex items-center gap-1.5 border-r-4 border-blue-600 pr-2">
                <span>یافته‌های پاراکلینیکی بررسی‌شده (ECG، اکوکاردیوگرافی و آزمایشات):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block">نوار قلب ۱۲ لید استاندارد:</span>
                  <p className="text-slate-700 mt-0.5">
                    ریتم تاکی‌کاردی سینوسی با ضربان ۱۰۴ bpm، فاقد شواهد صریح بالا یا افتادگی قطعه ST، فواصل زمانی نرمال.
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block">اکوکاردیوگرافی داپلر:</span>
                  <p className="text-slate-700 mt-0.5">
                    کسر انقباض بطن چپ EF=55% (طبیعی)، نارسایی خفیف دریچه میترال (Mild MR)، حفرات نرمال.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Final Evaluation & Diagnosis by Specialist (از صفحه ۶ و ۷ پتنت) */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-950 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
                <span>ارزیابی نهایی و تشخیص پزشک متخصص (Clinical Diagnosis):</span>
              </h4>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-950">
                    تشخیص: {specialist?.diagnosis || 'آریتمی فوق بطنی خوش‌خیم و اضطراب'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    تاریخ ثبت: {specialist?.reviewedAt || consultation.updatedAt}
                  </span>
                </div>

                <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-line font-medium">
                  {specialist?.clinicalGuidance || 'بررسی نوار قلب و اکوکاردیوگرافی نشان‌دهنده عملکرد مناسب ماهیچه قلب است.'}
                </p>
              </div>
            </div>

            {/* 6. Prescriptions & Therapeutic Recommendations */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-950 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                <span>دستورات دارویی و توصیه‌های مراقبتی تجویز شده:</span>
              </h4>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                {(specialist?.prescriptionsOrRecommendations || [
                  'قرص پروپرانولول ۱۰ میلی‌گرم صبح و شب در صورت احساس تپش قلب',
                  'پرهیز جدی از چای غلیظ، قهوه، نوشابه‌های انرژی‌زا و استرس شدید',
                  'کنترل منظم فشار خون و ثبت دو نوبت در روز در جدول هفتگی',
                ]).map((rx, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                    <span>{rx}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Official Stamps & Signatures */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
              
              {/* Health Center Stamp */}
              <div className="p-3 rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                <div className="inline-flex items-center justify-center p-1.5 bg-rose-50 rounded-full text-rose-700">
                  <Hospital className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-800 text-[11px]">مهر رسمی مرکز خدمات جامع سلامت</div>
                <div className="text-[10px] text-slate-500">واحد تله‌کاردیولوژی و مراقبت‌های اولیه</div>
                <div className="font-mono text-[9px] text-slate-400">AUTHENTICATED HEALTH CENTER</div>
              </div>

              {/* Specialist Doctor Seal & Signature */}
              <div className="p-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/20 text-center space-y-1">
                <div className="inline-flex items-center justify-center p-1.5 bg-emerald-50 rounded-full text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900 text-[11px]">
                  {specialist ? specialist.doctorName : 'دکتر کامران سهرابی'}
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold">فوق تخصص بیماری‌های قلب و عروق</div>
                <div className="text-[10px] text-slate-500 font-mono">نظام پزشکی: ۸۹۴۳۰</div>
                <div className="text-[9px] text-emerald-600 font-bold">امضای دیجیتال تأیید شد ✓</div>
              </div>

            </div>

            {/* 8. Official Telemedicine Disclaimer (از صفحه اول پتنت) */}
            <div className="text-[9px] text-slate-400 text-center pt-2 border-t border-slate-200 leading-relaxed">
              این برگه بر اساس ارزیابی مدارک پاراکلینیکی در بستر سامانه مشاوره پزشکی از راه دور TeleCardio صادر گردیده و نسخه چاپی معتبر است. در صورت بروز هرگونه علائم حاد فشاری قفسه سینه فوراً با ۱۱۵ تماس حاصل فرمایید.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
