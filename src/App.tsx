import React, { useEffect, useRef, useState } from 'react';
import { Navbar, ActiveRole } from './components/Navbar';
import { DisclaimerStep } from './components/DisclaimerStep';
import { TriageDoctorView } from './components/TriageDoctorView';
import { SpecialistDoctorView } from './components/SpecialistDoctorView';
import { PatientConsultationResult } from './components/PatientConsultationResult';
import { ConsultationHistoryList } from './components/ConsultationHistoryList';
import { CardiacHealthProfile } from './components/CardiacHealthProfile';
import { AuthModal } from './components/AuthModal';
import { ECGViewerModal } from './components/ECGViewerModal';

import { Doctor, PatientUser, ConsultationInquiry, CardiacDocument, InAppNotification, TriageSeverity } from './types';
import type { AuthUser } from './types/auth';
import { Sparkles, HeartPulse, ShieldAlert, ArrowLeft, HelpCircle } from 'lucide-react';
import { PatentPageOne } from './components/PatentPageOne';
import { CardiacTelemetryDashboard } from './components/CardiacTelemetryDashboard';
import { NotificationToast } from './components/NotificationToast';
import { ClinicLandingHero } from './components/ClinicLandingHero';
import { PublicLandingPage } from './components/PublicLandingPage';
import { CardiacTriageChat } from './components/CardiacTriageChat';
import { ChatSession, ChatMessage } from './types/chat';
import type { AppTab } from './types/tabs';
import { PatientPanel } from './components/PatientPanel';
import { DoctorPanel } from './components/DoctorPanel';
import { AdminPanel } from './components/AdminPanel';

function calculateAgeFromBirthDate(birthDate: string | null): number {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return 0;
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) return 0;

  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) age -= 1;
  return age >= 0 ? age : 0;
}

function patientFromAuthUser(user: AuthUser): PatientUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    nationalCode: '',
    phoneNumber: user.phoneNumber,
    email: user.email || undefined,
    username: user.username,
    age: calculateAgeFromBirthDate(user.birthDate),
    gender: user.gender || '',
    nationality: user.nationality || '',
    occupation: user.occupation || '',
    medicalHistory: [],
    currentMedications: [],
  };
}

