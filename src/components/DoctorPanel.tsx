import React from 'react';
import type { ComponentProps } from 'react';
import { TriageDoctorView } from './TriageDoctorView';
import { SpecialistDoctorView } from './SpecialistDoctorView';
import type { Doctor, ConsultationInquiry, CardiacDocument } from '../types';
import type { AuthUser } from '../types/auth';

interface DoctorPanelProps {
  authUser: AuthUser;
  consultations: ConsultationInquiry[];
  triageDoctor: Doctor | null;
  currentDoctor: Doctor | null;
  specialists: Array<{ id: string; name: string }>;
  onSubmitTriage: ComponentProps<typeof TriageDoctorView>['onSubmitTriage'];
  onUpdateConsultation: ComponentProps<typeof SpecialistDoctorView>['onUpdateConsultation'];
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export function DoctorPanel(p: DoctorPanelProps) {
  const u = p.authUser;
  if (u.accountType !== 'doctor' || u.status !== 'approved') return null;

  if (u.doctorLevel === 'triage_doctor' && p.triageDoctor) {
    return (
      <TriageDoctorView
        consultations={p.consultations}
        triageDoctor={p.triageDoctor}
        specialists={p.specialists}
        onSubmitTriage={p.onSubmitTriage}
        onUpdateConsultation={p.onUpdateConsultation}
        onOpenECGModal={p.onOpenECGModal}
      />
    );
  }

  if (u.doctorLevel === 'specialist_doctor' && p.currentDoctor) {
    return (
      <SpecialistDoctorView
        consultations={p.consultations}
        doctor={p.currentDoctor}
        onUpdateConsultation={p.onUpdateConsultation}
        onOpenECGModal={p.onOpenECGModal}
      />
    );
  }

  return null;
}
