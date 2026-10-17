import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock, Download, LogOut, Search, ShieldCheck, Video, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import parsePhoneNumberFromString from 'libphonenumber-js';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';
import './WebinarAdminDashboard.css';

const EMPTY_SUMMARY = { total: 0, today: 0, verified: 0, pending: 0 };
const STATUS_OPTIONS = ['Registered', 'Confirmed', 'Attended', 'Cancelled'];

function extractRecordId(record) {
  if (!record) return '';
  if (typeof record === 'string') {
    return record === '[object Object]' ? '' : record;
  }
  const raw = record.registrationId || record._id || record.id;
  if (!raw) return '';
  if (typeof raw === 'string') {
    return raw === '[object Object]' ? '' : raw;
  }
  if (typeof raw === 'object') {
    if (raw.oid) return String(raw.oid);
    if (raw.$oid) return String(raw.$oid);
    if (typeof raw.toString === 'function') {
      const str = raw.toString();
      if (str && str !== '[object Object]') return str;
    }
  }
  return '';
}

function text(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (value.oid) return String(value.oid);
    if (value.$oid) return String(value.$oid);
    if (value.date) return formatDate(value.date);
    if (value.$date) return formatDate(value.$date);
    if (typeof value.toString === 'function') {
      const str = value.toString();
      if (str && str !== '[object Object]') return str;
    }
    return JSON.stringify(value);
  }
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
  const raw = (typeof value === 'object' && value !== null && (value.date || value.$date))
    ? (value.date || value.$date)
    : value;
  const date = new Date(raw);
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
  const [sendingBulkPostponement, setSendingBulkPostponement] = useState(false);
  const [retryingBulkPostponement, setRetryingBulkPostponement] = useState(false);
  const [sendingConfirmationIds, setSendingConfirmationIds] = useState({});
  const [sendingPostponementIds, setSendingPostponementIds] = useState({});
  const [sendingZoomIds, setSendingZoomIds] = useState({});
  const [sendingBulkZoom, setSendingBulkZoom] = useState(false);
  const [retryingBulkZoom, setRetryingBulkZoom] = useState(false);
  const [resendingBulkZoom, setResendingBulkZoom] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
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

  async function openDetails(recordOrId) {
    const id = extractRecordId(recordOrId);
    if (!id) {
      setSelected({ error: 'Invalid registration identifier.' });
      return;
    }
    setSelected({ loading: true });
    try {
      const response = await adminApi.get(`/api/admin/registrations/${id}`);
      setSelected(response.data.data);
    } catch (requestError) {
      setSelected({ error: requestError.response?.data?.message || 'Registration details could not be loaded.' });
    }
  }

  async function updateStatus(recordOrId, nextStatus) {
    const id = extractRecordId(recordOrId);
    if (!id) {
      setError('Invalid registration identifier.');
      return;
    }
    setUpdatingId(id);
    setNotice('');
    try {
      await adminApi.put(`/api/admin/registrations/${id}/status`, { status: nextStatus });
      setNotice('Registration status updated.');
      setRefreshKey(value => value + 1);
      if (extractRecordId(selected) === id) setSelected(value => ({ ...value, status: nextStatus }));
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

  function announcementStatusFor(record) {
    if (record.announcementEmailSent === true) return 'Sent';
    if (record.announcementEmailLastError) return 'Failed';
    return 'Not Sent';
  }

  function zoomStatusFor(record) {
    if (record?.joiningEmailSent === true) return 'Sent';
    if (record?.joiningEmailLastError) return 'Failed';
    return 'Not Sent';
  }

  async function sendSingleConfirmation(record, resend = false) {
    const recordId = extractRecordId(record);
    if (!recordId) {
      setError('Cannot send confirmation: registration ID is missing or invalid.');
      return;
    }
    const targetEmail = record?.email || 'this participant';
    const confirmed = window.confirm(resend
      ? `Are you sure you want to resend the confirmation email to ${targetEmail}?`
      : `Send the confirmation email to ${targetEmail}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    setSendingConfirmationIds(current => ({ ...current, [recordId]: true }));

    try {
      const response = await adminApi.post(`/api/admin/registrations/${recordId}/send-confirmation`);
      const updatedRecord = response.data?.data || {};
      setRecords(current => current.map(item => extractRecordId(item) === recordId ? { ...item, ...updatedRecord } : item));
      if (extractRecordId(selected) === recordId) setSelected(current => ({ ...current, ...updatedRecord }));
      setNotice(resend ? `Confirmation email resent to ${targetEmail}.` : `Confirmation email sent to ${targetEmail}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The confirmation email could not be sent.');
    } finally {
      setSendingConfirmationIds(current => ({ ...current, [recordId]: false }));
    }
  }

  async function sendSinglePostponement(record, resend = false) {
    const recordId = extractRecordId(record);
    if (!recordId) {
      setError('Cannot send postponement notice: registration ID is missing or invalid.');
      return;
    }
    const targetEmail = record?.email || 'this participant';
    const confirmed = window.confirm(resend
      ? `Are you sure you want to resend the postponement notice to ${targetEmail}?`
      : `Send the postponement notice to ${targetEmail}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    setSendingPostponementIds(current => ({ ...current, [recordId]: true }));

    try {
      const response = await adminApi.post(`/api/admin/registrations/${recordId}/send-postponement`);
      const updatedRecord = response.data?.data || {};
      setRecords(current => current.map(item => extractRecordId(item) === recordId ? { ...item, ...updatedRecord } : item));
      if (extractRecordId(selected) === recordId) setSelected(current => ({ ...current, ...updatedRecord }));
      setNotice(resend ? `Postponement notice resent to ${targetEmail}.` : `Postponement notice sent to ${targetEmail}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The postponement notice could not be sent.');
    } finally {
      setSendingPostponementIds(current => ({ ...current, [recordId]: false }));
    }
  }

  async function sendSingleZoomLink(record, resend = false) {
    const recordId = extractRecordId(record);
    if (!recordId) {
      setError('Cannot send Zoom link: registration ID is missing or invalid.');
      return;
    }
    const targetEmail = record?.email || 'this participant';
    const confirmed = window.confirm(resend
      ? `Are you sure you want to resend the official Zoom webinar joining details to ${targetEmail}?`
      : `Send the official Zoom webinar joining details to ${targetEmail}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    setSendingZoomIds(current => ({ ...current, [recordId]: true }));

    try {
      const response = await adminApi.post(`/api/admin/registrations/${recordId}/send-joining-link`);
      const updatedRecord = response.data?.data || {};
      setRecords(current => current.map(item => extractRecordId(item) === recordId ? { ...item, ...updatedRecord } : item));
      if (extractRecordId(selected) === recordId) setSelected(current => ({ ...current, ...updatedRecord }));
      setNotice(resend ? `Zoom joining link resent to ${targetEmail}.` : `Zoom joining link sent to ${targetEmail}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The Zoom joining link could not be sent.');
    } finally {
      setSendingZoomIds(current => ({ ...current, [recordId]: false }));
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

  async function sendPostponementToAllRegistrants() {
    const confirmed = window.confirm('This will send the postponement notice to all existing webinar registrants who have not already received it. Continue?');
    if (!confirmed) return;

    setSendingBulkPostponement(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/send-postponement', { confirmed: true, delayMs: 250 });
      const summary = response.data?.summary || {};
      const failedCount = Number(summary.failed || 0);
      setNotice(`Postponement email sending completed. Total: ${summary.total || 0}. Successfully sent: ${summary.sent || 0}. Failed: ${failedCount}. Skipped: ${summary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The postponement announcement could not be sent.');
    } finally {
      setSendingBulkPostponement(false);
    }
  }

  async function retryFailedPostponements() {
    const confirmed = window.confirm('Are you sure you want to retry sending the postponement notice to all failed recipients?');
    if (!confirmed) return;

    setRetryingBulkPostponement(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/resend-postponement', { confirmed: true, retryFailed: true, delayMs: 250 });
      const summary = response.data?.summary || {};
      const failedCount = Number(summary.failed || 0);
      setNotice(`Postponement retry completed. Total: ${summary.total || 0}. Successfully sent: ${summary.sent || 0}. Failed: ${failedCount}. Skipped: ${summary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The postponement retry could not be completed.');
    } finally {
      setRetryingBulkPostponement(false);
    }
  }

  async function openCampaignPreview() {
    setCampaignLoading(true);
    setCampaignModalOpen(true);
    setError('');
    try {
      const response = await adminApi.get('/api/admin/registrations/joining-campaign');
      setCampaignData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Campaign preview could not be loaded.');
      setCampaignModalOpen(false);
    } finally {
      setCampaignLoading(false);
    }
  }

  async function sendZoomToPendingRegistrants() {
    const pendingCount = campaignData?.summary?.pending ?? summary?.joiningPending ?? 'all pending';
    const confirmed = window.confirm(`Are you sure you want to send the official Zoom joining details to ${pendingCount} pending participants?`);
    if (!confirmed) return;

    setSendingBulkZoom(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/send-joining-link', { confirmed: true, delayMs: 250 });
      const respSummary = response.data?.summary || {};
      const failedCount = Number(respSummary.failed || 0);
      setNotice(`Zoom joining email campaign completed. Total: ${respSummary.total || 0}. Successfully sent: ${respSummary.sent || 0}. Failed: ${failedCount}. Skipped: ${respSummary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
      setCampaignModalOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Zoom joining link campaign could not be completed.');
    } finally {
      setSendingBulkZoom(false);
    }
  }

  async function retryFailedZoomRegistrants() {
    const failedCount = campaignData?.summary?.failed ?? summary?.joiningFailed ?? 'failed';
    const confirmed = window.confirm(`Are you sure you want to retry sending the Zoom joining link to ${failedCount} failed participants?`);
    if (!confirmed) return;

    setRetryingBulkZoom(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/send-joining-link', { confirmed: true, retryFailed: true, delayMs: 250 });
      const respSummary = response.data?.summary || {};
      const failedCount = Number(respSummary.failed || 0);
      setNotice(`Retry completed. Total: ${respSummary.total || 0}. Successfully sent: ${respSummary.sent || 0}. Failed: ${failedCount}. Skipped: ${respSummary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
      setCampaignModalOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Retry could not be completed.');
    } finally {
      setRetryingBulkZoom(false);
    }
  }

  async function resendAllZoomRegistrants() {
    const confirmed = window.confirm('WARNING: This will re-send the Zoom joining link to EVERY registered participant, including those who already received it. Are you sure you want to continue?');
    if (!confirmed) return;

    setResendingBulkZoom(true);
    setError('');
    setNotice('');

    try {
      const response = await adminApi.post('/api/admin/registrations/resend-joining-link', { confirmed: true, delayMs: 250 });
      const respSummary = response.data?.summary || {};
      const failedCount = Number(respSummary.failed || 0);
      setNotice(`Resend completed. Total: ${respSummary.total || 0}. Successfully sent: ${respSummary.sent || 0}. Failed: ${failedCount}. Skipped: ${respSummary.skipped || 0}.`);
      setRefreshKey(value => value + 1);
      if (failedCount > 0 && Array.isArray(response.data?.failedEmails) && response.data.failedEmails.length > 0) {
        setError(`Failed recipients: ${response.data.failedEmails.join(', ')}`);
      }
      setCampaignModalOpen(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Resend could not be completed.');
    } finally {
      setResendingBulkZoom(false);
    }
  }

  async function handleSendStartingReminder() {
    const confirmed = window.confirm(
      'Are you ready to send the one-hour webinar starting reminder to all registered participants?\n\n' +
      'Subject: Webinar Starting in One Hour | Halal Trade, Investments & Generational Wealth\n\n' +
      'Click OK only when you are ready to send.'
    );
    if (!confirmed) return;

    setError('');
    setNotice('');
    setSendingReminder(true);

    try {
      const response = await adminApi.post('/api/admin/registrations/send-starting-reminder', { confirmed: true });
      const summary = response.data?.summary || {};
      const sent = summary.sent || 0;
      const failed = summary.failed || 0;
      const skipped = summary.skipped || 0;

      if (failed > 0) {
        setError(`Webinar starting reminder completed with failures: ${sent} sent, ${failed} failed, ${skipped} skipped.`);
      } else {
        setNotice(`Webinar starting reminder sent successfully to all eligible participants (${sent} sent, ${skipped} skipped, ${failed} failed).`);
      }
      setRefreshKey(value => value + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The webinar starting reminder could not be sent.');
    } finally {
      setSendingReminder(false);
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
            <div className="webinar-admin-reminder-wrapper">
              <button
                className="webinar-admin-bulk-action webinar-admin-bulk-action-reminder"
                type="button"
                onClick={handleSendStartingReminder}
                disabled={sendingReminder || sendingBulkPending || sendingBulkResend || sendingBulkPostponement || retryingBulkPostponement || sendingBulkZoom || retryingBulkZoom || resendingBulkZoom}
              >
                <Clock size={16} style={{ marginRight: '6px' }} />
                {sendingReminder ? 'Sending Reminder…' : 'Send Webinar Starting Reminder'}
              </button>
              <p className="webinar-admin-reminder-helper">
                Send the one-hour webinar reminder to all registered participants. Click only when you are ready to send.
              </p>
            </div>
            <button
              className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
              type="button"
              onClick={openCampaignPreview}
              disabled={sendingReminder || sendingBulkPending || sendingBulkResend || sendingBulkPostponement || retryingBulkPostponement || sendingBulkZoom || retryingBulkZoom || resendingBulkZoom}
            >
              <Video size={16} style={{ marginRight: '6px' }} /> Zoom Link Campaign
            </button>
            <button className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary" type="button" onClick={sendPendingRegistrants} disabled={sendingReminder || sendingBulkPending || sendingBulkResend || sendingBulkPostponement || retryingBulkPostponement || sendingBulkZoom || retryingBulkZoom || resendingBulkZoom}>
              {sendingBulkPending ? 'Sending…' : 'Send Confirmations'}
            </button>
            <button className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary" type="button" onClick={sendPostponementToAllRegistrants} disabled={sendingReminder || sendingBulkPending || sendingBulkResend || sendingBulkPostponement || retryingBulkPostponement || sendingBulkZoom || retryingBulkZoom || resendingBulkZoom}>
              {sendingBulkPostponement ? 'Sending…' : 'Send Postponement'}
            </button>
            <button className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary" type="button" onClick={retryFailedPostponements} disabled={sendingReminder || sendingBulkPending || sendingBulkResend || sendingBulkPostponement || retryingBulkPostponement || sendingBulkZoom || retryingBulkZoom || resendingBulkZoom}>
              {retryingBulkPostponement ? 'Retrying…' : 'Retry Postponement'}
            </button>
          </div>
        </div>

        <section className="webinar-admin-summary" aria-label="Registration summary">
          <SummaryCard label="Total registrations" value={summary.total} detail="All webinar records" />
          <SummaryCard label="Zoom links sent" value={summary.joiningSent || 0} detail="Received Zoom link" />
          <SummaryCard label="Zoom links pending" value={summary.joiningPending || 0} detail="Awaiting Zoom link" />
          <SummaryCard label="Verified registrations" value={summary.verified} detail="Confirmed status" />
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
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Location</th>
                  <th>Occupation</th>
                  <th>Industry</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => {
                  const recordId = extractRecordId(record);

                  return (
                    <tr key={recordId || record.email}>
                      <td className="webinar-admin-id">{recordId ? recordId.slice(-8).toUpperCase() : '—'}</td>
                      <td><button className="webinar-admin-name" type="button" onClick={() => openDetails(record)}>{text(record.fullName)}</button></td>
                      <td>{text(record.email)}</td>
                      <td>{formatPhone(record.whatsapp)}</td>
                      <td>{text(record.location)}</td>
                      <td>{text(record.designation)}</td>
                      <td>{text(record.industry)}</td>
                      <td>{formatDate(record.createdAt)}</td>
                      <td><select className={`webinar-admin-status status-${String(record.status || 'Registered').toLowerCase()}`} aria-label={`Status for ${record.fullName || record.email}`} value={record.status || 'Registered'} disabled={updatingId === recordId} onChange={event => updateStatus(record, event.target.value)}>{STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></td>
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

      {selected && (
        <RegistrationDetails
          registration={selected}
          onClose={() => setSelected(null)}
          onSendConfirmation={sendSingleConfirmation}
          onSendPostponement={sendSinglePostponement}
          onSendZoomLink={sendSingleZoomLink}
          isSendingConf={Boolean(sendingConfirmationIds[extractRecordId(selected)])}
          isSendingPost={Boolean(sendingPostponementIds[extractRecordId(selected)])}
          isSendingZoom={Boolean(sendingZoomIds[extractRecordId(selected)])}
        />
      )}

      {campaignModalOpen && (
        <ZoomCampaignModal
          isOpen={campaignModalOpen}
          onClose={() => setCampaignModalOpen(false)}
          loading={campaignLoading}
          data={campaignData}
          onSendPending={sendZoomToPendingRegistrants}
          onRetryFailed={retryFailedZoomRegistrants}
          onResendAll={resendAllZoomRegistrants}
          isSendingPending={sendingBulkZoom}
          isRetryingFailed={retryingBulkZoom}
          isResendingAll={resendingBulkZoom}
        />
      )}
    </main>
  );
}

function SummaryCard({ label, value, detail }) {
  return <article className="webinar-admin-summary-card"><span>{label}</span><strong>{Number(value || 0).toLocaleString()}</strong><small>{detail}</small></article>;
}

function RegistrationDetails({
  registration,
  onClose,
  onSendConfirmation,
  onSendPostponement,
  onSendZoomLink,
  isSendingConf,
  isSendingPost,
  isSendingZoom,
}) {
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const hasData = !registration.loading && !registration.error;

  return (
    <div className="webinar-admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="webinar-admin-modal" role="dialog" aria-modal="true" aria-labelledby="webinar-detail-title">
        <header><div><p className="webinar-admin-eyebrow">PARTICIPANT RECORD</p><h2 id="webinar-detail-title">{registration.loading ? 'Loading details…' : registration.error ? 'Details unavailable' : text(registration.fullName)}</h2></div><button type="button" onClick={onClose} aria-label="Close details"><X size={19} /></button></header>
        {registration.error && <p className="webinar-admin-alert" role="alert">{registration.error}</p>}
        {hasData && (
          <>
            <dl className="webinar-admin-detail-grid">
              {Object.entries(registration).filter(([key]) => !['_id', '__v', '$__', '_doc', '$locals', '$op', 'isNew', 'errors'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <dt>{labelFor(key)}</dt>
                  <dd>{key === 'createdAt' || key === 'updatedAt' || key === 'confirmationEmailSentAt' || key === 'announcementEmailSentAt' || key === 'joiningEmailSentAt' || key === 'reminderEmailSentAt' ? formatDate(value, true) : key === 'whatsapp' ? formatPhone(value) : text(value)}</dd>
                </div>
              ))}
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(15, 76, 117, 0.15)' }}>
              <button
                type="button"
                className="webinar-admin-email-action"
                style={{ padding: '8px 14px', background: '#082b49', color: '#fff', borderColor: '#d4af5a' }}
                onClick={() => onSendZoomLink(registration, registration.joiningEmailSent === true)}
                disabled={isSendingZoom}
              >
                {isSendingZoom ? 'Sending…' : registration.joiningEmailSent ? 'Resend Zoom Joining Link' : 'Send Zoom Joining Link'}
              </button>
              <button
                type="button"
                className="webinar-admin-email-action"
                style={{ padding: '8px 14px' }}
                onClick={() => onSendConfirmation(registration, registration.confirmationEmailSent === true)}
                disabled={isSendingConf}
              >
                {isSendingConf ? 'Sending…' : registration.confirmationEmailSent ? 'Resend Confirmation Email' : 'Send Confirmation Email'}
              </button>
              <button
                type="button"
                className="webinar-admin-email-action"
                style={{ padding: '8px 14px' }}
                onClick={() => onSendPostponement(registration, registration.announcementEmailSent === true)}
                disabled={isSendingPost}
              >
                {isSendingPost ? 'Sending…' : registration.announcementEmailSent ? 'Resend Postponement Notice' : 'Send Postponement Notice'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ZoomCampaignModal({
  isOpen,
  onClose,
  loading,
  data,
  onSendPending,
  onRetryFailed,
  onResendAll,
  isSendingPending,
  isRetryingFailed,
  isResendingAll,
}) {
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const summary = data?.summary || { total: 0, sent: 0, pending: 0, failed: 0, eligibleCount: 0 };
  const preview = data?.preview || {};
  const isBusy = isSendingPending || isRetryingFailed || isResendingAll;

  return (
    <div className="webinar-admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isBusy) onClose(); }}>
      <section className="webinar-admin-modal webinar-campaign-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-modal-title">
        <header>
          <div>
            <p className="webinar-admin-eyebrow">OFFICIAL ZOOM JOINING CAMPAIGN</p>
            <h2 id="campaign-modal-title">Zoom Joining Link Campaign</h2>
            <p style={{ margin: '4px 0 0', color: '#607987', fontSize: '13px' }}>
              Halal Trade, Investments &amp; Generational Wealth &bull; Sunday, 18 October 2026
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={isBusy} aria-label="Close campaign preview"><X size={19} /></button>
        </header>

        {loading ? (
          <div className="webinar-admin-empty">Loading campaign status and email template…</div>
        ) : (
          <>
            <div className="webinar-campaign-stats-grid">
              <div className="webinar-campaign-stat-card">
                <span>Total Registrants</span>
                <strong>{summary.total.toLocaleString()}</strong>
              </div>
              <div className="webinar-campaign-stat-card webinar-campaign-stat-sent">
                <span>Zoom Link Sent</span>
                <strong>{summary.sent.toLocaleString()}</strong>
              </div>
              <div className="webinar-campaign-stat-card webinar-campaign-stat-pending">
                <span>Pending to Send</span>
                <strong>{summary.pending.toLocaleString()}</strong>
              </div>
              <div className="webinar-campaign-stat-card webinar-campaign-stat-failed">
                <span>Failed Deliveries</span>
                <strong>{summary.failed.toLocaleString()}</strong>
              </div>
            </div>

            <div className="webinar-campaign-preview-box">
              <div className="webinar-campaign-preview-header">
                <p><strong>Subject:</strong> {preview.subject || 'Your Zoom Joining Link – Halal Wealth Webinar | 18 October 2026'}</p>
                <p><strong>Sender:</strong> Halal Wealth Webinar &lt;info@halalwealth.finance&gt;</p>
              </div>

              <div className="webinar-campaign-zoom-box">
                <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700 }}>Join the webinar using the Zoom link below:</p>
                <a href="https://us06web.zoom.us/j/81487983324?pwd=iiWszjuBKKDHZ7SNibjY9aUkfFVEvS.1" target="_blank" rel="noopener noreferrer" className="webinar-campaign-zoom-link">
                  https://us06web.zoom.us/j/81487983324?pwd=iiWszjuBKKDHZ7SNibjY9aUkfFVEvS.1
                </a>
                <div className="webinar-campaign-zoom-creds">
                  <span>Meeting ID: <strong>814 8798 3324</strong></span>
                  <span>Passcode: <strong>666991</strong></span>
                </div>
              </div>

              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#415a6b', fontSize: '12px', marginTop: '12px' }}>
                {preview.text}
              </div>
            </div>

            <div className="webinar-campaign-actions">
              <button
                type="button"
                className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
                onClick={onSendPending}
                disabled={isBusy || summary.pending === 0}
              >
                {isSendingPending ? 'Sending to Pending…' : `Send Zoom Link to Pending (${summary.pending})`}
              </button>

              <button
                type="button"
                className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary"
                onClick={onRetryFailed}
                disabled={isBusy || summary.failed === 0}
              >
                {isRetryingFailed ? 'Retrying Failed…' : `Retry Failed Only (${summary.failed})`}
              </button>

              <button
                type="button"
                className="webinar-admin-bulk-action webinar-admin-bulk-action-secondary"
                onClick={onResendAll}
                disabled={isBusy || summary.total === 0}
              >
                {isResendingAll ? 'Resending to All…' : `Resend to All (${summary.total})`}
              </button>

              <button
                type="button"
                className="webinar-admin-clear"
                style={{ marginLeft: 'auto' }}
                onClick={onClose}
                disabled={isBusy}
              >
                Close
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}