export default function App() {
  // Application Roles: Patient, Level 1 Triage Doctor, Level 2 Specialist Cardiologist
  
  // Active User / Personnel State
  const [currentPatient, setCurrentPatient] = useState<PatientUser>({
    id: '',
    firstName: '',
    lastName: '',
    nationalCode: '',
    phoneNumber: '',
    username: '',
    age: 0,
    gender: '',
    nationality: '',
    occupation: '',
    medicalHistory: [],
    currentMedications: [],
  });
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>({
    id: '',
    name: '',
    title: '',
    specialty: '',
    subSpecialty: '',
    avatar: '',
    medicalCouncilNumber: '',
    experienceYears: 0,
    availableDays: [],
  });
  const [triageDoctor, setTriageDoctor] = useState<Doctor | null>({
    id: '',
    name: '',
    title: '',
    specialty: '',
    subSpecialty: '',
    avatar: '',
    medicalCouncilNumber: '',
    experienceYears: 0,
    availableDays: [],
    isTriageDoctor: true,
  });

  // Consultations Database State
  const [consultations, setConsultations] = useState<ConsultationInquiry[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>('');
  const [specialists, setSpecialists] = useState<Array<{ id: string; name: string }>>([]);

  // In-App Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  // Active Tab for Patient View: 'landing' (صفحه اول مشابه عکس کاربر) | 'ai_chat' | 'doctor_referrals' | 'page_one' | 'disclaimer' | 'telemetry' | 'history' | 'result' | 'profile'
  const [currentTab, setCurrentTab] = useState<AppTab>('landing');

  // Keep browser history synchronized with in-app tab navigation.
  const lastHistoryTabRef = useRef<AppTab | null>(null);
  const isPopNavigationRef = useRef(false);

  useEffect(() => {
    if (lastHistoryTabRef.current === null) {
      window.history.replaceState(
        { ...(window.history.state ?? {}), telecardioApp: true, telecardioTab: currentTab },
        '',
        window.location.href
      );
      lastHistoryTabRef.current = currentTab;
      return;
    }

    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      return;
    }

    if (lastHistoryTabRef.current === currentTab) return;

    window.history.pushState(
      { telecardioApp: true, telecardioTab: currentTab },
      '',
      window.location.href
    );
    lastHistoryTabRef.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    const validTabs: AppTab[] = [
      'landing', 'ai_chat', 'doctor_referrals', 'page_one', 'disclaimer',
      'telemetry', 'history', 'result', 'profile', 'admin',
    ];

    const handleBrowserBack = (event: PopStateEvent) => {
      const state = event.state as
        | { telecardioApp?: boolean; telecardioTab?: unknown }
        | null;

      if (
        state?.telecardioApp === true &&
        typeof state.telecardioTab === 'string' &&
        validTabs.includes(state.telecardioTab as AppTab)
      ) {
        const nextTab = state.telecardioTab as AppTab;
        const user = authUserRef.current;
        const patientActive =
          user?.accountType === 'patient' &&
          user.status === 'active' &&
          user.isAdmin !== true;
        const doctorActive =
          user?.accountType === 'doctor' &&
          user.status === 'approved' &&
          Boolean(user.doctorLevel);
        const adminActive = user?.isAdmin === true;

        const patientOnlyTabs = new Set<AppTab>([
          'ai_chat', 'page_one', 'disclaimer',
          'telemetry', 'history', 'result', 'profile',
        ]);

        const allowed =
          nextTab === 'landing' ||
          (patientActive && patientOnlyTabs.has(nextTab)) ||
          (doctorActive && nextTab === 'doctor_referrals') ||
          (adminActive && nextTab === 'admin');

        if (!allowed) {
          const safeTab: AppTab = 'landing';
          isPopNavigationRef.current = true;
          lastHistoryTabRef.current = safeTab;
          setCurrentTab(safeTab);
          window.history.pushState(
            { telecardioApp: true, telecardioTab: safeTab },
            '',
            window.location.href
          );
          if (!user || (!patientActive && !doctorActive && !adminActive)) {
            setAuthModalOpen(true);
          }
          return;
        }

        if (nextTab !== lastHistoryTabRef.current) {
          isPopNavigationRef.current = true;
          lastHistoryTabRef.current = nextTab;
          setCurrentTab(nextTab);
        }
        return;
      }

      // Recover safely if a same-document history entry has no app state.
      const safeTab = lastHistoryTabRef.current ?? 'landing';
      window.history.pushState(
        { telecardioApp: true, telecardioTab: safeTab },
        '',
        window.location.href
      );
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  }, []);

  // Chat history starts empty until an authenticated patient is identified.
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [returnToChatAfterAuth, setReturnToChatAfterAuth] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const authUserRef = useRef<AuthUser | null>(authUser);
  authUserRef.current = authUser;

  const isPatientAuthenticated =
    authUser?.accountType === 'patient' &&
    authUser.status === 'active' &&
    authUser.isAdmin !== true;

  const isApprovedDoctor =
    authUser?.accountType === 'doctor' &&
    authUser.status === 'approved' &&
    Boolean(authUser.doctorLevel);

  const activeRole: ActiveRole =
    authUser?.accountType === 'doctor' && authUser.status === 'approved' && authUser.doctorLevel
      ? authUser.doctorLevel
      : 'patient';
  const [authNotice, setAuthNotice] = useState('');
  const [activeECGDoc, setActiveECGDoc] = useState<CardiacDocument | null>(null);

  // Build the display profile only from the authenticated server identity.
  const syncDoctorProfile = (user: AuthUser) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    const isTriage = user.doctorLevel === 'triage_doctor';

    const profile: Doctor = {
      id: user.id,
      name: name || 'پزشک',
      title: isTriage ? 'پزشک تریاژ' : 'متخصص',
      specialty: '',
      subSpecialty: '',
      avatar: '',
      medicalCouncilNumber: '',
      experienceYears: 0,
      availableDays: [],
    };

    setCurrentDoctor(profile);
    setTriageDoctor({ ...profile, isTriageDoctor: isTriage });
  };

  // The in-memory history must always belong to this authenticated patient.
  const chatStorageOwnerRef = useRef<string | null>(null);

  const loadChatHistoryForUser = (user: AuthUser | null) => {
    if (
      !user ||
      user.accountType !== 'patient' ||
      user.status !== 'active'
    ) {
      chatStorageOwnerRef.current = null;
      setChatSessions([]);
      setActiveChatSessionId('');
      return;
    }

    const ownerId = user.id;
    const suffix = encodeURIComponent(ownerId);
    const sessionsKey = `telecardio.chatSessions.v1.user.${suffix}`;
    const activeKey = `telecardio.activeChatSessionId.v1.user.${suffix}`;

    // Set ownership before scheduling React state updates.
    chatStorageOwnerRef.current = ownerId;

    try {
      const raw = window.localStorage.getItem(sessionsKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const sessions: ChatSession[] = Array.isArray(parsed)
        ? parsed.filter((item): item is ChatSession =>
            Boolean(
              item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              Array.isArray(item.messages) &&
              [
                'chatting',
                'triage_ready',
                'referred',
                'answered_by_doctor',
                'emergency',
              ].includes(item.status)
            )
          )
        : [];

      const savedActiveId = window.localStorage.getItem(activeKey) || '';
      setChatSessions(sessions);
      setActiveChatSessionId(
        sessions.some((session) => session.id === savedActiveId)
          ? savedActiveId
          : (sessions[0]?.id || '')
      );
    } catch (error) {
      console.error('بارگذاری تاریخچهٔ گفتگوی این حساب انجام نشد.', error);
      setChatSessions([]);
      setActiveChatSessionId('');
    }
  };

  // Never write history for visitors, doctors, or a different account.
  useEffect(() => {
    if (
      !authUser ||
      authUser.accountType !== 'patient' ||
      authUser.status !== 'active' ||
      chatStorageOwnerRef.current !== authUser.id
    ) {
      return;
    }

    const key =
      `telecardio.chatSessions.v1.user.${encodeURIComponent(authUser.id)}`;

    try {
      window.localStorage.setItem(key, JSON.stringify(chatSessions));
    } catch (error) {
      console.error('ذخیرهٔ تاریخچهٔ گفتگو انجام نشد.', error);
    }
  }, [chatSessions, authUser]);

  useEffect(() => {
    if (
      !authUser ||
      authUser.accountType !== 'patient' ||
      authUser.status !== 'active' ||
      chatStorageOwnerRef.current !== authUser.id
    ) {
      return;
    }

    const key =
      `telecardio.activeChatSessionId.v1.user.${encodeURIComponent(authUser.id)}`;

    try {
      if (activeChatSessionId) {
        window.localStorage.setItem(key, activeChatSessionId);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('ذخیرهٔ گفتگوی فعال انجام نشد.', error);
    }
  }, [activeChatSessionId, authUser]);


  // Restore the authenticated session from the server.
  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        const user = data?.user;
        const isAdmin = user?.isAdmin === true;
        const isPatient =
          !isAdmin && user?.accountType === 'patient' && user.status === 'active';
        const isApprovedDoctor =
          !isAdmin &&
          user?.accountType === 'doctor' &&
          user.status === 'approved' &&
          Boolean(user.doctorLevel);

        if (!user || (!isAdmin && !isPatient && !isApprovedDoctor)) {
          loadChatHistoryForUser(null);
          setAuthUser(null);
          setCurrentPatient(patientFromAuthUser({
            id: '', firstName: '', lastName: '', phoneNumber: '',
            birthDate: null, email: null, gender: null,
            nationality: null, occupation: null, username: '',
            accountType: 'patient', status: 'active',
            doctorLevel: null, isAdmin: false,
          }));
          setNotifications([]);
          setActiveToast(null);
          setConsultations([]);
          setSelectedConsultationId('');
          setSpecialists([]);
          setCurrentDoctor(null);
          setTriageDoctor(null);
          setCurrentTab('landing');
          return;
        }

        loadChatHistoryForUser(user);
        setAuthUser(user);

        if (isAdmin) {
          setConsultations([]);
          setSelectedConsultationId('');
          setSpecialists([]);
          setCurrentDoctor(null);
          setTriageDoctor(null);
          setCurrentTab('admin');
          setAuthNotice('');
        } else if (isPatient) {
          setCurrentPatient(patientFromAuthUser(user));
          setCurrentDoctor(null);
          setTriageDoctor(null);
        } else {
          syncDoctorProfile(user);
          setCurrentTab('doctor_referrals');
          setAuthNotice(
            'حساب پزشک تأیید شده است. پرونده‌ها و ارجاعات بر اساس نقش و تخصیص پزشک نمایش داده می‌شوند.'
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        loadChatHistoryForUser(null);
        setAuthUser(null);
        setConsultations([]);
        setSelectedConsultationId('');
        setNotifications([]);
        setActiveToast(null);
        setCurrentTab('landing');
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load persisted notifications only for the currently authenticated patient.
  useEffect(() => {
    if (
      !authUser ||
      authUser.accountType !== 'patient' ||
      authUser.status !== 'active'
    ) {
      setNotifications([]);
      setActiveToast(null);
      return;
    }

    let cancelled = false;

    fetch('/api/notifications', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Loading notifications failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        const serverNotifications = Array.isArray(data?.notifications)
          ? data.notifications as InAppNotification[]
          : [];

        setNotifications((current) => {
          const localAlerts = current.filter(
            (notification) =>
              notification.id.startsWith('notif-push-') &&
              !notification.consultationId
          );

          const serverIds = new Set(
            serverNotifications.map((notification) => notification.id)
          );

          return [
            ...serverNotifications,
            ...localAlerts.filter((notification) => !serverIds.has(notification.id)),
          ];
        });
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('بارگذاری اعلان‌های ذخیره‌شده انجام نشد:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, authUser?.accountType, authUser?.status]);

  // Selected consultation object
  const activeConsultation = consultations.find((c) => c.id === selectedConsultationId) || null;


  const loadMyConsultations = async (
    user: AuthUser = authUser!,
    isCurrent: () => boolean = () => true
  ): Promise<ConsultationInquiry[]> => {
    const endpoint =
      user.accountType === 'patient'
        ? '/api/consultations/mine'
        : user.accountType === 'doctor' &&
            user.status === 'approved' &&
            user.doctorLevel === 'triage_doctor'
          ? '/api/consultations/triage'
          : user.accountType === 'doctor' &&
              user.status === 'approved' &&
              user.doctorLevel === 'specialist_doctor'
            ? '/api/consultations/specialist'
            : null;

    if (!endpoint) {
      throw new Error('نقش حساب برای دریافت پرونده‌ها مجاز نیست.');
    }

    const response = await fetch(endpoint, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? 'نشست ورود معتبر نیست؛ دوباره وارد حساب شوید.'
          : 'دریافت تاریخچه مشاوره‌ها انجام نشد.'
      );
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.consultations)
      ? payload.consultations
      : [];

    const mappedSpecialists: Array<{ id: string; name: string }> =
      user.doctorLevel === 'triage_doctor' && Array.isArray(payload?.specialists)
        ? payload.specialists.filter(
            (item: unknown): item is { id: string; name: string } =>
              Boolean(
                item &&
                typeof item === 'object' &&
                'id' in item &&
                typeof item.id === 'string' &&
                'name' in item &&
                typeof item.name === 'string'
              )
          )
        : [];

    const mapped: ConsultationInquiry[] = rows.map((row: {
      id: string;
      patient_id?: string;
      patient_first_name?: string | null;
      patient_last_name?: string | null;
      patient_phone?: string | null;
      specialist_first_name?: string | null;
      specialist_last_name?: string | null;
      chief_complaint: string;
      symptoms_duration: string;
      symptoms_description: string;
      ai_intake_summary?: string | null;
      pain_type: string;
      radiating_to: string[] | null;
      triggers: string[] | null;
      associated_symptoms: string[] | null;
      intake_answers?: ConsultationInquiry['intakeAnswers'] | null;
      status: ConsultationInquiry['status'];
      created_at: string;
      updated_at: string;
      triage_review?: ConsultationInquiry['triage'] | null;
      specialist_review?: ConsultationInquiry['specialistReview'] | null;
      supplemental_response?: ConsultationInquiry['supplementalResponse'] | null;
      assigned_specialist_id?: string | null;
      is_read?: boolean;
    }) => {
      const triage = row.triage_review || undefined;
      const specialistReview = row.specialist_review || undefined;
      const supplementalResponse = row.supplemental_response || undefined;
      const specialistName = [
        row.specialist_first_name,
        row.specialist_last_name,
      ].filter(Boolean).join(' ').trim();

      return {
        id: row.id,
        status: row.status,
        patientId: row.patient_id || '',
        patientName: [
          row.patient_first_name,
          row.patient_last_name,
        ].filter(Boolean).join(' ').trim() || 'بیمار',
        patientPhone: row.patient_phone || '',
        targetDoctorId: row.assigned_specialist_id || '',
        targetDoctorName: specialistName || 'هنوز تعیین نشده',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isRead: row.is_read === true,
        chiefComplaint: row.chief_complaint,
        symptomsDuration: row.symptoms_duration,
        symptomsDescription: row.symptoms_description,
        ...(Array.isArray(row.intake_answers)
          ? { intakeAnswers: row.intake_answers }
          : {}),
        chestPainDetails: {
          painType: row.pain_type || '',
          radiatingTo: Array.isArray(row.radiating_to) ? row.radiating_to : [],
          triggers: Array.isArray(row.triggers) ? row.triggers : [],
          associatedSymptoms: Array.isArray(row.associated_symptoms)
            ? row.associated_symptoms
            : [],
        },
        documents: [],
        ...(triage ? { triage } : {}),
        ...(specialistReview ? { specialistReview } : {}),
        ...(supplementalResponse ? { supplementalResponse } : {}),
        ...(user.accountType === 'doctor' &&
            user.status === 'approved' &&
            user.doctorLevel === 'triage_doctor' &&
            typeof row.ai_intake_summary === 'string' &&
            row.ai_intake_summary.trim().length > 0
          ? { aiIntakeSummary: row.ai_intake_summary }
          : {}),
      };
    });

    if (!isCurrent()) return mapped;

    // دریافت فراداده مدارک جدا از فهرست پرونده‌ها؛ خطای یک پرونده
    // نباید مانع نمایش سایر پرونده‌های قابل‌دسترسی شود.
    const consultationsWithDocuments = await Promise.all(
      mapped.map(async (consultation): Promise<ConsultationInquiry> => {
        try {
          const documentsResponse = await fetch(
            `/api/consultations/${encodeURIComponent(consultation.id)}/documents`,
            { credentials: 'same-origin' }
          );

          if (!documentsResponse.ok) return consultation;

          const documentsPayload = await documentsResponse.json();
          if (!Array.isArray(documentsPayload?.documents)) return consultation;

          const allowedDocumentTypes = new Set<CardiacDocument['type']>([
            'ecg',
            'echo',
            'lab_enzymes',
            'holter',
            'angio',
            'prescription',
            'other',
          ]);

          const documents: CardiacDocument[] = documentsPayload.documents
            .filter((doc: unknown) =>
              Boolean(
                doc &&
                typeof doc === 'object' &&
                'id' in doc && typeof doc.id === 'string' &&
                'type' in doc && typeof doc.type === 'string' &&
                allowedDocumentTypes.has(doc.type as CardiacDocument['type']) &&
                'title' in doc && typeof doc.title === 'string' &&
                'fileName' in doc && typeof doc.fileName === 'string'
              )
            )
            .map((doc: {
              id: string;
              type: CardiacDocument['type'];
              title: string;
              fileName: string;
              mimeType?: string;
              fileSize?: number | string;
              notes?: string;
              date?: string;
              createdAt?: string;
              downloadUrl?: string;
              consultationId?: string;
            }) => ({
              id: doc.id,
              consultationId: doc.consultationId || consultation.id,
              type: doc.type,
              title: doc.title,
              fileName: doc.fileName,
              mimeType: doc.mimeType,
              fileSize: doc.fileSize ?? 'نامشخص',
              notes: doc.notes || '',
              date: doc.date || '',
              createdAt: doc.createdAt,
              downloadUrl: doc.downloadUrl,
            }));

          return { ...consultation, documents };
        } catch {
          return consultation;
        }
      })
    );

    if (!isCurrent()) return consultationsWithDocuments;

    setSpecialists(mappedSpecialists);
    setConsultations(consultationsWithDocuments);
    setSelectedConsultationId((selected) =>
      consultationsWithDocuments.some((item) => item.id === selected) ? selected : ''
    );
    return consultationsWithDocuments;
  };

  useEffect(() => {
    const user = authUser;
    const isPatient =
      user?.accountType === 'patient' && user.status === 'active';
    const isApprovedDoctor =
      user?.accountType === 'doctor' &&
      user.status === 'approved' &&
      Boolean(user.doctorLevel);

    if (!user || (!isPatient && !isApprovedDoctor)) {
      setConsultations([]);
      setSelectedConsultationId('');
      return;
    }

    let cancelled = false;

    setConsultations([]);
    setSelectedConsultationId('');
    setSpecialists([]);

    loadMyConsultations(user, () => !cancelled).catch((error) => {
      if (!cancelled) {
        console.error('بارگذاری تاریخچه مشاوره ناموفق بود:', error);
        setAuthNotice('بارگذاری تاریخچه مشاوره‌ها انجام نشد؛ لطفاً دوباره تلاش کنید.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    authUser,
    currentPatient.firstName,
    currentPatient.lastName,
    currentPatient.phoneNumber,
    currentPatient.age,
    currentPatient.gender,
  ]);

  // ثبت تصمیم تریاژ در سرور؛ هیچ تغییر محلی پیش از پاسخ موفق اعمال نمی‌شود.
  const handleSubmitTriage = async (
    consultationId: string,
    payload: {
      action: 'refer' | 'resolve' | 'emergency';
      severity: 'low' | 'moderate' | 'high' | 'critical';
      triageNotes: string;
      initialGuidance: string;
      specialistDoctorId?: string;
    }
  ): Promise<boolean> => {
    if (!authUser || authUser.accountType !== 'doctor' ||
        authUser.status !== 'approved' ||
        authUser.doctorLevel !== 'triage_doctor') {
      throw new Error('حساب پزشک تریاژ تأییدشده در دسترس نیست.');
    }

    const response = await fetch(
      `/api/consultations/${encodeURIComponent(consultationId)}/triage`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof result?.error === 'string'
          ? result.error
          : `ثبت تصمیم تریاژ ناموفق بود (HTTP ${response.status}).`
      );
    }

    try {
      await loadMyConsultations(authUser);
      return true;
    } catch (error) {
      console.error('ثبت تصمیم تریاژ موفق بود، اما تازه‌سازی فهرست شکست خورد:', error);
      return false;
    }
  };

  // ثبت پاسخ متخصص در سرور؛ فقط هویت احرازشده مبنای دسترسی است.
  const handleUpdateConsultation = async (
    updated: ConsultationInquiry
  ): Promise<boolean> => {
    const user = authUser;
    const review = updated.specialistReview;

    if (
      !user ||
      user.accountType !== 'doctor' ||
      user.status !== 'approved' ||
      user.doctorLevel !== 'specialist_doctor' ||
      !review
    ) {
      throw new Error('حساب متخصص تأییدشده یا اطلاعات پاسخ معتبر نیست.');
    }

    const response = await fetch(
      `/api/consultations/${encodeURIComponent(updated.id)}/specialist-review`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: review.diagnosis,
          clinicalGuidance: review.clinicalGuidance,
          prescriptionsOrRecommendations: review.prescriptionsOrRecommendations,
          requestedAdditionalInfo: review.requestedAdditionalInfo,
          additionalInfoDescription: review.additionalInfoDescription || '',
          additionalDocumentsNeeded: review.additionalDocumentsNeeded || [],
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof result?.error === 'string'
          ? result.error
          : `ثبت پاسخ متخصص ناموفق بود (HTTP ${response.status}).`
      );
    }

    try {
      await loadMyConsultations(user);
      return true;
    } catch (error) {
      console.error(
        'پاسخ متخصص ثبت شد، اما تازه‌سازی فهرست پرونده‌ها شکست خورد:',
        error
      );
      return false;
    }
  };

  // Persist read state for server notifications; local alerts remain client-only.
  const handleMarkAsRead = async (id: string) => {
    const isServerNotification =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    if (isServerNotification) {
      try {
        const response = await fetch(
          `/api/notifications/${encodeURIComponent(id)}/read`,
          {
            method: 'PATCH',
            credentials: 'same-origin',
          }
        );

        if (!response.ok) {
          throw new Error(`Marking notification read failed: ${response.status}`);
        }
      } catch (error) {
        console.error('ذخیره وضعیت خوانده‌شدن اعلان انجام نشد:', error);
        return;
      }
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Marking all notifications read failed: ${response.status}`);
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('ذخیره وضعیت خوانده‌شدن اعلان‌ها انجام نشد:', error);
    }
  };

  const handleSelectNotification = (notif: InAppNotification) => {
    const patientActive =
      authUser?.accountType === 'patient' &&
      authUser.status === 'active' &&
      authUser.isAdmin !== true;
    const doctorActive =
      authUser?.accountType === 'doctor' &&
      authUser.status === 'approved' &&
      Boolean(authUser.doctorLevel);

    if (!patientActive && !doctorActive) {
      setActiveToast(null);
      return;
    }

    handleMarkAsRead(notif.id);
    if (notif.consultationId) {
      setSelectedConsultationId(notif.consultationId);
    }
    if (notif.actionTab) {
      const patientTabs = new Set([
        'page_one',
        'telemetry',
        'history',
        'result',
        'profile',
        'landing',
        'ai_chat',
      ]);

      if (patientActive && patientTabs.has(notif.actionTab)) {
        setCurrentTab(notif.actionTab);
      } else if (
        (activeRole === 'triage_doctor' || activeRole === 'specialist_doctor') &&
        notif.actionTab === 'doctor_referrals' &&
        authUser?.accountType === 'doctor' &&
        authUser.status === 'approved' &&
        authUser.doctorLevel === activeRole
      ) {
        setCurrentTab('doctor_referrals');
      }
    }
    setActiveToast(null);
  };

  // ثبت متن تکمیلی بیمار در API؛ ارسال فایل در این مسیر پشتیبانی نمی‌شود.
  const handleSubmitSupplementalDocs = async (
    consultationId: string,
    notes: string,
    docs: CardiacDocument[]
  ): Promise<boolean> => {
    const user = authUser;

    if (!user || user.accountType !== 'patient' || user.status !== 'active') {
      throw new Error('برای ثبت اطلاعات تکمیلی باید وارد حساب فعال بیمار شوید.');
    }

    if (!notes.trim()) {
      throw new Error('لطفاً متن اطلاعات تکمیلی را وارد کنید.');
    }

    if (docs.length > 0) {
      throw new Error('ارسال فایل هنوز فعال نیست؛ هیچ فایلی ارسال نشده است.');
    }

    const response = await fetch(
      `/api/consultations/${encodeURIComponent(consultationId)}/supplemental`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientNotes: notes.trim() }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof result?.error === 'string'
          ? result.error
          : `ثبت اطلاعات تکمیلی ناموفق بود (HTTP ${response.status}).`
      );
    }

    try {
      await loadMyConsultations(user);
      return true;
    } catch (error) {
      console.error(
        'اطلاعات تکمیلی ثبت شد، اما تازه‌سازی فهرست پرونده‌ها ناموفق بود:',
        error
      );
      return false;
    }
  };

  // Open chat with a valid active session.
  const handleStartTriageChat = () => {
    if (!isPatientAuthenticated) {
      setReturnToChatAfterAuth(true);
      setAuthModalOpen(true);
      return;
    }

    const activeExists = chatSessions.some(
      (session) => session.id === activeChatSessionId
    );

    if (!activeExists) {
      if (chatSessions.length > 0) {
        setActiveChatSessionId(chatSessions[0].id);
      } else {
        handleNewChatSession();
        return;
      }
    }

    setCurrentTab('ai_chat');
  };

  // Create an empty local session; the AI response comes from /api/chat.
  const handleNewChatSession = () => {
    const newSessionId = `chat-sess-${Date.now()}`;
    const nowStr = new Date().toLocaleString('fa-IR');
    const patientName = `${currentPatient.firstName} ${currentPatient.lastName}`.trim();

    const newSession: ChatSession = {
      id: newSessionId,
      title: 'گفتگوی جدید تریاژ قلبی',
      createdAt: nowStr,
      updatedAt: nowStr,
      patientId: currentPatient.id,
      patientName,
      status: 'chatting',
      messages: [],
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setActiveChatSessionId(newSessionId);
    setCurrentTab('ai_chat');
  };

  // Handler: Delete chat session
  const handleDeleteChatSession = (id: string) => {
    const remaining = chatSessions.filter((s) => s.id !== id);
    setChatSessions(remaining);
    if (activeChatSessionId === id && remaining.length > 0) {
      setActiveChatSessionId(remaining[0].id);
    }
  };

  // Handler: Update chat session
  const handleUpdateChatSession = (updated: ChatSession) => {
    setChatSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // No real referral endpoint exists yet; never create a fake referral.
  const handleReferToDoctor = (
    _session: ChatSession,
    _matchedDoctor: Doctor,
    _clinicalSummary: string,
    _severity: TriageSeverity
  ) => {
    alert('ارجاع به پزشک هنوز به سرویس واقعی متصل نیست؛ هیچ ارجاعی ثبت یا ارسال نشد.');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        setAuthNotice('خروج از حساب انجام نشد. لطفاً دوباره تلاش کنید.');
        return;
      }

      chatStorageOwnerRef.current = null;
      setChatSessions([]);
      setActiveChatSessionId('');
      setAuthUser(null);
      setCurrentPatient({
        id: '', firstName: '', lastName: '', nationalCode: '',
        phoneNumber: '', username: '', age: 0, gender: '',
        nationality: '', occupation: '', medicalHistory: [],
        currentMedications: [],
      });
      setNotifications([]);
      setActiveToast(null);
      setConsultations([]);
      setSelectedConsultationId('');
      setSpecialists([]);
      setCurrentDoctor(null);
      setTriageDoctor(null);
      setCurrentTab('landing');
      setAuthNotice('با موفقیت از حساب خارج شدید.');
      setAuthModalOpen(false);
    } catch {
      setAuthNotice('ارتباط با سرور برقرار نشد؛ وضعیت ورود تغییر نکرد.');
    }
  };


  if (!authReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 font-['Vazirmatn',system-ui,sans-serif]"
        dir="rtl"
      >
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-sky-200 border-t-sky-700" />
          <p className="mt-4 text-sm text-slate-600">در حال بررسی وضعیت ورود...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Vazirmatn',system-ui,sans-serif]">
      

      {/* Main Navigation with Brand & Patent Tools */}
      {authUser?.isAdmin === true ? (
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">مدیریت TeleCardio</h1>
            <p className="mt-1 text-xs text-slate-500">تأیید و بررسی حساب پزشکان</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            خروج از حساب
          </button>
        </header>
      ) : (
      <Navbar
        activeRole={activeRole}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        isAuthenticated={isPatientAuthenticated || isApprovedDoctor}
        onLogout={handleLogout}
        onNavigateTab={(tab) => {
          if (tab === 'landing') {
            setCurrentTab('landing');
            return;
          }

          if (tab === 'ai_chat') {
            if (isPatientAuthenticated) {
              setCurrentTab('ai_chat');
            } else {
              setReturnToChatAfterAuth(true);
              setAuthModalOpen(true);
            }
            return;
          }

          if (tab === 'doctor_referrals') {
            if (isApprovedDoctor && authUser?.doctorLevel === activeRole) {
              setCurrentTab('doctor_referrals');
            }
            return;
          }

          const patientTabs = new Set([
            'page_one', 'disclaimer', 'history', 'result', 'profile', 'telemetry',
          ]);

          if (patientTabs.has(tab)) {
            if (isPatientAuthenticated) {
              setCurrentTab(tab);
            } else {
              setAuthModalOpen(true);
            }
          }
        }}
        currentTab={currentTab}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectNotification={handleSelectNotification}
      />
      )}

      {/* Main Content Area Based on Active Role & Tab */}
      {authNotice && (
        <div role="status" className="mx-auto mt-3 w-full max-w-7xl px-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {authNotice}
          </div>
        </div>
      )}
      <main className="flex-1 pb-16">
        {authUser?.isAdmin === true ? <AdminPanel /> : (
          <>
        
        {/* Public landing page for guests; authenticated patients keep their dashboard home. */}
        {!isPatientAuthenticated && activeRole === 'patient' && currentTab === 'landing' && (
          <PublicLandingPage
            onStartTriageChat={handleStartTriageChat}
            onOpenLogin={() => setAuthModalOpen(true)}
          />
        )}

        {isPatientAuthenticated && activeRole === 'patient' && currentTab === 'landing' && (
          <ClinicLandingHero
            onStartTriageChat={handleStartTriageChat}
            onOpenChatHistory={() => setCurrentTab('history')}
            onOpenLoginOrRoles={() => setAuthModalOpen(true)}
            onOpenEmergencyContacts={() => setCurrentTab('profile')}
            activePatientName={`${currentPatient.firstName} ${currentPatient.lastName}`}
            isDoctorMode={false}
          />
        )}

        {/* 2. CHATGPT / CLAUDE / GEMINI STYLE EMPATHETIC AI TRIAGE CHAT */}
        {isPatientAuthenticated && activeRole === 'patient' && currentTab === 'ai_chat' && (
          <CardiacTriageChat
            patientProfile={authUser ? {
              firstName: authUser.firstName,
              lastName: authUser.lastName,
              phoneNumber: authUser.phoneNumber,
              birthDate: authUser.birthDate,
            } : null}
            sessions={chatSessions}
            activeSessionId={activeChatSessionId}
            onSelectSession={(id) => setActiveChatSessionId(id)}
            onNewSession={handleNewChatSession}
            onDeleteSession={handleDeleteChatSession}
            onUpdateSession={handleUpdateChatSession}
            isAuthenticated={isPatientAuthenticated}
            onOpenAuth={() => {
              setReturnToChatAfterAuth(true);
              setAuthModalOpen(true);
            }}
            onReferToDoctor={handleReferToDoctor}
            onBackToHome={() => setCurrentTab('landing')}
            onOpenEmergencyContacts={() => {
              setCurrentTab('profile');
            }}
          />
        )}

        {/* PATIENT PANEL */}
        {isPatientAuthenticated &&
          activeRole === 'patient' &&
          currentTab !== 'landing' &&
          currentTab !== 'ai_chat' &&
          currentTab !== 'doctor_referrals' && (
            <PatientPanel
              currentTab={currentTab}
              onChangeTab={setCurrentTab}
              patient={currentPatient}
              onUpdatePatient={setCurrentPatient}
              consultations={consultations}
              activeConsultation={activeConsultation}
              onSelectConsultation={setSelectedConsultationId}
              onStartTriageChat={handleStartTriageChat}
              onSubmitSupplementalDocs={handleSubmitSupplementalDocs}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onOpenECGModal={(doc) => setActiveECGDoc(doc)}
              onPushAlert={(title, message) => {
                const notif: InAppNotification = {
                  id: `notif-push-${Date.now()}`,
                  type: 'prescription_added',
                  title,
                  message,
                  timestamp: 'هم‌اکنون',
                  read: false,
                  actionTab: 'profile',
                  highlightBadge: 'هشدار مصرف دارو',
                };
                setNotifications((prev) => [notif, ...prev]);
                setActiveToast(notif);
              }}
            />
          )}

        {/* DOCTOR PANEL (triage or specialist, decided by authUser) */}
        {activeRole !== 'patient' && authUser && currentTab === 'doctor_referrals' && (
          <DoctorPanel
            authUser={authUser}
            consultations={consultations}
            triageDoctor={triageDoctor}
            currentDoctor={currentDoctor}
            specialists={specialists}
            onSubmitTriage={handleSubmitTriage}
            onUpdateConsultation={handleUpdateConsultation}
            onOpenECGModal={(doc) => setActiveECGDoc(doc)}
          />
        )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-slate-200">
              TeleCardio — سامانه هوشمند کلینیک مجازی قلب و عروق
            </span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-slate-400">
            خدمات مشاوره و مراقبت مجازی قلب و عروق
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold">
{!isPatientAuthenticated && !isApprovedDoctor && (
              <button onClick={() => setAuthModalOpen(true)} className="hover:text-white transition-colors">
                ورود و ثبت‌نام
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={(user) => {
          if (user.isAdmin === true) {
            loadChatHistoryForUser(null);
            setAuthUser(user);
            setConsultations([]);
            setSelectedConsultationId('');
            setSpecialists([]);
            setCurrentDoctor(null);
            setTriageDoctor(null);
            setCurrentTab('admin');
            setAuthNotice('');
            setAuthModalOpen(false);
            setReturnToChatAfterAuth(false);
            return;
          }

          if (user.accountType === 'patient' && user.status === 'active') {
            loadChatHistoryForUser(user);
            setCurrentPatient(patientFromAuthUser(user));
            setAuthUser(user);
            setCurrentTab(returnToChatAfterAuth ? 'ai_chat' : 'landing');
            setReturnToChatAfterAuth(false);
            setAuthNotice('');
            setAuthModalOpen(false);
            return;
          }

          if (
            user.accountType === 'doctor' &&
            user.status === 'approved' &&
            user.doctorLevel
          ) {
            loadChatHistoryForUser(user);
            setAuthUser(user);
            syncDoctorProfile(user);
            setCurrentTab('doctor_referrals');
            setAuthModalOpen(false);
            return;
          }

          setAuthNotice('وضعیت حساب برای ورود به این بخش مجاز نیست.');
        }}
        onPendingApproval={(message) => {
          setAuthNotice(message);
          setAuthModalOpen(false);
        }}
      />
{activeECGDoc && (
        <ECGViewerModal
          document={activeECGDoc}
          onClose={() => setActiveECGDoc(null)}
        />
      )}

      {/* Floating In-App Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onAction={handleSelectNotification}
      />

    </div>
  );
}
