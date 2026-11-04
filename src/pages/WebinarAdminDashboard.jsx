import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, LogOut, Mail, PlayCircle, RefreshCw, RotateCcw, Search, Send, ShieldCheck, Users, Video, X } from 'lucide-react';
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
  feedback: {
    label: 'Feedback Sharing Email',
    getSubject: () => 'Your Feedback Matters – Halal Wealth Webinar',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum Wr Wb,\n\nDear ${name},\n\nThank you for being part of our Halal Wealth Webinar!\n\nWe sincerely appreciate your time and participation. We hope the session provided valuable insights into Halal Trade, Investments & Generational Wealth.\n\nYour feedback is important to us. It will help us improve our future webinars and deliver more meaningful sessions.\n\nWe kindly request you to take a few minutes to share your feedback.\n\nSubmit Your Feedback:\nhttps://forms.gle/yzQWLFSDr1va4A5o9\n\nJazakAllahu Khairan,\n\nHalal Wealth Team`;
    },
  },
  recording: {
    label: 'Webinar Recording Email',
    getSubject: () => 'Webinar Recording – Halal Investment & Retirement Planning',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum Wr Wb,\n\nDear ${name},\n\nThank you for being part of our Halal Wealth Webinar.\n\nWe are pleased to share the recording of our session on Halal Investment & Retirement Planning.\n\nIf you missed any part of the session or would like to revisit the valuable insights shared by our speaker, you can watch the complete recording using the link below.\n\nWatch the Webinar Recording:\n\nhttps://youtu.be/dam9grDGDpY?si=MNVFsmet8grttPf0\n\nWe hope this session provides you with valuable insights into Shariah-compliant investments and retirement planning.\n\nStay Connected with Us:\n\nYouTube:\nhttps://www.youtube.com/@ethicalfinancebasithtamil\n\nInstagram:\nhttps://www.instagram.com/ethicalfinancebasith.tamil\n\nWhatsApp Community:\nhttps://chat.whatsapp.com/DNaN5HnNifI3eQ5yv265i9?s=cl&p=a&mlu=4&ilr=4&iam=2\n\nJazakAllahu Khairan,\n\nHalal Wealth Team`;
    },
  },
  custom: {
    label: 'Custom Email',
    getSubject: () => 'Halal Wealth Webinar Update',
    getMessage: (record) => {
      const name = String(record?.fullName || '').trim() || 'Participant';
      return `Assalamu Alaikum ${name},\n\nWe hope this message finds you well.\n\n\n\nJazakAllah Khair,\nHalal Wealth Team`;
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

  // Feedback Email Preview Tab state ('email' | 'recipients')
  const [feedbackPreviewTab, setFeedbackPreviewTab] = useState('email');

  // Webinar Feedback Campaign states
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });
  const [loadingFeedbackStats, setLoadingFeedbackStats] = useState(false);
  const [feedbackActiveState, setFeedbackActiveState] = useState(null);
  const [showFeedbackPreviewModal, setShowFeedbackPreviewModal] = useState(false);
  const [showFeedbackSendConfirmModal, setShowFeedbackSendConfirmModal] = useState(false);
  const [showFeedbackRetryConfirmModal, setShowFeedbackRetryConfirmModal] = useState(false);
  const [feedbackPreviewRecords, setFeedbackPreviewRecords] = useState([]);
  const [feedbackPreviewLoading, setFeedbackPreviewLoading] = useState(false);
  const [feedbackPreviewPage, setFeedbackPreviewPage] = useState(1);
  const [feedbackPreviewPagination, setFeedbackPreviewPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [feedbackPreviewSearch, setFeedbackPreviewSearch] = useState('');
  const [feedbackCampaignError, setFeedbackCampaignError] = useState('');
  const [feedbackCampaignNotice, setFeedbackCampaignNotice] = useState('');
  const [isStartingFeedbackSend, setIsStartingFeedbackSend] = useState(false);
  const [feedbackConfirmChecked, setFeedbackConfirmChecked] = useState(false);
  const [feedbackRetryConfirmChecked, setFeedbackRetryConfirmChecked] = useState(false);
  const [feedbackTestEmail, setFeedbackTestEmail] = useState('');
  const [isSendingFeedbackTest, setIsSendingFeedbackTest] = useState(false);
  const [sendingIndividualId, setSendingIndividualId] = useState(null);

  // Webinar Recording Sharing Campaign states
  const [recordingPreviewTab, setRecordingPreviewTab] = useState('email');
  const [recordingStats, setRecordingStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });
  const [loadingRecordingStats, setLoadingRecordingStats] = useState(false);
  const [recordingActiveState, setRecordingActiveState] = useState(null);
  const [showRecordingPreviewModal, setShowRecordingPreviewModal] = useState(false);
  const [showRecordingSendConfirmModal, setShowRecordingSendConfirmModal] = useState(false);
  const [showRecordingRetryConfirmModal, setShowRecordingRetryConfirmModal] = useState(false);
  const [recordingPreviewRecords, setRecordingPreviewRecords] = useState([]);
  const [recordingPreviewLoading, setRecordingPreviewLoading] = useState(false);
  const [recordingPreviewPage, setRecordingPreviewPage] = useState(1);
  const [recordingPreviewPagination, setRecordingPreviewPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [recordingPreviewSearch, setRecordingPreviewSearch] = useState('');
  const [recordingCampaignError, setRecordingCampaignError] = useState('');
  const [recordingCampaignNotice, setRecordingCampaignNotice] = useState('');
  const [isStartingRecordingSend, setIsStartingRecordingSend] = useState(false);
  const [recordingConfirmChecked, setRecordingConfirmChecked] = useState(false);
  const [recordingRetryConfirmChecked, setRecordingRetryConfirmChecked] = useState(false);
  const [recordingTestEmail, setRecordingTestEmail] = useState('');
  const [isSendingRecordingTest, setIsSendingRecordingTest] = useState(false);
  const [sendingRecordingIndividualId, setSendingRecordingIndividualId] = useState(null);

  async function fetchFeedbackCampaignStatus() {
    setLoadingFeedbackStats(true);
    try {
      const res = await adminApi.get('/api/admin/feedback-campaign/status', {
        params: {
          webinarId: selectedWebinarId,
          edition,
        },
      });
      if (res.data?.success) {
        const s = res.data.summary || {};
        setFeedbackStats({
          total: s.total ?? s.eligibleCount ?? s.totalRegistrations ?? 0,
          pending: s.pending ?? s.pendingCount ?? 0,
          sent: s.sent ?? s.sentCount ?? 0,
          failed: s.failed ?? s.failedCount ?? 0,
          campaignId: s.campaignId || 'halal-wealth-feedback-2026',
          webinarId: s.webinarId || selectedWebinarId,
        });
        setFeedbackActiveState(res.data.activeState || null);
      }
    } catch (err) {
      console.error('Failed to load feedback campaign status:', err);
    } finally {
      setLoadingFeedbackStats(false);
    }
  }

  async function fetchFeedbackPreview(page = 1, search = '') {
    setFeedbackPreviewLoading(true);
    setFeedbackCampaignError('');
    try {
      const res = await adminApi.get('/api/admin/feedback-campaign/preview', {
        params: {
          page,
          limit: 50,
          search: search.trim(),
          webinarId: selectedWebinarId,
          edition,
        },
      });
      if (res.data?.success) {
        const recordsList = res.data.recipients || res.data.data || [];
        const totalCount = res.data.total ?? res.data.pagination?.total ?? recordsList.length;
        const totalPages = res.data.pages ?? res.data.pagination?.totalPages ?? 1;
        setFeedbackPreviewRecords(recordsList);
        setFeedbackPreviewPagination({
          page: res.data.page ?? res.data.pagination?.page ?? page,
          limit: res.data.limit ?? res.data.pagination?.limit ?? 50,
          total: totalCount,
          pages: totalPages,
        });
        if (res.data.summary) {
          const s = res.data.summary;
          setFeedbackStats({
            total: s.total ?? s.eligibleCount ?? s.totalRegistrations ?? 0,
            pending: s.pending ?? s.pendingCount ?? 0,
            sent: s.sent ?? s.sentCount ?? 0,
            failed: s.failed ?? s.failedCount ?? 0,
            campaignId: s.campaignId || 'halal-wealth-feedback-2026',
            webinarId: s.webinarId || selectedWebinarId,
          });
        }
      }
    } catch (err) {
      setFeedbackCampaignError(err.response?.data?.message || 'Failed to fetch feedback campaign recipients.');
    } finally {
      setFeedbackPreviewLoading(false);
    }
  }

  useEffect(() => {
    fetchFeedbackCampaignStatus();
  }, [refreshKey, selectedWebinarId, edition]);

  useEffect(() => {
    if (feedbackActiveState?.status !== 'processing') return;
    const timer = setInterval(() => {
      fetchFeedbackCampaignStatus();
    }, 2000);
    return () => clearInterval(timer);
  }, [feedbackActiveState?.status, selectedWebinarId, edition]);

  async function handleSendFeedbackCampaign() {
    if (isStartingFeedbackSend || !feedbackConfirmChecked) return;
    setIsStartingFeedbackSend(true);
    setFeedbackCampaignError('');
    setFeedbackCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/feedback-campaign/send', {
        confirmed: true,
        webinarId: selectedWebinarId,
        edition,
      });
      if (res.data?.success) {
        setFeedbackCampaignNotice(res.data.message || 'Feedback campaign dispatched successfully.');
        setShowFeedbackSendConfirmModal(false);
        setFeedbackConfirmChecked(false);
        fetchFeedbackCampaignStatus();
        if (showFeedbackPreviewModal) {
          fetchFeedbackPreview(feedbackPreviewPage, feedbackPreviewSearch);
        }
      } else {
        setFeedbackCampaignError(res.data?.message || 'Failed to dispatch feedback campaign.');
      }
    } catch (err) {
      setFeedbackCampaignError(err.response?.data?.message || 'Error initiating feedback campaign dispatch.');
    } finally {
      setIsStartingFeedbackSend(false);
    }
  }

  async function handleRetryFailedFeedbackEmails() {
    if (isStartingFeedbackSend || !feedbackRetryConfirmChecked) return;
    setIsStartingFeedbackSend(true);
    setFeedbackCampaignError('');
    setFeedbackCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/feedback-campaign/retry-failed', {
        confirmed: true,
        webinarId: selectedWebinarId,
        edition,
      });
      if (res.data?.success) {
        setFeedbackCampaignNotice(res.data.message || 'Retry feedback dispatch completed successfully.');
        setShowFeedbackRetryConfirmModal(false);
        setFeedbackRetryConfirmChecked(false);
        fetchFeedbackCampaignStatus();
        if (showFeedbackPreviewModal) {
          fetchFeedbackPreview(feedbackPreviewPage, feedbackPreviewSearch);
        }
      } else {
        setFeedbackCampaignError(res.data?.message || 'Failed to retry feedback campaign.');
      }
    } catch (err) {
      setFeedbackCampaignError(err.response?.data?.message || 'Error retrying failed feedback emails.');
    } finally {
      setIsStartingFeedbackSend(false);
    }
  }

  async function handleSendFeedbackTestEmail(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (isSendingFeedbackTest || !feedbackTestEmail) return;
    setIsSendingFeedbackTest(true);
    setFeedbackCampaignError('');
    setFeedbackCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/feedback-campaign/test-send', {
        testEmail: feedbackTestEmail,
        recipientName: 'Admin Reviewer',
      });
      if (res.data?.success) {
        setFeedbackCampaignNotice(res.data.message || `Test feedback email sent to ${feedbackTestEmail}`);
        setFeedbackTestEmail('');
      } else {
        setFeedbackCampaignError(res.data?.message || 'Failed to send test feedback email.');
      }
    } catch (err) {
      setFeedbackCampaignError(err.response?.data?.message || 'Error sending test feedback email.');
    } finally {
      setIsSendingFeedbackTest(false);
    }
  }

  async function handleSendIndividualFeedbackEmail(rec, forceResend = false) {
    const regId = rec._id || rec.registrationId || rec.referenceId;
    if (!regId || sendingIndividualId) return;
    setSendingIndividualId(regId);
    setFeedbackCampaignError('');
    try {
      const res = await adminApi.post('/api/admin/feedback-campaign/send-individual', {
        registrationId: regId,
        forceResend,
      });
      if (res.data?.success) {
        setFeedbackCampaignNotice(res.data.message || `Feedback email sent to ${rec.fullName || rec.email}`);
        fetchFeedbackCampaignStatus();
        fetchFeedbackPreview(feedbackPreviewPage, feedbackPreviewSearch);
      } else {
        setFeedbackCampaignError(res.data?.message || 'Failed to dispatch individual feedback email.');
      }
    } catch (err) {
      setFeedbackCampaignError(err.response?.data?.message || 'Error sending individual feedback email.');
    } finally {
      setSendingIndividualId(null);
    }
  }

  async function fetchRecordingCampaignStatus() {
    setLoadingRecordingStats(true);
    try {
      const res = await adminApi.get('/api/admin/recording-campaign/status', {
        params: {
          webinarId: selectedWebinarId,
          edition,
        },
      });
      if (res.data?.success) {
        const s = res.data.summary || {};
        setRecordingStats({
          total: s.total ?? s.eligibleCount ?? s.totalRegistrations ?? 0,
          pending: s.pending ?? s.pendingCount ?? 0,
          sent: s.sent ?? s.sentCount ?? 0,
          failed: s.failed ?? s.failedCount ?? 0,
          campaignId: s.campaignId || 'recording-halal-investment-retirement',
          webinarId: s.webinarId || selectedWebinarId,
        });
        setRecordingActiveState(res.data.activeState || null);
      }
    } catch (err) {
      console.error('Failed to load recording campaign status:', err);
    } finally {
      setLoadingRecordingStats(false);
    }
  }

  async function fetchRecordingPreview(page = 1, search = '') {
    setRecordingPreviewLoading(true);
    setRecordingCampaignError('');
    try {
      const res = await adminApi.get('/api/admin/recording-campaign/preview', {
        params: {
          page,
          limit: 50,
          search: search.trim(),
          webinarId: selectedWebinarId,
          edition,
        },
      });
      if (res.data?.success) {
        const recordsList = res.data.recipients || res.data.data || [];
        const totalCount = res.data.total ?? res.data.pagination?.total ?? recordsList.length;
        const totalPages = res.data.pages ?? res.data.pagination?.totalPages ?? 1;
        setRecordingPreviewRecords(recordsList);
        setRecordingPreviewPagination({
          page: res.data.page ?? res.data.pagination?.page ?? page,
          limit: res.data.limit ?? res.data.pagination?.limit ?? 50,
          total: totalCount,
          pages: totalPages,
        });
        if (res.data.summary) {
          const s = res.data.summary;
          setRecordingStats({
            total: s.total ?? s.eligibleCount ?? s.totalRegistrations ?? 0,
            pending: s.pending ?? s.pendingCount ?? 0,
            sent: s.sent ?? s.sentCount ?? 0,
            failed: s.failed ?? s.failedCount ?? 0,
            campaignId: s.campaignId || 'recording-halal-investment-retirement',
            webinarId: s.webinarId || selectedWebinarId,
          });
        }
      }
    } catch (err) {
      setRecordingCampaignError(err.response?.data?.message || 'Failed to fetch recording campaign recipients.');
    } finally {
      setRecordingPreviewLoading(false);
    }
  }

  useEffect(() => {
    fetchRecordingCampaignStatus();
  }, [refreshKey, selectedWebinarId, edition]);

  useEffect(() => {
    if (recordingActiveState?.status !== 'processing') return;
    const timer = setInterval(() => {
      fetchRecordingCampaignStatus();
    }, 2000);
    return () => clearInterval(timer);
  }, [recordingActiveState?.status, selectedWebinarId, edition]);

  async function handleSendRecordingCampaign() {
    if (isStartingRecordingSend || !recordingConfirmChecked) return;
    setIsStartingRecordingSend(true);
    setRecordingCampaignError('');
    setRecordingCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/recording-campaign/send', {
        confirmed: true,
        webinarId: selectedWebinarId,
        edition,
      });
      if (res.data?.success) {
        setRecordingCampaignNotice(res.data.message || 'Recording campaign dispatched successfully.');
        setShowRecordingSendConfirmModal(false);
        setRecordingConfirmChecked(false);
        fetchRecordingCampaignStatus();
        if (showRecordingPreviewModal) {
          fetchRecordingPreview(recordingPreviewPage, recordingPreviewSearch);
        }
      } else {
        setRecordingCampaignError(res.data?.message || 'Failed to dispatch recording campaign.');
      }
    } catch (err) {
      setRecordingCampaignError(err.response?.data?.message || 'Error initiating recording campaign dispatch.');
    } finally {
      setIsStartingRecordingSend(false);
    }
  }

  async function handleRetryFailedRecordingEmails() {
    if (isStartingRecordingSend || !recordingRetryConfirmChecked) return;
    setIsStartingRecordingSend(true);
    setRecordingCampaignError('');
    setRecordingCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/recording-campaign/retry-failed', {
        confirmed: true,
        webinarId: selectedWebinarId,
        edition,
      });
      if (res.data?.success) {
        setRecordingCampaignNotice(res.data.message || 'Retry recording dispatch completed successfully.');
        setShowRecordingRetryConfirmModal(false);
        setRecordingRetryConfirmChecked(false);
        fetchRecordingCampaignStatus();
        if (showRecordingPreviewModal) {
          fetchRecordingPreview(recordingPreviewPage, recordingPreviewSearch);
        }
      } else {
        setRecordingCampaignError(res.data?.message || 'Failed to retry recording campaign.');
      }
    } catch (err) {
      setRecordingCampaignError(err.response?.data?.message || 'Error retrying failed recording emails.');
    } finally {
      setIsStartingRecordingSend(false);
    }
  }

  async function handleSendRecordingTestEmail(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (isSendingRecordingTest || !recordingTestEmail) return;
    setIsSendingRecordingTest(true);
    setRecordingCampaignError('');
    setRecordingCampaignNotice('');
    try {
      const res = await adminApi.post('/api/admin/recording-campaign/test-send', {
        testEmail: recordingTestEmail,
        recipientName: 'Admin Reviewer',
      });
      if (res.data?.success) {
        setRecordingCampaignNotice(res.data.message || `Test recording email sent to ${recordingTestEmail}`);
        setRecordingTestEmail('');
      } else {
        setRecordingCampaignError(res.data?.message || 'Failed to send test recording email.');
      }
    } catch (err) {
      setRecordingCampaignError(err.response?.data?.message || 'Error sending test recording email.');
    } finally {
      setIsSendingRecordingTest(false);
    }
  }

  async function handleSendIndividualRecordingEmail(rec, forceResend = false) {
    const regId = rec._id || rec.registrationId || rec.referenceId;
    if (!regId || sendingRecordingIndividualId) return;
    setSendingRecordingIndividualId(regId);
    setRecordingCampaignError('');
    try {
      const res = await adminApi.post('/api/admin/recording-campaign/send-individual', {
        registrationId: regId,
        forceResend,
      });
      if (res.data?.success) {
        setRecordingCampaignNotice(res.data.message || `Recording email sent to ${rec.fullName || rec.email}`);
        fetchRecordingCampaignStatus();
        fetchRecordingPreview(recordingPreviewPage, recordingPreviewSearch);
      } else {
        setRecordingCampaignError(res.data?.message || 'Failed to dispatch individual recording email.');
      }
    } catch (err) {
      setRecordingCampaignError(err.response?.data?.message || 'Error sending individual recording email.');
    } finally {
      setSendingRecordingIndividualId(null);
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
    setSelectedWebinarId('halal-wealth-nov-2026');
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
            <button className="webinar-admin-export" type="button" onClick={exportRegistrations} disabled={exporting}>
              <Download size={16} /> {exporting ? 'Preparing…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Feedback Sharing Campaign - ONLY Campaign in Admin Dashboard */}
        <section className="webinar-feedback-campaign-section" aria-labelledby="feedback-campaign-title">
          <div className="webinar-campaign-header-row">
            <div>
              <p className="webinar-admin-eyebrow">DEDICATED EMAIL CAMPAIGN</p>
              <h2 id="feedback-campaign-title">Feedback Sharing Campaign</h2>
              <p>
                Send Google Feedback Form invitations to all previously registered participants. Delivery tracking is maintained separately in <code>FeedbackCampaignDelivery</code> to preserve all existing MongoDB registration records.
              </p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '3px 10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  <ShieldCheck size={14} /> Selected Edition: {selectedWebinarId === 'halal-wealth-nov-2026' ? 'November 1, 2026 Webinar' : selectedWebinarId === 'halal-wealth-oct-2026' ? 'October 2026 Webinar' : selectedWebinarId === 'all' ? 'All Webinars' : selectedWebinarId}
                </span>
              </div>
            </div>
            {feedbackActiveState?.status === 'processing' && (
              <span className="webinar-admin-email-pill webinar-admin-email-pill-sent" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <RefreshCw size={14} className="webinar-spin" style={{ marginRight: '6px' }} />
                Sending in Progress...
              </span>
            )}
          </div>

          {feedbackCampaignError && (
            <div className="webinar-admin-alert" role="alert" style={{ marginBottom: '16px' }}>
              <span>{feedbackCampaignError}</span>
              <button type="button" onClick={() => setFeedbackCampaignError('')}>Dismiss</button>
            </div>
          )}

          {feedbackCampaignNotice && (
            <p className="webinar-admin-notice" role="status" style={{ marginBottom: '16px' }}>
              {feedbackCampaignNotice}
            </p>
          )}

          {/* 4 Required Stats Display:
              - Total registered participants
              - Pending feedback emails
              - Successfully sent feedback emails
              - Failed feedback emails */}
          <div className="webinar-campaign-stats-grid webinar-campaign-stats-grid--4">
            <div className="webinar-campaign-stat-box stat-eligible">
              <span>Total Registered Participants</span>
              <strong>{feedbackStats.total || 0}</strong>
              <small>Live registered participants</small>
            </div>
            <div className="webinar-campaign-stat-box stat-pending">
              <span>Pending Feedback Emails</span>
              <strong>{feedbackStats.pending || 0}</strong>
              <small>Awaiting feedback send</small>
            </div>
            <div className="webinar-campaign-stat-box stat-sent">
              <span>Successfully Sent Feedback Emails</span>
              <strong>{feedbackStats.sent || 0}</strong>
              <small>Delivered via Hostinger SMTP</small>
            </div>
            <div className="webinar-campaign-stat-box stat-failed">
              <span>Failed Feedback Emails</span>
              <strong>{feedbackStats.failed || 0}</strong>
              <small>Delivery rejected</small>
            </div>
          </div>

          {/* Live Progress Bar if active */}
          {feedbackActiveState?.status === 'processing' && (
            <div className="webinar-bulk-progress-container" style={{ margin: '14px 0 20px' }}>
              <div className="webinar-bulk-progress-header">
                <span>Sending Feedback Emails ({feedbackActiveState.processed || 0} / {feedbackActiveState.total || 0})</span>
                <span>{Math.round(((feedbackActiveState.processed || 0) / Math.max(1, feedbackActiveState.total || 1)) * 100)}%</span>
              </div>
              <div className="webinar-bulk-progress-track">
                <div
                  className="webinar-bulk-progress-fill"
                  style={{ width: `${Math.min(100, Math.round(((feedbackActiveState.processed || 0) / Math.max(1, feedbackActiveState.total || 1)) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Campaign Controls */}
          <div className="webinar-campaign-actions-bar">
            <div className="webinar-campaign-btn-group">
              <button
                type="button"
                className="btn-campaign-secondary"
                onClick={() => {
                  setFeedbackPreviewTab('email');
                  setShowFeedbackPreviewModal(true);
                }}
              >
                <Eye size={15} />
                <span>Preview Feedback Email</span>
              </button>

              <button
                type="button"
                className="btn-campaign-secondary"
                onClick={() => {
                  setFeedbackPreviewTab('recipients');
                  fetchFeedbackPreview(1, '');
                  setShowFeedbackPreviewModal(true);
                }}
              >
                <Users size={15} />
                <span>View Participants ({feedbackStats.total || 0})</span>
              </button>

              <button
                type="button"
                className="btn-campaign-primary"
                onClick={() => {
                  setFeedbackConfirmChecked(false);
                  setShowFeedbackSendConfirmModal(true);
                }}
                disabled={isStartingFeedbackSend || feedbackActiveState?.status === 'processing' || (feedbackStats.pending || 0) === 0}
                title={(feedbackStats.pending || 0) === 0 ? 'No pending recipients' : 'Send feedback invitation email to pending registrants'}
              >
                {feedbackActiveState?.status === 'processing' ? (
                  <RefreshCw size={15} className="webinar-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>Send Feedback Email to All ({feedbackStats.pending || 0} Pending)</span>
              </button>

              {(feedbackStats.failed || 0) > 0 && (
                <button
                  type="button"
                  className="btn-campaign-retry"
                  onClick={() => {
                    setFeedbackRetryConfirmChecked(false);
                    setShowFeedbackRetryConfirmModal(true);
                  }}
                  disabled={isStartingFeedbackSend || feedbackActiveState?.status === 'processing'}
                  title="Retry failed recipients only. Successfully sent recipients are never resent."
                >
                  <RefreshCw size={15} />
                  <span>Retry Failed Emails ({feedbackStats.failed})</span>
                </button>
              )}
            </div>

            {/* Send Test Email */}
            <form className="webinar-campaign-test-tool" onSubmit={handleSendFeedbackTestEmail}>
              <input
                type="email"
                placeholder="Send test feedback email to..."
                value={feedbackTestEmail}
                onChange={e => setFeedbackTestEmail(e.target.value)}
                disabled={isSendingFeedbackTest}
                required
              />
              <button type="submit" disabled={isSendingFeedbackTest || !feedbackTestEmail}>
                {isSendingFeedbackTest ? 'Sending...' : 'Send Test'}
              </button>
            </form>
          </div>
        </section>

        {/* Webinar Recording Sharing Campaign */}
        <section className="webinar-recording-campaign-section" aria-labelledby="recording-campaign-title">
          <div className="webinar-campaign-header-row">
            <div>
              <p className="webinar-admin-eyebrow">DEDICATED EMAIL CAMPAIGN</p>
              <h2 id="recording-campaign-title">Webinar Recording Sharing Campaign</h2>
              <p>
                Share the session recording for <strong>Halal Investment &amp; Retirement Planning</strong> with registered participants. Delivery tracking is maintained separately in <code>RecordingCampaignDelivery</code> to preserve all existing MongoDB registration records.
              </p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '3px 10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  <ShieldCheck size={14} /> Selected Edition: {selectedWebinarId === 'halal-wealth-nov-2026' ? 'November 1, 2026 Webinar' : selectedWebinarId === 'halal-wealth-oct-2026' ? 'October 2026 Webinar' : selectedWebinarId === 'all' ? 'All Webinars' : selectedWebinarId}
                </span>
              </div>
            </div>
            {recordingActiveState?.status === 'processing' && (
              <span className="webinar-admin-email-pill webinar-admin-email-pill-sent" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <RefreshCw size={14} className="webinar-spin" style={{ marginRight: '6px' }} />
                Sending in Progress...
              </span>
            )}
          </div>

          {recordingCampaignError && (
            <div className="webinar-admin-alert" role="alert" style={{ marginBottom: '16px' }}>
              <span>{recordingCampaignError}</span>
              <button type="button" onClick={() => setRecordingCampaignError('')}>Dismiss</button>
            </div>
          )}

          {recordingCampaignNotice && (
            <p className="webinar-admin-notice" role="status" style={{ marginBottom: '16px' }}>
              {recordingCampaignNotice}
            </p>
          )}

          {/* 4 Required Stats Display */}
          <div className="webinar-campaign-stats-grid webinar-campaign-stats-grid--4">
            <div className="webinar-campaign-stat-box stat-eligible">
              <span>Total Registered Participants</span>
              <strong>{recordingStats.total || 0}</strong>
              <small>Live registered participants</small>
            </div>
            <div className="webinar-campaign-stat-box stat-pending">
              <span>Pending Recording Emails</span>
              <strong>{recordingStats.pending || 0}</strong>
              <small>Awaiting recording send</small>
            </div>
            <div className="webinar-campaign-stat-box stat-sent">
              <span>Successfully Sent Recording Emails</span>
              <strong>{recordingStats.sent || 0}</strong>
              <small>Delivered via Hostinger SMTP</small>
            </div>
            <div className="webinar-campaign-stat-box stat-failed">
              <span>Failed Recording Emails</span>
              <strong>{recordingStats.failed || 0}</strong>
              <small>Delivery rejected</small>
            </div>
          </div>

          {/* Live Progress Bar if active */}
          {recordingActiveState?.status === 'processing' && (
            <div className="webinar-bulk-progress-container" style={{ margin: '14px 0 20px' }}>
              <div className="webinar-bulk-progress-header">
                <span>Sending Recording Emails ({recordingActiveState.processed || 0} / {recordingActiveState.total || 0})</span>
                <span>{Math.round(((recordingActiveState.processed || 0) / Math.max(1, recordingActiveState.total || 1)) * 100)}%</span>
              </div>
              <div className="webinar-bulk-progress-track">
                <div
                  className="webinar-bulk-progress-fill"
                  style={{ width: `${Math.min(100, Math.round(((recordingActiveState.processed || 0) / Math.max(1, recordingActiveState.total || 1)) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Campaign Controls */}
          <div className="webinar-campaign-actions-bar">
            <div className="webinar-campaign-btn-group">
              <button
                type="button"
                className="btn-campaign-secondary"
                onClick={() => {
                  setRecordingPreviewTab('email');
                  setShowRecordingPreviewModal(true);
                }}
              >
                <Eye size={15} />
                <span>Preview Recording Email</span>
              </button>

              <button
                type="button"
                className="btn-campaign-secondary"
                onClick={() => {
                  setRecordingPreviewTab('recipients');
                  fetchRecordingPreview(1, '');
                  setShowRecordingPreviewModal(true);
                }}
              >
                <Users size={15} />
                <span>View Participants ({recordingStats.total || 0})</span>
              </button>

              <button
                type="button"
                className="btn-campaign-primary"
                onClick={() => {
                  setRecordingConfirmChecked(false);
                  setShowRecordingSendConfirmModal(true);
                }}
                disabled={isStartingRecordingSend || recordingActiveState?.status === 'processing' || (recordingStats.pending || 0) === 0}
                title={(recordingStats.pending || 0) === 0 ? 'No pending recipients' : 'Send recording email to pending registrants'}
              >
                {recordingActiveState?.status === 'processing' ? (
                  <RefreshCw size={15} className="webinar-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>Send Recording Email to All ({recordingStats.pending || 0} Pending)</span>
              </button>

              {(recordingStats.failed || 0) > 0 && (
                <button
                  type="button"
                  className="btn-campaign-retry"
                  onClick={() => {
                    setRecordingRetryConfirmChecked(false);
                    setShowRecordingRetryConfirmModal(true);
                  }}
                  disabled={isStartingRecordingSend || recordingActiveState?.status === 'processing'}
                  title="Retry failed recipients only. Successfully sent recipients are never resent."
                >
                  <RefreshCw size={15} />
                  <span>Retry Failed Emails ({recordingStats.failed})</span>
                </button>
              )}
            </div>

            {/* Send Test Email */}
            <form className="webinar-campaign-test-tool" onSubmit={handleSendRecordingTestEmail}>
              <input
                type="email"
                placeholder="Send test recording email to..."
                value={recordingTestEmail}
                onChange={e => setRecordingTestEmail(e.target.value)}
                disabled={isSendingRecordingTest}
                required
              />
              <button type="submit" disabled={isSendingRecordingTest || !recordingTestEmail}>
                {isSendingRecordingTest ? 'Sending...' : 'Send Test'}
              </button>
            </form>
          </div>
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
            <label className="webinar-admin-filter-field">
              <span>Edition</span>
              <select
                value={edition}
                onChange={event => {
                  const val = event.target.value;
                  setEdition(val);
                  setPage(1);
                  if (val === 'november') setSelectedWebinarId('halal-wealth-nov-2026');
                  else if (val === 'october') setSelectedWebinarId('halal-wealth-oct-2026');
                  else if (val === 'business') setSelectedWebinarId('business-webinar-2026');
                  else if (val === 'all') setSelectedWebinarId('all');
                  else setSelectedWebinarId('halal-wealth-nov-2026');
                }}
              >
                <option value="">November 1, 2026 (Default)</option>
                <option value="november">November 1, 2026 Webinar</option>
                <option value="october">October 2026 Webinar</option>
                <option value="business">Business Webinar 2026</option>
                <option value="all">All Webinars</option>
              </select>
            </label>
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

      {showFeedbackPreviewModal && (
        <FeedbackPreviewModal
          isOpen={showFeedbackPreviewModal}
          onClose={() => setShowFeedbackPreviewModal(false)}
          activeTab={feedbackPreviewTab}
          onTabChange={setFeedbackPreviewTab}
          records={feedbackPreviewRecords}
          loading={feedbackPreviewLoading}
          pagination={feedbackPreviewPagination}
          page={feedbackPreviewPage}
          onPageChange={newPage => {
            setFeedbackPreviewPage(newPage);
            fetchFeedbackPreview(newPage, feedbackPreviewSearch);
          }}
          search={feedbackPreviewSearch}
          onSearchChange={setFeedbackPreviewSearch}
          onSearchSubmit={() => {
            setFeedbackPreviewPage(1);
            fetchFeedbackPreview(1, feedbackPreviewSearch);
          }}
          stats={feedbackStats}
          onSendIndividual={handleSendIndividualFeedbackEmail}
          sendingId={sendingIndividualId}
        />
      )}

      {showFeedbackSendConfirmModal && (
        <FeedbackSendConfirmModal
          isOpen={showFeedbackSendConfirmModal}
          onClose={() => {
            if (!isStartingFeedbackSend) setShowFeedbackSendConfirmModal(false);
          }}
          stats={feedbackStats}
          isSending={isStartingFeedbackSend}
          confirmed={feedbackConfirmChecked}
          onConfirmChange={setFeedbackConfirmChecked}
          onStart={handleSendFeedbackCampaign}
          error={feedbackCampaignError}
        />
      )}

      {showFeedbackRetryConfirmModal && (
        <FeedbackRetryConfirmModal
          isOpen={showFeedbackRetryConfirmModal}
          onClose={() => {
            if (!isStartingFeedbackSend) setShowFeedbackRetryConfirmModal(false);
          }}
          stats={feedbackStats}
          isSending={isStartingFeedbackSend}
          confirmed={feedbackRetryConfirmChecked}
          onConfirmChange={setFeedbackRetryConfirmChecked}
          onStart={handleRetryFailedFeedbackEmails}
          error={feedbackCampaignError}
        />
      )}

      {showRecordingPreviewModal && (
        <RecordingPreviewModal
          isOpen={showRecordingPreviewModal}
          onClose={() => setShowRecordingPreviewModal(false)}
          activeTab={recordingPreviewTab}
          onTabChange={setRecordingPreviewTab}
          records={recordingPreviewRecords}
          loading={recordingPreviewLoading}
          pagination={recordingPreviewPagination}
          page={recordingPreviewPage}
          onPageChange={newPage => {
            setRecordingPreviewPage(newPage);
            fetchRecordingPreview(newPage, recordingPreviewSearch);
          }}
          search={recordingPreviewSearch}
          onSearchChange={setRecordingPreviewSearch}
          onSearchSubmit={() => {
            setRecordingPreviewPage(1);
            fetchRecordingPreview(1, recordingPreviewSearch);
          }}
          stats={recordingStats}
          onSendIndividual={handleSendIndividualRecordingEmail}
          sendingId={sendingRecordingIndividualId}
        />
      )}

      {showRecordingSendConfirmModal && (
        <RecordingSendConfirmModal
          isOpen={showRecordingSendConfirmModal}
          onClose={() => {
            if (!isStartingRecordingSend) setShowRecordingSendConfirmModal(false);
          }}
          stats={recordingStats}
          isSending={isStartingRecordingSend}
          confirmed={recordingConfirmChecked}
          onConfirmChange={setRecordingConfirmChecked}
          onStart={handleSendRecordingCampaign}
          error={recordingCampaignError}
        />
      )}

      {showRecordingRetryConfirmModal && (
        <RecordingRetryConfirmModal
          isOpen={showRecordingRetryConfirmModal}
          onClose={() => {
            if (!isStartingRecordingSend) setShowRecordingRetryConfirmModal(false);
          }}
          stats={recordingStats}
          isSending={isStartingRecordingSend}
          confirmed={recordingRetryConfirmChecked}
          onConfirmChange={setRecordingRetryConfirmChecked}
          onStart={handleRetryFailedRecordingEmails}
          error={recordingCampaignError}
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

function FeedbackPreviewModal({
  isOpen,
  onClose,
  activeTab = 'email',
  onTabChange,
  records,
  loading,
  pagination,
  page,
  onPageChange,
  search,
  onSearchChange,
  onSearchSubmit,
  stats,
  onSendIndividual,
  sendingId,
}) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = pagination?.total ?? records.length;
  const pages = pagination?.pages ?? 1;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="webinar-admin-modal webinar-recording-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-preview-title"
        style={{ width: 'min(100%, 780px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">FEEDBACK SHARING CAMPAIGN</p>
            <h2 id="feedback-preview-title">
              {activeTab === 'email' ? 'Preview Feedback Email' : 'Feedback Campaign Participants'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview">
            <X size={19} />
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="feedback-preview-tabs">
          <button
            type="button"
            className={`feedback-preview-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('email')}
          >
            <Eye size={15} />
            <span>Preview Feedback Email</span>
          </button>
          <button
            type="button"
            className={`feedback-preview-tab-btn ${activeTab === 'recipients' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('recipients')}
          >
            <Users size={15} />
            <span>Participants &amp; Delivery Tracking ({stats?.total || 0})</span>
          </button>
        </div>

        {activeTab === 'email' ? (
          <div className="feedback-email-preview-container">
            <div className="feedback-email-meta-header">
              <div className="feedback-email-meta-row">
                <span className="feedback-email-meta-label">Subject:</span>
                <strong>Your Feedback Matters – Halal Wealth Webinar</strong>
              </div>
              <div className="feedback-email-meta-row">
                <span className="feedback-email-meta-label">Sender:</span>
                <span>Halal Wealth Webinar &lt;info@halalwealth.finance&gt;</span>
              </div>
              <div className="feedback-email-meta-row">
                <span className="feedback-email-meta-label">Recipient:</span>
                <span>Personalized: <em>&#123;&#123;name&#125;&#125;</em> ({stats?.total || 294} registered participants)</span>
              </div>
            </div>

            <article className="feedback-email-card-preview">
              <div className="feedback-email-card-header">
                <p style={{ margin: '0 0 6px', color: '#d4af5a', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
                  HALAL WEALTH WEBINAR
                </p>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>
                  Your Feedback Matters
                </h3>
              </div>

              <div className="feedback-email-card-body">
                <p style={{ margin: '0 0 14px' }}>Assalamu Alaikum Wr Wb,</p>
                <p style={{ margin: '0 0 14px' }}>Dear [Participant Name],</p>
                <p style={{ margin: '0 0 14px' }}>Thank you for being part of our Halal Wealth Webinar!</p>
                <p style={{ margin: '0 0 14px' }}>
                  We sincerely appreciate your time and participation. We hope the session provided valuable insights into <strong>Halal Trade, Investments &amp; Generational Wealth</strong>.
                </p>
                <p style={{ margin: '0 0 14px' }}>
                  Your feedback is important to us. It will help us improve our future webinars and deliver more meaningful sessions.
                </p>
                <p style={{ margin: '0 0 18px' }}>
                  We kindly request you to take a few minutes to share your feedback.
                </p>

                <div className="feedback-email-cta-box">
                  <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Submit Your Feedback:</p>
                  <a
                    href="https://forms.gle/yzQWLFSDr1va4A5o9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-feedback-email-submit"
                  >
                    Submit Your Feedback
                  </a>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#e6c875', wordBreak: 'break-all' }}>
                    https://forms.gle/yzQWLFSDr1va4A5o9
                  </p>
                </div>

                <div className="feedback-email-poster-wrap">
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Inline Webinar Poster Attachment (cid:webinar-poster)
                  </p>
                  <img src="/assets/webinar tamil.png" alt="Halal Wealth Webinar Poster" onError={e => { e.target.style.display = 'none'; }} />
                </div>

                <p style={{ margin: '20px 0 4px' }}>JazakAllahu Khairan,</p>
                <p style={{ margin: '0', color: '#082b49', fontWeight: 700 }}>Halal Wealth Team</p>
              </div>
            </article>
          </div>
        ) : (
          <>
            <div className="webinar-recording-filter-summary">
              <div className="recording-filter-note">
                <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Feedback Sharing Campaign: Delivering Google Feedback Form invitations to all previously registered participants.
                  Feedback delivery tracking is maintained separately in <strong>FeedbackCampaignDelivery</strong> and never modifies original participant registrations.
                </span>
              </div>
              <div className="recording-filter-stats-pills">
                <span className="filter-pill pill-eligible">Total Registered: {stats?.total || 0}</span>
                <span className="filter-pill pill-pending">Pending: {stats?.pending || 0}</span>
                <span className="filter-pill pill-sent">Sent: {stats?.sent || 0}</span>
                <span className="filter-pill pill-failed">Failed: {stats?.failed || 0}</span>
              </div>
            </div>

            <form
              className="webinar-recording-search-row"
              onSubmit={e => {
                e.preventDefault();
                onSearchSubmit();
              }}
            >
              <div className="webinar-recording-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by name, email, or registration ID..."
                  value={search}
                  onChange={e => onSearchChange(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-campaign-secondary" style={{ padding: '6px 12px' }}>
                Filter
              </button>
              {search && (
                <button
                  type="button"
                  className="webinar-admin-clear"
                  onClick={() => {
                    onSearchChange('');
                    setTimeout(() => onSearchSubmit(), 0);
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            <div className="webinar-recording-table-wrap">
              <table className="webinar-recording-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Reference ID</th>
                    <th>Registered (IST)</th>
                    <th>Feedback Status</th>
                    <th>Delivery Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px' }}>
                        <RefreshCw size={20} className="webinar-spin" style={{ display: 'inline', color: '#082b49', marginRight: '8px' }} />
                        Loading feedback campaign recipients...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No matching participants found.
                      </td>
                    </tr>
                  ) : (
                    records.map(rec => {
                      const status = rec.deliveryStatus || rec.campaignDelivery?.status || 'pending';
                      const sentDate = rec.sentAt || rec.campaignDelivery?.sentAt;
                      const errorMsg = rec.errorMessage || rec.campaignDelivery?.errorMessage;
                      const recId = rec._id || rec.registrationId || rec.referenceId;
                      const isCurrentSending = sendingId === recId;

                      return (
                        <tr key={recId}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#082b49' }}>{rec.fullName || '—'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{rec.email || '—'}</div>
                          </td>
                          <td>
                            <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 5px', borderRadius: '3px' }}>
                              {rec.registrationId || rec.referenceId || '—'}
                            </code>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {formatDate(rec.createdAt, true)}
                          </td>
                          <td>
                            <span className={`email-badge email-badge-${status}`}>
                              {status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>
                            {sentDate ? (
                              <span>Sent: {formatDate(sentDate, true)}</span>
                            ) : errorMsg ? (
                              <span style={{ color: '#dc2626' }}>{errorMsg}</span>
                            ) : (
                              <span>Ready to send</span>
                            )}
                          </td>
                          <td>
                            {status === 'failed' ? (
                              <button
                                type="button"
                                className="btn-campaign-retry"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                onClick={() => onSendIndividual(rec, true)}
                                disabled={Boolean(sendingId)}
                                title="Retry sending feedback email to this failed recipient"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Retrying...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw size={11} />
                                    <span>Resend Feedback</span>
                                  </>
                                )}
                              </button>
                            ) : status === 'sent' ? (
                              <button
                                type="button"
                                className="btn-campaign-individual-action btn-campaign-individual-resend"
                                onClick={() => onSendIndividual(rec, true)}
                                disabled={Boolean(sendingId)}
                                title="Resend feedback email to this participant"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw size={11} />
                                    <span>Resend</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-campaign-individual-action"
                                onClick={() => onSendIndividual(rec, false)}
                                disabled={Boolean(sendingId)}
                                title="Send feedback email to this participant"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={11} />
                                    <span>Send Feedback</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="webinar-recording-modal-footer">
              <div className="webinar-recording-pagination-info">
                Showing Page <strong>{page}</strong> of <strong>{pages}</strong> ({total} total participants)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-campaign-secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => onPageChange(page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-campaign-secondary"
                  disabled={page >= pages || loading}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

function FeedbackSendConfirmModal({
  isOpen,
  onClose,
  stats,
  isSending,
  confirmed,
  onConfirmChange,
  onStart,
  error,
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

  if (!isOpen) return null;

  const pending = stats?.pending || 0;
  const total = stats?.total || 0;
  const sent = stats?.sent || 0;
  const failed = stats?.failed || 0;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <section
        className="webinar-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-send-confirm-title"
        style={{ width: 'min(100%, 580px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">CONFIRM BULK EMAIL DISPATCH</p>
            <h2 id="feedback-send-confirm-title">Send Feedback Emails to Participants</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSending} aria-label="Close confirmation">
            <X size={19} />
          </button>
        </header>

        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '14px 0 0' }}>
            <span>{error}</span>
          </div>
        )}

        <div className="webinar-recording-summary-cards" style={{ margin: '16px 0' }}>
          <div className="recording-summary-card">
            <span>Total Registered</span>
            <strong>{total}</strong>
            <small>Live participants</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#059669' }}>
            <span>Pending Delivery</span>
            <strong style={{ color: '#059669' }}>{pending}</strong>
            <small>Awaiting feedback</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#2563eb' }}>
            <span>Already Sent</span>
            <strong style={{ color: '#2563eb' }}>{sent}</strong>
            <small>Will be skipped</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#dc2626' }}>
            <span>Failed Deliveries</span>
            <strong style={{ color: '#dc2626' }}>{failed}</strong>
            <small>Retryable</small>
          </div>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px 14px',
            fontSize: '12.5px',
            lineHeight: 1.55,
            color: '#334155',
            margin: '0 0 16px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#082b49', marginBottom: '4px' }}>
            Campaign Configuration Details:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            <li><strong>Subject:</strong> Your Feedback Matters – Halal Wealth Webinar</li>
            <li><strong>Feedback Form:</strong> https://forms.gle/yzQWLFSDr1va4A5o9</li>
            <li><strong>Inline Attachment:</strong> Webinar Poster (CID: webinar-poster)</li>
            <li><strong>Sender:</strong> info@halalwealth.finance (Hostinger SMTP)</li>
            <li><strong>Database Safety:</strong> Tracking is isolated in <code>FeedbackCampaignDelivery</code>. Registration records are never modified.</li>
          </ul>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#065f46',
            fontWeight: 500,
            margin: '0 0 16px',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onConfirmChange(e.target.checked)}
            disabled={isSending || pending === 0}
            style={{ marginTop: '2px', accentColor: '#059669' }}
          />
          <span>
            I confirm and authorize dispatching the feedback campaign email to all eligible pending registrants.
          </span>
        </label>

        <footer>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-campaign-primary"
            disabled={!confirmed || isSending || pending === 0}
            onClick={onStart}
          >
            {isSending ? (
              <>
                <RefreshCw size={15} className="webinar-spin" />
                <span>Dispatching Feedback Emails...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Confirm &amp; Send Feedback Email to All ({pending})</span>
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}

function FeedbackRetryConfirmModal({
  isOpen,
  onClose,
  stats,
  isSending,
  confirmed,
  onConfirmChange,
  onStart,
  error,
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

  if (!isOpen) return null;

  const failed = stats?.failed || 0;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <section
        className="webinar-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-retry-confirm-title"
        style={{ width: 'min(100%, 540px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">RETRY FAILED DELIVERIES</p>
            <h2 id="feedback-retry-confirm-title">Retry Failed Feedback Emails</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSending} aria-label="Close retry modal">
            <X size={19} />
          </button>
        </header>

        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '14px 0 0' }}>
            <span>{error}</span>
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#526b78', lineHeight: 1.5, margin: '12px 0' }}>
          This operation will retry sending the webinar feedback invitation email <strong>only</strong> to the {failed} participant(s) whose delivery previously encountered an error.
          Successfully sent deliveries will not be resent.
        </p>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#92400e',
            fontWeight: 500,
            margin: '14px 0',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onConfirmChange(e.target.checked)}
            disabled={isSending || failed === 0}
            style={{ marginTop: '2px', accentColor: '#d97706' }}
          />
          <span>
            I confirm and authorize retrying delivery for {failed} failed participant(s).
          </span>
        </label>

        <footer>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-campaign-retry"
            disabled={!confirmed || isSending || failed === 0}
            onClick={onStart}
          >
            {isSending ? (
              <>
                <RefreshCw size={15} className="webinar-spin" />
                <span>Retrying Feedback Emails...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Retry Failed Feedback Emails ({failed})</span>
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}

function RecordingPreviewModal({
  isOpen,
  onClose,
  activeTab = 'email',
  onTabChange,
  records = [],
  loading = false,
  pagination,
  page,
  onPageChange,
  search,
  onSearchChange,
  onSearchSubmit,
  stats,
  onSendIndividual,
  sendingId,
}) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = pagination?.total ?? records.length;
  const pages = pagination?.pages ?? 1;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="webinar-admin-modal webinar-recording-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recording-preview-title"
        style={{ width: 'min(100%, 780px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">RECORDING SHARING CAMPAIGN</p>
            <h2 id="recording-preview-title">
              {activeTab === 'email' ? 'Preview Recording Email' : 'Recording Campaign Participants'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview">
            <X size={19} />
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="recording-preview-tabs">
          <button
            type="button"
            className={`recording-preview-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('email')}
          >
            <Eye size={15} />
            <span>Preview Recording Email</span>
          </button>
          <button
            type="button"
            className={`recording-preview-tab-btn ${activeTab === 'recipients' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('recipients')}
          >
            <Users size={15} />
            <span>Participants &amp; Delivery Tracking ({stats?.total || 0})</span>
          </button>
        </div>

        {activeTab === 'email' ? (
          <div className="recording-email-preview-container">
            <div className="recording-email-meta-header">
              <div className="recording-email-meta-row">
                <span className="recording-email-meta-label">Subject:</span>
                <strong>Webinar Recording – Halal Investment &amp; Retirement Planning</strong>
              </div>
              <div className="recording-email-meta-row">
                <span className="recording-email-meta-label">Sender:</span>
                <span>Halal Wealth Webinar &lt;info@halalwealth.finance&gt;</span>
              </div>
              <div className="recording-email-meta-row">
                <span className="recording-email-meta-label">Recipient:</span>
                <span>Personalized: <em>&#123;&#123;name&#125;&#125;</em> ({stats?.total || 294} registered participants)</span>
              </div>
            </div>

            <article className="recording-email-card-preview">
              <div className="recording-email-card-header">
                <p style={{ margin: '0 0 6px', color: '#d4af5a', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
                  HALAL WEALTH WEBINAR
                </p>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>
                  Halal Investment &amp; Retirement Planning
                </h3>
              </div>

              <div className="recording-email-card-body">
                <p style={{ margin: '0 0 14px' }}>Assalamu Alaikum Wr Wb,</p>
                <p style={{ margin: '0 0 14px' }}>Dear [Participant Name],</p>
                <p style={{ margin: '0 0 14px' }}>Thank you for being part of our Halal Wealth Webinar.</p>
                <p style={{ margin: '0 0 14px' }}>
                  We are pleased to share the recording of our session on <strong>Halal Investment &amp; Retirement Planning</strong>.
                </p>
                <p style={{ margin: '0 0 14px' }}>
                  If you missed any part of the session or would like to revisit the valuable insights shared by our speaker, you can watch the complete recording using the link below.
                </p>

                <div className="recording-email-cta-box">
                  <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Watch the Webinar Recording:</p>
                  <a
                    href="https://youtu.be/dam9grDGDpY?si=MNVFsmet8grttPf0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-recording-email-submit"
                  >
                    Watch Webinar Recording
                  </a>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#e6c875', wordBreak: 'break-all' }}>
                    https://youtu.be/dam9grDGDpY?si=MNVFsmet8grttPf0
                  </p>
                </div>

                <p style={{ margin: '0 0 14px' }}>
                  We hope this session provides you with valuable insights into Shariah-compliant investments and retirement planning.
                </p>

                {/* Stay Connected Section */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', margin: '22px 0' }}>
                  <p style={{ margin: '0 0 4px', color: '#b98a2a', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    STAY CONNECTED
                  </p>
                  <h4 style={{ margin: '0 0 8px', color: '#082b49', fontSize: '16px', fontWeight: 700 }}>
                    Stay Connected with Us
                  </h4>
                  <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
                    Join our channels and community for upcoming webinars, Shariah-compliant finance insights, and community updates:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a
                      href="https://www.youtube.com/@ethicalfinancebasithtamil"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: '#c4302b',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        padding: '11px 18px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        letterSpacing: '0.3px',
                      }}
                    >
                      &#9658; YouTube: @ethicalfinancebasithtamil
                    </a>
                    <a
                      href="https://www.instagram.com/ethicalfinancebasith.tamil"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: '#c13584',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        padding: '11px 18px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        letterSpacing: '0.3px',
                      }}
                    >
                      &#9679; Instagram: @ethicalfinancebasith.tamil
                    </a>
                    <a
                      href="https://chat.whatsapp.com/DNaN5HnNifI3eQ5yv265i9?s=cl&p=a&mlu=4&ilr=4&iam=2"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: '#128c7e',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        padding: '11px 18px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        letterSpacing: '0.3px',
                      }}
                    >
                      &#128172; Join WhatsApp Community
                    </a>
                  </div>
                </div>

                <div className="feedback-email-poster-wrap">
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Inline Webinar Poster Attachment (cid:webinar-poster)
                  </p>
                  <img src="/assets/webinar tamil.png" alt="Halal Wealth Webinar Poster" onError={e => { e.target.style.display = 'none'; }} />
                </div>

                <p style={{ margin: '20px 0 4px' }}>JazakAllahu Khairan,</p>
                <p style={{ margin: '0', color: '#082b49', fontWeight: 700 }}>Halal Wealth Team</p>
              </div>
            </article>
          </div>
        ) : (
          <>
            <div className="webinar-recording-filter-summary">
              <div className="recording-filter-note">
                <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Webinar Recording Sharing Campaign: Delivering recording access for Halal Investment &amp; Retirement Planning to registered participants.
                  Delivery tracking is maintained separately in <strong>RecordingCampaignDelivery</strong> and never modifies original participant registrations.
                </span>
              </div>
              <div className="recording-filter-stats-pills">
                <span className="filter-pill pill-eligible">Total Registered: {stats?.total || 0}</span>
                <span className="filter-pill pill-pending">Pending: {stats?.pending || 0}</span>
                <span className="filter-pill pill-sent">Sent: {stats?.sent || 0}</span>
                <span className="filter-pill pill-failed">Failed: {stats?.failed || 0}</span>
              </div>
            </div>

            <form
              className="webinar-recording-search-row"
              onSubmit={e => {
                e.preventDefault();
                onSearchSubmit();
              }}
            >
              <div className="webinar-recording-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by name, email, or registration ID..."
                  value={search}
                  onChange={e => onSearchChange(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-campaign-secondary" style={{ padding: '6px 12px' }}>
                Filter
              </button>
              {search && (
                <button
                  type="button"
                  className="webinar-admin-clear"
                  onClick={() => {
                    onSearchChange('');
                    setTimeout(() => onSearchSubmit(), 0);
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            <div className="webinar-recording-table-wrap">
              <table className="webinar-recording-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Registration ID</th>
                    <th>Recording Status</th>
                    <th>Delivery Info</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                        <RefreshCw size={20} className="webinar-spin" style={{ margin: '0 auto 8px' }} />
                        <div>Loading participants...</div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No matching participants found.
                      </td>
                    </tr>
                  ) : (
                    records.map(rec => {
                      const regId = rec._id || rec.registrationId || rec.referenceId;
                      const status = rec.deliveryStatus || 'pending';
                      const isCurrentSending = sendingId === regId;
                      const sentDate = rec.sentAt;
                      const errorMsg = rec.errorMessage;

                      return (
                        <tr key={String(regId)}>
                          <td>
                            <strong>{rec.fullName || '—'}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{rec.email}</div>
                            {rec.whatsapp && (
                              <div style={{ fontSize: '11px', color: '#059669' }}>WA: {rec.whatsapp}</div>
                            )}
                            <div style={{ marginTop: '2px' }}>
                              <span className="webinar-recipient-tag-october">
                                {rec.webinarVersion || 'November 1, 2026 Webinar'}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                            {rec.registrationId || rec.referenceId || String(rec._id).slice(-8).toUpperCase()}
                          </td>
                          <td>
                            {status === 'sent' ? (
                              <span className="webinar-email-badge email-badge-delivered">
                                <CheckCircle2 size={11} /> Sent
                              </span>
                            ) : status === 'failed' ? (
                              <span className="webinar-email-badge email-badge-failed" title={errorMsg || 'Failed'}>
                                <AlertTriangle size={11} /> Failed
                              </span>
                            ) : (
                              <span className="webinar-email-badge email-badge-pending">
                                <Clock size={11} /> Pending
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>
                            {sentDate ? (
                              <span>Sent: {formatDate(sentDate, true)}</span>
                            ) : errorMsg ? (
                              <span style={{ color: '#dc2626' }}>{errorMsg}</span>
                            ) : (
                              <span>Ready to send</span>
                            )}
                          </td>
                          <td>
                            {status === 'failed' ? (
                              <button
                                type="button"
                                className="btn-campaign-retry"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                onClick={() => onSendIndividual(rec, true)}
                                disabled={Boolean(sendingId)}
                                title="Retry sending recording email to this failed recipient"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Retrying...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw size={11} />
                                    <span>Resend Recording</span>
                                  </>
                                )}
                              </button>
                            ) : status === 'sent' ? (
                              <button
                                type="button"
                                className="btn-campaign-individual-action btn-campaign-individual-resend"
                                onClick={() => onSendIndividual(rec, true)}
                                disabled={Boolean(sendingId)}
                                title="Resend recording email to this participant"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw size={11} />
                                    <span>Resend</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-campaign-individual-action"
                                onClick={() => onSendIndividual(rec, false)}
                                disabled={Boolean(sendingId)}
                                title="Send recording email to this participant"
                              >
                                {isCurrentSending ? (
                                  <>
                                    <RefreshCw size={11} className="webinar-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={11} />
                                    <span>Send Recording</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="webinar-recording-modal-footer">
              <div className="webinar-recording-pagination-info">
                Showing Page <strong>{page}</strong> of <strong>{pages}</strong> ({total} total participants)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-campaign-secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => onPageChange(page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-campaign-secondary"
                  disabled={page >= pages || loading}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

function RecordingSendConfirmModal({
  isOpen,
  onClose,
  stats,
  isSending,
  confirmed,
  onConfirmChange,
  onStart,
  error,
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

  if (!isOpen) return null;

  const pending = stats?.pending || 0;
  const total = stats?.total || 0;
  const sent = stats?.sent || 0;
  const failed = stats?.failed || 0;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <section
        className="webinar-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recording-send-confirm-title"
        style={{ width: 'min(100%, 580px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">CONFIRM BULK EMAIL DISPATCH</p>
            <h2 id="recording-send-confirm-title">Send Recording Emails to Participants</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSending} aria-label="Close confirmation">
            <X size={19} />
          </button>
        </header>

        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '14px 0 0' }}>
            <span>{error}</span>
          </div>
        )}

        <div className="webinar-recording-summary-cards" style={{ margin: '16px 0' }}>
          <div className="recording-summary-card">
            <span>Total Registered</span>
            <strong>{total}</strong>
            <small>Live participants</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#059669' }}>
            <span>Pending Delivery</span>
            <strong style={{ color: '#059669' }}>{pending}</strong>
            <small>Awaiting recording</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#2563eb' }}>
            <span>Already Sent</span>
            <strong style={{ color: '#2563eb' }}>{sent}</strong>
            <small>Will be skipped</small>
          </div>
          <div className="recording-summary-card" style={{ borderLeftColor: '#dc2626' }}>
            <span>Failed Deliveries</span>
            <strong style={{ color: '#dc2626' }}>{failed}</strong>
            <small>Retryable</small>
          </div>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px 14px',
            fontSize: '12.5px',
            lineHeight: 1.55,
            color: '#334155',
            margin: '0 0 16px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#082b49', marginBottom: '4px' }}>
            Campaign Configuration Details:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            <li><strong>Subject:</strong> Webinar Recording – Halal Investment &amp; Retirement Planning</li>
            <li><strong>Recording URL:</strong> https://youtu.be/dam9grDGDpY?si=MNVFsmet8grttPf0</li>
            <li><strong>YouTube:</strong> https://www.youtube.com/@ethicalfinancebasithtamil</li>
            <li><strong>Instagram:</strong> https://www.instagram.com/ethicalfinancebasith.tamil</li>
            <li><strong>WhatsApp Community:</strong> https://chat.whatsapp.com/DNaN5HnNifI3eQ5yv265i9...</li>
            <li><strong>Inline Attachment:</strong> Webinar Poster (CID: webinar-poster)</li>
            <li><strong>Sender:</strong> info@halalwealth.finance (Hostinger SMTP)</li>
            <li><strong>Database Safety:</strong> Tracking is isolated in <code>RecordingCampaignDelivery</code>. Registration records are never modified.</li>
          </ul>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#065f46',
            fontWeight: 500,
            margin: '0 0 16px',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onConfirmChange(e.target.checked)}
            disabled={isSending || pending === 0}
            style={{ marginTop: '2px', accentColor: '#059669' }}
          />
          <span>
            I confirm and authorize dispatching the recording campaign email to all eligible pending registrants.
          </span>
        </label>

        <footer>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-campaign-primary"
            disabled={!confirmed || isSending || pending === 0}
            onClick={onStart}
          >
            {isSending ? (
              <>
                <RefreshCw size={15} className="webinar-spin" />
                <span>Dispatching Recording Emails...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Confirm &amp; Send Recording Email to All ({pending})</span>
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}

function RecordingRetryConfirmModal({
  isOpen,
  onClose,
  stats,
  isSending,
  confirmed,
  onConfirmChange,
  onStart,
  error,
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

  if (!isOpen) return null;

  const failed = stats?.failed || 0;

  return (
    <div
      className="webinar-admin-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <section
        className="webinar-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recording-retry-confirm-title"
        style={{ width: 'min(100%, 540px)' }}
      >
        <header>
          <div>
            <p className="webinar-admin-eyebrow">RETRY FAILED DELIVERIES</p>
            <h2 id="recording-retry-confirm-title">Retry Failed Recording Emails</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSending} aria-label="Close retry modal">
            <X size={19} />
          </button>
        </header>

        {error && (
          <div className="webinar-admin-alert" role="alert" style={{ margin: '14px 0 0' }}>
            <span>{error}</span>
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#526b78', lineHeight: 1.5, margin: '12px 0' }}>
          This operation will retry sending the webinar recording email <strong>only</strong> to the {failed} participant(s) whose delivery previously encountered an error.
          Successfully sent deliveries will not be resent.
        </p>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#92400e',
            fontWeight: 500,
            margin: '14px 0',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onConfirmChange(e.target.checked)}
            disabled={isSending || failed === 0}
            style={{ marginTop: '2px', accentColor: '#d97706' }}
          />
          <span>
            I confirm and authorize retrying delivery for {failed} failed participant(s).
          </span>
        </label>

        <footer>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-campaign-retry"
            disabled={!confirmed || isSending || failed === 0}
            onClick={onStart}
          >
            {isSending ? (
              <>
                <RefreshCw size={15} className="webinar-spin" />
                <span>Retrying Recording Emails...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Retry Failed Recording Emails ({failed})</span>
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
