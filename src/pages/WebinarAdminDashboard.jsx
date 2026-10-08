import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Download, LogOut, Search, ShieldCheck, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import parsePhoneNumberFromString from 'libphonenumber-js';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';
import './WebinarAdminDashboard.css';

const EMPTY_SUMMARY = { total: 0, today: 0, verified: 0, pending: 0 };
const STATUS_OPTIONS = ['Registered', 'Confirmed', 'Attended', 'Cancelled'];

function text(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function formatPhone(value) {
  const phone = String(value || '').trim();
  const parsed = phone ? parsePhoneNumberFromString(phone) : undefined;
  return parsed?.isValid() ? parsed.formatInternational() : text(phone);
}

function labelFor(key) {
  if (key === '_id') return 'Record ID';
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, character => character.toUpperCase());
}

function formatDate(value, includeTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(date);
}

export default function WebinarAdminDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [sendingBulkPending, setSendingBulkPending] = useState(false);
  const [sendingBulkResend, setSendingBulkResend] = useState(false);
  const [sendingConfirmationIds, setSendingConfirmationIds] = useState({});
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const params = { page, limit };
    if (searchTerm) params.q = searchTerm;
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;

    setLoading(true);
    setError('');
    adminApi.get('/api/admin/registrations', { params, signal: controller.signal })
      .then(response => {
        setRecords(response.data.data || []);
        setSummary(response.data.summary || EMPTY_SUMMARY);
        setPagination(response.data.pagination || { page: 1, limit, total: 0, totalPages: 1 });
      })
      .catch(requestError => {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.response?.data?.message || 'Registrations could not be loaded. Try again.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [page, limit, searchTerm, status, from, to, refreshKey]);

  function logout() {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    window.dispatchEvent(new Event('admin-session-expired'));
    navigate('/admin/login', { replace: true });
  }

  async function openDetails(id) {
    setSelected({ loading: true });
    try {
      const response = await adminApi.get(`/api/admin/registrations/${id}`);
      setSelected(response.data.data);
    } catch (requestError) {
      setSelected({ error: requestError.response?.data?.message || 'Registration details could not be loaded.' });
    }
  }

  async function updateStatus(id, nextStatus) {
    setUpdatingId(id);
    setNotice('');
    try {
      await adminApi.put(`/api/admin/registrations/${id}/status`, { status: nextStatus });
      setNotice('Registration status updated.');
      setRefreshKey(value => value + 1);
      if (selected?._id === id) setSelected(value => ({ ...value, status: nextStatus }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Status could not be updated. Try again.');
    } finally {
      setUpdatingId('');
    }
  }

  async function exportRegistrations() {
    setExporting(true);
    setError('');
    const params = {};
    if (searchTerm) params.q = searchTerm;
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;
    try {
      const response = await adminApi.get('/api/admin/registrations/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `webinar-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Export could not be created. Try again.');
    } finally {
      setExporting(false);
    }
  }

  function clearFilters() {
    setQuery('');
    setSearchTerm('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  }

  function emailStatusFor(record) {
    if (record.confirmationEmailSent === true) return 'Sent';
    if (record.confirmationEmailLastError) return 'Failed';
    return 'Not Sent';
  }

  async function sendSingleConfirmation(record, resend = false) {
    const targetEmail = record.email || 'this participant';
    const confirmed = window.confirm(resend
      ? `Are you sure you want to resend the confirmation email to ${targetEmail}?`
      : `Send the confirmation email to ${targetEmail}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    setSendingConfirmationIds(current => ({ ...current, [record._id]: true }));

    try {
      const response = await adminApi.post(`/api/admin/registrations/${record._id}/send-confirmation`);
      const updatedRecord = response.data?.data || {};
      setRecords(current => current.map(item => item._id === record._id ? { ...item, ...updatedRecord } : item));
      if (selected?._id === record._id) setSelected(current => ({ ...current, ...updatedRecord }));
      setNotice(resend ? `Confirmation email resent to ${targetEmail}.` : `Confirmation email sent to ${targetEmail}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The confirmation email could not be sent.');
    } finally {
      setSendingConfirmationIds(current => ({ ...current, [record._id]: false }));
    }
  }

  async function sendPendingRegistrants() {
    const confirmed = window.confirm('Are you sure you want to send the webinar confirmation email to all registered participants who have not received it?');
    if (!confirmed) return;

    setSendingBulkPending(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/send-confirmations');
      const summary = response.data?.summary || {};
      const failedCount = Number(summary.failed || 0);
      setNotice(`Email sending completed. Total: ${summary.total || 0}. Successfully sent: ${summary.sent || 0}. Failed: ${failedCount}. Skipped: ${summary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Pending confirmation emails could not be sent.');
    } finally {
      setSendingBulkPending(false);
    }
  }

  async function resendAllRegistrants() {
    const confirmed = window.confirm('WARNING: This will send an email to every registered participant, including people who have already received it. Continue?');
    if (!confirmed) return;

    setSendingBulkResend(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/resend-confirmations');
      const summary = response.data?.summary || {};
      const failedCount = Number(summary.failed || 0);
      setNotice(`Resend completed. Total: ${summary.total || 0}. Successfully sent: ${summary.sent || 0}. Failed: ${failedCount}. Skipped: ${summary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Resend could not be completed.');
    } finally {
      setSendingBulkResend(false);
    }
  }

  return (
    <main className="webinar-admin-page">
      <header className="webinar-admin-header">
        <Link className="webinar-admin-brand" to="/admin/dashboard" aria-label="Webinar Admin dashboard">
          <span className="webinar-admin-brand-mark"><ShieldCheck size={21} /></span>
          <span><strong>HALAL WEALTH</strong><small>WEBINAR ADMIN</small></span>
        </Link>
        <nav className="webinar-admin-nav" aria-label="Admin navigation">
          <Link to="/admin/summit">Summit registrations</Link>
          <span className="webinar-admin-session">Admin</span>
          <button type="button" onClick={logout}><LogOut size={16} /> Log out</button>
        </nav>
      </header>

      <div className="webinar-admin-content">
        <div className="webinar-admin-title-row">
          <div>
            <p className="webinar-admin-eyebrow">REGISTRATION MANAGEMENT</p>
            <h1>Webinar registrations</h1>
            <p>Search, review and manage participant records.</p>
          </div>
          <div className="webinar-admin-bulk-actions">
            <button className="webinar-admin-export" type="button" onClick={exportRegistrations} disabled={exporting}>
              <Download size={16} /> {exporting ? 'Preparing…' : 'Export CSV'}
            </button>
            <button className="webinar-admin-bulk-action" type="button" onClick={sendPendingRegistrants} disabled={sendingBulkPending || sendingBulkResend}>
              {sendingBulkPending ? 'Sending…' : 'Send to All Pending'}
            </button>
            <button className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary" type="button" onClick={resendAllRegistrants} disabled={sendingBulkPending || sendingBulkResend}>
              {sendingBulkResend ? 'Resending…' : 'Resend to All'}
            </button>
          </div>
        </div>

        <section className="webinar-admin-summary" aria-label="Registration summary">
          <SummaryCard label="Total registrations" value={summary.total} detail="All webinar records" />
          <SummaryCard label="Today's registrations" value={summary.today} detail="Since midnight UTC" />
          <SummaryCard label="Verified registrations" value={summary.verified} detail="Confirmed status" />
          <SummaryCard label="Pending registrations" value={summary.pending} detail="Registered status" />
        </section>

        <section className="webinar-admin-records" aria-labelledby="webinar-records-title">
          <div className="webinar-admin-section-heading">
            <div><h2 id="webinar-records-title">Participants</h2><span>{pagination.total.toLocaleString()} matching records</span></div>
            <label className="webinar-admin-page-size">Rows
              <select value={limit} onChange={event => { setLimit(Number(event.target.value)); setPage(1); }}>
                {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>

          <div className="webinar-admin-filters">
            <label className="webinar-admin-search"><Search size={17} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email or mobile" aria-label="Search webinar registrations" /></label>
            <label className="webinar-admin-filter-field"><span>Status</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></label>
            <label className="webinar-admin-filter-field"><span>From</span><span className="webinar-admin-date"><CalendarDays size={15} /><input type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} /></span></label>
            <label className="webinar-admin-filter-field"><span>To</span><span className="webinar-admin-date"><CalendarDays size={15} /><input type="date" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} /></span></label>
            <button className="webinar-admin-clear" type="button" onClick={clearFilters}><ArrowLeft size={15} /> Clear filters</button>
          </div>

          {error && <div className="webinar-admin-alert" role="alert"><span>{error}</span><button type="button" onClick={() => setRefreshKey(value => value + 1)}>Retry</button></div>}
          {notice && <p className="webinar-admin-notice" role="status">{notice}</p>}

          <div className="webinar-admin-table-wrap" aria-busy={loading}>
            <table className="webinar-admin-table">
              <thead><tr><th>Record ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Location</th><th>Occupation</th><th>Industry</th><th>Registered</th><th>Status</th><th>Email Status</th><th>Action</th></tr></thead>
              <tbody>
                {records.map(record => {
                  const status = emailStatusFor(record);
                  const isSending = Boolean(sendingConfirmationIds[record._id]);
                  const actionLabel = status === 'Sent' ? 'Resend' : 'Send Email';
                  return (
                    <tr key={record._id}>
                      <td className="webinar-admin-id">{String(record._id).slice(-8).toUpperCase()}</td>
                      <td><button className="webinar-admin-name" type="button" onClick={() => openDetails(record._id)}>{text(record.fullName)}</button></td>
                      <td>{text(record.email)}</td>
                      <td>{formatPhone(record.whatsapp)}</td>
                      <td>{text(record.location)}</td>
                      <td>{text(record.designation)}</td>
                      <td>{text(record.industry)}</td>
                      <td>{formatDate(record.createdAt)}</td>
                      <td><select className={`webinar-admin-status status-${String(record.status || 'Registered').toLowerCase()}`} aria-label={`Status for ${record.fullName || record.email}`} value={record.status || 'Registered'} disabled={updatingId === record._id} onChange={event => updateStatus(record._id, event.target.value)}>{STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></td>
                      <td><span className={`webinar-admin-email-pill webinar-admin-email-pill-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span></td>
                      <td><button className="webinar-admin-email-action" type="button" onClick={() => sendSingleConfirmation(record, status === 'Sent')} disabled={isSending}>{isSending ? 'Sending…' : actionLabel}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && <div className="webinar-admin-empty">Loading registrations…</div>}
            {!loading && !error && records.length === 0 && <div className="webinar-admin-empty">No webinar registrations match these filters.</div>}
          </div>

          <div className="webinar-admin-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div>
              <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={18} /> Previous</button>
              <button type="button" aria-label="Next page" disabled={page >= pagination.totalPages || loading} onClick={() => setPage(value => Math.min(pagination.totalPages, value + 1))}>Next <ChevronRight size={18} /></button>
            </div>
          </div>
        </section>
      </div>

      {selected && <RegistrationDetails registration={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function SummaryCard({ label, value, detail }) {
  return <article className="webinar-admin-summary-card"><span>{label}</span><strong>{Number(value || 0).toLocaleString()}</strong><small>{detail}</small></article>;
}

function RegistrationDetails({ registration, onClose }) {
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="webinar-admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="webinar-admin-modal" role="dialog" aria-modal="true" aria-labelledby="webinar-detail-title">
        <header><div><p className="webinar-admin-eyebrow">PARTICIPANT RECORD</p><h2 id="webinar-detail-title">{registration.loading ? 'Loading details…' : registration.error ? 'Details unavailable' : text(registration.fullName)}</h2></div><button type="button" onClick={onClose} aria-label="Close details"><X size={19} /></button></header>
        {registration.error && <p className="webinar-admin-alert" role="alert">{registration.error}</p>}
        {!registration.loading && !registration.error && <dl className="webinar-admin-detail-grid">{Object.entries(registration).filter(([key]) => key !== '__v').map(([key, value]) => <div key={key}><dt>{labelFor(key)}</dt><dd>{key === 'createdAt' || key === 'updatedAt' ? formatDate(value, true) : key === 'whatsapp' ? formatPhone(value) : text(value)}</dd></div>)}</dl>}
      </section>
    </div>
  );
}