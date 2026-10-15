import React from 'react';
import { 
  FileText, Clock, CheckCircle2, AlertCircle, ChevronLeft, 
  Activity, ArrowLeft, Shield, User, Plus 
} from 'lucide-react';
import { ConsultationInquiry, PatientUser, CardiacDocument } from '../types';

interface Props {
  consultations: ConsultationInquiry[];
  patient: PatientUser;
  onSelectConsultation: (consultation: ConsultationInquiry) => void;
  onNewInquiry: () => void;
  onOpenECGModal: (doc: CardiacDocument) => void;
}

export const ConsultationHistoryList: React.FC<Props> = ({
  consultations,
  patient,
  onSelectConsultation,
  onNewInquiry,
  onOpenECGModal,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            سوابق مشاوره‌ها و پرونده‌های قلب (منوی ص ۵ پتنت)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مشاهده وضعیت بررسی تریاژ، پاسخ متخصصین و پیگیری مدارک تکمیلی
          </p>
        </div>

        <button
          onClick={onNewInquiry}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all self-end sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت مشاوره قلبی جدید (صفحه ۲ و ۵)</span>
        </button>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {consultations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">هیچ سابقه مشاوره‌ای ثبت نشده است</h3>
            <p className="text-xs text-slate-500 mt-1">برای شروع اولین مشاوره بر روی دکمه زیر کلیک کنید.</p>
            <button
              onClick={onNewInquiry}
              className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت مشاوره جدید</span>
            </button>
          </div>
        ) : (
          consultations.map((item) => {
            const hasAdditionalReq = item.status === 'additional_info_requested';
            const isCompleted = item.status === 'completed';
            const isTriagePending = item.status === 'triage_pending';

            return (
              <div
                key={item.id}
                onClick={() => onSelectConsultation(item)}
                className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  hasAdditionalReq
                    ? 'border-amber-300 hover:border-amber-400 ring-1 ring-amber-200'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {item.id}
                    </span>
                    <span className="text-xs text-slate-400">ثبت: {item.createdAt}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {hasAdditionalReq && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>پزشک درخواست مدارک تکمیلی داده است (ص ۷ پتنت)</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>پاسخ داده شده و تکمیل (ص ۳ و ۷)</span>
                      </span>
                    )}
                    {isTriagePending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>در صف بررسی تریاژ مرکز بهداشت (ص ۳)</span>
                      </span>
                    )}
                    {item.status === 'referred_to_specialist' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        <span>تأیید تریاژ و در حال بررسی توسط متخصص</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">{item.chiefComplaint}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.symptomsDescription}
                  </p>
                </div>

                {/* Doctor name & documents info */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-700">
                      پزشک طرف مشاوره: <span className="font-bold text-slate-900">{item.targetDoctorName}</span>
                    </span>
                    <span>• {item.documents.length} مدرک پیوست</span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-600 font-bold group">
                    <span>مشاهده جزئیات و صفحه پاسخ (ص ۷)</span>
                    <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
