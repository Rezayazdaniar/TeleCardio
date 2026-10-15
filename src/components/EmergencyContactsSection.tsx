import React, { useState } from 'react';
import { 
  PhoneCall, AlertTriangle, ShieldAlert, Plus, Trash2, Edit2, 
  CheckCircle2, Star, UserCheck, MessageSquare, Copy, Check, 
  Ambulance, MapPin, HeartHandshake, PhoneForwarded, Info, Siren, ExternalLink
} from 'lucide-react';
import { EmergencyContact, PatientUser } from '../types';

interface Props {
  patient: PatientUser;
  onUpdatePatient: (updated: PatientUser) => void;
  onTriggerPushAlert?: (title: string, message: string) => void;
}

const OFFICIAL_EMERGENCY_NUMBERS = [
  {
    number: '115',
    title: 'اورژانس پیش‌بیمارستانی کشور',
    subtitle: 'فوریت‌های پزشکی و انتقال آمبولانس اورژانس قلب',
    iconColor: 'bg-red-600 text-white',
    badge: '۲۴ ساعته رایگان',
    type: 'medical',
  },
  {
    number: '190',
    title: 'مرکز اطلاع‌رسانی داروها و سموم (وزارت بهداشت)',
    subtitle: 'مشاوره فوری عوارض جانبی حاد و مسمومیت دارویی',
    iconColor: 'bg-emerald-600 text-white',
    badge: 'پاسخگویی دارویی',
    type: 'pharma',
  },
  {
    number: '112',
    title: 'ندای امداد هلال احمر',
    subtitle: 'امداد و نجات جاده‌ای و بحران‌های کوهستانی و حوادث',
    iconColor: 'bg-rose-500 text-white',
    badge: 'امداد و نجات',
    type: 'rescue',
  },
  {
    number: '125',
    title: 'سازمان آتش‌نشانی و خدمات ایمنی',
    subtitle: 'امداد حوادث، باز کردن درب‌های بسته در شرایط اضطرار',
    iconColor: 'bg-amber-600 text-white',
    badge: 'ایمنی شهری',
    type: 'fire',
  },
];

