import React, { type ComponentProps } from 'react';
import { PatentPageOne } from './PatentPageOne';
import { CardiacTelemetryDashboard } from './CardiacTelemetryDashboard';
import { PatientConsultationResult } from './PatientConsultationResult';
import { ConsultationHistoryList } from './ConsultationHistoryList';
import { CardiacHealthProfile } from './CardiacHealthProfile';
import type { PatientUser, ConsultationInquiry, CardiacDocument } from '../types';
import type { AppTab } from '../types/tabs';

interface PatientPanelProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  patient: PatientUser;
  onUpdatePatient: (p: PatientUser) => void;
  consultations: ConsultationInquiry[];
  activeConsultation: ConsultationInquiry | null | undefined;
  onSelectConsultation: (id: string) => void;
  onStartTriageChat: () => void;
  onSubmitSupplementalDocs: ComponentProps<typeof PatientConsultationResult>['onSubmitSupplementalDocs'];
  onOpenAuthModal: () => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
  onPushAlert: (title: string, message: string) => void;
}

export function PatientPanel(props: PatientPanelProps) {
  const {
    currentTab, onChangeTab, patient, onUpdatePatient, consultations,
    activeConsultation, onSelectConsultation, onStartTriageChat,
    onSubmitSupplementalDocs, onOpenAuthModal, onOpenECGModal, onPushAlert,
  } = props;

  return (
    <>
      {(currentTab === 'page_one' || currentTab === 'disclaimer') && (
        <PatentPageOne
          onStartLogin={onOpenAuthModal}
          onExit={() => {
            alert('انصراف از ثبت مشاوره غیرحضوری. جهت دریافت خدمات حضوری می‌توانید به نزدیک‌ترین مرکز خدمات جامع سلامت مراجعه نمایید یا در شرایط حاد با ۱۱۵ تماس بگیرید.');
          }}
        />
      )}

      {currentTab === 'telemetry' && <CardiacTelemetryDashboard patient={patient} />}

      {currentTab === 'result' && (
        activeConsultation ? (
          <PatientConsultationResult
            consultation={activeConsultation}
            patient={patient}
            onBack={() => onChangeTab('history')}
            onOpenECGModal={onOpenECGModal}
            onSubmitSupplementalDocs={onSubmitSupplementalDocs}
          />
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-slate-800">
            <h2 className="mb-2 text-lg font-bold">پرونده‌ای برای نمایش انتخاب نشده است</h2>
            <p className="mb-4 text-sm">
              ممکن است فهرست پرونده‌ها به‌روزرسانی شده باشد. برای مشاهده پرونده‌های موجود به تاریخچه برگردید.
            </p>
            <button
              type="button"
              onClick={() => onChangeTab('history')}
              className="rounded-xl bg-slate-800 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
            >
              بازگشت به تاریخچه
            </button>
          </div>
        )
      )}

      {currentTab === 'history' && (
        <ConsultationHistoryList
          consultations={consultations}
          patient={patient}
          onSelectConsultation={(c) => {
            onSelectConsultation(c.id);
            onChangeTab('result');
          }}
          onStartTriageChat={onStartTriageChat}
          onOpenECGModal={onOpenECGModal}
        />
      )}

      {currentTab === 'profile' && (
        <CardiacHealthProfile
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onOpenECGModal={onOpenECGModal}
          onNavigateToTelemetry={() => onChangeTab('telemetry')}
          recentConsultation={activeConsultation ?? undefined}
          onTriggerPushAlert={onPushAlert}
        />
      )}
    </>
  );
}
