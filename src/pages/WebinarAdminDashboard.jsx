import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, LogOut, Mail, RefreshCw, Search, Send, ShieldCheck, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import parsePhoneNumberFromString from 'libphonenumber-js';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';
import './WebinarAdminDashboard.css';

const EMPTY_SUMMARY = {
  total: 0,
  today: 0,
  verified: 0,
  pending: 0,
  deliveredEmails: 0,
  acceptedEmails: 0,
  failedEmails: 0,
  pendingOrUnknownEmails: 0,
};
const STATUS_OPTIONS = ['Registered', 'Confirmed', 'Attended', 'Cancelled'];

function extractRecordId(record) {
  if (!record) return '';
  if (typeof record === 'string') {
    return record === '[object Object]' ? '' : record;
  }
  const raw = record._id || record.id || record.registrationId || record.referenceId;
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
  if (key === 'referenceId') return 'Reference ID';
  if (key === 'registrationId') return 'Registration ID';
  if (key === 'companyName') return 'Company Name';
  if (key === 'businessWebsite') return 'Business Website';
  if (key === 'additionalInfo') return 'Additional Information';
  if (key === 'webinarVersion') return 'Webinar Edition';
  if (key === 'ageGroup') return 'Age Group';
  if (key === 'otherAgeGroup') return 'Other Age Group';
  if (key === 'otherOccupation') return 'Other Occupation';
  if (key === 'otherWebinarSource') return 'Other Webinar Source';
  if (key === 'otherFinancialInterest') return 'Other Financial Interest';
  if (key === 'questionsOrTopics') return 'Questions / Topics';
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

const EMAIL_TEMPLATES = {
  custom: {
    label: 'Custom Email',
    getSubject: () => 'Halal Wealth Webinar Update',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum ${name},\n\nWe hope this message finds you well.\n\n\n\nJazakAllah Khair,\nHalal Wealth Webinar Team`;
    },
  },
  feedback: {
    label: 'Feedback Request',
    getSubject: () => 'Thank You for Attending | Feedback & Future Halal Investing Programs',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum Wr Wb ${name},\n\nHope you have joined our webinar yesterday and benefited from the knowledge shared.\n\nWe would like to hear your feedback and suggestions to help us better plan our future programs.\n\nKindly submit this feedback form:\nhttps://forms.gle/ysMqbTQ37BSnrbGT9\n\nWe look forward to having you join our Halal Investing webinar planned for November 2026. Do stay connected with us.\n\nWhatsApp Community: https://chat.whatsapp.com/I9d41QdjbOGA43kYph2noq\nYouTube: https://youtube.com/@ethicalfinancebasithtamil\nInstagram: https://instagram.com/ethicalfinancebasith.tamil\n\nJazakAllah Khair,\nHalal Wealth Webinar Team`;
    },
  },
  reminder: {
    label: 'Webinar Reminder',
    getSubject: () => 'Webinar Starting in One Hour | Halal Trade, Investments & Generational Wealth',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum Wr Wb ${name},\n\nWe are commencing our Tamil webinar on Halal Trade, Investments & Generational Wealth in an hour.\n\n🗓️ Sunday, 18 October 2026\n🕐 11:00 am IST (1:30 pm SG | 9:30 am UAE | 8:30 am KSA)\n\nLink to join:\nhttps://us06web.zoom.us/j/81487983324?pwd=iiWszjuBKKDHZ7SNibjY9aUkfFVEvS.1\n\nMeeting ID: 814 8798 3324\nPasscode: 666991\n\nSee you in a while, Insha'Allah!\n\nJazakAllahu Khairan,\nBarakah Team\nHalal Wealth Webinar`;
    },
  },
  zoom: {
    label: 'Zoom Joining Link',
    getSubject: () => 'Your Zoom Joining Link – Halal Wealth Webinar | 18 October 2026',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh ${name},\n\nWe are pleased to welcome you to our upcoming Halal Wealth Webinar.\n\nTopic: Halal Trade, Investments & Generational Wealth\nDate: Sunday, 18 October 2026\nTime:\n- India: 11:00 AM IST\n- Singapore: 1:30 PM SGT\n- UAE: 9:30 AM GST\n- Saudi Arabia (KSA): 8:30 AM AST\n\nJoin the webinar using the Zoom link below:\nhttps://us06web.zoom.us/j/81487983324?pwd=iiWszjuBKKDHZ7SNibjY9aUkfFVEvS.1\n\nMeeting ID: 814 8798 3324\nPasscode: 666991\n\nWe encourage you to join a few minutes before the session begins.\n\nWe look forward to welcoming you to an insightful session on Halal trade, ethical investments, financial planning, and generational wealth.\n\nJazakAllahu Khairan,\nBarakah Team\nHalal Wealth Webinar`;
    },
  },
  postponement: {
    label: 'Postponement Notice',
    getSubject: () => 'Important Update: Halal Wealth Webinar Postponed to 18 October 2026',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum warahmatullahi wabarakatuh ${name},\n\nIMPORTANT UPDATE: NEW WEBINAR DATE\n\nDue to unforeseen circumstances, our live Halal Wealth Webinar, originally scheduled for Sunday, 11 October 2026, has been postponed.\n\nPlease note the revised date and time:\n\nDate: Sunday, 18 October 2026\nTime:\n- 11:00 AM IST\n- 1:30 PM Singapore\n- 9:30 AM UAE\n- 8:30 AM KSA\n\nWe sincerely apologize for any inconvenience this sudden change may cause to your weekend schedule. We truly appreciate your understanding and patience.\n\nNO NEED TO REGISTER AGAIN!\nYour existing registration remains valid. We will share the webinar joining link as we get closer to next Sunday. Please keep an eye on your email and WhatsApp messages for further updates.\n\nIn the meantime, stay connected with us to learn more about Islamic finance and Halal investments:\n- YouTube: https://youtube.com/@ethicalfinancebasithtamil\n- Instagram: https://instagram.com/ethicalfinancebasith.tamil\n- WhatsApp Community: https://chat.whatsapp.com/InfThev3br60wmCUWRt3tq\n\nJazakAllah Khair for your understanding and continued support.\n\nJazakAllah,\nHalal Wealth Webinar Team`;
    },
  },
};

