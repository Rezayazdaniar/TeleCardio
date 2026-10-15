export type InteractionSeverity = 'high' | 'moderate' | 'low';

export interface DrugInteractionRule {
  id: string;
  drugA: string;
  drugB: string;
  severity: InteractionSeverity;
  title: string;
  clinicalEffect: string;
  mechanism: string;
  recommendation: string;
}

export interface ChronicMedication {
  id: string;
  name: string;
  dose: string;
  category: string;
  startDate: string;
  prescribingDoctor: string;
  status: 'active' | 'discontinued';
  indication: string;
}

export const INITIAL_CHRONIC_MEDICATIONS: ChronicMedication[] = [
  {
    id: 'chr-1',
    name: 'قرص لوزارتان پتاسیم (Losartan)',
    dose: '۲۵ میلی‌گرم روزانه',
    category: 'مهارکننده گیرنده آنژیوتانسین (ARB)',
    startDate: '۱۳۹۹/۰۲/۱۵',
    prescribingDoctor: 'دکتر مریم کاظمی',
    status: 'active',
    indication: 'کنترل پرفشاری خون مزمن',
  },
  {
    id: 'chr-2',
    name: 'قرص آسپرین (Aspirin)',
    dose: '۸۰ میلی‌گرم روزانه',
    category: 'ضدپلاکت (Antiplatelet)',
    startDate: '۱۴۰۱/۰۵/۱۰',
    prescribingDoctor: 'دکتر کامران سهرابی',
    status: 'active',
    indication: 'پیشگیری اولیه قلبی-عروقی',
  },
  {
    id: 'chr-3',
    name: 'قرص ناپروکسن (Naproxen)',
    dose: '۵۰۰ میلی‌گرم (مصرف متناوب)',
    category: 'ضدالتهاب غیراستروئیدی (NSAID)',
    startDate: '۱۴۰۳/۰۶/۲۰',
    prescribingDoctor: 'پزشک ارتوپد (درد زانو)',
    status: 'active',
    indication: 'تسکین درد مفاصل',
  },
  {
    id: 'chr-4',
    name: 'قرص متفورمین (Metformin)',
    dose: '۵۰۰ میلی‌گرم دو بار در روز',
    category: 'کنترل قند خون (بی‌گوانید)',
    startDate: '۱۴۰۱/۱۰/۱۲',
    prescribingDoctor: 'متخصص غدد',
    status: 'active',
    indication: 'پره‌دیابتیک و قند ناشتای لب‌مرز',
  },
];

