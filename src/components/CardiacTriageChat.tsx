import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, User, Sparkles, AlertTriangle, ShieldAlert, PhoneCall,
  Clock, Plus, CheckCircle2, ChevronRight, Stethoscope, ArrowRight, ArrowLeft,
  MessageSquare, Trash2, Heart, Search, ChevronLeft, Menu, Activity,
  FileText, Check, Share2, Mic, MicOff, Loader2, Paperclip, X
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types/chat';
import { Doctor, TriageSeverity } from '../types';
import { cardiacIntakeQuestionnaire, cardiacIntakeSafetyNotice } from '../data/cardiacIntakeQuestionnaire';

interface Props {
  patientProfile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string | null;
  } | null;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (updated: ChatSession) => void;
  onReferToDoctor: (session: ChatSession, doctor: Doctor, triageNotes: string, severity: TriageSeverity) => void;
  onBackToHome: () => void;
  onOpenEmergencyContacts: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
}


// Extract the latest answer associated with each questionnaire question.
const getAnsweredQuestionValues = (
  messages: ChatMessage[]
): Record<string, string> => {
  const answers: Record<string, string> = {};

  messages.forEach((item, index) => {
    const match = item.sender === 'ai'
      ? item.id.match(/^triage-question-(\d+)$/)
      : null;

    if (!match) return;

    const question = cardiacIntakeQuestionnaire[Number(match[1])];
    if (!question) return;

    for (let next = index + 1; next < messages.length; next += 1) {
      const candidate = messages[next];

      if (candidate.sender === 'ai') break;

      if (candidate.sender === 'patient') {
        answers[question.id] = candidate.text.trim();
        break;
      }
    }
  });

  return answers;
};

const normalizeIntakeAnswer = (value: string): string =>
  value
    .toLocaleLowerCase('fa-IR')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200d]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const hasIntakeOption = (
  answers: Record<string, string>,
  questionId: string,
  options: string[]
): boolean => {
  const answer = normalizeIntakeAnswer(answers[questionId] || '');
  if (!answer) return false;

  const selectedOptions = answer
    .split(/[،,؛;\n]+/)
    .map(normalizeIntakeAnswer)
    .filter(Boolean);

  return options.some((option) => {
    const normalizedOption = normalizeIntakeAnswer(option);
    return answer === normalizedOption ||
      selectedOptions.includes(normalizedOption);
  });
};

const isExclusiveMultiOption = (option: string): boolean =>
  /هیچکدام|موردی ندارم|موردی نیست|مورد شناختهشده‌ای ندارم|اطلاع ندارم|نمیدانم|در اختیار ندارم|محل مشخصی ندارد|تغییری نکرده است|تغییری نداشتهام|مصرف نمیکنم/.test(
    normalizeIntakeAnswer(option)
  );

// A skipped question is not interpreted as a negative clinical finding.
const shouldSkipIntakeQuestion = (
  questionId: string,
  answers: Record<string, string>
): boolean => {
  if (
    questionId === 'pain_severity_worst' ||
    questionId === 'important_to_doctor' ||
    questionId === 'measurements_other'
  ) return true;

  const skipRules: Record<string, [string, string[]]> = {
    pain_radiation_location: [
      'pain_radiation',
      ['خیر', 'مطمئن نیستم'],
    ],
    symptom_most_important_change: [
      'symptom_changes',
      ['تغییری نکرده است'],
    ],
    activity_stop_detail: [
      'activity_stop',
      ['خیر', 'مطمئن نیستم'],
    ],
    stress_detail: [
      'stress',
      ['خیر', 'مطمئن نیستم'],
    ],
    body_changes_detail: [
      'body_changes',
      ['تغییری نداشته‌ام'],
    ],
    allergy_details: [
      'allergies',
      ['خیر', 'مطمئن نیستم'],
    ],
    medical_history_detail: [
      'medical_history',
      ['هیچ‌کدام', 'هیچ کدام', 'مطمئن نیستم'],
    ],
    procedure_year_center: [
      'cardiac_procedures',
      ['هیچ‌کدام', 'هیچ کدام', 'مطمئن نیستم'],
    ],
    family_history_detail: [
      'family_history',
      ['مورد شناخته‌شده‌ای ندارم', 'اطلاع ندارم'],
    ],
    alcohol_frequency: [
      'alcohol',
      ['مصرف نمی‌کنم'],
    ],
    smoking_detail: [
      'smoking',
      ['هرگز مصرف نکرده‌ام', 'مطمئن نیستم'],
    ],
    records_detail: [
      'records_available',
      ['مدرکی در اختیار ندارم'],
    ],
  };

  if (
    (questionId === 'medications' || questionId === 'medication_unknown') &&
    hasIntakeOption(answers, 'medication_status', ['خیر، مصرف نمی‌کنم'])
  ) {
    return true;
  }

  if (questionId === 'medication_unknown') {
    const medicationAnswer = normalizeIntakeAnswer(
      answers.medications || ''
    );

    if (
      hasIntakeOption(answers, 'medications', ['هیچ‌کدام', 'هیچ کدام'])
    ) {
      return true;
    }

    return !/نمیدانم|نامشخص|نامعلوم|یادم نیست|اطلاع ندارم|مشخص نیست/.test(
      medicationAnswer
    );
  }

  const rule = skipRules[questionId];
  return rule
    ? hasIntakeOption(answers, rule[0], rule[1])
    : false;
};

