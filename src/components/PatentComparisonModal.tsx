import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, CheckCircle2, ArrowLeft, ArrowRight, HeartPulse, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen?: (screen: string) => void;
}

export const PatentComparisonModal: React.FC<Props> = ({ isOpen, onClose, onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const patentScreens = [
    {
      page: 'صفحه ۱',
      title: 'تعهدنامه و شرایط اولیه مشاوره از راه دور (Tele D)',
      originalConcept: 'مشخص کردن قلمرو تخصصی بیماری‌ها، سلب مسئولیت فوریت‌های اورژانسی، تاکید بر عدم خوددرمانی، دکمه‌های دوگانه "شروع شدم، ورود" و "نمی‌پذیرم، خروج".',
      cardiologyAdaptation: 'در کلینیک مجازی قلب، تمرکز تخصصی از بیماری‌های پستان به بیماری‌های قلبی-عروقی تغییر یافت. هشدار صریح علائم اورژانسی سندرم حاد کرونری (درد شدید فشاری قفسه سینه، انتشار به فک و دست چپ، تنگی نفس حاد) و دکمه اتصال مستقیم به ۱۱۵ تعبیه شد.',
      keyAdvantage: 'پیشگیری از خطاهای تریاژ و تضمین ایمنی بالینی بیمار قبل از ورود به چرخه مشاوره غیرحضوری.',
    },
    {
      page: 'صفحه ۲',
      title: 'صفحه اول بعد از ورود: انتخاب پزشک و ثبت سوال',
      originalConcept: 'هدر سامانه، انتخاب پزشک از منوی کشویی، کادر ثبت سوال و دکمه ثبت اولیه.',
      cardiologyAdaptation: 'منوی انتخاب پزشک در کلینیک مجازی قلب به تفکیک فلوشیپ‌ها (آنژیوپلاستی، اکوکاردیوگرافی، آریتمی و پیس‌میکر، تریاژ اولیه) ارائه شد؛ به همراه چک‌لیست ساخت‌یافته علائم قلبی شامل ماهیت درد، محرک‌ها، علائم همراه و مدت زمان.',
      keyAdvantage: 'ساماندهی شرح حال پراکنده به یک قالب استاندارد بالینی کاردیولوژی جهت تسریع زمان ویزیت پزشک.',
    },
    {
      page: 'صفحه ۴',
      title: 'ورود و ثبت‌نام کاربر در سامانه (Authentication)',
      originalConcept: 'فرم ثبت‌نام با فیلدهای نام، نام خانوادگی، شماره همراه، ایمیل، نام کاربری پیشنهادی خودکار (default) و رمز عبور؛ فرم ورود با چک‌باکس پیش‌فرض "مرا به خاطر بسپار".',
      cardiologyAdaptation: 'پیاده‌سازی دقیق منطق پتنت با پیشنهاد خودکار نام کاربری بر اساس کدملی یا شماره همراه، تیک پیش‌فرض "مرا به خاطر بسپار" و سوئیچ سریع بین نقش‌های بیمار، پزشک تریاژ و متخصص.',
      keyAdvantage: 'حفظ سهولت کاربری برای سالمندان و بیماران قلبی و تسریع فرایند ثبت‌نام بدون پیچیدگی‌های زائد.',
    },
    {
      page: 'صفحه ۵',
      title: 'ثبت مدارک پاراکلینیکی و منوی اصلی سیستم',
      originalConcept: 'منوی همبرگری (پروفایل شخصی، ثبت مدارک، سوابق مشاوره)؛ بارگذاری مدارک اولیه شامل ماموگرافی، سونوگرافی، ام‌آرآی، پاتولوژی و سایر.',
      cardiologyAdaptation: 'تبدیل مدارک تشخیصی به ماژول‌های قلب: ۱- نوار قلب ۱۲ لید (ECG)، ۲- اکوکاردیوگرافی داپلر و کسر انقباضی (EF%)، ۳- بیومارکرهای قلبی و تروپونین، ۴- هولتر ریتم و فشار خون ۲۴ ساعته، ۵- آنژیوگرافی و سی‌تی آنژیو.',
      keyAdvantage: 'پوشش کامل ۵ رکن تشخیصی قلب و عروق در یک مرکز سلامت یکپارچه با نمایشگر اختصاصی نوار قلب.',
    },
    {
      page: 'صفحه ۳',
      title: 'غربالگری سطح اول تریاژ و ارجاع هدفمند (Triage Flow)',
      originalConcept: 'بررسی اولیه توسط پزشک سطح اول (تریاژ) جهت screen کردن حالات در صورت شلوغی سامانه؛ پاسخ مقدماتی یا ارجاع به مشاوره تخصصی در صورت عدم کفایت.',
      cardiologyAdaptation: 'طراحی کارتابل پزشک تریاژ مرکز بهداشت با دسته‌بندی سه‌گانه ریسک (سبز: کم‌خطر / زرد: نیازمند متخصص قلب / قرمز: اورژانس حاد). در صورت نیاز، ارجاع سیستمی مستقیم به متخصص قلب ثبت می‌شود.',
      keyAdvantage: 'جلوگیری از شلوغی و اتلاف وقت فوق‌تخصص‌ها با پالایش بیماران در سطح مراقبت‌های اولیه مرکز سلامت.',
    },
    {
      page: 'صفحه ۶',
      title: 'پنل پزشک متخصص و درخواست مدارک تکمیلی',
      originalConcept: 'مشخصات بیمار، شرح پرسش، دکمه‌های مشاهده مدارک، کادر پاسخ پزشک، و چک‌باکس کلیدی: "[درخواست تکمیل اطلاعات از سوی بیمار]" که در صورت انتخاب، فیلد مدارک درخواستی فعال می‌شود.',
      cardiologyAdaptation: 'پیاده‌سازی مو به موی کادر پاسخ بالینی و فعال شدن پنل درخواست مدارک تکمیلی قلبی (مانند درخواست نوار قلب حین تپش، هولتر ریتم یا آزمایش مجدد الکترولیت‌ها و آنزیم‌ها).',
      keyAdvantage: 'مکانیزم حلقه بسته (Closed-Loop Telemedicine)؛ پزشک بدون رد کردن بیمار، مدارک ضروری را استعلام می‌کند.',
    },
    {
      page: 'صفحه ۷',
      title: 'مشاهده نتیجه توسط بیمار و ثبت مدارک درخواستی',
      originalConcept: 'پیام رسمی به بیمار با نام پزشک، متن پاسخ و کادر شرطی: "ضمناً برای دریافت راهنمایی بهتر، پزشک مشاوره مدارک زیر را درخواست کرده است"، به همراه لینک سامانه مشاوره تخصصی.',
      cardiologyAdaptation: 'نمایش پاسخ بالینی و توصیه‌های دارویی، فعال شدن بخش آپلود مدارک تکمیلی به صورت فوری برای بیمار، و دکمه ارجاع حضوری به کلینیک تخصصی قلب مرکز جامع سلامت.',
      keyAdvantage: 'تکمیل چرخه درمان و رضایت بیمار از تداوم مراقبت (Continuity of Care).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-xl shadow-inner">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                <span>تطبیق و معماری ایده: از پتنت اولیه تا کلینیک مجازی قلب</span>
              </h3>
              <p className="text-xs text-rose-200">
                بررسی جزء‌به‌جزء ۷ برگ اسکچ پتنت پروژه و بازآفرینی در سیستم تله‌کاردیولوژی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto">
          {patentScreens.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 shrink-0 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === idx
                  ? 'border-rose-600 text-rose-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px]">
                {item.page}
              </span>
              <span>{item.title.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
                {patentScreens[activeTab].page} از پتنت اولیه
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {patentScreens[activeTab].title}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Original Sketch Concept */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>مفهوم در اسکچ اولیه پتنت (Tele D):</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                {patentScreens[activeTab].originalConcept}
              </p>
            </div>

            {/* Box 2: Cardiology Adaptation */}
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="font-bold text-rose-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>انطباق تخصصی برای کلینیک مجازی قلب:</span>
              </div>
              <p className="text-rose-950 leading-relaxed text-xs font-medium">
                {patentScreens[activeTab].cardiologyAdaptation}
              </p>
            </div>

          </div>

          {/* Advantage Banner */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block text-xs">
                مزیت بالینی و ارزش‌آفرینی در مرکز بهداشت:
              </span>
              <p className="text-emerald-900 leading-relaxed mt-0.5">
                {patentScreens[activeTab].keyAdvantage}
              </p>
            </div>
          </div>

          {/* Ideas for Health Center Deployment */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2 text-xs text-blue-950">
            <span className="font-bold block flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-700" />
              ایده‌های کلیدی پیاده‌سازی برای مراکز جامع سلامت:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li><span className="font-bold">استفاده از بهورز یا پرستار مرکز بهداشت:</span> بیمار در خانه یا خانه بهداشت نوار قلب می‌گیرد و فوراً در سامانه بارگذاری می‌کند.</li>
              <li><span className="font-bold">سیستم تریاژ دو سطحی (Two-Tier):</span> پزشک عمومی مرکز بهداشت موارد ساده را پاسخ می‌دهد و تنها موارد شک به ایسکمی یا آریتمی را به کاردیولوژیست ارجاع می‌دهد.</li>
              <li><span className="font-bold">حلقه درخواست مدارک تکمیلی ( ص ۶ و ۷):</span> مانع از ارجاع‌های حضوری مکرر و بیهوده برای انجام هولتر یا آزمایش مجدد می‌گردد.</li>
            </ul>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
              disabled={activeTab === 0}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>صفحه قبلی پتنت</span>
            </button>

            <span className="font-mono text-slate-400">
              {activeTab + 1} از {patentScreens.length}
            </span>

            <button
              onClick={() => setActiveTab((prev) => Math.min(patentScreens.length - 1, prev + 1))}
              disabled={activeTab === patentScreens.length - 1}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>صفحه بعدی پتنت</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