export const EmergencyContactsSection: React.FC<Props> = ({
  patient,
  onUpdatePatient,
  onTriggerPushAlert,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    patient.emergencyContacts || []
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState('همسر');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);

  // Quick readout copied state
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [showSymptomsGuide, setShowSymptomsGuide] = useState(true);

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormRelationship('همسر');
    setFormPhone('');
    setFormNotes('');
    setFormAddress('');
    setFormIsPrimary(contacts.length === 0);
    setShowAddModal(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormRelationship(contact.relationship);
    setFormPhone(contact.phoneNumber);
    setFormNotes(contact.notes || '');
    setFormAddress(contact.address || '');
    setFormIsPrimary(Boolean(contact.isPrimary));
    setShowAddModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    let updatedList: EmergencyContact[];

    if (editingContact) {
      updatedList = contacts.map((c) => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name: formName.trim(),
            relationship: formRelationship.trim(),
            phoneNumber: formPhone.trim(),
            notes: formNotes.trim(),
            address: formAddress.trim(),
            isPrimary: formIsPrimary,
          };
        }
        return formIsPrimary ? { ...c, isPrimary: false } : c;
      });
    } else {
      const newContact: EmergencyContact = {
        id: `ec-${Date.now()}`,
        name: formName.trim(),
        relationship: formRelationship.trim(),
        phoneNumber: formPhone.trim(),
        notes: formNotes.trim(),
        address: formAddress.trim(),
        isPrimary: formIsPrimary || contacts.length === 0,
      };

      updatedList = formIsPrimary
        ? [...contacts.map((c): EmergencyContact => ({ ...c, isPrimary: false })), newContact]
        : [...contacts, newContact];
    }

    setContacts(updatedList);
    onUpdatePatient({
      ...patient,
      emergencyContacts: updatedList,
    });

    if (onTriggerPushAlert) {
      onTriggerPushAlert(
        'مخاطبین اضطراری به‌روزرسانی شد',
        `اطلاعات مخاطب اضطراری «${formName.trim()}» با موفقیت در پرونده سلامت ذخیره گردید.`
      );
    }

    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    // If deleted one was primary, pick first
    if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setContacts(updated);
    onUpdatePatient({
      ...patient,
      emergencyContacts: updated,
    });
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setContacts(updated);
    onUpdatePatient({
      ...patient,
      emergencyContacts: updated,
    });
  };

  // Text summary for 115 operator
  const dispatcherText = `اطلاعات بیمار قلبی برای اورژانس ۱۱۵:
نام بیمار: ${patient.firstName} ${patient.lastName} (${patient.age} ساله - ${patient.gender})
کد ملی: ${patient.nationalCode} | تلفن: ${patient.phoneNumber}
سوابق بیماری قلبی: ${patient.medicalHistory.join('، ') || 'ثبت نشده'}
داروهای مصرفی: ${patient.currentMedications.join('، ') || 'ثبت نشده'}
فشار خون معمول: ${patient.bloodPressure || 'نامشخص'}
مخاطب اصلی همراه: ${primaryContact ? `${primaryContact.name} (${primaryContact.relationship} - ${primaryContact.phoneNumber})` : 'ثبت نشده'}`;

  const handleCopyDispatcherText = () => {
    navigator.clipboard.writeText(dispatcherText);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO CARD: DIRECT CALL 115 & URGENT CARDIAC SYMPTOMS */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-500/40 relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-950/20 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/60 backdrop-blur-md text-amber-200 rounded-full text-xs font-bold border border-red-400/40 animate-pulse">
              <Siren className="w-4 h-4 text-amber-300" />
              <span>اقدام فوری هنگام بروز علائم حاد قلبی (Emergency Action)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              تماس مستقیم و بی‌درنگ با اورژانس ۱۱۵
            </h2>

            <p className="text-red-100 text-xs sm:text-sm leading-relaxed">
              در صورت احساس درد کوبنده در قفسه سینه، سوزش شدید جناغ، انتشار درد به بازوی چپ، فک، گردن یا پشت، تنگی نفس ناگهانی، سرگیجه حاد یا تعریق سرد ناگهانی، اتلاف وقت جایز نیست. فوراً با اورژانس تماس بگیرید.
            </p>
          </div>

          {/* Quick Action Dial 115 Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <a
              href="tel:115"
              className="px-6 py-4 bg-white text-red-700 hover:bg-amber-50 active:scale-95 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all duration-200 border-2 border-white/80 group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-red-500 uppercase tracking-wider">
                  شماره‌گیری فوری تلفنی
                </span>
                <span className="text-xl font-black text-slate-900">
                  تماس مستقیم با ۱۱۵
                </span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => setShowSymptomsGuide(!showSymptomsGuide)}
              className="px-4 py-2 bg-red-800/80 hover:bg-red-800 text-red-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-red-400/30 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showSymptomsGuide ? 'بستن راهنمای اقدامات تا رسیدن ۱۱۵' : 'راهنمای اقدامات حیاتی تا رسیدن ۱۱۵'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Critical Cardiac First-Aid Guide */}
        {showSymptomsGuide && (
          <div className="mt-6 pt-6 border-t border-red-500/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-red-800/50 backdrop-blur-xs rounded-2xl p-4 border border-red-400/30 space-y-2">
              <h4 className="font-bold text-amber-200 flex items-center gap-2 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>علائم هشداردهنده حمله قلبی (Red Flags):</span>
              </h4>
              <ul className="space-y-1.5 text-red-100 pr-4 list-disc marker:text-amber-300">
                <li>احساس فشار، سنگینی یا سوزش مبهم در مرکز قفسه سینه (بیش از ۵ دقیقه)</li>
                <li>انتشار درد به شانه، دست چپ، بازوها، گلو، فک تحتانی یا پشت کتف</li>
                <li>تنگی نفس همراه یا بدون درد قفسه سینه و احساس خفگی</li>
                <li>تعریق سرد شدید، تهوع، احساس سرگیجه ناگهانی یا افت شدید هوشیاری</li>
              </ul>
            </div>

            <div className="bg-red-800/50 backdrop-blur-xs rounded-2xl p-4 border border-red-400/30 space-y-2">
              <h4 className="font-bold text-emerald-200 flex items-center gap-2 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>اقدامات طلایی تا رسیدن آمبولانس ۱۱۵:</span>
              </h4>
              <ul className="space-y-1.5 text-red-100 pr-4 list-disc marker:text-emerald-300">
                <li><strong className="text-white">توقف کامل تحرک:</strong> در وضعیت نیمه‌نشسته (زاویه ۴۵ درجه) تکیه دهید.</li>
                <li><strong className="text-white">مصرف آسپرین:</strong> در صورت عدم حساسیت، ۱ عدد آسپرین ۳۰۰mg بجوید.</li>
                <li><strong className="text-white">نیتروگلیسیرین:</strong> در صورت تجویز قبلی متخصص، ۱ قرص زیرزبانی قرار دهید.</li>
                <li><strong className="text-white">باز کردن فضا:</strong> یقه لباس را باز کرده و درِ ورودی خانه را برای امدادگران باز بگذارید.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 2. DISPATCHER QUICK READOUT HELPER */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                کارت اطلاعات بالینی جهت قرائت برای اپراتور ۱۱۵
              </h3>
              <p className="text-xs text-slate-500">
                هنگام تماس با ۱۱۵، می‌توانید این اطلاعات را سریعاً برای ارسال دقیق‌تر آمبولانس اعلام کنید.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyDispatcherText}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedInfo ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>کپی متن برای ارسال یا خواندن</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
          {dispatcherText}
        </div>
      </div>

      {/* 3. OFFICIAL & LOCAL EMERGENCY NUMBERS DIRECT DIAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <PhoneForwarded className="w-4 h-4 text-red-600" />
            <span>شماره‌های ضروری و امدادی رسمی کشور (تماس سریع):</span>
          </h3>
          <span className="text-xs text-slate-400">بدون نیاز به پیش‌شماره</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {OFFICIAL_EMERGENCY_NUMBERS.map((item) => (
            <div
              key={item.number}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${item.iconColor} flex items-center justify-center font-black text-lg shadow-xs`}>
                    {item.number}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>تماس با {item.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PATIENT'S PERSONAL & LOCAL EMERGENCY CONTACTS */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              <span>مخاطبین اضطراری شخصی و محلی بیمار</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              شماره اعضای خانواده، پزشک معالج، همسایه نزدیک یا درمانگاه محل برای دسترسی و اطلاع‌رسانی سریع
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مخاطب اضطراری جدید</span>
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">
              هنوز مخاطب اضطراری ثبت نشده است
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              توصیه انجمن قلب: حداقل یک نفر از نزدیکان مطلع از بیماری و کلیددار منزل را به عنوان مخاطب اضطراری ثبت کنید.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              افزودن اولین مخاطب
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 rounded-2xl border transition-all ${
                  contact.isPrimary
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {contact.name}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-200/80 text-slate-700">
                        {contact.relationship}
                      </span>
                      {contact.isPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>مخاطب اصلی (Primary)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-700 font-bold">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.phoneNumber}</span>
                    </div>

                    {contact.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.address}</span>
                      </div>
                    )}

                    {contact.notes && (
                      <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/80 mt-1.5 leading-relaxed">
                        📝 {contact.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(contact)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                      title="ویرایش مخاطب"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="حذف مخاطب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick actions for this contact */}
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/80">
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>تماس مستقیم</span>
                  </a>

                  <a
                    href={`sms:${contact.phoneNumber}?body=${encodeURIComponent(
                      `سلام، من علائم حاد قلبی دارم و با ۱۱۵ تماس گرفته‌ام. لطفاً فوراً با من تماس بگیرید یا به منزل بیایید.`
                    )}`}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    title="ارسال پیامک اضطراری"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>پیامک اضطرار</span>
                  </a>

                  {!contact.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(contact.id)}
                      className="px-2.5 py-1.5 text-[11px] text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                    >
                      انتخاب به عنوان مخاطب اصلی
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MODAL: ADD / EDIT EMERGENCY CONTACT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingContact ? 'ویرایش مخاطب اضطراری' : 'ثبت مخاطب اضطراری جدید'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    اطلاعات فرد مورد اعتماد برای دسترسی سریع در زمان حمله قلبی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی مخاطب: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: مریم رسولی"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نسبت یا نوع ارتباط: *
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 outline-none text-xs bg-white"
                  >
                    <option value="همسر">همسر</option>
                    <option value="فرزند">فرزند</option>
                    <option value="پدر / مادر">پدر / مادر</option>
                    <option value="خواهر / برادر">خواهر / برادر</option>
                    <option value="پزشک معالج قلب">پزشک معالج قلب</option>
                    <option value="پزشک خانواده">پزشک خانواده</option>
                    <option value="همسایه نزدیک">همسایه نزدیک (دارای کلید)</option>
                    <option value="درمانگاه شبانه‌روزی محل">درمانگاه شبانه‌روزی محل</option>
                    <option value="سایر">سایر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شماره تماس همراه یا ثابت: *
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹ یا ۰۲۱۲۲۰۰۱۱۰۰"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 outline-none text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  آدرس یا فاصله تقریبی (اختیاری):
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="مثال: تهران، خیابان دولت - ۵ دقیقه فاصله تا منزل"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  توضیحات و نکات مهم (اختیاری):
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="مثال: دارای کلید اضافه منزل است، از حساسیت به پنی‌سیلین و داروهای قلبی مطلع است..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="primaryContactCheckbox" className="font-bold text-slate-800 cursor-pointer">
                  انتخاب به عنوان مخاطب اصلی و اولویت اول اضطراری
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ذخیره مخاطب اضطراری</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