export const DRUG_INTERACTION_RULES: DrugInteractionRule[] = [
  {
    id: 'rule-1',
    drugA: 'پروپرانولول',
    drugB: 'وراپامیل',
    severity: 'high',
    title: 'تداخل شدید: بتابلوکر + بلوک‌کننده کانال کلسیم غیر دی‌هیدروپیریدینی',
    clinicalEffect: 'خطر بالای برادی‌کاردی شدید، ایست قلبی سینوسی یا بلوک کامل دهلیزی-بطنی (Complete AV Block) و نارسایی قلبی.',
    mechanism: 'هر دو دارو دارای اثر اینوتروپیک و دروموتروپیک منفی قوی بر گره SA و AV قلب هستند.',
    recommendation: 'از تجویز هم‌زمان اکیداً خودداری شود؛ در صورت نیاز به درمان ترکیبی، از آملودیپین استفاده گردد.',
  },
  {
    id: 'rule-2',
    drugA: 'لوزارتان',
    drugB: 'اسپیرونولاکتون',
    severity: 'high',
    title: 'تداخل با ریسک بالا: لوزارتان (ARB) + اسپیرونولاکتون (دیورتیک نگهدارنده پتاسیم)',
    clinicalEffect: 'افزایش شدید پتاسیم خون (Hyperkalemia) که می‌تواند منجر به آریتمی‌های کشنده قلبی شود.',
    mechanism: 'مهار هم‌زمان آلدوسترون و دفع کلیوی پتاسیم.',
    recommendation: 'پایش دقیق سطح الکترولیت‌ها (پتاسیم و کراتینین سرم) هر دو هفته یک‌بار الزامی است.',
  },
  {
    id: 'rule-3',
    drugA: 'آسپرین',
    drugB: 'ناپروکسن',
    severity: 'high',
    title: 'تداخل مهم: آسپرین + ناپروکسن (NSAIDs)',
    clinicalEffect: 'افزایش چشمگیر خطر خونریزی و زخم‌های گوارشی و خنثی‌سازی اثر ضدپلاکتی محافظتی آسپرین.',
    mechanism: 'رقابت ناپروکسن با آسپرین در مهار استیلاسیون آنزیم COX-1 در پلاکت‌ها.',
    recommendation: 'مصرف ناپروکسن قطع شود و استامینوفن جایگزین گردد یا با فاصله حداقل ۲ ساعت پس از آسپرین میل شود.',
  },
  {
    id: 'rule-4',
    drugA: 'پروپرانولول',
    drugB: 'سالبوتامول',
    severity: 'moderate',
    title: 'تداخل متوسط: بتابلوکر غیرانتخابی + آگونیست بتا-۲ تنفسی',
    clinicalEffect: 'کاهش اثر گشادکنندگی برونش و خطر اسپاسم راه‌های هوایی در بیماران حساس.',
    mechanism: 'مهار متقابل گیرنده‌های بتا-۲ در عضلات صاف ریه.',
    recommendation: 'در بیماران مبتلا به آسم، استفاده از بتابلوکرهای کاردیوسلکتیو (مانند متوپرولول یا بیزوپرولول) ترجیح دارد.',
  },
  {
    id: 'rule-5',
    drugA: 'آتورواستاتین',
    drugB: 'کلاریترومایسین',
    severity: 'high',
    title: 'تداخل شدید: استاتین + آنتی‌بیوتیک ماکرولید',
    clinicalEffect: 'افزایش چند برابری غلظت سرمی استاتین و خطر آسیب حاد عضلانی (Rhabdomyolysis) و نارسایی حاد کلیه.',
    mechanism: 'مهار شدید آنزیم کبدی CYP3A4 توسط کلاریترومایسین.',
    recommendation: 'در طول دوره مصرف آنتی‌بیوتیک، مصرف آتورواستاتین موقتاً متوقف شود.',
  },
  {
    id: 'rule-6',
    drugA: 'لوزارتان',
    drugB: 'ناپروکسن',
    severity: 'moderate',
    title: 'تداخل متوسط: لوزارتان + مسکن NSAID',
    clinicalEffect: 'کاهش اثر کاهنده فشار خون لوزارتان و خطر آسیب کلیوی (افزایش کراتینین).',
    mechanism: 'مهار پروستاگلاندین‌های وازودیلاتور کلیوی توسط ناپروکسن.',
    recommendation: 'پرهیز از مصرف روزانه مسکن‌های NSAID و کنترل منظم فشار خون و عملکرد کلیه.',
  },
];

// Helper to check interactions between a new drug and existing chronic medications
export function checkDrugInteractions(
  newDrugQuery: string,
  chronicMeds: ChronicMedication[]
): DrugInteractionRule[] {
  if (!newDrugQuery || !newDrugQuery.trim()) return [];

  const normalizedQuery = newDrugQuery.toLowerCase();
  const matchedRules: DrugInteractionRule[] = [];

  for (const rule of DRUG_INTERACTION_RULES) {
    const ruleDrugA = rule.drugA.toLowerCase();
    const ruleDrugB = rule.drugB.toLowerCase();

    // Check if new drug matches drugA or drugB
    const newMatchesA = normalizedQuery.includes(ruleDrugA);
    const newMatchesB = normalizedQuery.includes(ruleDrugB);

    if (newMatchesA || newMatchesB) {
      const otherDrugTarget = newMatchesA ? ruleDrugB : ruleDrugA;

      // Check if patient's active chronic medications contain the conflicting drug
      const conflictingChronic = chronicMeds.some(
        (m) => m.status === 'active' && m.name.toLowerCase().includes(otherDrugTarget)
      );

      if (conflictingChronic) {
        matchedRules.push(rule);
      }
    }
  }

  return matchedRules;
}
