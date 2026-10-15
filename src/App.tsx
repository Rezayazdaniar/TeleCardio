import React, { useState } from 'react';
import { Navbar, ActiveRole } from './components/Navbar';
import { CardiacEmergencyBanner } from './components/CardiacEmergencyBanner';
import { DisclaimerStep } from './components/DisclaimerStep';
import { PatientInquiryForm } from './components/PatientInquiryForm';
import { TriageDoctorView } from './components/TriageDoctorView';
import { SpecialistDoctorView } from './components/SpecialistDoctorView';
import { PatientConsultationResult } from './components/PatientConsultationResult';
import { ConsultationHistoryList } from './components/ConsultationHistoryList';
import { CardiacHealthProfile } from './components/CardiacHealthProfile';
import { AuthModal } from './components/AuthModal';
import { ECGViewerModal } from './components/ECGViewerModal';
import { PatentComparisonModal } from './components/PatentComparisonModal';

import { Doctor, PatientUser, ConsultationInquiry, CardiacDocument } from './types';
import { CURRENT_PATIENT, DOCTORS, INITIAL_CONSULTATIONS } from './data/mockData';
import { Sparkles, HeartPulse, ShieldAlert, ArrowLeft, HelpCircle } from 'lucide-react';
import { PatentPageOne } from './components/PatentPageOne';

