export type TriageSeverity = 'low' | 'moderate' | 'high' | 'emergency';

export type ConsultationStatus = 
  | 'triage_pending'       // در انتظار بررسی تریاژ سطح اول
  | 'referred_to_specialist' // ارجاع به پزشک متخصص قلب
  | 'additional_info_requested' // پزشک درخواست مدارک تکمیلی داده است
  | 'completed'            // پاسخ داده شده و تکمیل شده
  | 'emergency_redirect';  // هدایت فوری به اورژانس ۱۱۵

export interface CardiacDocument {
  id: string;
  type: 'ecg' | 'echo' | 'lab_enzymes' | 'holter' | 'angio' | 'prescription' | 'other';
  title: string;
  date: string;
  fileName: string;
  fileSize: string;
  notes?: string;
  previewUrl?: string;
  ecgData?: {
    heartRate: number;
    rhythm: string;
    prInterval?: string;
    qrsDuration?: string;
    qtc?: string;
    stChanges?: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  subSpecialty: string;
  avatar: string;
  medicalCouncilNumber: string;
  experienceYears: number;
  availableDays: string[];
  isTriageDoctor?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string; // e.g. همسر، فرزند، پزشک معالج، همسایه، درمانگاه محلی
  phoneNumber: string;
  isPrimary?: boolean;
  notes?: string;
  address?: string;
}

export interface PatientUser {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phoneNumber: string;
  email?: string;
  username: string;
  age: number;
  gender: 'مرد' | 'زن';
  bloodPressure?: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies?: string[];
  emergencyContacts?: EmergencyContact[];
}

export interface ConsultationInquiry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'مرد' | 'زن';
  targetDoctorId: string;
  targetDoctorName: string;
  createdAt: string;
  updatedAt: string;
  
  // Symptoms & Chief Complaint
  chiefComplaint: string;
  symptomsDuration: string;
  symptomsDescription: string;
  chestPainDetails?: {
    painType: string;
    radiatingTo: string[];
    triggers: string[];
    associatedSymptoms: string[];
  };

  // Uploaded Cardiac Documents (from Patent Page 5)
  documents: CardiacDocument[];

  // Triage Phase (from Patent Page 3)
  triage?: {
    doctorId: string;
    doctorName: string;
    reviewedAt: string;
    severity: TriageSeverity;
    triageNotes: string;
    passedToSpecialist: boolean;
    initialGuidance?: string;
  };

  // Specialist Phase (from Patent Page 6)
  specialistReview?: {
    doctorId: string;
    doctorName: string;
    reviewedAt: string;
    diagnosis: string;
    clinicalGuidance: string;
    prescriptionsOrRecommendations: string[];
    
    // Checkbox from patent: "درخواست تکمیل اطلاعات از سوی بیمار"
    requestedAdditionalInfo: boolean;
    additionalInfoDescription?: string;
    additionalDocumentsNeeded?: string[];
  };

  // Patient Supplemental Submission (from Patent Page 7)
  supplementalResponse?: {
    submittedAt: string;
    patientNotes: string;
    additionalDocuments: CardiacDocument[];
  };

  status: ConsultationStatus;
}

export type NotificationType = 
  | 'specialist_reply'          // پاسخ جدید از پزشک متخصص
  | 'additional_info_requested' // درخواست مدارک یا اطلاعات تکمیلی (ص ۶ و ۷ پتنت)
  | 'prescription_added'        // ثبت دستور دارویی یا مراقبتی جدید
  | 'triage_approved'           // تایید تریاژ و ارجاع به متخصص
  | 'vitals_alert';             // هشدار در روند علائم حیاتی

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  consultationId?: string;
  doctorName?: string;
  actionTab?: 'page_one' | 'inquiry_form' | 'telemetry' | 'history' | 'result' | 'profile' | 'landing' | 'ai_chat' | 'doctor_referrals';
  highlightBadge?: string;
}