const getNextIntakeQuestionIndex = (
  currentIndex: number,
  answers: Record<string, string>
): number => {
  const ordered = cardiacIntakeQuestionnaire
    .map((question, index) => ({ question, index }))
    .filter(({ index }) => index >= 7);

  const smokingDetailPosition = ordered.findIndex(
    ({ question }) => question.id === 'smoking_detail'
  );
  const smokingPosition = ordered.findIndex(
    ({ question }) => question.id === 'smoking'
  );

  if (smokingDetailPosition >= 0 && smokingPosition >= 0) {
    const [smokingDetail] = ordered.splice(smokingDetailPosition, 1);
    ordered.splice(smokingPosition + 1, 0, smokingDetail);
  }

  const activityStopDetailPosition = ordered.findIndex(
    ({ question }) => question.id === 'activity_stop_detail'
  );
  const activityStopPosition = ordered.findIndex(
    ({ question }) => question.id === 'activity_stop'
  );

  if (activityStopDetailPosition >= 0 && activityStopPosition >= 0) {
    const [activityStopDetail] = ordered.splice(activityStopDetailPosition, 1);
    const updatedActivityStopPosition = ordered.findIndex(
      ({ question }) => question.id === 'activity_stop'
    );
    ordered.splice(updatedActivityStopPosition + 1, 0, activityStopDetail);
  }

  const medicationStatusPosition = ordered.findIndex(
    ({ question }) => question.id === 'medication_status'
  );
  const medicationPosition = ordered.findIndex(
    ({ question }) => question.id === 'medications'
  );

  if (medicationStatusPosition >= 0 && medicationPosition >= 0) {
    const [medicationStatus] = ordered.splice(medicationStatusPosition, 1);
    const updatedMedicationPosition = ordered.findIndex(
      ({ question }) => question.id === 'medications'
    );
    ordered.splice(updatedMedicationPosition, 0, medicationStatus);
  }

  const sleepPosition = ordered.findIndex(
    ({ question }) => question.id === 'sleep'
  );

  if (sleepPosition >= 0) {
    const sleepFollowUps = ['sleep_snoring', 'sleep_apnea', 'sleep_interruption'];

    for (const questionId of sleepFollowUps) {
      const position = ordered.findIndex(
        ({ question }) => question.id === questionId
      );

      if (position >= 0) {
        const [followUp] = ordered.splice(position, 1);
        const updatedSleepPosition = ordered.findIndex(
          ({ question }) => question.id === 'sleep'
        );
        ordered.splice(updatedSleepPosition + 1 + sleepFollowUps.indexOf(questionId), 0, followUp);
      }
    }
  }

  const dietPosition = ordered.findIndex(
    ({ question }) => question.id === 'diet'
  );

  if (dietPosition >= 0) {
    const dietFollowUps = ['salt_intake', 'sugar_intake'];

    for (let i = 0; i < dietFollowUps.length; i += 1) {
      const position = ordered.findIndex(
        ({ question }) => question.id === dietFollowUps[i]
      );

      if (position >= 0) {
        const [followUp] = ordered.splice(position, 1);
        const updatedDietPosition = ordered.findIndex(
          ({ question }) => question.id === 'diet'
        );
        ordered.splice(updatedDietPosition + 1 + i, 0, followUp);
      }
    }
  }

  const stressPosition = ordered.findIndex(
    ({ question }) => question.id === 'stress'
  );
  const stressDetailPosition = ordered.findIndex(
    ({ question }) => question.id === 'stress_detail'
  );

  if (stressPosition >= 0 && stressDetailPosition >= 0) {
    const [stressDetail] = ordered.splice(stressDetailPosition, 1);
    const updatedStressPosition = ordered.findIndex(
      ({ question }) => question.id === 'stress'
    );
    ordered.splice(updatedStressPosition + 1, 0, stressDetail);
  }

  const weeklyActivityPosition = ordered.findIndex(
    ({ question }) => question.id === 'weekly_activity_duration'
  );
  const physicalActivityPosition = ordered.findIndex(
    ({ question }) => question.id === 'physical_activity'
  );

  if (weeklyActivityPosition >= 0 && physicalActivityPosition >= 0) {
    const [weeklyActivity] = ordered.splice(weeklyActivityPosition, 1);
    const updatedPhysicalActivityPosition = ordered.findIndex(
      ({ question }) => question.id === 'physical_activity'
    );
    ordered.splice(updatedPhysicalActivityPosition + 1, 0, weeklyActivity);
  }

  const currentPosition = ordered.findIndex(
    ({ index }) => index === currentIndex
  );
  if (currentPosition < 0) return -1;

  for (let position = currentPosition + 1; position < ordered.length; position += 1) {
    const candidate = ordered[position];
    if (!shouldSkipIntakeQuestion(candidate.question.id, answers)) {
      return candidate.index;
    }
  }

  return -1;
};