export default function WebinarAdminDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [edition, setEdition] = useState('');
  const [selectedWebinarId, setSelectedWebinarId] = useState('halal-wealth-nov-2026');
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
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Individual Email Modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetRecord, setEmailTargetRecord] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailModalError, setEmailModalError] = useState('');
  const [emailModalNotice, setEmailModalNotice] = useState('');

  // Email Delivery Tracking & Resend states
  const [emailStatusFilter, setEmailStatusFilter] = useState('');
  const [inFlightSendId, setInFlightSendId] = useState('');
  const [resendModalRecord, setResendModalRecord] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [resendModalError, setResendModalError] = useState('');

  // Bulk Email states
  const [showSendAllModal, setShowSendAllModal] = useState(false);
  const [sendAllScope, setSendAllScope] = useState('pending_failed');
  const [sendAllForceConfirm, setSendAllForceConfirm] = useState(false);
  const [sendAllLoadingPreview, setSendAllLoadingPreview] = useState(false);
  const [sendAllPreviewCounts, setSendAllPreviewCounts] = useState({ total: 0, eligible: 0, pending: 0, failed: 0, alreadySent: 0, bounced: 0 });
  const [sendAllError, setSendAllError] = useState('');
  const [isStartingBulkJob, setIsStartingBulkJob] = useState(false);
  const [activeBulkJob, setActiveBulkJob] = useState(null);
  const [showBulkProgressModal, setShowBulkProgressModal] = useState(false);

  // Check active bulk job on mount
  useEffect(() => {
    let isMounted = true;
    adminApi.get('/api/admin/registrations/bulk-email/active')
      .then(res => {
        if (isMounted && res.data?.job) {
          setActiveBulkJob(res.data.job);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Poll active bulk job progress while queued or processing
  useEffect(() => {
    if (!activeBulkJob?.jobId) return;
    const isFinished = ['completed', 'failed', 'cancelled'].includes(activeBulkJob.status);
    if (isFinished) return;

    const timer = setInterval(async () => {
      try {
        const res = await adminApi.get(`/api/admin/registrations/bulk-email/${activeBulkJob.jobId}`);
        if (res.data?.job) {
          setActiveBulkJob(res.data.job);
          if (['completed', 'failed', 'cancelled'].includes(res.data.job.status)) {
            setRefreshKey(k => k + 1);
          }
        }
      } catch (_) {}
    }, 1500);

    return () => clearInterval(timer);
  }, [activeBulkJob?.jobId, activeBulkJob?.status]);

  async function openSendAllModal() {
    setShowSendAllModal(true);
    setSendAllError('');
    setSendAllForceConfirm(false);
    setSendAllScope('pending_failed');
    setSendAllLoadingPreview(true);
    try {
      const res = await adminApi.get('/api/admin/registrations/bulk-email/preview', {
        params: { webinarId: selectedWebinarId },
      });
      if (res.data?.success && res.data.counts) {
        setSendAllPreviewCounts(res.data.counts);
      }
    } catch (err) {
      setSendAllError(err.response?.data?.message || 'Could not load eligible recipient counts.');
    } finally {
      setSendAllLoadingPreview(false);
    }
  }

  async function handleStartBulkSend() {
    if (isStartingBulkJob) return;
    if (sendAllScope === 'all' && !sendAllForceConfirm) {
      setSendAllError('Please confirm the warning checkbox before resending to already-sent participants.');
      return;
    }
    setIsStartingBulkJob(true);
    setSendAllError('');
    try {
      const res = await adminApi.post('/api/admin/registrations/bulk-email', {
        webinarId: selectedWebinarId,
        scope: sendAllScope,
        includeSent: sendAllScope === 'all',
      });
      if (res.data?.success) {
        setShowSendAllModal(false);
        setActiveBulkJob({
          jobId: res.data.jobId,
          total: res.data.total,
          status: res.data.status || 'queued',
          processed: 0,
          accepted: 0,
          failed: 0,
          skipped: 0,
          failedRecipients: [],
        });
        setShowBulkProgressModal(true);
      } else {
        setSendAllError(res.data?.message || 'Failed to start bulk email job.');
      }
    } catch (err) {
      setSendAllError(err.response?.data?.message || 'Error initiating bulk email dispatch.');
    } finally {
      setIsStartingBulkJob(false);
    }
  }

  async function handleCancelBulkJob() {
    if (!activeBulkJob?.jobId) return;
    try {
      await adminApi.post(`/api/admin/registrations/bulk-email/${activeBulkJob.jobId}/cancel`);
      setActiveBulkJob(prev => prev ? { ...prev, status: 'cancelling' } : null);
    } catch (err) {
      console.error('Cancel job error:', err);
    }
  }

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
    if (edition) params.edition = edition;
    if (emailStatusFilter) params.emailStatus = emailStatusFilter;
    if (from) params.from = from;
    if (to) params.to = to;
    if (selectedWebinarId && selectedWebinarId !== 'all') params.webinarId = selectedWebinarId;

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
  }, [page, limit, searchTerm, status, edition, emailStatusFilter, from, to, refreshKey, selectedWebinarId]);

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
    if (edition) params.edition = edition;
    if (emailStatusFilter) params.emailStatus = emailStatusFilter;
    if (from) params.from = from;
    if (to) params.to = to;
    if (selectedWebinarId && selectedWebinarId !== 'all') params.webinarId = selectedWebinarId;
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
    setEdition('');
    setEmailStatusFilter('');
    setFrom('');
    setTo('');
    setPage(1);
  }

  async function handleSendConfirmationDirect(record) {
    const id = extractRecordId(record);
    if (!id) {
      setError('Registration ID is missing or invalid.');
      return;
    }
    setInFlightSendId(id);
    setError('');
    setNotice('');
    try {
      const response = await adminApi.post(`/api/admin/registrations/${id}/send-confirmation`);
      if (response.data?.success) {
        setNotice(response.data.message || `Confirmation email sent successfully to ${record.email}.`);
      } else {
        setError(response.data?.message || 'Failed to send confirmation email.');
      }
      setRefreshKey(v => v + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to send confirmation email.');
    } finally {
      setInFlightSendId('');
    }
  }

  function openResendConfirmModal(record) {
    if (!record) return;
    if (!record.email) {
      setError('Cannot send email: this participant does not have an email address.');
      return;
    }
    setResendModalRecord(record);
    setResendModalError('');
  }

  async function handleConfirmResend() {
    if (!resendModalRecord || isResending) return;
    const id = extractRecordId(resendModalRecord);
    setIsResending(true);
    setResendModalError('');
    try {
      const response = await adminApi.post(`/api/admin/registrations/${id}/send-confirmation`, { force: true });
      if (response.data?.success) {
        setNotice(response.data.message || `Confirmation email resent successfully to ${resendModalRecord.email}.`);
        setResendModalRecord(null);
        setRefreshKey(v => v + 1);
      } else {
        setResendModalError(response.data?.message || 'Failed to resend confirmation email.');
      }
    } catch (requestError) {
      setResendModalError(requestError.response?.data?.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  }

  function openEmailModal(record) {
    if (!record) return;
    const targetEmail = record.email;
    if (!targetEmail) {
      setError('Cannot send email: this participant does not have an email address.');
      return;
    }
    const templateKey = 'custom';
    setEmailTargetRecord(record);
    setSelectedTemplate(templateKey);
    setEmailSubject(EMAIL_TEMPLATES[templateKey].getSubject(record));
    setEmailMessage(EMAIL_TEMPLATES[templateKey].getMessage(record));
    setEmailModalError('');
    setEmailModalNotice('');
    setIsSendingEmail(false);
    setEmailModalOpen(true);
  }

  function handleTemplateChange(templateKey) {
    setSelectedTemplate(templateKey);
    setEmailModalError('');
    setEmailModalNotice('');
    const tmpl = EMAIL_TEMPLATES[templateKey];
    if (tmpl) {
      setEmailSubject(tmpl.getSubject(emailTargetRecord));
      setEmailMessage(tmpl.getMessage(emailTargetRecord));
    }
  }

  function closeEmailModal() {
    if (isSendingEmail) return;
    setEmailModalOpen(false);
    setEmailTargetRecord(null);
    setEmailModalError('');
    setEmailModalNotice('');
  }

  async function handleSendEmail(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (isSendingEmail) return;
    if (!emailTargetRecord) return;

    const recordId = extractRecordId(emailTargetRecord);
    if (!recordId) {
      setEmailModalError('Cannot send email: registration ID is missing or invalid.');
      return;
    }

    const cleanSubject = String(emailSubject || '').trim();
    const cleanMessage = String(emailMessage || '').trim();

    if (!cleanSubject) {
      setEmailModalError('Please enter an email subject.');
      return;
    }
    if (!cleanMessage) {
      setEmailModalError('Please enter an email message.');
      return;
    }

    setIsSendingEmail(true);
    setEmailModalError('');
    setEmailModalNotice('');

    try {
      const response = await adminApi.post(`/api/admin/registrations/${recordId}/send-email`, {
        subject: cleanSubject,
        message: cleanMessage,
        template: selectedTemplate,
      });

      const successMsg = response.data?.message || `Email sent successfully to ${emailTargetRecord.email}.`;
      setEmailModalNotice(successMsg);
      setNotice(successMsg);
      setRefreshKey(value => value + 1);
    } catch (err) {
      setEmailModalError(err.response?.data?.message || 'Failed to send email. Please check email service configuration and try again.');
    } finally {
      setIsSendingEmail(false);
    }
  }

  function renderEmailBadge(record) {
    const status = String(record?.emailStatus || 'delivery_unknown').toLowerCase();
    if (status === 'delivered') {
      return (
        <span
          className="webinar-email-badge email-badge-delivered"
          title={record.emailDeliveredAt ? `Delivered: ${formatDate(record.emailDeliveredAt, true)}` : 'Delivered to mailbox'}
        >
          <CheckCircle2 size={12} /> Delivered
        </span>
      );
    }
    if (status === 'accepted') {
      return (
        <span
          className="webinar-email-badge email-badge-accepted"
          title={record.emailLastAttemptAt ? `Accepted: ${formatDate(record.emailLastAttemptAt, true)}` : 'Accepted by email service'}
        >
          <Clock size={12} /> Accepted
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="webinar-email-badge email-badge-pending" title="Awaiting send">
          <Clock size={12} /> Pending
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span
          className="webinar-email-badge email-badge-failed"
          title={record.emailLastError || 'Email delivery failed'}
        >
          <AlertTriangle size={12} /> Failed
        </span>
      );
    }
    if (status === 'bounced') {
      return (
        <span
          className="webinar-email-badge email-badge-bounced"
          title={record.emailLastError || 'Email address bounced permanently'}
        >
          <X size={12} /> Bounced
        </span>
      );
    }
    return (
      <span className="webinar-email-badge email-badge-unknown" title="Legacy registration or status unknown">
        Unknown
      </span>
    );
  }

  function renderRowActions(record) {
    const recordId = extractRecordId(record);
    const status = String(record?.emailStatus || 'pending').toLowerCase();
    const isBusy = inFlightSendId === recordId;

    if (status === 'bounced') {
      return (
        <div className="webinar-admin-actions-cell">
          <button
            type="button"
            className="webinar-admin-row-email-btn btn-bounced"
            disabled
            title={record.emailLastError ? `Bounced: ${record.emailLastError}` : 'Cannot send email to a bounced address'}
          >
            <AlertTriangle size={12} />
            <span>Bounced</span>
          </button>
          <button
            type="button"
            className="webinar-admin-row-icon-btn"
            onClick={() => openEmailModal(record)}
            title="Compose custom email"
            aria-label={`Compose custom email to ${record.fullName || record.email}`}
          >
            <Mail size={13} />
          </button>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className="webinar-admin-actions-cell">
          <button
            type="button"
            className="webinar-admin-row-email-btn btn-send"
            disabled={isBusy}
            onClick={() => handleSendConfirmationDirect(record)}
            title={`Send confirmation email to ${record.fullName || record.email}`}
          >
            <Mail size={12} />
            <span>{isBusy ? 'Sending…' : 'Send Email'}</span>
          </button>
          <button
            type="button"
            className="webinar-admin-row-icon-btn"
            onClick={() => openEmailModal(record)}
            title="Compose custom email"
            aria-label={`Compose custom email to ${record.fullName || record.email}`}
          >
            <Mail size={13} />
          </button>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="webinar-admin-actions-cell">
          <button
            type="button"
            className="webinar-admin-row-email-btn btn-retry"
            disabled={isBusy}
            onClick={() => handleSendConfirmationDirect(record)}
            title={`Retry confirmation email (${record.emailLastError || 'Delivery failed'})`}
          >
            <RefreshCw size={12} className={isBusy ? 'webinar-spin' : ''} />
            <span>{isBusy ? 'Retrying…' : 'Retry Email'}</span>
          </button>
          <button
            type="button"
            className="webinar-admin-row-icon-btn"
            onClick={() => openEmailModal(record)}
            title="Compose custom email"
            aria-label={`Compose custom email to ${record.fullName || record.email}`}
          >
            <Mail size={13} />
          </button>
        </div>
      );
    }

    // accepted, delivered, delivery_unknown
    return (
      <div className="webinar-admin-actions-cell">
        <button
          type="button"
          className="webinar-admin-row-email-btn btn-resend"
          disabled={isBusy}
          onClick={() => openResendConfirmModal(record)}
          title={`Resend confirmation email to ${record.fullName || record.email}`}
        >
          <RefreshCw size={12} className={isBusy ? 'webinar-spin' : ''} />
          <span>{isBusy ? 'Sending…' : 'Resend Email'}</span>
        </button>
        <button
          type="button"
          className="webinar-admin-row-icon-btn"
          onClick={() => openEmailModal(record)}
          title="Compose custom email"
          aria-label={`Compose custom email to ${record.fullName || record.email}`}
        >
          <Mail size={13} />
        </button>
      </div>
    );
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
            <button
              className="webinar-admin-send-all-btn"
              type="button"
              onClick={openSendAllModal}
              disabled={activeBulkJob?.status === 'processing' || activeBulkJob?.status === 'queued'}
              title={activeBulkJob?.status === 'processing' ? 'A bulk email job is currently processing' : 'Send confirmation emails in bulk'}
            >
              {activeBulkJob?.status === 'processing' || activeBulkJob?.status === 'queued' ? (
                <RefreshCw size={15} className="webinar-spin" />
              ) : (
                <Send size={15} />
              )}
              <span>
                {activeBulkJob?.status === 'processing' || activeBulkJob?.status === 'queued'
                  ? 'Sending In Progress…'
                  : 'Send All Emails'}
              </span>
            </button>
            <button className="webinar-admin-export" type="button" onClick={exportRegistrations} disabled={exporting}>
              <Download size={16} /> {exporting ? 'Preparing…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {activeBulkJob && (
          <div className={`webinar-bulk-active-banner banner-${activeBulkJob.status}`}>
            <div className="webinar-bulk-active-banner-info">
              {activeBulkJob.status === 'processing' || activeBulkJob.status === 'queued' ? (
                <RefreshCw size={16} className="webinar-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>
                <strong>Bulk Email Job ({activeBulkJob.status}):</strong>{' '}
                {activeBulkJob.processed} of {activeBulkJob.total} processed
                {' '}({activeBulkJob.accepted} accepted, {activeBulkJob.failed} failed, {activeBulkJob.skipped} skipped)
              </span>
            </div>
            <button type="button" onClick={() => setShowBulkProgressModal(true)}>
              View Live Progress
            </button>
          </div>
        )}

        <section className="webinar-admin-summary" aria-label="Email delivery summary">
          <SummaryCard
            label="Delivered"
            value={summary.deliveredEmails || 0}
            detail="Verified mailbox delivery"
            statusClass="summary-delivered"
          />
          <SummaryCard
            label="Accepted / In flight"
            value={summary.acceptedEmails || 0}
            detail="Accepted by email API"
            statusClass="summary-accepted"
          />
          <SummaryCard
            label="Failed / Bounced"
            value={summary.failedEmails || 0}
            detail="Delivery rejected or bounced"
            statusClass="summary-failed"
          />
          <SummaryCard
            label="Pending / Untracked"
            value={summary.pendingOrUnknownEmails || 0}
            detail="Awaiting send or legacy"
            statusClass="summary-pending"
          />
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
            <label className="webinar-admin-filter-field"><span>Edition</span><select value={edition} onChange={event => { setEdition(event.target.value); setPage(1); }}><option value="">All webinars</option><option value="november">November 1, 2026 Webinar</option><option value="business">Business Webinar 2026</option><option value="october">October 2026 Webinar</option></select></label>
            <label className="webinar-admin-filter-field"><span>Status</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></label>
            <label className="webinar-admin-filter-field"><span>Email Status</span>
              <select value={emailStatusFilter} onChange={event => { setEmailStatusFilter(event.target.value); setPage(1); }}>
                <option value="">All email statuses</option>
                <option value="delivered">Delivered</option>
                <option value="accepted">Accepted / In flight</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="bounced">Bounced</option>
                <option value="delivery_unknown">Unknown / Not tracked</option>
              </select>
            </label>
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
                  <th>Reference ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Email Status</th>
                  <th>Attempts</th>
                  <th>Last Attempt</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => {
                  const recordId = extractRecordId(record);
                  const displayId = record.referenceId || record.registrationId || (recordId ? recordId.slice(-8).toUpperCase() : '—');

                  return (
                    <tr key={recordId || record.email}>
                      <td className="webinar-admin-id" title={record.referenceId || record.registrationId || recordId || ''}>{displayId}</td>
                      <td>
                        <button className="webinar-admin-name" type="button" onClick={() => openDetails(record)}>
                          {text(record.fullName)}
                        </button>
                        {record.webinarVersion === 'November 1, 2026 Webinar' && <span className="webinar-admin-tag-november" title="November 1, 2026 Webinar">Nov 1</span>}
                        {record.webinarVersion === 'Business Webinar 2026' && <span className="webinar-admin-tag-business" title="Business Webinar 2026">Business</span>}
                      </td>
                      <td>{text(record.email)}</td>
                      <td>{formatPhone(record.whatsapp)}</td>
                      <td>{renderEmailBadge(record)}</td>
                      <td style={{ textAlign: 'center' }}>{record.emailAttemptCount || 0}</td>
                      <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{formatDate(record.emailLastAttemptAt, true)}</td>
                      <td>{formatDate(record.createdAt)}</td>
                      <td>
                        <select
                          className={`webinar-admin-status status-${String(record.status || 'Registered').toLowerCase()}`}
                          aria-label={`Status for ${record.fullName || record.email}`}
                          value={record.status || 'Registered'}
                          disabled={updatingId === recordId}
                          onChange={event => updateStatus(record, event.target.value)}
                        >
                          {STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}
                        </select>
                      </td>
                      <td>
                        {renderRowActions(record)}
                      </td>
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
          onOpenEmailModal={openEmailModal}
        />
      )}

      {emailModalOpen && emailTargetRecord && (
        <IndividualEmailModal
          isOpen={emailModalOpen}
          onClose={closeEmailModal}
          participant={emailTargetRecord}
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
          subject={emailSubject}
          onSubjectChange={setEmailSubject}
          message={emailMessage}
          onMessageChange={setEmailMessage}
          onSend={handleSendEmail}
          isSending={isSendingEmail}
          error={emailModalError}
          notice={emailModalNotice}
        />
      )}

      {resendModalRecord && (
        <ResendConfirmationModal
          isOpen={Boolean(resendModalRecord)}
          onClose={() => { if (!isResending) setResendModalRecord(null); }}
          record={resendModalRecord}
          onConfirm={handleConfirmResend}
          isSending={isResending}
          error={resendModalError}
        />
      )}

      {showSendAllModal && (
        <SendAllEmailsModal
          isOpen={showSendAllModal}
          onClose={() => { if (!isStartingBulkJob) setShowSendAllModal(false); }}
          counts={sendAllPreviewCounts}
          loading={sendAllLoadingPreview}
          scope={sendAllScope}
          onScopeChange={setSendAllScope}
          forceConfirm={sendAllForceConfirm}
          onForceConfirmChange={setSendAllForceConfirm}
          onStart={handleStartBulkSend}
          isStarting={isStartingBulkJob}
          error={sendAllError}
        />
      )}

      {showBulkProgressModal && activeBulkJob && (
        <BulkJobProgressModal
          isOpen={showBulkProgressModal}
          onClose={() => setShowBulkProgressModal(false)}
          job={activeBulkJob}
          onCancel={handleCancelBulkJob}
          onRefreshTable={() => {
            setShowBulkProgressModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </main>
  );
}

function SummaryCard({ label, value, detail, statusClass = '' }) {
  return <article className={`webinar-admin-summary-card ${statusClass}`.trim()}><span>{label}</span><strong>{Number(value || 0).toLocaleString()}</strong><small>{detail}</small></article>;
}

function RegistrationDetails({
  registration,
  onClose,
  onOpenEmailModal,
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
        <header>
          <div>
            <p className="webinar-admin-eyebrow">PARTICIPANT RECORD</p>
            <h2 id="webinar-detail-title">{registration.loading ? 'Loading details…' : registration.error ? 'Details unavailable' : text(registration.fullName)}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details"><X size={19} /></button>
        </header>
        {registration.error && <p className="webinar-admin-alert" role="alert">{registration.error}</p>}
        {hasData && (
          <>
            <dl className="webinar-admin-detail-grid">
              {Object.entries(registration).filter(([key]) => !['_id', '__v', '$__', '_doc', '$locals', '$op', 'isNew', 'errors'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <dt>{labelFor(key)}</dt>
                  <dd>{key === 'createdAt' || key === 'updatedAt' || key === 'confirmationEmailSentAt' || key === 'announcementEmailSentAt' || key === 'joiningEmailSentAt' || key === 'reminderEmailSentAt' || key === 'feedbackEmailSentAt' ? formatDate(value, true) : key === 'whatsapp' ? formatPhone(value) : text(value)}</dd>
                </div>
              ))}
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(15, 76, 117, 0.15)' }}>
              <button
                type="button"
                className="webinar-admin-email-action"
                style={{ padding: '8px 14px', background: '#082b49', color: '#fff', borderColor: '#d4af5a' }}
                onClick={() => {
                  onClose();
                  onOpenEmailModal(registration);
                }}
              >
                <Mail size={14} style={{ marginRight: '6px' }} />
                Send Email
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function IndividualEmailModal({
  isOpen,
  onClose,
  participant,
  selectedTemplate,
  onTemplateChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  onSend,
  isSending,
  error,
  notice,
}) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !isSending) onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose, isSending]);

  if (!isOpen || !participant) return null;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <section
        className="webinar-admin-modal webinar-email-composer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-composer-title"
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">INDIVIDUAL MANUAL EMAIL</p>
            <h2 id="email-composer-title">Send Email to Participant</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close email composer"
          >
            <X size={19} />
          </button>
        </header>

        <div className="webinar-email-recipient-card">
          <div className="webinar-email-recipient-field">
            <span className="recipient-label">Recipient:</span>
            <strong className="recipient-value">{participant.fullName || 'Participant'}</strong>
          </div>
          <div className="webinar-email-recipient-field">
            <span className="recipient-label">Registered Email:</span>
            <strong className="recipient-value email-highlight">{participant.email || '—'}</strong>
          </div>
        </div>

        {notice && (
          <p className="webinar-admin-notice" role="status" style={{ margin: '10px 0' }}>
            {notice}
          </p>
        )}
        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '10px 0' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSend} className="webinar-email-form">
          <div className="webinar-email-form-group">
            <label htmlFor="email-template-select">Email Template</label>
            <select
              id="email-template-select"
              value={selectedTemplate}
              onChange={e => onTemplateChange(e.target.value)}
              disabled={isSending}
              className="webinar-email-select"
            >
              <option value="custom">1. Custom Email</option>
              <option value="feedback">2. Feedback Request</option>
              <option value="reminder">3. Webinar Reminder</option>
              <option value="zoom">4. Zoom Joining Link</option>
              <option value="postponement">5. Postponement Notice</option>
            </select>
            <small className="webinar-email-helper">
              Selecting a template fills the subject and message with appropriate default text. You can freely edit both before sending.
            </small>
          </div>

          <div className="webinar-email-form-group">
            <label htmlFor="email-subject-input">
              Subject <span style={{ color: '#c53030' }}>*</span>
            </label>
            <input
              id="email-subject-input"
              type="text"
              maxLength={300}
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              placeholder="Enter email subject"
              disabled={isSending}
              required
              className="webinar-email-input"
            />
          </div>

          <div className="webinar-email-form-group">
            <label htmlFor="email-message-textarea">
              Message <span style={{ color: '#c53030' }}>*</span>
            </label>
            <textarea
              id="email-message-textarea"
              rows={9}
              maxLength={10000}
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder="Compose your email message here..."
              disabled={isSending}
              required
              className="webinar-email-textarea"
            />
          </div>

          <div className="webinar-email-modal-actions">
            <button
              type="button"
              className="webinar-admin-clear"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
              disabled={isSending || !subject.trim() || !message.trim()}
              style={{ minWidth: '130px' }}
            >
              <Mail size={15} style={{ marginRight: '6px' }} />
              {isSending ? 'Sending Email…' : 'Send Email'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ResendConfirmationModal({
  isOpen,
  onClose,
  record,
  onConfirm,
  isSending,
  error,
}) {
  useEffect(() => {
    function closeOnEscape(e) {
      if (e.key === 'Escape' && !isSending) onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose, isSending]);

  if (!isOpen || !record) return null;

  const status = String(record.emailStatus || 'delivery_unknown').toLowerCase();
  const isDelivered = status === 'delivered';
  const isAccepted = status === 'accepted';

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget && !isSending) onClose(); }}
    >
      <section
        className="webinar-admin-modal webinar-resend-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resend-confirm-title"
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">CONFIRM MANUAL RESEND</p>
            <h2 id="resend-confirm-title">Resend Confirmation Email</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSending} aria-label="Close resend confirmation">
            <X size={19} />
          </button>
        </header>

        {isDelivered && (
          <div className="webinar-resend-warning-box warning-delivered">
            <strong>Note:</strong> Resend confirmed this email was previously <strong>Delivered</strong> to the recipient's mail provider. Only resend if the user contacted support stating they lost or did not receive the email.
          </div>
        )}

        {isAccepted && (
          <div className="webinar-resend-warning-box warning-accepted">
            <strong>Note:</strong> This email was previously <strong>Accepted</strong> by the sending service. Delivery may still be in transit or already received.
          </div>
        )}

        {!isDelivered && !isAccepted && (
          <div className="webinar-resend-warning-box warning-general">
            <strong>Note:</strong> Delivery status for this registration is currently untracked or unknown. Resending will dispatch a fresh confirmation email.
          </div>
        )}

        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '10px 0' }}>
            <span>{error}</span>
          </div>
        )}

        <div className="webinar-resend-details-list">
          <div className="webinar-resend-detail-row">
            <span>Recipient:</span>
            <span>{record.fullName || '—'}</span>
          </div>
          <div className="webinar-resend-detail-row">
            <span>Email:</span>
            <span>{record.email || '—'}</span>
          </div>
          <div className="webinar-resend-detail-row">
            <span>Reference ID:</span>
            <span>{record.referenceId || record.registrationId || '—'}</span>
          </div>
          <div className="webinar-resend-detail-row">
            <span>Current Status:</span>
            <span style={{ textTransform: 'capitalize' }}>{record.emailStatus || 'Unknown'}</span>
          </div>
          <div className="webinar-resend-detail-row">
            <span>Total Send Attempts:</span>
            <span>{record.emailAttemptCount || 1}</span>
          </div>
          <div className="webinar-resend-detail-row">
            <span>Last Attempt:</span>
            <span>{formatDate(record.emailLastAttemptAt, true)}</span>
          </div>
        </div>

        <div className="webinar-email-modal-actions">
          <button type="button" className="webinar-admin-clear" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
            onClick={onConfirm}
            disabled={isSending}
            style={{ minWidth: '140px' }}
          >
            <RefreshCw size={14} className={isSending ? 'webinar-spin' : ''} style={{ marginRight: '6px' }} />
            {isSending ? 'Resending…' : 'Confirm Resend'}
          </button>
        </div>
      </section>
    </div>
  );
}

function SendAllEmailsModal({
  isOpen,
  onClose,
  counts,
  loading,
  scope,
  onScopeChange,
  forceConfirm,
  onForceConfirmChange,
  onStart,
  isStarting,
  error,
}) {
  useEffect(() => {
    function closeOnEscape(e) {
      if (e.key === 'Escape' && !isStarting) onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose, isStarting]);

  if (!isOpen) return null;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget && !isStarting) onClose(); }}
    >
      <section
        className="webinar-admin-modal webinar-campaign-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-all-modal-title"
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">BULK EMAIL DISPATCH</p>
            <h2 id="send-all-modal-title">Send Confirmation Emails</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isStarting} aria-label="Close modal">
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#526b78' }}>
            <RefreshCw size={24} className="webinar-spin" style={{ marginBottom: '8px' }} />
            <p>Loading eligible recipient counts...</p>
          </div>
        ) : (
          <>
            <p style={{ margin: '14px 0 6px', fontSize: '13px', color: '#526b78' }}>
              Review the recipient breakdown below before initiating automated background sending via Hostinger SMTP.
            </p>

            <div className="webinar-bulk-stats-grid">
              <div className="webinar-bulk-stat-card webinar-bulk-stat-eligible">
                <span>Eligible</span>
                <strong>{counts.eligible || 0}</strong>
              </div>
              <div className="webinar-bulk-stat-card webinar-bulk-stat-failed">
                <span>Failed</span>
                <strong>{counts.failed || 0}</strong>
              </div>
              <div className="webinar-bulk-stat-card webinar-bulk-stat-pending">
                <span>Pending</span>
                <strong>{counts.pending || 0}</strong>
              </div>
              <div className="webinar-bulk-stat-card webinar-bulk-stat-skipped">
                <span>Already Sent (Skip)</span>
                <strong>{counts.alreadySent || 0}</strong>
              </div>
            </div>

            <div className="webinar-bulk-options-group">
              <label className={`webinar-bulk-option-card ${scope === 'pending_failed' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="bulkScope"
                  value="pending_failed"
                  checked={scope === 'pending_failed'}
                  onChange={() => onScopeChange('pending_failed')}
                  disabled={isStarting}
                />
                <div className="webinar-bulk-option-content">
                  <strong>Send only to Failed and Pending recipients (Recommended)</strong>
                  <p>
                    Safely delivers confirmation emails to unreached participants. Automatically skips all {counts.alreadySent || 0} recipients whose emails were already accepted or delivered.
                  </p>
                </div>
              </label>

              <label className={`webinar-bulk-option-card ${scope === 'all' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="bulkScope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => onScopeChange('all')}
                  disabled={isStarting}
                />
                <div className="webinar-bulk-option-content">
                  <strong>Send to ALL registered recipients ({counts.total || 0} participants)</strong>
                  <p>
                    Forces resending to every participant, including those who already received their confirmation email.
                  </p>
                </div>
              </label>
            </div>

            {scope === 'all' && (
              <div className="webinar-resend-warning-box warning-delivered" style={{ margin: '12px 0' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#991b1b' }}>Duplicate Send Warning:</strong>
                    <p style={{ margin: '4px 0 8px', fontSize: '12px' }}>
                      Sending to all participants will resend confirmation emails to users who already received one. This may result in duplicate notifications.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={forceConfirm}
                        onChange={e => onForceConfirmChange(e.target.checked)}
                        disabled={isStarting}
                        style={{ accentColor: '#082b49' }}
                      />
                      I confirm and approve resending to already-sent participants
                    </label>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="webinar-admin-alert" role="alert" style={{ margin: '12px 0' }}>
                <span>{error}</span>
              </div>
            )}

            <div className="webinar-email-modal-actions">
              <button type="button" className="webinar-admin-clear" onClick={onClose} disabled={isStarting}>
                Cancel
              </button>
              <button
                type="button"
                className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
                onClick={onStart}
                disabled={isStarting || (scope === 'all' && !forceConfirm) || (scope === 'pending_failed' && (counts.eligible || 0) === 0)}
                style={{ minWidth: '150px' }}
              >
                {isStarting ? (
                  <>
                    <RefreshCw size={14} className="webinar-spin" style={{ marginRight: '6px' }} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Send size={14} style={{ marginRight: '6px' }} />
                    Start Bulk Send
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function BulkJobProgressModal({
  isOpen,
  onClose,
  job,
  onCancel,
  onRefreshTable,
}) {
  const isRunning = job.status === 'queued' || job.status === 'processing';
  const isFinished = ['completed', 'failed', 'cancelled'].includes(job.status);
  const percent = Math.min(100, Math.round(((job.processed || 0) / Math.max(1, job.total || 1)) * 100));

  return (
    <div className="webinar-admin-modal-backdrop" role="presentation">
      <section
        className="webinar-admin-modal webinar-campaign-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-progress-title"
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">LIVE SMTP PROGRESS</p>
            <h2 id="bulk-progress-title">
              {isRunning ? 'Sending Emails in Background' : 'Bulk Email Summary'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </header>

        <div className="webinar-bulk-progress-container">
          <div className="webinar-bulk-progress-header">
            <span>
              Status: <strong style={{ textTransform: 'capitalize' }}>{job.status}</strong>
            </span>
            <span>{job.processed || 0} / {job.total || 0} ({percent}%)</span>
          </div>
          <div className="webinar-bulk-progress-track">
            <div className="webinar-bulk-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="webinar-bulk-stats-grid">
          <div className="webinar-bulk-stat-card">
            <span>Total Queued</span>
            <strong>{job.total || 0}</strong>
          </div>
          <div className="webinar-bulk-stat-card webinar-bulk-stat-eligible">
            <span>Accepted (SMTP)</span>
            <strong>{job.accepted || 0}</strong>
          </div>
          <div className="webinar-bulk-stat-card webinar-bulk-stat-failed">
            <span>Failed</span>
            <strong>{job.failed || 0}</strong>
          </div>
          <div className="webinar-bulk-stat-card webinar-bulk-stat-skipped">
            <span>Skipped</span>
            <strong>{job.skipped || 0}</strong>
          </div>
        </div>

        {job.errorMessage && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '12px 0' }}>
            <span>{job.errorMessage}</span>
          </div>
        )}

        {Array.isArray(job.failedRecipients) && job.failedRecipients.length > 0 && (
          <div>
            <p style={{ margin: '12px 0 6px', fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
              Failed Deliveries ({job.failedRecipients.length}):
            </p>
            <div className="webinar-bulk-failures-list">
              {job.failedRecipients.map((f, idx) => (
                <div key={idx} className="webinar-bulk-failure-row">
                  <span><strong>{f.email}</strong> ({f.registrationId})</span>
                  <span>{f.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isFinished && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '13px' }}>
            <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />
            Bulk operation finished. Registration statuses in the database have been updated accordingly.
          </div>
        )}

        <div className="webinar-email-modal-actions" style={{ marginTop: '20px' }}>
          {isRunning ? (
            <>
              <button type="button" className="webinar-admin-clear" onClick={onCancel} style={{ color: '#dc2626' }}>
                Cancel Sending
              </button>
              <button
                type="button"
                className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
                onClick={onClose}
              >
                Close & Run in Background
              </button>
            </>
          ) : (
            <button
              type="button"
              className="webinar-admin-bulk-action webinar-admin-bulk-action-primary"
              onClick={onRefreshTable}
            >
              Done & Refresh Table
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
