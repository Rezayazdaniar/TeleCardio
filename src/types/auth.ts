export type AccountType = 'patient' | 'doctor';

export type AccountStatus =
  | 'active'
  | 'pending'
  | 'approved'
  | 'rejected';

export type DoctorLevel =
  | 'triage_doctor'
  | 'specialist_doctor';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string | null;
  email: string | null;
  gender: 'مرد' | 'زن' | 'ترجیح می‌دهم پاسخ ندهم' | 'سایر' | null;
  nationality: string | null;
  occupation: string | null;
  username: string;
  accountType: AccountType;
  status: AccountStatus;
  doctorLevel: DoctorLevel | null;
  isAdmin: boolean;
}

export interface AuthApiResponse {
  user?: AuthUser;
  error?: string;
  message?: string;
  pendingApproval?: boolean;
}