export const CardiacTriageChat: React.FC<Props> = ({
  patientProfile,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onUpdateSession,
  onBackToHome,
  onOpenEmergencyContacts,
  onOpenAuth,
  isAuthenticated,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
  const [pendingFilesBySession, setPendingFilesBySession] = useState<Record<string, File[]>>({});
  const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);
  const [uploadErrorBySession, setUploadErrorBySession] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const patientMessageCount = activeSession?.messages.filter(
    (message) => message.sender === 'patient'
  ).length ?? 0;
  const isEmergency = activeSession?.status === 'emergency';
  const profileSummary = patientProfile
    ? (() => {
        const birthDate = patientProfile.birthDate;
        let ageText = 'قابل محاسبه نیست';
        if (birthDate) {
          const [year, month, day] = birthDate.split('-').map(Number);
          const today = new Date();
          let age = today.getFullYear() - year;
          if (
            today.getMonth() + 1 < month ||
            (today.getMonth() + 1 === month && today.getDate() < day)
          ) age -= 1;
          ageText = `${age} سال`;
        }
        return `اطلاعات ثبت‌شده در حساب بیمار:\nنام و نام خانوادگی: ${patientProfile.firstName} ${patientProfile.lastName}\nشماره همراه: ${patientProfile.phoneNumber}\nتاریخ تولد: ${birthDate || 'ثبت نشده'}\nسن: ${ageText}`;
      })()
    : 'برای نمایش اطلاعات هویتی، ابتدا وارد حساب بیمار شوید.';

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  // Start new questionnaires after the emergency notice and account profile summary.
  useEffect(() => {
    if (!activeSession || activeSession.messages.length !== 0) return;

    const firstQuestion = cardiacIntakeQuestionnaire[7];
    const first: ChatMessage = {
      id: 'triage-question-7',
      sender: 'ai',
      text: `${cardiacIntakeSafetyNotice}\n\n${profileSummary}\n\n${firstQuestion.text}`,
      timestamp: new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onUpdateSession({
      ...activeSession,
      messages: [first],
      updatedAt: 'هم‌اکنون',
    });
  }, [activeSession?.id, activeSession?.messages.length, onUpdateSession]);


  const uploadMedicalFiles = async (
    sessionId: string,
    consultationId: string,
    files: File[]
  ) => {
    if (files.length === 0 || uploadingSessionId) return;

    setUploadingSessionId(sessionId);
    setUploadErrorBySession((prev) => ({ ...prev, [sessionId]: '' }));

    let failedFiles: File[] = [];
    let failureMessage = '';

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'other');
        formData.append('title', file.name.slice(0, 200));

        try {
          const response = await fetch(
            `/api/consultations/${encodeURIComponent(consultationId)}/documents`,
            {
              method: 'POST',
              credentials: 'same-origin',
              body: formData,
            }
          );
          const result: { error?: string; message?: string } =
            await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(result.error || `خطای ارسال فایل (${response.status})`);
          }
        } catch (error) {
          failedFiles = files.slice(index);
          failureMessage = error instanceof Error
            ? error.message
            : 'ارسال فایل با خطا مواجه شد.';
          break;
        }
      }

      setPendingFilesBySession((prev) => ({
        ...prev,
        [sessionId]: failedFiles,
      }));
      setUploadErrorBySession((prev) => ({
        ...prev,
        [sessionId]: failedFiles.length
          ? `${failureMessage} ${failedFiles.length} فایل برای تلاش مجدد باقی مانده است.`
          : '',
      }));
    } finally {
      setUploadingSessionId(null);
    }
  };

  const handleMedicalFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (!activeSession || selectedFiles.length === 0) return;

    const allowedExtensions = /\.(pdf|jpe?g|png|webp)$/i;
    const invalidFile = selectedFiles.find(
      (file) =>
        !allowedExtensions.test(file.name) ||
        file.size === 0 ||
        file.size > 20 * 1024 * 1024
    );

    if (invalidFile) {
      setUploadErrorBySession((prev) => ({
        ...prev,
        [activeSession.id]: !allowedExtensions.test(invalidFile.name)
          ? 'فقط فایل‌های PDF، JPEG، PNG و WebP قابل انتخاب هستند.'
          : invalidFile.size === 0
            ? 'فایل انتخاب‌شده خالی است.'
            : 'حجم هر فایل نباید بیشتر از ۲۰ مگابایت باشد.',
      }));
      return;
    }

    setUploadErrorBySession((prev) => ({ ...prev, [activeSession.id]: '' }));

    if (activeSession.consultationId) {
      const queuedFiles = [
        ...(pendingFilesBySession[activeSession.id] || []),
        ...selectedFiles,
      ];
      void uploadMedicalFiles(
        activeSession.id,
        activeSession.consultationId,
        queuedFiles
      );
      return;
    }

    setPendingFilesBySession((prev) => ({
      ...prev,
      [activeSession.id]: [
        ...(prev[activeSession.id] || []),
        ...selectedFiles,
      ],
    }));
  };

  // Guided intake runs locally first; completed answers then go to the existing Qwen API.
  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || !activeSession || isTyping) return;
    if (activeSession.status === 'emergency') {
      setInputText('');
      return;
    }

    const timestamp = () =>
      new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      });

    const patientMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: message,
      timestamp: timestamp(),
    };

    const updatedMessages = [...activeSession.messages, patientMsg];
    const updatedSession: ChatSession = {
      ...activeSession,
      messages: updatedMessages,
      updatedAt: 'هم‌اکنون',
    };

    onUpdateSession(updatedSession);
    setInputText('');

    const lastAssistantMessage = [...activeSession.messages]
      .reverse()
      .find((m) => m.sender === 'ai');


    const safetyScreen = lastAssistantMessage?.id === 'triage-intake-0';
    const questionMatch = lastAssistantMessage?.id.match(/^triage-question-(\d+)$/);
    const retryingSubmission = Boolean(
      lastAssistantMessage?.id.startsWith('triage-intake-submit-failed-') ||
      lastAssistantMessage?.id.startsWith('triage-intake-auth-required-')
    );

    if (safetyScreen || questionMatch || retryingSubmission) {
      const normalized = message.toLocaleLowerCase('fa-IR').trim();
      const affirmative = /^(بله|آری|دارم|وجود دارد|مثبت)(\s|$|،|,|\.)/.test(normalized);
      const unsure = /مطمئن نیستم|نمی‌دانم|شاید/.test(normalized);

      if (safetyScreen) {
        if (affirmative || unsure) {
          const emergencyMsg: ChatMessage = {
            id: `triage-intake-emergency-stop-${Date.now()}`,
            sender: 'ai',
            text: 'این علائم ممکن است نیازمند رسیدگی فوری باشند. لطفاً پرسش‌نامه را ادامه نده و همین حالا با اورژانس ۱۱۵ تماس بگیر یا از فردی بخواه این کار را انجام دهد. خودت رانندگی نکن. اگر علائم شدید یا ناگهانی‌اند، منتظر پاسخ آنلاین نمان.',
            timestamp: timestamp(),
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, emergencyMsg],
            status: 'emergency',
          });
          return;
        }

        const firstQuestion = cardiacIntakeQuestionnaire[7];
        const firstMsg: ChatMessage = {
          id: 'triage-question-7',
          sender: 'ai',
          text: `${cardiacIntakeSafetyNotice}\n\n${profileSummary}\n\n${firstQuestion.text}`,
          timestamp: timestamp(),
        };
        onUpdateSession({
          ...updatedSession,
          messages: [...updatedMessages, firstMsg],
        });
        return;
      }

      const questionIndex = questionMatch ? Number(questionMatch[1]) : -1;
      const currentQuestion = questionIndex >= 0
        ? cardiacIntakeQuestionnaire[questionIndex]
        : undefined;

      if (questionMatch && currentQuestion?.required && !message.trim()) {
        const validationMsg: ChatMessage = {
          id: `triage-question-validation-${Date.now()}`,
          sender: 'ai',
          text: 'پاسخ این سؤال لازم است. اگر پاسخ دقیق را نمی‌دانی، می‌توانی «نمی‌دانم» بنویسی.',
          timestamp: timestamp(),
        };
        onUpdateSession({
          ...updatedSession,
          messages: [...updatedMessages, validationMsg, {
            id: `triage-question-${questionIndex}`,
            sender: 'ai',
            text: currentQuestion.text,
            timestamp: timestamp(),
            ...(currentQuestion.type === 'single' && currentQuestion.options
              ? { quickReplies: currentQuestion.options }
              : {}),
          }],
        });
        return;
      }

      const flowAnswers = getAnsweredQuestionValues(updatedMessages);
      const nextIndex = questionMatch
        ? getNextIntakeQuestionIndex(questionIndex, flowAnswers)
        : -1;

      const hasNextQuestion = nextIndex >= 0;

      if (questionMatch && currentQuestion && hasNextQuestion) {
        const nextQuestion = cardiacIntakeQuestionnaire[nextIndex];
        const nextMsg: ChatMessage = {
          id: `triage-question-${nextIndex}`,
          sender: 'ai',
          text: nextQuestion.text,
          timestamp: timestamp(),
          ...(nextQuestion.type === 'single' && nextQuestion.options
            ? { quickReplies: nextQuestion.options }
            : {}),
        };
        onUpdateSession({
          ...updatedSession,
          messages: [...updatedMessages, nextMsg],
        });
        return;
      }

      const shouldSubmit = retryingSubmission ||
        Boolean(questionMatch && !hasNextQuestion);

      if (shouldSubmit) {
        if (activeSession.consultationId) {
          const existingMsg: ChatMessage = {
            id: `triage-intake-already-submitted-${Date.now()}`,
            sender: 'ai',
            text: `این گفت‌وگو قبلاً با شناسهٔ ${activeSession.consultationId} ثبت شده است؛ برای جلوگیری از پروندهٔ تکراری، درخواست دیگری ساخته نشد.`,
            timestamp: timestamp(),
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, existingMsg],
          });
          return;
        }

        const answerTextById: Record<string, string> = {};
        updatedMessages.forEach((item, index) => {
          const match = item.sender === 'ai'
            ? item.id.match(/^triage-question-(\d+)$/)
            : null;
          if (!match) return;

          const question = cardiacIntakeQuestionnaire[Number(match[1])];
          if (!question) return;

          for (let next = index + 1; next < updatedMessages.length; next += 1) {
            const candidate = updatedMessages[next];

            // Never associate a patient message with a question across an AI message.
            if (candidate.sender === 'ai') {
              break;
            }

            if (candidate.sender === 'patient') {
              // Later repetitions overwrite earlier answers for this question.
              answerTextById[question.id] = candidate.text.trim();
              break;
            }
          }
        });

        const intakeAnswers = cardiacIntakeQuestionnaire
          .filter((question) => answerTextById[question.id] !== undefined)
          .map((question) => {
            const rawAnswer = answerTextById[question.id];
            const answer: string | string[] = question.type === 'multi'
              ? rawAnswer.split(/[،,;\n]+/).map((part) => part.trim()).filter(Boolean)
              : rawAnswer;
            return {
              id: question.id,
              section: question.section,
              sectionTitle: question.sectionTitle,
              question: question.text,
              answer,
            };
          });

        const missingRequired = cardiacIntakeQuestionnaire.slice(7).find(
          (question) =>
            question.required &&
            !shouldSkipIntakeQuestion(question.id, answerTextById) &&
            !answerTextById[question.id]?.trim()
        );
        if (missingRequired) {
          const missingIndex = cardiacIntakeQuestionnaire.findIndex(
            (question) => question.id === missingRequired.id
          );
          const missingMsg: ChatMessage = {
            id: `triage-intake-missing-${Date.now()}`,
            sender: 'ai',
            text: `پاسخ سؤال «${missingRequired.text}» برای ثبت پرونده موجود نیست. لطفاً همین سؤال را پاسخ بده؛ پاسخ‌های قبلی حفظ می‌شوند.`,
            timestamp: timestamp(),
          };
          const repeatQuestion: ChatMessage = {
            id: `triage-question-${missingIndex}`,
            sender: 'ai',
            text: missingRequired.text,
            timestamp: timestamp(),
            ...(missingRequired.type === 'single' && missingRequired.options
              ? { quickReplies: missingRequired.options }
              : {}),
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, missingMsg, repeatQuestion],
          });
          return;
        }

        const chiefComplaint = (
          answerTextById.symptom_main ||
          answerTextById.visit_reason_detail ||
          answerTextById.visit_reason ||
          ''
        ).slice(0, 500).trim();

        const symptomsDuration = (
          answerTextById.symptom_start ||
          answerTextById.symptom_duration ||
          answerTextById.symptom_onset_pattern ||
          ''
        ).slice(0, 100).trim();

        if (!chiefComplaint || !symptomsDuration) {
          const validationMsg: ChatMessage = {
            id: `triage-intake-validation-${Date.now()}`,
            sender: 'ai',
            text: 'برای ثبت پرونده، علامت اصلی و زمان شروع آن باید مشخص باشند. لطفاً پاسخ‌های این دو سؤال را بررسی کن.',
            timestamp: timestamp(),
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, validationMsg],
          });
          return;
        }

        if (!isAuthenticated) {
          const authMsg: ChatMessage = {
            id: `triage-intake-auth-required-${Date.now()}`,
            sender: 'ai',
            text: 'برای ثبت شرح حال در پروندهٔ پزشکی، ورود به حساب بیمار الزامی است. پاسخ‌های این گفت‌وگو حفظ شده‌اند؛ پس از ورود، روی «تلاش مجدد برای ثبت پرونده» بزن.',
            timestamp: timestamp(),
            quickReplies: ['تلاش مجدد برای ثبت پرونده'],
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, authMsg],
          });
          onOpenAuth();
          return;
        }

        const symptomsDescription = [
          'شرح حال گردآوری‌شده از پرسش‌نامهٔ بیمار؛ پاسخ‌ها تشخیص پزشکی محسوب نمی‌شوند.',
          ...cardiacIntakeQuestionnaire.map((question) => {
            const answer = answerTextById[question.id];
            return answer ? `${question.sectionTitle} — ${question.text}\nپاسخ: ${answer}` : '';
          }).filter(Boolean),
        ].join('\n\n').slice(0, 5000);

        const arrayAnswer = (id: string): string[] => {
          const raw = answerTextById[id] || '';
          return raw.split(/[،,;\n]+/).map((part) => part.trim()).filter(Boolean);
        };

        setIsTyping(true);
        try {
          const response = await fetch('/api/consultations', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientRequestId: activeSession.id,
              chiefComplaint,
              symptomsDuration,
              symptomsDescription,
              intakeAnswers,
              chestPainDetails: {
                painType: answerTextById.pain_location || 'در پرسش‌نامه مشخص نشده',
                radiatingTo: arrayAnswer('pain_radiation_location'),
                triggers: arrayAnswer('symptom_triggers'),
                associatedSymptoms: arrayAnswer('associated_symptoms'),
              },
            }),
          });

          const result: {
            consultation?: { id?: string; status?: string; createdAt?: string };
            error?: string;
            message?: string;
          } = await response.json().catch(() => ({}));

          if (!response.ok || !result.consultation?.id) {
            if (response.status === 401) onOpenAuth();
            throw new Error(
              result.error || 'سرور ثبت پرونده را تأیید نکرد؛ پرونده ثبت‌شده تلقی نمی‌شود.'
            );
          }

          const consultationId = result.consultation.id;
          const successMsg: ChatMessage = {
            id: `triage-intake-submitted-${Date.now()}`,
            sender: 'ai',
            text: `شرح حال کامل با موفقیت ثبت شد. شناسهٔ پیگیری: ${consultationId}\n\nپاسخ‌های پرسش‌نامه برای بررسی پزشک تریاژ ارسال شده‌اند. ثبت پرونده به معنی تشخیص قطعی یا تأیید درمان نیست. اگر علائم شدید یا ناگهانی هستند، منتظر بررسی آنلاین نمان و با اورژانس ۱۱۵ تماس بگیر.`,
            timestamp: timestamp(),
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, successMsg],
            status: 'triage_ready',
            consultationId,
          });

          const pendingFiles = pendingFilesBySession[activeSession.id] || [];
          if (pendingFiles.length > 0) {
            await uploadMedicalFiles(
              activeSession.id,
              consultationId,
              pendingFiles
            );
          }
        } catch (error) {
          console.error('TeleCardio triage consultation submission failed:', error);
          const failureText = error instanceof Error
            ? error.message
            : 'ثبت پرونده انجام نشد. لطفاً دوباره تلاش کن.';
          const failureMsg: ChatMessage = {
            id: `triage-intake-submit-failed-${Date.now()}`,
            sender: 'ai',
            text: `ثبت پرونده تأیید نشد: ${failureText}\n\nمی‌توانی با همان شناسهٔ جلسه دوباره تلاش کنی؛ اگر درخواست قبلی در سرور ثبت شده باشد، پروندهٔ تکراری ساخته نمی‌شود.`,
            timestamp: timestamp(),
            quickReplies: ['تلاش مجدد برای ثبت پرونده'],
          };
          onUpdateSession({
            ...updatedSession,
            messages: [...updatedMessages, failureMsg],
          });
        } finally {
          setIsTyping(false);
        }
        return;
      }

      // سایر پیام‌ها طبق روال قبلی به دستیار هوشمند ارسال می‌شوند.
    }

    setIsTyping(true);

    try {
      const conversation = updatedMessages
        .filter((m) => m.sender === 'patient' || m.sender === 'ai')
        .slice(-30)
        .map((m) => ({
          role: m.sender === 'patient' ? 'user' : 'assistant',
          text: m.text,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
        signal: AbortSignal.timeout(125000),
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      const data: { text?: string } = await response.json();
      if (typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('Empty response from local AI');
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.text.trim(),
        timestamp: timestamp(),
      };

      onUpdateSession({
        ...updatedSession,
        messages: [...updatedMessages, aiMsg],
      });
    } catch (error) {
      console.error('TeleCardio chat request failed:', error);
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        sender: 'ai',
        text: 'متأسفانه در اتصال به دستیار هوشمند مشکلی پیش آمد. لطفاً دوباره تلاش کن. اگر علائم شدید یا ناگهانی داری، منتظر پاسخ سامانه نمان و با اورژانس ۱۱۵ تماس بگیر.',
        timestamp: timestamp(),
      };
      onUpdateSession({
        ...updatedSession,
        messages: [...updatedMessages, errorMsg],
      });
    } finally {
      setIsTyping(false);
    }
  };


  // Record Persian speech and place its transcript in the input for review.
  const handleMicClick = async () => {
    setVoiceError('');

    if (isTranscribing) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined') {
      setVoiceError('ضبط صدا در این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const mimeType = mimeCandidates.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setVoiceError('هنگام ضبط صدا خطایی رخ داد. دوباره تلاش کنید.');
        setIsRecording(false);
      };

      recorder.onstop = async () => {
        const actualType = recorder.mimeType || 'audio/webm';
        const extension = actualType.includes('mp4') ? 'm4a'
          : actualType.includes('ogg') ? 'ogg'
          : actualType.includes('wav') ? 'wav'
          : 'webm';

        const blob = new Blob(audioChunksRef.current, { type: actualType });
        audioChunksRef.current = [];

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;

        if (!blob.size) {
          setVoiceError('صدایی ضبط نشد. دوباره تلاش کنید.');
          return;
        }

        if (blob.size > 20 * 1024 * 1024) {
          setVoiceError('حجم فایل صوتی بیش از ۲۰ مگابایت است.');
          return;
        }

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append('file', blob, `recording.${extension}`);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(140000),
          });

          const data: { text?: string; error?: string } =
            await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data.error || 'تبدیل صدا به متن انجام نشد.');
          }

          if (typeof data.text !== 'string' || !data.text.trim()) {
            throw new Error('متنی از صدا تشخیص داده نشد.');
          }

          setInputText((previous) =>
            previous.trim()
              ? `${previous.trim()} ${data.text!.trim()}`
              : data.text!.trim()
          );
        } catch (error) {
          console.error('TeleCardio transcription failed:', error);
          setVoiceError(
            error instanceof Error && error.name !== 'AbortError'
              ? error.message
              : 'تبدیل صدا به متن انجام نشد؛ دوباره تلاش کنید.'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      setIsRecording(false);

      setVoiceError(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'برای ضبط صدا، اجازهٔ دسترسی به میکروفون را فعال کنید.'
          : 'دسترسی به میکروفون ممکن نشد. مجوز مرورگر و اتصال امن را بررسی کنید.'
      );
    }
  };

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Filtered sessions for sidebar
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] min-h-0 flex overflow-hidden bg-slate-50 font-['Vazirmatn',system-ui,sans-serif]">

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

        {/* Guest-friendly chat footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1">
            <span>گفت‌وگوی سلامت قلب</span>
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
      <main className="flex-1 min-w-0 min-h-0 flex flex-col h-full overflow-hidden bg-slate-50">

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
          {activeSession?.messages.length > 0 && activeSession?.messages.length <= 1 && (
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
            const lastAssistantMessageId = [...(activeSession?.messages ?? [])]
              .reverse()
              .find((item) => item.sender === 'ai')?.id;
            const isCurrentAssistantMessage =
              !isPatient && msg.id === lastAssistantMessageId;
            const questionMatch = !isPatient ? msg.id.match(/^triage-question-(\d+)$/) : null;
            const intakeQuestion = questionMatch
              ? cardiacIntakeQuestionnaire[Number(questionMatch[1])]
              : undefined;
            const selectedOptions = intakeQuestion ? (multiSelections[intakeQuestion.id] || []) : [];

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

                  {/* Multi-select questionnaire options */}
                  {isCurrentAssistantMessage && intakeQuestion?.type === 'multi' && intakeQuestion.options && (
                    <div className="flex flex-col items-start gap-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {intakeQuestion.options.map((option) => {
                          const selected = selectedOptions.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setMultiSelections((previous) => {
                                const current = previous[intakeQuestion.id] || [];
                                const exclusive = isExclusiveMultiOption(option);
                                const next = selected
                                  ? current.filter((item) => item !== option)
                                  : exclusive
                                    ? [option]
                                    : [...current.filter((item) => !isExclusiveMultiOption(item)), option];
                                return { ...previous, [intakeQuestion.id]: next };
                              })}
                              disabled={isEmergency || isTyping}
                              aria-pressed={selected}
                              className={`px-3 py-1.5 rounded-full border text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50 ${
                                selected
                                  ? 'bg-sky-700 text-white border-sky-700'
                                  : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200'
                              }`}
                            >
                              {selected ? '✓ ' : ''}{option}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(selectedOptions.join('، '))}
                        disabled={isEmergency || isTyping || selectedOptions.length === 0}
                        className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ثبت انتخاب‌ها و ادامه
                      </button>
                    </div>
                  )}

                  {/* Quick Reply Chips */}
                  {isCurrentAssistantMessage && intakeQuestion?.type !== 'multi' && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(reply)}
                          disabled={isEmergency || isTyping}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {!isAuthenticated && patientMessageCount >= 4 && (
          <div className="mx-3 sm:mx-4 mb-3 max-w-3xl self-center w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] rounded-2xl border border-sky-200 bg-sky-50 p-4 text-right">
            <p className="text-sm font-bold text-slate-800">
              می‌خواهی بعداً به این گفت‌وگو برگردی؟
            </p>
            <p className="mt-1 text-xs leading-6 text-slate-600">
              با ساخت حساب کاربری می‌توانی از امکانات حساب استفاده کنی. فعلاً می‌توانی همین گفت‌وگو را بدون ثبت‌نام ادامه بدهی.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="mt-3 rounded-xl bg-[#1b739e] px-4 py-2 text-xs font-bold text-white hover:bg-[#155e82]"
            >
              ورود یا ثبت‌نام
            </button>
          </div>
        )}

        {/* Input Bar (ChatGPT Style) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleMedicalFileSelection}
            className="hidden"
            aria-label="انتخاب مدارک پزشکی"
          />
          <div className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-50 border border-slate-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 rounded-2xl px-3 py-1.5 transition-all">

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isEmergency || uploadingSessionId !== null}
              aria-label="افزودن تصویر یا مدرک پزشکی"
              title="افزودن تصویر یا مدرک پزشکی"
              className="w-9 h-9 shrink-0 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-center disabled:opacity-50"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="علائم خود یا هر تغییری در ضربان قلب را اینجا بنویسید..."
              value={inputText}
              disabled={isEmergency}
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
              type="button"
              onClick={handleMicClick}
              disabled={isEmergency || isTranscribing || isTyping}
              aria-label={isRecording ? 'توقف ضبط صدا' : 'ضبط صدا'}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
                isRecording
                  ? 'bg-red-600 border-red-600 text-white animate-pulse'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
              title={
                isTranscribing ? 'در حال تبدیل صدا به متن...'
                : isRecording ? 'توقف ضبط صدا'
                : 'ضبط پیام صوتی'
              }
            >
              {isTranscribing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isRecording
                  ? <MicOff className="w-4 h-4" />
                  : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isEmergency || !inputText.trim() || isTyping || isTranscribing}
              className="w-9 h-9 rounded-xl bg-[#1b739e] hover:bg-[#155e82] disabled:opacity-40 disabled:hover:bg-[#1b739e] text-white flex items-center justify-center transition-all active:scale-95 shadow-xs"
              title="ارسال پیام"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {activeSession && (pendingFilesBySession[activeSession.id] || []).length > 0 && (
            <div className="max-w-3xl mx-auto mt-2 rounded-xl border border-sky-100 bg-sky-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-700">
                  فایل‌های در انتظار ارسال ({pendingFilesBySession[activeSession.id].length})
                </p>
                {activeSession.consultationId && (
                  <button
                    type="button"
                    onClick={() => void uploadMedicalFiles(
                      activeSession.id,
                      activeSession.consultationId!,
                      pendingFilesBySession[activeSession.id] || []
                    )}
                    disabled={uploadingSessionId !== null}
                    className="text-xs font-bold text-sky-800 hover:text-sky-950 disabled:opacity-50"
                  >
                    {uploadingSessionId === activeSession.id
                      ? 'در حال ارسال...'
                      : 'تلاش مجدد برای ارسال'}
                  </button>
                )}
              </div>
              <ul className="mt-2 space-y-1">
                {(pendingFilesBySession[activeSession.id] || []).map((file, index) => (
                  <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="min-w-0 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setPendingFilesBySession((prev) => ({
                        ...prev,
                        [activeSession.id]: (prev[activeSession.id] || []).filter((_, i) => i !== index),
                      }))}
                      disabled={uploadingSessionId === activeSession.id}
                      aria-label={`حذف ${file.name}`}
                      className="shrink-0 rounded p-1 text-slate-500 hover:bg-white hover:text-red-600 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              {!activeSession.consultationId && (
                <p className="mt-2 text-[11px] text-slate-500">
                  فایل‌ها پس از ثبت پرونده به‌صورت خودکار ارسال می‌شوند.
                </p>
              )}
            </div>
          )}

          {activeSession && uploadErrorBySession[activeSession.id] && (
            <p role="alert" className="max-w-3xl mx-auto mt-2 text-xs text-red-600">
              {uploadErrorBySession[activeSession.id]}
            </p>
          )}

          {(isRecording || isTranscribing || voiceError) && (
            <div
              role={voiceError ? 'alert' : 'status'}
              className={`max-w-3xl mx-auto mt-2 text-xs text-center ${
                voiceError ? 'text-red-600' : 'text-sky-700'
              }`}
            >
              {voiceError || (
                isRecording
                  ? 'در حال ضبط صدا؛ برای پایان ضبط روی میکروفون بزنید.'
                  : 'در حال تبدیل صدا به متن...'
              )}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 mt-2">
            در شرایط حاد، درد شدید قفسه سینه یا غش، فوراً با شماره ۱۱۵ تماس حاصل فرمایید.
          </div>
        </div>

      </main>

    </div>
  );
};
