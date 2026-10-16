import { TriageSeverity, Doctor } from './index';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient' | 'doctor' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  triageAssessment?: {
    severity: TriageSeverity;
    urgencyScore: number; // 0 to 100
    matchedDoctor: Doctor;
    matchReason: string;
    clinicalSummary: string;
    actionAdvice: string;
  };
  doctorResponse?: {
    doctorId: string;
    doctorName: string;
    specialty: string;
    submittedAt: string;
    diagnosis: string;
    prescriptions: string[];
    clinicalGuidance: string;
    nextStep: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  patientName: string;
  messages: ChatMessage[];
  consultationId?: string;
  status: 'chatting' | 'triage_ready' | 'referred' | 'answered_by_doctor' | 'emergency';
  urgencySeverity?: TriageSeverity;
  urgencyScore?: number;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
}
