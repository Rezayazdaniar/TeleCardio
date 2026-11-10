import React from 'react';
import { X, Download, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { CardiacDocument } from '../types';

interface Props {
  document: CardiacDocument;
  onClose: () => void;
}

export const ECGViewerModal: React.FC<Props> = ({ document, onClose }) => {
  const mimeType = document.mimeType?.toLowerCase() || '';
  const isPdf = mimeType === 'application/pdf';
  const isImage = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ].includes(mimeType);
  const canPreview = Boolean(document.downloadUrl) && (isPdf || isImage);

  const typeLabels: Record<CardiacDocument['type'], string> = {
    ecg: 'نوار قلب (ECG)',
    echo: 'اکوکاردیوگرافی',
    lab_enzymes: 'آزمایش خون و آنزیم‌های قلبی',
    holter: 'هولتر',
    angio: 'آنژیوگرافی',
    prescription: 'نسخه پزشکی',
    other: 'سایر مدارک',
  };

  const formattedSize =
    typeof document.fileSize === 'number'
      ? `${(document.fileSize / 1024).toFixed(1)} KB`
      : document.fileSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col my-8"
        role="dialog"
        aria-modal="true"
        aria-label="نمایش مدرک پرونده"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-slate-800 text-slate-300 rounded-xl">
              {isImage ? (
                <ImageIcon className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-slate-100">
                نمایش مدرک پرونده
              </h3>
              <p className="text-xs text-slate-400 break-words">
                {document.title} · {typeLabels[document.type]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950">
          {canPreview && isPdf && (
            <iframe
              title={`پیش‌نمایش ${document.title}`}
              src={document.downloadUrl}
              className="w-full h-[65vh] min-h-[350px] rounded-lg bg-white"
            />
          )}

          {canPreview && isImage && (
            <div className="flex justify-center items-center min-h-[250px] max-h-[70vh] overflow-auto">
              <img
                src={document.downloadUrl}
                alt={document.title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          )}

          {!canPreview && (
            <div className="min-h-[250px] flex flex-col items-center justify-center gap-3 text-center text-slate-300">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="font-semibold">
                پیش‌نمایش این نوع فایل در این پنجره پشتیبانی نمی‌شود.
              </p>
              <p className="text-sm text-slate-400">
                برای مشاهده محتوا، فایل اصلی را دریافت کنید.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">نام فایل</dt>
              <dd className="text-slate-200 break-all" dir="auto">
                {document.fileName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">حجم فایل</dt>
              <dd className="text-slate-200">{formattedSize || 'نامشخص'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">تاریخ مدرک</dt>
              <dd className="text-slate-200">{document.date || 'ثبت نشده'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">نوع محتوا</dt>
              <dd className="text-slate-200">{mimeType || 'نامشخص'}</dd>
            </div>
          </dl>

          {document.notes?.trim() && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">
                توضیحات ثبت‌شده برای مدرک
              </h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                {document.notes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            {document.downloadUrl ? (
              <a
                href={document.downloadUrl}
                download={document.fileName}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg flex items-center gap-2 border border-slate-700"
              >
                <Download className="w-4 h-4" />
                دریافت فایل اصلی
              </a>
            ) : (
              <span className="text-sm text-slate-400">
                پیوند دریافت فایل موجود نیست.
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
