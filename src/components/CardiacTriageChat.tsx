import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, AlertTriangle, ShieldAlert, PhoneCall, 
  Clock, Plus, CheckCircle2, ChevronRight, Stethoscope, ArrowRight, ArrowLeft,
  MessageSquare, Trash2, Heart, Search, ChevronLeft, Menu, Activity,
  FileText, Check, Share2
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types/chat';
import { DOCTORS, CURRENT_PATIENT } from '../data/mockData';
import { Doctor, ConsultationInquiry, TriageSeverity } from '../types';

interface Props {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (updated: ChatSession) => void;
  onReferToDoctor: (session: ChatSession, doctor: Doctor, triageNotes: string, severity: TriageSeverity) => void;
  onBackToHome: () => void;
  onOpenDoctorPanel: () => void;
  onOpenEmergencyContacts: () => void;
}

export const CardiacTriageChat: React.FC<Props> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onUpdateSession,
  onReferToDoctor,
  onBackToHome,
  onOpenDoctorPanel,
  onOpenEmergencyContacts,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  // Determine smart doctor matching based on keywords
  const determineBestSpecialist = (conversationText: string): { doctor: Doctor; reason: string; severity: TriageSeverity; urgencyScore: number } => {
    const lower = conversationText.toLowerCase();

    // Check for critical emergencies
    if (
      lower.includes('بی‌هوش') || lower.includes('غش') || lower.includes('سنکوپ') || 
      lower.includes('درد وحشتناک') || lower.includes('عرق سرد شدید') || lower.includes('تنگی نفس شدید در حالت خوابیده')
    ) {
      return {
        doctor: DOCTORS[1], // Dr. Sohrabi
        reason: 'اورژانس قلبی: علائم هشدار دهنده سنکوپ یا سندروم حاد کرونری (ACS)',
        severity: 'emergency',
        urgencyScore: 98,
      };
    }

    // Arrhythmia & Palpitations
    if (lower.includes('تپش') || lower.includes('نامنظم') || lower.includes('ریتم') || lower.includes('ضربان جا افتاده') || lower.includes('pvc')) {
      return {
        doctor: DOCTORS[3], // Dr. Behzad Farahmand (Arrhythmia & EP)
        reason: 'تطابق ۹۵٪: شکایت غالب بیمار اختلال ریتم و تپش قلب (آریتمی و الکتروفیزیولوژی)',
        severity: 'moderate',
        urgencyScore: 68,
      };
    }

    // Dyspnea & Valve issues
    if (lower.includes('تنگی نفس') || lower.includes('ورم پا') || lower.includes('دریچه') || lower.includes('پله') || lower.includes('اکو')) {
      return {
        doctor: DOCTORS[2], // Dr. Niloofar Afshar (Echo & Valve)
        reason: 'تطابق ۹۳٪: علائم تنگی نفس فعالیتی نیازمند اکوکاردیوگرافی داپلر و بررسی حفرات قلبی',
        severity: 'high',
        urgencyScore: 82,
      };
    }

    // Default: Chest Pain / Ischemia / Angina
    return {
      doctor: DOCTORS[1], // Dr. Kamran Sohrabi (Interventional)
      reason: 'تطابق ۹۶٪: علائم مشکوک به دردهای آنژینی قفسه سینه، ایسکمی عروق کرونر و کنترل فشار خون',
      severity: 'high',
      urgencyScore: 86,
    };
  };

  // Empathetic and lightly humorous AI response generator
  const generateEmpatheticResponse = (userMsg: string, messageHistory: ChatMessage[]) => {
    const text = userMsg.trim();
    const count = messageHistory.length;

    // Check for acute emergency keywords
    if (text.includes('درد شدید چپ') || text.includes('تیر به فک') || text.includes('عرق سرد') || text.includes('غش')) {
      const match = determineBestSpecialist(text);
      return {
        text: '🚨 دوست عزیزم، با توجه به اشاره به درد شدید، تیرکشیدن به فک یا عرق سرد، این‌ها علائم اورژانسی قلب هستند! لطفاً آرامش خودت رو حفظ کن، روی صندلی یا زمین بشین و فوراً با اورژانس ۱۱۵ تماس بگیر. من هم همزمان این اطلاعات رو با بالاترین فوریت برای پزشک متخصص ارسال می‌کنم.',
        triageAssessment: {
          severity: 'emergency' as TriageSeverity,
          urgencyScore: 98,
          matchedDoctor: match.doctor,
          matchReason: match.reason,
          clinicalSummary: `شکایت حاد درد قفسه سینه با انتشار و علائم واگوتونیک. نیاز فوری به ارزیابی اورژانس پیش‌بیمارستانی ۱۱۵.`,
          actionAdvice: 'تماس آنی با ۱۱۵ — قرار گرفتن در وضعیت نیمه‌نشسته — عدم فعالیت فیزیکی.',
        },
        quickReplies: ['تماس با ۱۱۵', 'مخاطبین اضطراری', 'حالم کمی بهتر شد'],
      };
    }

    // Step 1: Inquiring about symptom characteristics
    if (count <= 2) {
      return {
        text: 'ممنون که اینقدر دقیق گفتی. قلب آدم گاهی مثل زنگ هشدار یک ماشین حساس کار می‌کنه؛ حتی یه سرماخوردگی ساده یا یه چای پررنگ هم می‌تونه ساز مخالف بزنه! بهم بگو این حس دقیقاً از کی شروع شده؟ و آیا موقع راه رفتن یا فعالیت بدتر میشه یا موقع استراحت هم حسش می‌کنی؟',
        quickReplies: [
          'فقط موقع راه رفتن و فعالیت',
          'بیشتر در حال استراحت و شب‌ها',
          'دائم و پیوسته است',
          'با استرس روحی بیشتر میشه',
        ],
      };
    }

    // Step 2: Risk factors & medications
    if (count <= 4) {
      return {
        text: 'خیلی خوب متوجه شدم. راستی، وضعیت فشار خون یا قند خونت چطوره؟ و اینکه آیا داروی قلبی یا فشار خاصی الان مصرف می‌کنی یا سابقه فامیلی بیماری قلبی داری؟ (اگه دوست داری سن تقریبی‌ت رو هم بگو تا ارزیابی‌مون دقیق‌تر از ساعت سوئیسی بشه!)',
        quickReplies: [
          'فشار خون دارم و دارو مصرف می‌کنم',
          'سابقه فامیلی قلبی دارم',
          'قند خون یا چربی خون بالا دارم',
          'هیچ دارویی مصرف نمی‌کنم',
        ],
      };
    }

    // Step 3: Triage Complete & Smart Referral
    const allText = [...messageHistory.map((m) => m.text), userMsg].join(' ');
    const match = determineBestSpecialist(allText);

    return {
      text: `اطلاعاتت رو کامل تحلیل کردم. از اینکه صبورانه پاسخ دادی ممنونم. هوای قلبت رو داشتن وظیفه ماست! 
خبر خوب اینکه علائم حاد سقوط فشار یا ایست تنفسی دیده نمیشه، اما با توجه به ویژگی‌های اعلامی، پرونده‌ت رو دسته‌بندی کردم و بر اساس بیشترین تطابق بالینی، به **${match.doctor.name} (${match.doctor.title})** ارجاع دادم. ایشون به زودی نظرشون رو مستقیماً برات همین‌جا ارسال می‌کنن!`,
      triageAssessment: {
        severity: match.severity,
        urgencyScore: match.urgencyScore,
        matchedDoctor: match.doctor,
        matchReason: match.reason,
        clinicalSummary: `بیمار با شکایت ${userMsg.slice(0, 80)}... تریاژ هوشمند نشان‌دهنده نیاز به بررسی بالینی تخصصی است.`,
        actionAdvice: `ارجاع به ${match.doctor.name} جهت پایش تخصصی و تعیین پروتکل درمانی.`,
      },
      quickReplies: [
        'متشکرم، منتظر پاسخ پزشکم',
        'مشاهده سوابق و نسخه',
        'چطور نوبت حضوری بگیرم؟',
      ],
    };
  };

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || !activeSession) return;

    const patientMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: message,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeSession.messages, patientMsg];

    const updatedSession: ChatSession = {
      ...activeSession,
      messages: updatedMessages,
      updatedAt: 'هم‌اکنون',
    };

    onUpdateSession(updatedSession);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      const aiReply = generateEmpatheticResponse(message, updatedMessages);
      
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply.text,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: aiReply.quickReplies,
        triageAssessment: aiReply.triageAssessment,
      };

      const finalMessages = [...updatedMessages, aiMsg];
      
      let newStatus = updatedSession.status;
      let assignedDocId = updatedSession.assignedDoctorId;
      let assignedDocName = updatedSession.assignedDoctorName;
      let urgencySev = updatedSession.urgencySeverity;
      let urgencyScr = updatedSession.urgencyScore;

      if (aiReply.triageAssessment) {
        newStatus = 'referred';
        assignedDocId = aiReply.triageAssessment.matchedDoctor.id;
        assignedDocName = aiReply.triageAssessment.matchedDoctor.name;
        urgencySev = aiReply.triageAssessment.severity;
        urgencyScr = aiReply.triageAssessment.urgencyScore;

        // Trigger system referral handler to sync with Doctor panel
        onReferToDoctor(
          { ...updatedSession, messages: finalMessages },
          aiReply.triageAssessment.matchedDoctor,
          aiReply.triageAssessment.clinicalSummary,
          aiReply.triageAssessment.severity
        );
      }

      const finalSession: ChatSession = {
        ...updatedSession,
        messages: finalMessages,
        status: newStatus,
        assignedDoctorId: assignedDocId,
        assignedDoctorName: assignedDocName,
        urgencySeverity: urgencySev,
        urgencyScore: urgencyScr,
      };

      onUpdateSession(finalSession);
      setIsTyping(false);
    }, 1200);
  };

  // Filtered sessions for sidebar
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-[calc(100dvh-60px)] flex overflow-hidden bg-slate-50 font-['Vazirmatn',system-ui,sans-serif]">
      
      {/* ========================================================
          SIDEBAR: CHAT HISTORY (ChatGPT / Claude / Gemini Style)
         ======================================================== */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-72 sm:w-80 bg-slate-900 text-slate-100 flex flex-col justify-between 
        transition-transform duration-300 ease-in-out border-l border-slate-800
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header & New Chat */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                سابقه گفتگوها
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button (ChatGPT Style) */}
          <button
            onClick={() => {
              onNewSession();
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>شروع گفتگوی جدید تریاژ</span>
          </button>

          {/* Search Bar in History */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در سوابق گفتگو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
            گفتگوهای اخیر ({filteredSessions.length})
          </div>

          {filteredSessions.map((sess) => {
            const isSelected = sess.id === activeSession?.id;
            return (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess.id);
                  setSidebarOpen(false);
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-right ${
                  isSelected 
                    ? 'bg-slate-800 text-white border border-sky-500/40 shadow-xs' 
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {sess.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sess.createdAt.split(' - ')[0]}
                      </span>
                      {sess.status === 'answered_by_doctor' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          پاسخ پزشک
                        </span>
                      )}
                      {sess.status === 'referred' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                          ارجاع شده
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button on hover */}
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('آیا این گفتگو حذف شود؟')) {
                        onDeleteSession(sess.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded-md transition-opacity"
                    title="حذف گفتگو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Doctor Portal Link */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <button
            onClick={onOpenDoctorPanel}
            className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>ورود به کارتابل پزشک متخصص</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1">
            <span>کاربر فعال: {CURRENT_PATIENT.firstName} {CURRENT_PATIENT.lastName}</span>
            <button 
              onClick={onBackToHome}
              className="text-sky-400 hover:underline font-medium"
            >
              صفحه اصلی
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ========================================================
          MAIN CHAT CONTAINER
         ======================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Top Chat Bar */}
        <header className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle History Sidebar button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              title="مشاهده سوابق چت"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* AI Assistant Avatar & Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-white text-sky-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
                    دستیار هوشمند تریاژ قلب
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  پاسخگویی همدلانه، ارزیابی فوریت بالینی و ارجاع مستقیم به فوق‌تخصص
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmergencyContacts}
              className="px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="hidden sm:inline">تماس ۱۱۵</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
            >
              <span>بازگشت</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-3xl w-full mx-auto">
          
          {/* Welcome Capsule if few messages */}
          {activeSession?.messages.length <= 1 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50/50 to-blue-50 border border-sky-100 text-center my-2 space-y-2">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                سیستم گفتگوی هوشمند ارزیابی ریسک قلب
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                علائم خودت را به زبان ساده بگو. دستیار ما با همدلی و دقت کامل، شرایط قلبی‌ات را تریاژ کرده و به متناسب‌ترین پزشک متخصص ارجاع می‌دهد.
              </p>
            </div>
          )}

          {/* Message Thread */}
          {activeSession?.messages.map((msg) => {
            const isPatient = msg.sender === 'patient';
            const isSystem = msg.sender === 'system';
            const isDoctor = msg.sender === 'doctor';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-4 py-1.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-right ${isPatient ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                  isPatient 
                    ? 'bg-slate-700 text-white' 
                    : isDoctor
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 text-white'
                }`}>
                  {isPatient ? (
                    <User className="w-4 h-4" />
                  ) : isDoctor ? (
                    <Stethoscope className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4 fill-white" />
                  )}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2.5`}>
                  
                  {/* Speech bubble */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isPatient
                      ? 'bg-[#1b739e] text-white rounded-tr-none'
                      : isDoctor
                        ? 'bg-emerald-50 text-slate-800 border border-emerald-200 rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line font-medium">
                      {msg.text}
                    </p>
                    <div className={`text-[10px] mt-1 font-mono ${isPatient ? 'text-sky-200 text-left' : 'text-slate-400 text-right'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* AI TRIAGE ASSESSMENT CARD */}
                  {msg.triageAssessment && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3 text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          msg.triageAssessment.severity === 'emergency' 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : msg.triageAssessment.severity === 'high'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            {msg.triageAssessment.severity === 'emergency' && 'سطح ۱: اورژانسی حاد'}
                            {msg.triageAssessment.severity === 'high' && 'سطح ۲: اولویت بالا (High)'}
                            {msg.triageAssessment.severity === 'moderate' && 'سطح ۳: اولویت متوسط'}
                            {msg.triageAssessment.severity === 'low' && 'سطح ۴: پایش مستمر'}
                          </span>
                        </span>

                        <div className="text-left font-mono font-bold text-xs text-slate-600">
                          نمره فوریت: {msg.triageAssessment.urgencyScore}٪
                        </div>
                      </div>

                      {/* Matched Specialist */}
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={msg.triageAssessment.matchedDoctor.avatar}
                            alt={msg.triageAssessment.matchedDoctor.name}
                            className="w-10 h-10 rounded-full object-cover border border-sky-200 shrink-0"
                          />
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-sky-950">
                              ارجاع هوشمند به: {msg.triageAssessment.matchedDoctor.name}
                            </div>
                            <div className="text-[11px] text-sky-700">
                              {msg.triageAssessment.matchedDoctor.title}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-white text-sky-800 font-bold text-[10px] border border-sky-200 shrink-0">
                          بیشترین تطابق
                        </span>
                      </div>

                      {/* Reason & Action advice */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        💡 <strong className="text-slate-800">علت ارجاع:</strong> {msg.triageAssessment.matchReason}
                      </p>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {msg.triageAssessment.actionAdvice}
                      </div>
                    </div>
                  )}

                  {/* DOCTOR OFFICIAL RESPONSE CARD */}
                  {msg.doctorResponse && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-300 shadow-md space-y-3 text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-emerald-950">
                              پاسخ بالینی {msg.doctorResponse.doctorName}
                            </span>
                            <span className="text-[10px] text-emerald-700 block">
                              {msg.doctorResponse.specialty}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.doctorResponse.submittedAt}
                        </span>
                      </div>

                      {/* Diagnosis */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500">تشخیص اولیه پزشک:</span>
                        <p className="text-xs font-extrabold text-slate-900 bg-white p-2 rounded-lg border border-emerald-200">
                          {msg.doctorResponse.diagnosis}
                        </p>
                      </div>

                      {/* Clinical guidance */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {msg.doctorResponse.clinicalGuidance}
                      </p>

                      {/* Prescriptions */}
                      {msg.doctorResponse.prescriptions.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-900">دستورات دارویی و بالینی:</span>
                          <ul className="space-y-1">
                            {msg.doctorResponse.prescriptions.map((rx, idx) => (
                              <li key={idx} className="text-xs bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-start gap-2 text-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                <span>{rx}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next step */}
                      {msg.doctorResponse.nextStep && (
                        <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                          📌 مرحله بعدی درمان: {msg.doctorResponse.nextStep}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Reply Chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(reply)}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium pr-11">
              <Bot className="w-4 h-4 text-sky-500 animate-bounce" />
              <span>دستیار در حال تحلیل علائم قلبی و تدوین پاسخ...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (ChatGPT Style) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-50 border border-slate-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 rounded-2xl px-3 py-1.5 transition-all">
            
            <input
              type="text"
              placeholder="علائم خود یا هر تغییری در ضربان قلب را اینجا بنویسید..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-transparent py-2 px-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-[#1b739e] hover:bg-[#155e82] disabled:opacity-40 disabled:hover:bg-[#1b739e] text-white flex items-center justify-center transition-all active:scale-95 shadow-xs"
              title="ارسال پیام"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-2">
            در شرایط حاد، درد شدید قفسه سینه یا غش، فوراً با شماره ۱۱۵ تماس حاصل فرمایید.
          </div>
        </div>

      </main>

    </div>
  );
};
