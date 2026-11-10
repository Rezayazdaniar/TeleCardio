import React from 'react';
import {
  Activity, ArrowLeft, ArrowLeftCircle, CheckCircle2, Clock,
  Heart, HeartPulse, ShieldCheck, Sparkles, Stethoscope,
  Video, BookOpen, ClipboardList, AlertTriangle
} from 'lucide-react';

interface Props {
  onStartTriageChat: () => void;
  onOpenLogin: () => void;
}

export const PublicLandingPage: React.FC<Props> = ({
  onStartTriageChat,
  onOpenLogin,
}) => {
  return (
    <div dir="rtl" className="bg-white text-slate-800">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-teal-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold text-sky-800 shadow-sm">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              سلامت قلب، کیفیت زندگی
            </div>
            <h1 className="text-3xl font-black leading-[1.6] text-slate-900 sm:text-4xl lg:text-5xl">
              مراقبت هوشمند از قلب،
              <span className="block text-sky-700">آسان‌تر و در دسترس‌تر</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600 sm:text-base">
              TeleCardio بستری برای ارزیابی اولیه علائم قلبی، ثبت اطلاعات سلامت
              و ارتباط ساختاریافته با پزشکان است. گفت‌وگوی هوشمند تریاژ به شما
              کمک می‌کند اطلاعات اولیه خود را مرحله‌به‌مرحله ثبت کنید.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartTriageChat}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-sky-700/20 transition hover:bg-sky-800"
              >
                <Sparkles className="h-5 w-5" />
                شروع ارزیابی هوشمند
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenLogin}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-sky-400 hover:text-sky-800"
              >
                ورود یا ثبت‌نام
              </button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> ثبت ساختاریافته اطلاعات</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-600" /> دسترسی آنلاین</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-sky-200/40 blur-2xl" />
            <img
              src="/images/telecardio-heart-hero.png"
              alt="تصویر سلامت قلب و سامانه TeleCardio"
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl ring-1 ring-slate-200"
            />
            <div className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800">مراقبت آگاهانه از قلب</p>
                <p className="mt-1 text-[10px] text-slate-500">اطلاعات دقیق‌تر، تصمیم‌گیری بهتر</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-extrabold text-sky-700">خدمات TeleCardio</span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">یک مسیر منظم برای پیگیری سلامت قلب</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">ابزارهای سامانه برای جمع‌آوری اطلاعات و تسهیل ارتباط بیمار و تیم درمان طراحی شده‌اند.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'تریاژ هوشمند قلب', text: 'پاسخ به پرسش‌های مرحله‌ای درباره علائم و سوابق مرتبط برای تهیه خلاصه ارزیابی اولیه.' },
            { icon: ClipboardList, title: 'پرونده و سوابق سلامت', text: 'ثبت و نگهداری اطلاعات و مدارک پزشکی و دسترسی به سوابق مشاوره پس از ورود.' },
            { icon: Stethoscope, title: 'ارتباط با پزشک', text: 'ارسال اطلاعات ساختاریافته برای بررسی پزشک و پیگیری پاسخ‌های تخصصی در سامانه.' },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-9 text-center">
            <span className="text-xs font-extrabold text-sky-700">شروع استفاده</span>
            <h2 className="mt-3 text-2xl font-black text-slate-900">چطور از تریاژ هوشمند استفاده کنید؟</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: '۱', title: 'ورود یا ایجاد حساب', text: 'حساب بیمار بسازید یا با حساب فعال خود وارد شوید.' },
              { n: '۲', title: 'پاسخ به پرسش‌ها', text: 'علائم، زمان شروع و اطلاعات سلامت خود را با دقت ثبت کنید.' },
              { n: '۳', title: 'بررسی و پیگیری', text: 'خلاصه اطلاعات و وضعیت پیگیری را در حساب خود مشاهده کنید.' },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-lg font-black text-white">{step.n}</span>
                <h3 className="mt-4 font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600"><Video className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-extrabold text-slate-900">راهنمای ویدئویی استفاده از سامانه</h3>
                  <p className="mt-1 text-xs text-slate-500">آموزش گام‌به‌گام چت تریاژ</p>
                </div>
              </div>
              <div className="mt-5 flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                <Video className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">ویدئوی آموزشی هنوز بارگذاری نشده است</p>
                <p className="mt-1 text-xs text-slate-400">پس از آماده‌شدن فایل، این بخش به پخش‌کننده ویدئو تبدیل می‌شود.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><BookOpen className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-extrabold text-slate-900">آموزش سلامت قلب</h3>
                  <p className="mt-1 text-xs text-slate-500">نکات پایه برای مراقبت روزمره</p>
                </div>
              </div>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span><strong className="text-slate-800">کنترل عوامل خطر:</strong> فشارخون، قند و چربی خون را طبق نظر پزشک پیگیری کنید.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span><strong className="text-slate-800">سبک زندگی:</strong> فعالیت بدنی متناسب، تغذیه متعادل و پرهیز از دخانیات اهمیت دارند.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span><strong className="text-slate-800">پیگیری درمان:</strong> داروها را خودسرانه قطع یا جایگزین نکنید و مراجعات پزشکی را ادامه دهید.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs font-extrabold text-emerald-700">تیم درمان</span>
            <h2 className="mt-3 text-2xl font-black text-slate-900">پزشکان و متخصصان همکار</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600">اطلاعات پزشکان، تخصص‌ها و تصاویر رسمی پس از تأیید و دریافت مشخصات معتبر در این بخش معرفی خواهد شد.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-200">
                  <Stethoscope className="h-9 w-9" />
                </div>
                <p className="mt-4 font-extrabold text-slate-700">معرفی پزشک همکار</p>
                <p className="mt-2 text-xs text-slate-500">تصویر و مشخصات تأییدشده پزشک در این قسمت قرار می‌گیرد.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-rose-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-rose-700" />
            <div>
              <h2 className="font-extrabold text-rose-900">هشدار پزشکی مهم</h2>
              <p className="mt-1 text-sm leading-7 text-rose-800">در صورت درد یا فشار شدید قفسه سینه، تنگی نفس شدید، غش یا علائم ناگهانی نگران‌کننده، منتظر پاسخ سامانه نمانید و فوراً با اورژانس ۱۱۵ تماس بگیرید.</p>
            </div>
          </div>
          <button type="button" onClick={onStartTriageChat} className="shrink-0 rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold text-white hover:bg-rose-800">شروع ارزیابی اولیه</button>
        </div>
      </section>

      <div className="border-t border-slate-200 bg-slate-900 px-4 py-8 text-center text-xs leading-7 text-slate-400">
        <div className="mb-2 flex items-center justify-center gap-2 font-extrabold text-white">
          <Heart className="h-4 w-4 text-rose-400" /> TeleCardio
        </div>
        سامانه تله‌کاردیولوژی و مراقبت مجازی قلب و عروق
        <p className="mt-2">این سامانه جایگزین تشخیص، معاینه یا درمان حضوری و خدمات اورژانسی نیست.</p>
      </div>
    </div>
  );
};
