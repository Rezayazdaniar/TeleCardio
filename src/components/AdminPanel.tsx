import { useCallback, useEffect, useState } from 'react';

type DoctorStatus = 'pending' | 'approved' | 'rejected';
type DoctorLevel = 'triage_doctor' | 'specialist_doctor';

interface AdminDoctor {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  councilNumber: string | null;
  doctorLevel: DoctorLevel | null;
  status: DoctorStatus;
  createdAt: string;
}

type AdminTab = 'doctors' | 'auth-events';
type AuthEventType = 'all' | 'login_success' | 'login_failure' | 'logout';

interface AdminAuthEvent {
  id: string;
  username: string;
  event_type: Exclude<AuthEventType, 'all'>;
  reason: string | null;
  occurred_at: string;
  ip_address: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown' | null;
  suspicious: boolean;
  suspicious_reason: string | null;
}

const authEventLabels: Record<AdminAuthEvent['event_type'], string> = {
  login_success: 'ورود موفق',
  login_failure: 'ورود ناموفق',
  logout: 'خروج',
};

const authReasonLabels: Record<string, string> = {
  invalid_credentials: 'نام کاربری یا رمز عبور نادرست',
  account_rejected: 'حساب رد شده است',
  doctor_pending: 'حساب پزشک هنوز تأیید نشده است',
  doctor_level_missing: 'سطح دسترسی پزشک تعیین نشده است',
};

const statusLabels: Record<DoctorStatus, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};

const levelLabels: Record<DoctorLevel, string> = {
  triage_doctor: 'پزشک تریاژ',
  specialist_doctor: 'متخصص',
};