export default function App() {
  // Application Roles: Patient, Level 1 Triage Doctor, Level 2 Specialist Cardiologist
  const [activeRole, setActiveRole] = useState<ActiveRole>('patient');
  
  // Active User / Personnel State
  const [currentPatient, setCurrentPatient] = useState<PatientUser>(CURRENT_PATIENT);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(DOCTORS[1]); // Default: Dr. Sohrabi (Specialist)
  const [triageDoctor, setTriageDoctor] = useState<Doctor>(DOCTORS[0]); // Dr. Kazemi (Triage L1)

  // Consultations Database State
  const [consultations, setConsultations] = useState<ConsultationInquiry[]>(INITIAL_CONSULTATIONS);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>('REQ-1403-102'); // Pre-selected consultation with requested docs

  // Active Tab for Patient View: 'page_one' (ص ۱ پتنت - ورودی پیش‌فرض) | 'disclaimer' | 'inquiry_form' (ص ۲ و ۵) | 'history' | 'result' (ص ۳ و ۷) | 'profile'
  const [currentTab, setCurrentTab] = useState<'page_one' | 'disclaimer' | 'inquiry_form' | 'history' | 'result' | 'profile'>('page_one');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [patentModalOpen, setPatentModalOpen] = useState(false);
  const [activeECGDoc, setActiveECGDoc] = useState<CardiacDocument | null>(null);

  // Selected consultation object
  const activeConsultation = consultations.find((c) => c.id === selectedConsultationId) || consultations[0];

  // Handler: Patient Submits New Inquiry (Patent Pages 2 & 5)
  const handleCreateInquiry = (inquiryData: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newId = `REQ-1403-${Math.floor(104 + Math.random() * 890)}`;
    const nowStr = '۱۴۰۳/۰۷/۲۵ - ۱۲:۰۰';

    const newInquiry: ConsultationInquiry = {
      ...inquiryData,
      id: newId,
      createdAt: nowStr,
      updatedAt: nowStr,
      status: 'triage_pending', // Enters triage queue (Patent Page 3)
    };

    setConsultations([newInquiry, ...consultations]);
    setSelectedConsultationId(newId);
    setCurrentTab('history');
    alert(
      `درخواست مشاوره قلبی شما با شماره پیگیری ${newId} با موفقیت ثبت گردید.\nمطابق صفحه ۳ پتنت، این درخواست هم‌اکنون به کارتابل پزشک تریاژ مرکز بهداشت ارسال شد.`
    );
  };

  // Handler: Update Consultation (by Triage or Specialist)
  const handleUpdateConsultation = (updated: ConsultationInquiry) => {
    setConsultations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedConsultationId(updated.id);
  };

  // Handler: Patient Submits Supplemental Info (Patent Page 7)
  const handleSubmitSupplementalDocs = (consultationId: string, notes: string, docs: CardiacDocument[]) => {
    setConsultations((prev) =>
      prev.map((c) => {
        if (c.id === consultationId) {
          return {
            ...c,
            documents: [...c.documents, ...docs],
            status: 'referred_to_specialist', // Send back to specialist for final review
            updatedAt: 'هم‌اکنون',
            supplementalResponse: {
              submittedAt: 'هم‌اکنون',
              patientNotes: notes,
              additionalDocuments: docs,
            },
          };
        }
        return c;
      })
    );
  };

  // Handler for Role Switching
  const handleRoleChange = (role: ActiveRole) => {
    setActiveRole(role);
    if (role === 'triage_doctor') {
      setCurrentDoctor(DOCTORS[0]);
    } else if (role === 'specialist_doctor') {
      setCurrentDoctor(DOCTORS[1]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Vazirmatn',system-ui,sans-serif]">
      
      {/* Top Cardiac Emergency Red-Flag Warning Banner */}
      <CardiacEmergencyBanner />

      {/* Main Navigation with Brand & Patent Tools */}
      <Navbar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        currentPatient={currentPatient}
        currentDoctor={currentDoctor}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenPatentModal={() => setPatentModalOpen(true)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        currentTab={currentTab}
      />

      {/* Quick Ideation & Patent Context Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100/80 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="p-1 rounded-md bg-rose-600 text-white font-mono font-bold text-[10px]">
              PATENT BLUEPRINT
            </span>
            <span className="font-semibold text-slate-800">
              پیاده‌سازی سبک طراحی و معماری پتنت اولیه Tele D در قالب کلینیک مجازی قلب و عروق مرکز جامع سلامت
            </span>
          </div>

          <button
            onClick={() => setPatentModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-900 font-bold hover:underline shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>مشاهده تطبیق هر یک از ۷ تصویر اسکچ با اجزای این سایت</span>
          </button>
        </div>
      </div>

      {/* Main Content Area Based on Active Role & Tab */}
      <main className="flex-1 pb-16">
        
        {/* ROLE 1: PATIENT PORTAL */}
        {activeRole === 'patient' && (
          <>
            {/* Step 1: Patent Page 1 (صفحه اول - ص ۱ پتنت) */}
            {(currentTab === 'page_one' || currentTab === 'disclaimer') && (
              <PatentPageOne
                onStartLogin={() => {
                  setAuthModalOpen(true);
                }}
                onExit={() => {
                  alert('انصراف از ثبت مشاوره غیرحضوری. جهت دریافت خدمات حضوری می‌توانید به نزدیک‌ترین مرکز خدمات جامع سلامت مراجعه نمایید یا در شرایط حاد با ۱۱۵ تماس بگیرید.');
                }}
                onOpenPatentCompare={() => setPatentModalOpen(true)}
              />
            )}

            {/* Step 2 & 5: Patient Inquiry Form & Medical Docs (صفحه ۲ و ۵ پتنت) */}
            {currentTab === 'inquiry_form' && (
              <PatientInquiryForm
                patient={currentPatient}
                onSubmit={handleCreateInquiry}
                onOpenECGModal={(doc) => setActiveECGDoc(doc)}
              />
            )}

            {/* Step 3 & 7: Consultation Response & Supplemental Info Request (صفحه ۷ و ۳ پتنت) */}
            {currentTab === 'result' && activeConsultation && (
              <PatientConsultationResult
                consultation={activeConsultation}
                patient={currentPatient}
                onBack={() => setCurrentTab('history')}
                onOpenECGModal={(doc) => setActiveECGDoc(doc)}
                onSubmitSupplementalDocs={handleSubmitSupplementalDocs}
                onNavigateToSpecialistClinic={() => {
                  alert('ارجاع به سیستم نوبت‌دهی کلینیک تخصصی قلب مرکز جامع سلامت انجام شد.');
                }}
              />
            )}

            {/* Consultation History List */}
            {currentTab === 'history' && (
              <ConsultationHistoryList
                consultations={consultations}
                patient={currentPatient}
                onSelectConsultation={(c) => {
                  setSelectedConsultationId(c.id);
                  setCurrentTab('result');
                }}
                onNewInquiry={() => setCurrentTab('inquiry_form')}
                onOpenECGModal={(doc) => setActiveECGDoc(doc)}
              />
            )}

            {/* Patient Personal Health & Paraclinical Profile (صفحه ۵ پتنت منو) */}
            {currentTab === 'profile' && (
              <CardiacHealthProfile
                patient={currentPatient}
                onUpdatePatient={(p) => setCurrentPatient(p)}
                onOpenECGModal={(doc) => setActiveECGDoc(doc)}
              />
            )}
          </>
        )}

        {/* ROLE 2: LEVEL 1 TRIAGE DOCTOR VIEW (صفحه ۳ پتنت) */}
        {activeRole === 'triage_doctor' && (
          <TriageDoctorView
            consultations={consultations}
            triageDoctor={triageDoctor}
            onUpdateConsultation={handleUpdateConsultation}
            onOpenECGModal={(doc) => setActiveECGDoc(doc)}
          />
        )}

        {/* ROLE 3: LEVEL 2 SPECIALIST CARDIOLOGIST VIEW (صفحه ۶ پتنت) */}
        {activeRole === 'specialist_doctor' && (
          <SpecialistDoctorView
            consultations={consultations}
            doctor={currentDoctor}
            onUpdateConsultation={handleUpdateConsultation}
            onOpenECGModal={(doc) => setActiveECGDoc(doc)}
          />
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
            طراحی شده بر مبنای ایده و معماری پتنت اولیه سامانه Tele D با انطباق بر نیازهای مراقبت قلبی مرکز جامع سلامت
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setPatentModalOpen(true)} className="hover:text-white transition-colors">
              تحلیل پتنت
            </button>
            <button onClick={() => setAuthModalOpen(true)} className="hover:text-white transition-colors">
              ورود/ثبت‌نام (ص ۴)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginAsPatient={(p) => {
          setCurrentPatient(p);
          setActiveRole('patient');
          setCurrentTab('inquiry_form');
        }}
        onLoginAsDoctor={(d) => {
          if (d.isTriageDoctor) {
            setTriageDoctor(d);
            setActiveRole('triage_doctor');
          } else {
            setCurrentDoctor(d);
            setActiveRole('specialist_doctor');
          }
        }}
      />

      <PatentComparisonModal
        isOpen={patentModalOpen}
        onClose={() => setPatentModalOpen(false)}
      />

      {activeECGDoc && (
        <ECGViewerModal
          document={activeECGDoc}
          onClose={() => setActiveECGDoc(null)}
        />
      )}

    </div>
  );
}