export function AdminPanel() {
  const [status, setStatus] = useState<DoctorStatus>('pending');
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [levels, setLevels] = useState<Record<string, DoctorLevel>>({});
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors');
  const [eventType, setEventType] = useState<AuthEventType>('all');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [authEvents, setAuthEvents] = useState<AdminAuthEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/doctors?status=${encodeURIComponent(status)}`,
        { credentials: 'same-origin' },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'دریافت فهرست پزشکان انجام نشد.',
        );
      }

      setDoctors(Array.isArray(data?.doctors) ? data.doctors : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارتباط با سرور برقرار نشد.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  const loadAuthEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');

    try {
      const params = new URLSearchParams({ limit: '100' });
      if (eventType !== 'all') {
        params.set('eventType', eventType);
      }
      if (suspiciousOnly) {
        params.set('suspiciousOnly', 'true');
      }

      const response = await fetch(
        `/api/admin/auth-events?${params.toString()}`,
        { credentials: 'same-origin' },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'دریافت گزارش ورود و خروج انجام نشد.',
        );
      }

      setAuthEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err) {
      setEventsError(
        err instanceof Error ? err.message : 'ارتباط با سرور برقرار نشد.',
      );
      setAuthEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [eventType, suspiciousOnly]);

  useEffect(() => {
    if (activeTab === 'auth-events') {
      void loadAuthEvents();
    }
  }, [activeTab, loadAuthEvents]);

  const reviewDoctor = async (
    doctor: AdminDoctor,
    action: 'approve' | 'reject',
  ) => {
    const doctorLevel = levels[doctor.id] ?? 'triage_doctor';

    if (
      action === 'reject' &&
      !window.confirm(`درخواست ${doctor.firstName} ${doctor.lastName} رد شود؟`)
    ) {
      return;
    }

    setBusyId(doctor.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `/api/admin/doctors/${encodeURIComponent(doctor.id)}/${action}`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          ...(action === 'approve'
            ? { body: JSON.stringify({ doctorLevel }) }
            : {}),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'ثبت تصمیم انجام نشد.',
        );
      }

      setNotice(
        action === 'approve'
          ? 'حساب پزشک با موفقیت تأیید شد.'
          : 'درخواست پزشک رد شد.',
      );
      await loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارتباط با سرور برقرار نشد.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section dir="rtl" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            مدیریت پزشکان
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            درخواست‌های ثبت‌نام را بررسی و سطح دسترسی پزشکان تأییدشده را تعیین کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDoctors()}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
        >
          تازه‌سازی فهرست
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          aria-pressed={activeTab === 'doctors'}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          مدیریت پزشکان
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('auth-events')}
          aria-pressed={activeTab === 'auth-events'}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            activeTab === 'auth-events'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          گزارش ورود و خروج
        </button>
      </div>

      {activeTab === 'doctors' ? (
      <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label htmlFor="admin-doctor-status" className="text-sm font-bold text-slate-700">
          وضعیت درخواست
        </label>
        <select
          id="admin-doctor-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as DoctorStatus)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="pending">در انتظار بررسی</option>
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          در حال دریافت فهرست پزشکان…
        </p>
      ) : doctors.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          پزشکی با وضعیت «{statusLabels[status]}» پیدا نشد.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {statusLabels[doctor.status]}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {doctor.councilNumber || 'شماره نظام ثبت نشده'}
                </span>
              </div>

              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-slate-600">تلفن:</dt>
                  <dd dir="ltr" className="text-slate-800">{doctor.phone}</dd>
                </div>
                {doctor.email && (
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-bold text-slate-600">ایمیل:</dt>
                    <dd className="break-all text-slate-800">{doctor.email}</dd>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-slate-600">تاریخ ثبت:</dt>
                  <dd className="text-slate-800">
                    {new Date(doctor.createdAt).toLocaleString('fa-IR')}
                  </dd>
                </div>
                {doctor.doctorLevel && (
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-bold text-slate-600">سطح فعلی:</dt>
                    <dd className="text-slate-800">
                      {levelLabels[doctor.doctorLevel]}
                    </dd>
                  </div>
                )}
              </dl>

              {doctor.status === 'pending' && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <label
                    htmlFor={`doctor-level-${doctor.id}`}
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    سطح دسترسی هنگام تأیید
                  </label>
                  <select
                    id={`doctor-level-${doctor.id}`}
                    value={levels[doctor.id] ?? 'triage_doctor'}
                    onChange={(event) =>
                      setLevels((previous) => ({
                        ...previous,
                        [doctor.id]: event.target.value as DoctorLevel,
                      }))
                    }
                    disabled={busyId === doctor.id}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="triage_doctor">پزشک تریاژ</option>
                    <option value="specialist_doctor">متخصص</option>
                  </select>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void reviewDoctor(doctor, 'approve')}
                      disabled={busyId !== null}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {busyId === doctor.id ? 'در حال ثبت…' : 'تأیید پزشک'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void reviewDoctor(doctor, 'reject')}
                      disabled={busyId !== null}
                      className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      رد درخواست
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      </>
      ) : (
        <section aria-labelledby="admin-auth-events-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                id="admin-auth-events-heading"
                className="text-xl font-extrabold text-slate-900"
              >
                گزارش رویدادهای حساب کاربری
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                حداکثر ۱۰۰ رویداد اخیر؛ شامل ورود موفق، ورود ناموفق و خروج.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadAuthEvents()}
              disabled={eventsLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              {eventsLoading ? 'در حال دریافت…' : 'تازه‌سازی گزارش'}
            </button>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label
              htmlFor="admin-auth-event-type"
              className="text-sm font-bold text-slate-700"
            >
              نوع رویداد
            </label>
            <select
              id="admin-auth-event-type"
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value as AuthEventType)
              }
              className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">همه رویدادها</option>
              <option value="login_success">ورود موفق</option>
              <option value="login_failure">ورود ناموفق</option>
              <option value="logout">خروج</option>
            </select>

            <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={suspiciousOnly}
                onChange={(event) => setSuspiciousOnly(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              فقط رویدادهای مشکوک
            </label>
          </div>

          {eventsError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              {eventsError}
            </div>
          )}

          {eventsLoading ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              در حال دریافت گزارش ورود و خروج…
            </p>
          ) : authEvents.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              رویدادی برای این فیلتر پیدا نشد.
            </p>
          ) : (
            <div className="grid gap-3">
              {Array.from(
                authEvents.reduce((groups, item) => {
                  const userEvents = groups.get(item.username) ?? [];
                  userEvents.push(item);
                  groups.set(item.username, userEvents);
                  return groups;
                }, new Map<string, AdminAuthEvent[]>()).entries()
              ).map(([username, userEvents]) => {
                const suspiciousCount = userEvents.filter(
                  (item) => item.suspicious
                ).length;
                const successCount = userEvents.filter(
                  (item) => item.event_type === 'login_success'
                ).length;
                const failureCount = userEvents.filter(
                  (item) => item.event_type === 'login_failure'
                ).length;
                const logoutCount = userEvents.filter(
                  (item) => item.event_type === 'logout'
                ).length;
                const latestEvent = userEvents[0];

                const formatEventTime = (value: string) =>
                  Number.isNaN(Date.parse(value))
                    ? value
                    : new Date(value).toLocaleString('fa-IR');

                return (
                  <details
                    key={username}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <summary className="cursor-pointer list-inside p-4 sm:p-5">
                      <span className="break-all text-base font-extrabold text-slate-900">
                        {username}
                      </span>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">
                          ورود موفق: {successCount}
                        </span>
                        <span className="rounded-lg bg-rose-50 px-2 py-1 text-rose-800">
                          ورود ناموفق: {failureCount}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">
                          خروج: {logoutCount}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-1 ${
                            suspiciousCount > 0
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          رویداد مشکوک: {suspiciousCount}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {userEvents.length} رویداد در نتایج فعلی · آخرین فعالیت:{' '}
                        {latestEvent
                          ? formatEventTime(latestEvent.occurred_at)
                          : 'ثبت نشده'}
                      </p>
                    </summary>

                    <div className="grid gap-2 border-t border-slate-200 p-3 sm:p-4">
                      {userEvents.map((item) => (
                        <details
                          key={item.id}
                          className="min-w-0 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <summary className="cursor-pointer p-3">
                            <span className="font-bold text-slate-800">
                              {authEventLabels[item.event_type] ?? item.event_type}
                            </span>
                            <span className="mt-1 block text-xs text-slate-600">
                              {formatEventTime(item.occurred_at)}
                            </span>
                            <span
                              className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-bold ${
                                item.suspicious
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {item.suspicious
                                ? 'مشکوک'
                                : 'علامت مشکوک ثبت نشده'}
                            </span>
                          </summary>

                          <div className="border-t border-slate-200 p-3">
                            <dl className="grid gap-3 text-sm text-slate-700">
                              <div>
                                <dt className="font-bold">نام کاربری</dt>
                                <dd className="mt-1 break-all">{item.username}</dd>
                              </div>
                              <div>
                                <dt className="font-bold">زمان رویداد</dt>
                                <dd className="mt-1">
                                  {formatEventTime(item.occurred_at)}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-bold">نشانی IP</dt>
                                <dd dir="ltr" className="mt-1 break-all text-left">
                                  {item.ip_address || 'ثبت نشده'}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-bold">نوع دستگاه</dt>
                                <dd className="mt-1">
                                  {{
                                    mobile: 'موبایل',
                                    tablet: 'تبلت',
                                    desktop: 'رایانه',
                                    unknown: 'نامشخص',
                                  }[item.device_type || 'unknown']}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-bold">علت رویداد</dt>
                                <dd className="mt-1 break-words">
                                  {item.reason
                                    ? authReasonLabels[item.reason] ?? item.reason
                                    : 'علت مشخصی ثبت نشده'}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-bold">وضعیت بررسی مشکوک بودن</dt>
                                <dd className="mt-1">
                                  {item.suspicious ? (
                                    <span className="font-bold text-amber-800">
                                      مشکوک
                                      {item.suspicious_reason === 'repeated_login_failures'
                                        ? ' — حداقل ۵ تلاش ناموفق از این IP در بازهٔ ۱۰ دقیقه‌ای'
                                        : item.suspicious_reason
                                          ? ` — ${item.suspicious_reason}`
                                          : ''}
                                    </span>
                                  ) : (
                                    <span>
                                      علامت مشکوک ثبت نشده؛ این به‌تنهایی تضمین‌کنندهٔ امنیت حساب نیست.
                                    </span>
                                  )}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}

        </section>
      )}
    </section>
  );
}
