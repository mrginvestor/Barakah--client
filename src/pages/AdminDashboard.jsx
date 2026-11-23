import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  ExternalLink,
  Users,
  Check,
  X,
  FileText,
  RotateCcw,
  Banknote,
  Smartphone,
  MessageSquare,
  ShieldCheck,
  Camera,
  Download,
  Mail,
  QrCode,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import adminApi from '../config/adminApi';
import API_URL from '../config/api';
import './AdminDashboard.css';

export default function AdminDashboard({ isInvestorMissionAdminOnly = false }) {
  const isImAdmin = isInvestorMissionAdminOnly || window.sessionStorage.getItem('admin-role') === 'INVESTOR_MISSION_ADMIN';
  const adminDisplayName = window.sessionStorage.getItem('admin-display-name') || (isImAdmin ? 'SIO Coimbatore' : 'Admin');

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedPayments: 0,
    pendingVerification: 0,
    pendingPayments: 0,
    pendingOfflinePayments: 0,
    rejectedPayments: 0,
    onlineCount: 0,
    offlineCount: 0,
    pendingTotal: 0,
    availableSeats: 50,
    maxCapacity: 50,
  });

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalRegistration, setModalRegistration] = useState(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const [receiptZoom, setReceiptZoom] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Offline Payment Modal State
  const [offlineModalReg, setOfflineModalReg] = useState(null);
  const [offlineForm, setOfflineForm] = useState({
    amount: 500,
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'Cash at Venue',
    notes: '',
    approve: true,
  });

  // Admin Notes Modal State
  const [notesModalReg, setNotesModalReg] = useState(null);
  const [notesText, setNotesText] = useState('');

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await adminApi.post('/api/admin/investor-mission/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setShowPasswordModal(false), 1500);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('halal-wealth-admin-token');
    window.sessionStorage.removeItem('admin-role');
    window.sessionStorage.removeItem('admin-display-name');
    window.location.href = isImAdmin ? '/investor-mission-admin/login' : '/admin/login';
  };

  // Attendance & Check-In View State
  const [viewMode, setViewMode] = useState('REGISTRATIONS'); // 'REGISTRATIONS' | 'ATTENDANCE'
  const [attendanceStats, setAttendanceStats] = useState({
    totalConfirmed: 0,
    totalCheckedIn: 0,
    remainingNotCheckedIn: 0,
  });
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceQuery, setAttendanceQuery] = useState('');
  const [checkInInput, setCheckInInput] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi
        .get('/api/admin/investor-mission/registrations')
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.get('/api/admin/dec-summit/registrations');
          }
          throw err;
        }),
      adminApi
        .get('/api/admin/investor-mission/stats')
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.get('/api/admin/dec-summit/stats');
          }
          throw err;
        }),
    ])
      .then(([regRes, statRes]) => {
        if (regRes.data?.registrations) {
          setRegistrations(regRes.data.registrations);
        } else if (Array.isArray(regRes.data)) {
          setRegistrations(regRes.data);
        }
        if (statRes.data) {
          setStats(statRes.data);
        }
      })
      .catch((error) => console.error('Failed to load summit registrations:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered registrations
  const filtered = useMemo(() => {
    return registrations.filter((reg) => {
      const isConfirmed =
        (reg.registrationApproved && reg.paymentApproved) ||
        (reg.registrationStatus === 'CONFIRMED' && reg.paymentStatus === 'PAID') ||
        (reg.status === 'Confirmed' && reg.paymentStatus === 'PAID');

      const isRejected =
        reg.registrationStatus === 'REJECTED' ||
        reg.paymentStatus === 'REJECTED' ||
        reg.status === 'Rejected';

      const isPending =
        !isConfirmed &&
        !isRejected &&
        (reg.registrationStatus === 'PENDING_APPROVAL' ||
          !reg.registrationApproved ||
          !reg.paymentApproved ||
          reg.status === 'Pending');

      // Filter Tabs
      if (activeFilter === 'PENDING') {
        if (!isPending) return false;
      } else if (activeFilter === 'ONLINE') {
        if (reg.paymentMethod === 'OFFLINE') return false;
      } else if (activeFilter === 'OFFLINE') {
        if (reg.paymentMethod !== 'OFFLINE') return false;
      } else if (activeFilter === 'PENDING_VERIFICATION') {
        if (reg.paymentStatus !== 'PENDING_VERIFICATION') return false;
      } else if (activeFilter === 'CONFIRMED') {
        if (!isConfirmed) return false;
      } else if (activeFilter === 'REJECTED') {
        if (!isRejected) return false;
      }

      // Search query filter
      if (query.trim()) {
        const haystack = [
          reg.fullName,
          reg.name,
          reg.email,
          reg.whatsappNumber,
          reg.mobileNumber,
          reg.phone,
          reg.registrationId,
          reg.upiTransactionId,
          reg.city,
          reg.district,
          reg.state,
          reg.organization,
          reg.occupation,
          reg.otherOccupation,
          reg.sessionExpectations,
          reg.adminVerificationNotes,
          reg.adminNotes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }

      return true;
    });
  }, [registrations, query, activeFilter]);

  // Open secure receipt viewer modal
  const handleOpenReceipt = async (reg) => {
    setModalRegistration(reg);
    if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    setReceiptBlobUrl('');
    setReceiptError(null);
    setReceiptZoom(1);
    setReceiptLoading(true);

    try {
      const res = await adminApi
        .get(`/api/admin/investor-mission/receipt/${reg.registrationId}`, { responseType: 'blob' })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.get(`/api/admin/dec-summit/receipt/${reg.registrationId}`, { responseType: 'blob' });
          }
          throw err;
        });
      const url = URL.createObjectURL(res.data);
      setReceiptBlobUrl(url);
    } catch (err) {
      console.error('Failed to load receipt blob:', err);
      let errMsg = 'The payment screenshot file for this registration is no longer on the server.';
      let errCode = '';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errMsg = json.message;
          if (json.code) errCode = json.code;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
        errCode = err.response.data.code;
      }
      setReceiptError({ message: errMsg, code: errCode });
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    setModalRegistration(null);
    setReceiptBlobUrl('');
    setReceiptError(null);
    setReceiptZoom(1);
  };

  // 1. Approve Registration Details
  const handleApproveRegistration = async (regId) => {
    if (!window.confirm(`Approve participant registration details for ${regId}?`)) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/approve-registration`)
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${regId}/approve-registration`);
          }
          throw err;
        });
      alert(res.data?.message || 'Registration details approved.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject Registration Details
  const handleRejectRegistration = async (regId) => {
    const reason = window.prompt(
      `Enter reason for rejecting registration ${regId}:`,
      'Participant details did not meet the event requirements.'
    );
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/reject-registration`, { reason })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${regId}/reject-registration`, { reason });
          }
          throw err;
        });
      alert(res.data?.message || 'Registration rejected.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Approve Payment
  const handleApprovePayment = async (regId) => {
    if (!window.confirm(`Approve ₹500 payment for ${regId}? This will officially confirm the participant's seat and send their confirmation email.`)) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/approve-payment`)
        .catch((err) => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${regId}/approve-payment`);
          }
          throw err;
        });
      if (res.data?.emailStatus === 'FAILED' || (res.data?.emailSent === false && res.data?.emailError)) {
        alert(`Payment approved and seat confirmed! Note: Confirmation email delivery timed out or failed (${res.data.emailError || 'Connection timeout'}). You can click "Retry Email" at any time.`);
      } else {
        alert(res.data?.message || 'Payment approved and seat confirmed.');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Reject Payment
  const handleRejectPayment = async (regId) => {
    const reason = window.prompt(
      `Enter reason for rejecting ${regId} payment (visible to participant on payment page):`,
      'Unable to verify UTR number against bank records. Please verify your reference or re-upload a clear receipt screenshot.'
    );
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/reject-payment`, { reason })
        .catch((err) => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${regId}/reject-payment`, { reason });
          }
          throw err;
        });
      alert(res.data?.message || 'Payment rejected.');
      handleCloseModal();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Offline Payment Modal & Submit
  const handleOpenOfflineModal = (reg) => {
    setOfflineModalReg(reg);
    setOfflineForm({
      amount: reg.paymentAmount || 500,
      paymentDate: new Date().toISOString().split('T')[0],
      method: reg.offlinePaymentMethod || 'Cash at Venue',
      notes: reg.adminVerificationNotes || '',
      approve: true,
    });
  };

  const handleSubmitOfflinePayment = async (e) => {
    e.preventDefault();
    if (!offlineModalReg) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${offlineModalReg.registrationId}/record-offline-payment`, {
          paymentAmount: Number(offlineForm.amount) || 500,
          paymentDate: offlineForm.paymentDate,
          offlinePaymentMethod: offlineForm.method,
          adminVerificationNotes: offlineForm.notes,
          approvePayment: offlineForm.approve,
        })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${offlineModalReg.registrationId}/record-offline-payment`, {
              paymentAmount: Number(offlineForm.amount) || 500,
              paymentDate: offlineForm.paymentDate,
              offlinePaymentMethod: offlineForm.method,
              adminVerificationNotes: offlineForm.notes,
              approvePayment: offlineForm.approve,
            });
          }
          throw err;
        });
      alert(res.data?.message || 'Offline payment recorded successfully.');
      setOfflineModalReg(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record offline payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Verification Notes Modal & Submit
  const handleOpenNotesModal = (reg) => {
    setNotesModalReg(reg);
    setNotesText(reg.adminVerificationNotes || reg.adminNotes || '');
  };

  const handleSubmitNotes = async (e) => {
    e.preventDefault();
    if (!notesModalReg) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${notesModalReg.registrationId}/notes`, {
          adminVerificationNotes: notesText,
        })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${notesModalReg.registrationId}/notes`, {
              adminVerificationNotes: notesText,
            });
          }
          throw err;
        });
      alert(res.data?.message || 'Verification notes saved.');
      setNotesModalReg(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setActionLoading(false);
    }
  };

  const loadAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await adminApi
        .get('/api/admin/investor-mission/attendance')
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.get('/api/admin/dec-summit/attendance');
          }
          throw err;
        });
      if (res.data?.stats) {
        setAttendanceStats(res.data.stats);
      }
      if (res.data?.attendees) {
        setAttendanceList(res.data.attendees);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckIn = async (lookupKey) => {
    const raw = String(lookupKey || checkInInput || '').trim();
    if (!raw) return;
    const match = raw.match(/\/checkin\/verify\/([a-zA-Z0-9_-]+)/);
    const token = match ? match[1] : raw;

    setActionLoading(true);
    setCheckInResult(null);
    try {
      const res = await adminApi
        .post('/api/admin/investor-mission/checkin', { token })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post('/api/admin/dec-summit/checkin', { token });
          }
          throw err;
        });
      setCheckInResult({
        type: 'success',
        message: res.data.message || 'Check-in successful!',
        participantName: res.data.participantName,
        registrationId: res.data.registrationId,
        checkedInAt: res.data.checkedInAt,
        checkedInBy: res.data.checkedInBy,
      });
      setCheckInInput('');
      loadAttendance();
      loadData();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 || data?.alreadyCheckedIn) {
        setCheckInResult({
          type: 'warning',
          message: data?.message || 'Already Checked In',
          participantName: data?.participantName,
          registrationId: data?.registrationId,
          checkedInAt: data?.checkedInAt,
          checkedInBy: data?.checkedInBy,
        });
      } else {
        setCheckInResult({
          type: 'error',
          message: data?.message || 'Check-in failed.',
          participantName: data?.participantName,
          registrationId: data?.registrationId,
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendConfirmation = async (regId) => {
    if (!window.confirm(`Resend Investor Mission confirmation email with QR code for ${regId}?`)) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/resend-confirmation`)
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.post(`/api/admin/dec-summit/registrations/${regId}/resend-confirmation`);
          }
          throw err;
        });
      if (res.data?.emailStatus === 'FAILED') {
        alert(`Email delivery attempt failed (${res.data?.emailError || 'Connection timeout'}). You can retry again.`);
      } else {
        alert(res.data?.message || 'Confirmation email sent successfully.');
      }
      loadData();
      if (viewMode === 'ATTENDANCE') loadAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send confirmation email. Check email provider configuration.');
      loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const res = await adminApi
        .get('/api/admin/investor-mission/attendance/export', { responseType: 'blob' })
        .catch(err => {
          if (err.response?.status === 404) {
            return adminApi.get('/api/admin/dec-summit/attendance/export', { responseType: 'blob' });
          }
          throw err;
        });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investor-mission-attendance-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export attendance CSV.');
    }
  };

  useEffect(() => {
    let scanner = null;
    if (viewMode === 'ATTENDANCE' && scannerActive) {
      scanner = new Html5QrcodeScanner(
        'dashboard-qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        (decodedText) => {
          handleCheckIn(decodedText);
        },
        () => {}
      );
      scannerRef.current = scanner;
    }
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (_) {}
      }
    };
  }, [viewMode, scannerActive]);

  return (
    <div className="admin-page">
      {/* Top Admin Navigation / Info Header */}
      <div className="admin-nav-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isImAdmin && (
            <Link
              to="/admin/main-summit"
              style={{
                padding: '8px 16px',
                background: '#F1F5F9',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
              }}
            >
              Main Summit 2027 &rarr;
            </Link>
          )}

          <Link
            to={isImAdmin ? '/investor-mission-admin/dashboard' : '/admin/investor-mission'}
            style={{
              padding: '8px 16px',
              background: '#064B36',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            Investor Mission 2026 ({registrations.length} registered)
          </Link>

          {!isImAdmin && (
            <Link
              to="/admin/dashboard"
              style={{
                padding: '8px 16px',
                background: '#F1F5F9',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
              }}
            >
              Webinar Campaigns &rarr;
            </Link>
          )}

          <Link
            to={isImAdmin ? '/investor-mission-admin/check-in' : '/admin/check-in'}
            style={{
              padding: '8px 16px',
              background: '#F1F5F9',
              color: '#334155',
              fontWeight: 600,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            QR Check-In
          </Link>
        </div>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', background: '#E2E8F0', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, color: '#0F172A' }}>
            Organizer: <strong style={{ color: '#064B36' }}>{adminDisplayName}</strong>
          </span>
          <button
            type="button"
            onClick={() => { setShowPasswordModal(true); setPasswordError(''); setPasswordSuccess(''); }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="admin-heading">
        <div>
          <p className="eyebrow">INVESTOR MISSION 2026 • SIRUTHULI NOYYAL LIFE CENTRE, COIMBATORE • 50 SEATS • ₹500</p>
          <h1>Investor Mission 2026 Registrations &amp; Seat Management</h1>
          <p>
            Manage two-step verification (Registration &amp; Payment), review online UPI proofs, record offline payments, and maintain strict 50-seat event capacity.
          </p>
        </div>
        <div>
          <button className="text-button" onClick={loadData} title="Refresh data">
            <RotateCcw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Primary Mode Switcher */}
      <div style={{ display: 'flex', gap: '12px', margin: '20px 0 24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setViewMode('REGISTRATIONS')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            border: viewMode === 'REGISTRATIONS' ? '2px solid #053726' : '1px solid #CBD5E1',
            background: viewMode === 'REGISTRATIONS' ? '#053726' : '#FFFFFF',
            color: viewMode === 'REGISTRATIONS' ? '#FFFFFF' : '#334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={16} />
          Registrations &amp; Seat Management ({registrations.length})
        </button>
        <button
          type="button"
          onClick={() => { setViewMode('ATTENDANCE'); loadAttendance(); }}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            border: viewMode === 'ATTENDANCE' ? '2px solid #053726' : '1px solid #CBD5E1',
            background: viewMode === 'ATTENDANCE' ? '#053726' : '#FFFFFF',
            color: viewMode === 'ATTENDANCE' ? '#FFFFFF' : '#334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <QrCode size={16} />
          Event Check-In &amp; Attendance ({stats.confirmedPayments} Confirmed)
        </button>
      </div>

      {viewMode === 'REGISTRATIONS' ? (
        <>
          {/* KPI Cards Grid */}
      <div className="summit-admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="summit-admin-kpi-card">
          <span className="kpi-label">Total Registrations</span>
          <span className="kpi-number">{stats.totalRegistrations}</span>
        </div>

        <div className="summit-admin-kpi-card kpi-confirmed">
          <span className="kpi-label">Confirmed Seats</span>
          <span className="kpi-number" style={{ color: '#166534' }}>
            {stats.confirmedPayments} / {stats.maxCapacity || 50}
          </span>
        </div>

        <div className="summit-admin-kpi-card kpi-seats">
          <span className="kpi-label">Available Seats</span>
          <span className="kpi-number" style={{ color: stats.availableSeats <= 0 ? '#DC2626' : '#0B2D49' }}>
            {stats.availableSeats <= 0 ? 'Full (0)' : stats.availableSeats}
          </span>
        </div>

        <div className="summit-admin-kpi-card">
          <span className="kpi-label">Online Payments</span>
          <span className="kpi-number" style={{ color: '#2563EB' }}>
            {stats.onlineCount ?? registrations.filter(r => r.paymentMethod !== 'OFFLINE').length}
          </span>
        </div>

        <div className="summit-admin-kpi-card">
          <span className="kpi-label">Offline Payments</span>
          <span className="kpi-number" style={{ color: '#7C3AED' }}>
            {stats.offlineCount ?? registrations.filter(r => r.paymentMethod === 'OFFLINE').length}
          </span>
        </div>

        <div className="summit-admin-kpi-card kpi-verification">
          <span className="kpi-label">Needs UPI Review</span>
          <span className="kpi-number" style={{ color: '#D97706' }}>{stats.pendingVerification}</span>
        </div>

        <div className="summit-admin-kpi-card">
          <span className="kpi-label">Pending Offline</span>
          <span className="kpi-number" style={{ color: '#9333EA' }}>{stats.pendingOfflinePayments || 0}</span>
        </div>

        <div className="summit-admin-kpi-card kpi-rejected">
          <span className="kpi-label">Rejected</span>
          <span className="kpi-number" style={{ color: '#DC2626' }}>{stats.rejectedPayments}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="summit-admin-tabs">
        <button
          className={`summit-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Registrations ({registrations.length})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveFilter('PENDING')}
        >
          Pending Registrations ({stats.pendingTotal ?? registrations.filter(r => (!r.registrationApproved || !r.paymentApproved) && r.registrationStatus !== 'REJECTED' && r.paymentStatus !== 'REJECTED').length})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'ONLINE' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ONLINE')}
        >
          Online Payments ({stats.onlineCount ?? registrations.filter(r => r.paymentMethod !== 'OFFLINE').length})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'OFFLINE' ? 'active' : ''}`}
          onClick={() => setActiveFilter('OFFLINE')}
        >
          Offline Payments ({stats.offlineCount ?? registrations.filter(r => r.paymentMethod === 'OFFLINE').length})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'PENDING_VERIFICATION' ? 'active' : ''}`}
          onClick={() => setActiveFilter('PENDING_VERIFICATION')}
        >
          Pending Payment Verification ({stats.pendingVerification})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('CONFIRMED')}
        >
          Confirmed Registrations ({stats.confirmedPayments})
        </button>
        <button
          className={`summit-tab-btn ${activeFilter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('REJECTED')}
        >
          Rejected Registrations ({stats.rejectedPayments})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="admin-toolbar" style={{ marginBottom: '20px' }}>
        <input
          placeholder="Search by ID, Name, Email, Phone, District, UTR, Notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '480px' }}
        />
        <strong style={{ alignSelf: 'center', marginLeft: 'auto', fontSize: '13px', color: '#64748B' }}>
          Showing {filtered.length} of {registrations.length} registrations
        </strong>
      </div>

      {/* Registrations Table & Responsive Cards */}
      <div className="admin-section">
        <h2>Participant Records</h2>

        {/* Desktop View: Consolidated 8-Column Table (No Horizontal Scroll) */}
        <div className="im-admin-table-wrap">
          <table className="im-admin-table">
            <colgroup>
              <col className="im-col-participant" />
              <col className="im-col-contact" />
              <col className="im-col-location" />
              <col className="im-col-occupation" />
              <col className="im-col-payment" />
              <col className="im-col-seat" />
              <col className="im-col-proof" />
              <col className="im-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Occupation / Org</th>
                <th>Payment</th>
                <th>Registration & Seat</th>
                <th>Proof / UTR</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => {
                const isConfirmed =
                  (reg.registrationApproved && reg.paymentApproved) ||
                  (reg.registrationStatus === 'CONFIRMED' && reg.paymentStatus === 'PAID') ||
                  (reg.status === 'Confirmed' && reg.paymentStatus === 'PAID');

                const isRegApproved = Boolean(reg.registrationApproved || reg.registrationStatus === 'CONFIRMED');
                const isPayApproved = Boolean(reg.paymentApproved || reg.paymentStatus === 'PAID');
                const isRegRejected = reg.registrationStatus === 'REJECTED';
                const isPayRejected = reg.paymentStatus === 'REJECTED';
                const hasReceipt = Boolean(reg.paymentScreenshot);
                const isOffline = reg.paymentMethod === 'OFFLINE';

                return (
                  <tr key={reg._id}>
                    {/* 1. Participant */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#053726', marginBottom: '2px' }}>
                        {reg.fullName || reg.name}
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F4C75', background: '#F1F5F9', padding: '1px 5px', borderRadius: '3px' }}>
                          {reg.registrationId}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </td>

                    {/* 2. Contact */}
                    <td>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all', color: '#0F172A', fontWeight: 500 }}>
                        {reg.email}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                        {reg.countryCode || '+91'} {reg.mobileNumber || reg.phone || reg.whatsappNumber}
                      </div>
                    </td>

                    {/* 3. Location */}
                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        {[reg.city, reg.district, reg.state].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>

                    {/* 4. Occupation / Org */}
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
                        {reg.occupation === 'Other' && reg.otherOccupation
                          ? `Other (${reg.otherOccupation})`
                          : reg.occupation || reg.currentProfession || '—'}
                      </div>
                      {reg.organization && (
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                          {reg.organization}
                        </div>
                      )}
                      {reg.sessionExpectations && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#475569',
                            marginTop: '4px',
                            fontStyle: 'italic',
                            lineHeight: 1.3,
                            cursor: 'help',
                          }}
                          title={reg.sessionExpectations}
                        >
                          Goal: {reg.sessionExpectations.length > 50 ? `${reg.sessionExpectations.substring(0, 50)}...` : reg.sessionExpectations}
                        </div>
                      )}
                    </td>

                    {/* 5. Payment */}
                    <td>
                      <div style={{ marginBottom: '4px' }}>
                        {isOffline ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#EDE9FE',
                              color: '#5B21B6',
                              border: '1px solid #DDD6FE',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '10.5px',
                            }}
                          >
                            <Banknote size={11} /> OFFLINE
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#E0F2FE',
                              color: '#0369A1',
                              border: '1px solid #BAE6FD',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '10.5px',
                            }}
                          >
                            <Smartphone size={11} /> ONLINE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>
                        ₹{reg.paymentAmount || 500}
                      </div>
                      <div>
                        {isPayApproved ? (
                          <span className="admin-badge-paid">PAID</span>
                        ) : isPayRejected ? (
                          <span className="admin-badge-rejected">REJECTED</span>
                        ) : reg.paymentStatus === 'PENDING_VERIFICATION' ? (
                          <span className="admin-badge-pending-verification">NEEDS REVIEW</span>
                        ) : isOffline ? (
                          <span
                            style={{
                              background: '#F5F3FF',
                              color: '#6D28D9',
                              border: '1px solid #DDD6FE',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              fontSize: '10.5px',
                            }}
                          >
                            PENDING OFFLINE
                          </span>
                        ) : (
                          <span className="admin-badge-pending">PENDING</span>
                        )}
                      </div>
                    </td>

                    {/* 6. Registration & Seat */}
                    <td>
                      {isConfirmed ? (
                        <>
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '11.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={12} /> CONFIRMED
                          </span>
                          <div style={{ marginTop: '5px' }}>
                            {reg.confirmationEmailStatus === 'SENT' || reg.confirmationEmailSent ? (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  color: '#15803D',
                                  background: '#DCFCE7',
                                  border: '1px solid #86EFAC',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Mail size={11} /> EMAIL SENT
                              </span>
                            ) : reg.confirmationEmailStatus === 'PENDING' ? (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  color: '#854D0E',
                                  background: '#FEF9C3',
                                  border: '1px solid #FDE047',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Clock size={11} /> EMAIL PENDING
                              </span>
                            ) : reg.confirmationEmailStatus === 'FAILED' ? (
                              <div>
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    color: '#DC2626',
                                    background: '#FEE2E2',
                                    border: '1px solid #FCA5A5',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                  title={reg.confirmationEmailLastError || 'Delivery failed'}
                                >
                                  <AlertCircle size={11} /> EMAIL FAILED
                                </span>
                                {reg.confirmationEmailLastError && (
                                  <div
                                    style={{
                                      fontSize: '9.5px',
                                      color: '#991B1B',
                                      marginTop: '2px',
                                      maxWidth: '135px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                    title={reg.confirmationEmailLastError}
                                  >
                                    {reg.confirmationEmailLastError}
                                  </div>
                                )}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleResendConfirmation(reg.registrationId)}
                                    disabled={actionLoading}
                                    style={{
                                      fontSize: '11px',
                                      color: '#DC2626',
                                      textDecoration: 'underline',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '2px 0 0 0',
                                      fontWeight: 700,
                                    }}
                                    title={reg.confirmationEmailLastError || 'Retry sending confirmation email'}
                                  >
                                    Retry Email{reg.confirmationEmailAttempts ? ` (${reg.confirmationEmailAttempts})` : ''}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleResendConfirmation(reg.registrationId)}
                                disabled={actionLoading}
                                style={{
                                  fontSize: '11px',
                                  color: '#0369A1',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontWeight: 600,
                                }}
                              >
                                Send Email
                              </button>
                            )}
                          </div>
                        </>
                      ) : isRegRejected || isPayRejected ? (
                        <span className="admin-badge-rejected">REJECTED</span>
                      ) : (
                        <span
                          style={{
                            background: '#FEF9C3',
                            color: '#854D0E',
                            border: '1px solid #FDE047',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                            display: 'inline-block',
                          }}
                        >
                          PENDING {!isRegApproved && !isPayApproved ? 'REG & PAY' : !isRegApproved ? 'REG' : 'PAY'}
                        </span>
                      )}
                    </td>

                    {/* 7. Proof / UTR */}
                    <td>
                      {isOffline ? (
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          {reg.offlinePaymentRecorded ? (
                            <>
                              <strong style={{ color: '#166534' }}>₹{reg.paymentAmount || 500} recorded</strong>
                              <div>{reg.offlinePaymentMethod || 'Cash'}</div>
                            </>
                          ) : (
                            <span style={{ color: '#64748B' }}>Venue Payment</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          {hasReceipt && (
                            <button
                              type="button"
                              className="btn-admin-action btn-admin-view-receipt"
                              style={{ display: 'block', marginBottom: '4px' }}
                              onClick={() => handleOpenReceipt(reg)}
                            >
                              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              View Proof
                            </button>
                          )}
                          {reg.upiTransactionId ? (
                            <code style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 4px', borderRadius: '3px', wordBreak: 'break-all', display: 'inline-block' }}>
                              {reg.upiTransactionId}
                            </code>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>No UTR</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 8. Admin Actions */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                          type="button"
                          className="btn-admin-action btn-admin-approve"
                          onClick={() => handleApprovePayment(reg.registrationId)}
                          disabled={actionLoading}
                          title="Approve payment and officially confirm seat"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            padding: '6px 8px',
                            borderRadius: '5px',
                            fontSize: '11.5px',
                            width: '100%',
                          }}
                        >
                          Approve Pay
                        </button>
                        <button
                          type="button"
                          className="btn-admin-action btn-admin-reject"
                          onClick={() => handleRejectPayment(reg.registrationId)}
                          disabled={actionLoading}
                          title="Reject payment"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            padding: '6px 8px',
                            borderRadius: '5px',
                            fontSize: '11.5px',
                            width: '100%',
                          }}
                        >
                          Reject Pay
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && !loading && (
            <p className="admin-empty">No summit registrations match your search filters.</p>
          )}
        </div>

        {/* Mobile View: Responsive Participant Cards (No Horizontal Scroll) */}
        <div className="im-admin-mobile-cards">
          {filtered.map((reg) => {
            const isConfirmed =
              (reg.registrationApproved && reg.paymentApproved) ||
              (reg.registrationStatus === 'CONFIRMED' && reg.paymentStatus === 'PAID') ||
              (reg.status === 'Confirmed' && reg.paymentStatus === 'PAID');

            const isRegApproved = Boolean(reg.registrationApproved || reg.registrationStatus === 'CONFIRMED');
            const isPayApproved = Boolean(reg.paymentApproved || reg.paymentStatus === 'PAID');
            const isRegRejected = reg.registrationStatus === 'REJECTED';
            const isPayRejected = reg.paymentStatus === 'REJECTED';
            const hasReceipt = Boolean(reg.paymentScreenshot);
            const isOffline = reg.paymentMethod === 'OFFLINE';

            return (
              <div key={reg._id} className="im-admin-card">
                <div className="im-admin-card-header">
                  <div>
                    <div className="im-admin-card-name">{reg.fullName || reg.name}</div>
                    <div className="im-admin-card-date">
                      Registered: {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <span className="im-admin-card-id">{reg.registrationId}</span>
                </div>

                <div className="im-admin-card-badges">
                  {isConfirmed ? (
                    <span
                      style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        border: '1px solid #86EFAC',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '11.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> CONFIRMED
                    </span>
                  ) : isRegRejected || isPayRejected ? (
                    <span className="admin-badge-rejected">REJECTED</span>
                  ) : (
                    <span
                      style={{
                        background: '#FEF9C3',
                        color: '#854D0E',
                        border: '1px solid #FDE047',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      PENDING {!isRegApproved && !isPayApproved ? 'REG & PAY' : !isRegApproved ? 'REG' : 'PAY'}
                    </span>
                  )}

                  {isPayApproved ? (
                    <span className="admin-badge-paid">PAID</span>
                  ) : isPayRejected ? (
                    <span className="admin-badge-rejected">REJECTED</span>
                  ) : reg.paymentStatus === 'PENDING_VERIFICATION' ? (
                    <span className="admin-badge-pending-verification">NEEDS REVIEW</span>
                  ) : isOffline ? (
                    <span
                      style={{
                        background: '#F5F3FF',
                        color: '#6D28D9',
                        border: '1px solid #DDD6FE',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '10.5px',
                      }}
                    >
                      PENDING OFFLINE
                    </span>
                  ) : (
                    <span className="admin-badge-pending">PENDING</span>
                  )}

                  {isOffline ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#EDE9FE',
                        color: '#5B21B6',
                        border: '1px solid #DDD6FE',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '10.5px',
                      }}
                    >
                      <Banknote size={11} /> OFFLINE
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#E0F2FE',
                        color: '#0369A1',
                        border: '1px solid #BAE6FD',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '10.5px',
                      }}
                    >
                      <Smartphone size={11} /> ONLINE
                    </span>
                  )}
                </div>

                <div className="im-admin-card-grid">
                  <div className="im-admin-card-field">
                    <span className="im-admin-card-label">Contact</span>
                    <span className="im-admin-card-val" style={{ wordBreak: 'break-all' }}>
                      {reg.email}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {reg.countryCode || '+91'} {reg.mobileNumber || reg.phone || reg.whatsappNumber}
                    </span>
                  </div>

                  <div className="im-admin-card-field">
                    <span className="im-admin-card-label">Location</span>
                    <span className="im-admin-card-val">
                      {[reg.city, reg.district, reg.state].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>

                  <div className="im-admin-card-field">
                    <span className="im-admin-card-label">Occupation & Organization</span>
                    <span className="im-admin-card-val">
                      {reg.occupation === 'Other' && reg.otherOccupation
                        ? `Other (${reg.otherOccupation})`
                        : reg.occupation || reg.currentProfession || '—'}
                      {reg.organization ? ` • ${reg.organization}` : ''}
                    </span>
                  </div>

                  {reg.sessionExpectations && (
                    <div className="im-admin-card-field">
                      <span className="im-admin-card-label">Expectations / Goals</span>
                      <span className="im-admin-card-val" style={{ fontStyle: 'italic', color: '#475569' }}>
                        {reg.sessionExpectations}
                      </span>
                    </div>
                  )}

                  <div className="im-admin-card-field">
                    <span className="im-admin-card-label">Payment & Proof (₹{reg.paymentAmount || 500})</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {hasReceipt && (
                        <button
                          type="button"
                          className="btn-admin-action btn-admin-view-receipt"
                          onClick={() => handleOpenReceipt(reg)}
                        >
                          <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          View Proof
                        </button>
                      )}
                      {reg.upiTransactionId ? (
                        <code style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '3px' }}>
                          UTR: {reg.upiTransactionId}
                        </code>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '11px' }}>No UTR</span>
                      )}
                    </div>
                  </div>

                  {isConfirmed && (
                    <div className="im-admin-card-field">
                      <span className="im-admin-card-label">Confirmation Email</span>
                      <div style={{ marginTop: '3px' }}>
                        {reg.confirmationEmailStatus === 'SENT' || reg.confirmationEmailSent ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#15803D',
                              background: '#DCFCE7',
                              border: '1px solid #86EFAC',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Mail size={12} /> EMAIL SENT
                          </span>
                        ) : reg.confirmationEmailStatus === 'PENDING' ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#854D0E',
                              background: '#FEF9C3',
                              border: '1px solid #FDE047',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock size={12} /> EMAIL PENDING
                          </span>
                        ) : reg.confirmationEmailStatus === 'FAILED' ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#DC2626',
                                  background: '#FEE2E2',
                                  border: '1px solid #FCA5A5',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <AlertCircle size={12} /> EMAIL FAILED
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResendConfirmation(reg.registrationId)}
                                disabled={actionLoading}
                                style={{
                                  fontSize: '11.5px',
                                  color: '#DC2626',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontWeight: 700,
                                }}
                              >
                                Retry Email{reg.confirmationEmailAttempts ? ` (${reg.confirmationEmailAttempts})` : ''}
                              </button>
                            </div>
                            {reg.confirmationEmailLastError && (
                              <div
                                style={{
                                  fontSize: '10.5px',
                                  color: '#991B1B',
                                  marginTop: '3px',
                                  wordBreak: 'break-word',
                                }}
                              >
                                Error: {reg.confirmationEmailLastError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResendConfirmation(reg.registrationId)}
                            disabled={actionLoading}
                            style={{
                              fontSize: '11.5px',
                              color: '#0369A1',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontWeight: 600,
                            }}
                          >
                            Send Confirmation Email
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="im-admin-card-actions">
                  <button
                    type="button"
                    className="btn-admin-action btn-admin-approve"
                    onClick={() => handleApprovePayment(reg.registrationId)}
                    disabled={actionLoading}
                    title="Approve payment and officially confirm seat"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontWeight: 700,
                    }}
                  >
                    Approve Pay
                  </button>
                  <button
                    type="button"
                    className="btn-admin-action btn-admin-reject"
                    onClick={() => handleRejectPayment(reg.registrationId)}
                    disabled={actionLoading}
                    title="Reject payment"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontWeight: 700,
                    }}
                  >
                    Reject Pay
                  </button>
                </div>
              </div>
            );
          })}
          {!filtered.length && !loading && (
            <p className="admin-empty">No summit registrations match your search filters.</p>
          )}
        </div>
      </div>
      </>
      ) : (
        /* ATTENDANCE & CHECK-IN SECTION */
        <div className="admin-section" style={{ marginTop: '8px' }}>
          {/* Attendance KPI Cards */}
          <div className="summit-admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '24px' }}>
            <div className="summit-admin-kpi-card">
              <span className="kpi-label">Confirmed Participants</span>
              <span className="kpi-number" style={{ color: '#053726' }}>{attendanceStats.totalConfirmed}</span>
            </div>
            <div className="summit-admin-kpi-card kpi-confirmed">
              <span className="kpi-label">Checked-In Attendees</span>
              <span className="kpi-number" style={{ color: '#16A34A' }}>{attendanceStats.totalCheckedIn}</span>
            </div>
            <div className="summit-admin-kpi-card kpi-verification">
              <span className="kpi-label">Remaining to Check-In</span>
              <span className="kpi-number" style={{ color: '#D97706' }}>{attendanceStats.remainingNotCheckedIn}</span>
            </div>
            <div className="summit-admin-kpi-card">
              <span className="kpi-label">Attendance Rate</span>
              <span className="kpi-number" style={{ color: '#2563EB' }}>
                {attendanceStats.totalConfirmed > 0
                  ? `${Math.round((attendanceStats.totalCheckedIn / attendanceStats.totalConfirmed) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>

          {/* Check-In Action Station */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 12px rgba(5,55,38,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#053726' }}>
                  Investor Mission 2026 Check-In Station — Siruthuli Noyyal Life Centre, Coimbatore
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Scan participant QR code or enter Registration ID manually to confirm venue entry at Ukkadam Sungam Bypass Rd, Ramanathapuram, Coimbatore.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setScannerActive(prev => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: scannerActive ? '1px solid #FCA5A5' : '1px solid #CBD5E1',
                    background: scannerActive ? '#FEF2F2' : '#F8FAFC',
                    color: scannerActive ? '#DC2626' : '#053726',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Camera size={16} />
                  {scannerActive ? 'Stop Camera Scanner' : 'Open Camera QR Scanner'}
                </button>

                <button
                  type="button"
                  onClick={handleExportAttendance}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: '#053726',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(5,55,38,0.15)',
                  }}
                >
                  <Download size={16} />
                  Export Attendance CSV
                </button>
              </div>
            </div>

            {/* QR Scanner Container */}
            {scannerActive && (
              <div style={{ maxWidth: '400px', margin: '0 auto 20px', background: '#0F172A', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div id="dashboard-qr-reader" style={{ width: '100%' }}></div>
                <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>
                  Hold participant's email QR code in front of the camera to verify entrance.
                </p>
              </div>
            )}

            {/* Manual Check-In Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }} style={{ display: 'flex', gap: '8px', maxWidth: '540px' }}>
              <input
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                placeholder="Enter Registration ID (e.g. SS26-00001) or scan token..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  background: '#D8AE54',
                  color: '#053726',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  boxShadow: '0 2px 4px rgba(216,174,84,0.3)',
                }}
              >
                {actionLoading ? 'Checking...' : 'Check In'}
              </button>
            </form>

            {/* Check-In Feedback Alert Banner */}
            {checkInResult && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  border:
                    checkInResult.type === 'success'
                      ? '1px solid #86EFAC'
                      : checkInResult.type === 'warning'
                      ? '1px solid #FDE68A'
                      : '1px solid #FECACA',
                  background:
                    checkInResult.type === 'success'
                      ? '#F0FDF4'
                      : checkInResult.type === 'warning'
                      ? '#FFFBEB'
                      : '#FEF2F2',
                  color:
                    checkInResult.type === 'success'
                      ? '#166534'
                      : checkInResult.type === 'warning'
                      ? '#92400E'
                      : '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <strong>
                    {checkInResult.type === 'success' && '✓ Check-In Confirmed: '}
                    {checkInResult.type === 'warning' && '⚠️ Already Checked In: '}
                    {checkInResult.type === 'error' && '❌ Verification Failed: '}
                  </strong>
                  {checkInResult.participantName ? `${checkInResult.participantName} (${checkInResult.registrationId}) — ` : ''}
                  {checkInResult.message}
                  {checkInResult.checkedInAt && ` (Scanned at ${new Date(checkInResult.checkedInAt).toLocaleTimeString()})`}
                  {checkInResult.checkedInBy && ` by ${checkInResult.checkedInBy}`}
                </div>
                <button
                  type="button"
                  onClick={() => setCheckInResult(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: 'inherit',
                    fontWeight: 'bold',
                    padding: '0 4px',
                  }}
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Attendance Table */}
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2>Confirmed Participants Attendance ({attendanceList.length})</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                  Live tracking of confirmed participants and door check-in status.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  placeholder="Filter attendees by name, ID, phone..."
                  value={attendanceQuery}
                  onChange={(e) => setAttendanceQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    width: '240px',
                  }}
                />
                <button
                  type="button"
                  onClick={loadAttendance}
                  style={{
                    fontSize: '12.5px',
                    color: '#053726',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant</th>
                    <th>Contact</th>
                    <th>City / State</th>
                    <th>Attendance Status</th>
                    <th>Check-In Time</th>
                    <th>Checked In By</th>
                    <th>Email Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList
                    .filter((a) => {
                      if (!attendanceQuery) return true;
                      const q = attendanceQuery.toLowerCase();
                      return [a.registrationId, a.fullName, a.name, a.email, a.mobileNumber, a.phone, a.city, a.state]
                        .some((f) => f && String(f).toLowerCase().includes(q));
                    })
                    .map((a) => {
                      const isCheckedIn = a.attendanceStatus === 'CHECKED_IN' || a.status === 'Checked-In';
                      const emailSent = a.confirmationEmailStatus === 'SENT' || a.confirmationEmailSent;
                      const emailFailed = a.confirmationEmailStatus === 'FAILED';

                      return (
                        <tr key={a._id}>
                          <td><strong>{a.registrationId}</strong></td>
                          <td><strong>{a.fullName || a.name}</strong></td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              <div>{a.email}</div>
                              <div style={{ color: '#64748B' }}>{a.mobileNumber || a.phone}</div>
                            </div>
                          </td>
                          <td>{[a.city, a.state].filter(Boolean).join(', ') || '—'}</td>
                          <td>
                            {isCheckedIn ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>
                                <CheckCircle2 size={12} /> CHECKED IN
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>
                                <Clock size={12} /> NOT CHECKED IN
                              </span>
                            )}
                          </td>
                          <td>
                            {a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : '—'}
                          </td>
                          <td>{a.checkedInBy || '—'}</td>
                          <td>
                            {emailSent ? (
                              <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Mail size={11} /> Sent
                              </span>
                            ) : emailFailed ? (
                              <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <AlertCircle size={11} /> Failed
                              </span>
                            ) : (
                              <span style={{ color: '#64748B', fontSize: '11px' }}>Not Sent</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {!isCheckedIn && (
                                <button
                                  type="button"
                                  className="btn-admin-action btn-admin-approve"
                                  onClick={() => handleCheckIn(a.registrationId)}
                                  disabled={actionLoading}
                                  title="Mark attendee as checked in"
                                >
                                  Check In
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-admin-action"
                                style={{ background: '#F1F5F9', color: '#053726', border: '1px solid #CBD5E1' }}
                                onClick={() => handleResendConfirmation(a.registrationId)}
                                disabled={actionLoading}
                                title="Resend confirmation email with QR code"
                              >
                                Resend QR
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {!attendanceList.length && !attendanceLoading && (
                <p className="admin-empty">No confirmed participants found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Receipt Lightbox Modal */}
      {modalRegistration && (
        <div className="summit-modal-backdrop" onClick={handleCloseModal}>
          <div className="summit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="summit-modal-header">
              <h3>Payment Proof Verification – {modalRegistration.registrationId}</h3>
              <button className="summit-modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="summit-modal-body">
              <div className="modal-receipt-meta">
                <div>
                  <span>Participant:</span>
                  <strong>{modalRegistration.fullName || modalRegistration.name}</strong>
                </div>
                <div>
                  <span>Email:</span>
                  <strong>{modalRegistration.email}</strong>
                </div>
                <div>
                  <span>Phone:</span>
                  <strong>{modalRegistration.countryCode || '+91'} {modalRegistration.mobileNumber || modalRegistration.phone}</strong>
                </div>
                <div>
                  <span>Location:</span>
                  <strong>{[modalRegistration.city, modalRegistration.district, modalRegistration.state].filter(Boolean).join(', ')}</strong>
                </div>
                <div>
                  <span>Payment Method:</span>
                  <strong>{modalRegistration.paymentMethod || 'ONLINE'}</strong>
                </div>
                <div>
                  <span>UPI / UTR Ref:</span>
                  <strong>{modalRegistration.upiTransactionId || 'None provided'}</strong>
                </div>
                <div>
                  <span>Payment Date:</span>
                  <strong>{modalRegistration.paymentDate ? new Date(modalRegistration.paymentDate).toLocaleDateString() : '—'}</strong>
                </div>
                <div>
                  <span>Registration Status:</span>
                  <strong>{modalRegistration.registrationStatus || 'PENDING_APPROVAL'}</strong>
                </div>
                {modalRegistration.sessionExpectations && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span>Session Expectations:</span>
                    <strong style={{ fontWeight: 400, whiteSpace: 'pre-wrap', color: '#1E293B', display: 'block', marginTop: '4px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E2E8F0', maxHeight: '100px', overflowY: 'auto' }}>
                      {modalRegistration.sessionExpectations}
                    </strong>
                  </div>
                )}
                {modalRegistration.adminVerificationNotes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span>Admin Notes:</span>
                    <strong style={{ color: '#0B2D49' }}>{modalRegistration.adminVerificationNotes}</strong>
                  </div>
                )}
              </div>

              <div className="modal-screenshot-wrap">
                {receiptLoading ? (
                  <div style={{ color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 0' }}>
                    <div className="im-admin-spinner" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading payment screenshot securely...</span>
                  </div>
                ) : receiptBlobUrl ? (
                  <>
                    <div className="modal-screenshot-toolbar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-admin-action"
                          style={{ padding: '4px 8px', fontSize: '12px', background: '#334155', color: '#FFFFFF', border: '1px solid #475569' }}
                          onClick={() => setReceiptZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                          title="Zoom out"
                        >
                          <ZoomOut size={13} style={{ display: 'inline', marginRight: '3px' }} /> -
                        </button>
                        <span style={{ color: '#F1F5F9', fontSize: '12px', minWidth: '45px', textAlign: 'center', fontWeight: 600 }}>
                          {Math.round(receiptZoom * 100)}%
                        </span>
                        <button
                          type="button"
                          className="btn-admin-action"
                          style={{ padding: '4px 8px', fontSize: '12px', background: '#334155', color: '#FFFFFF', border: '1px solid #475569' }}
                          onClick={() => setReceiptZoom(z => Math.min(3, Number((z + 0.25).toFixed(2))))}
                          title="Zoom in"
                        >
                          <ZoomIn size={13} style={{ display: 'inline', marginRight: '3px' }} /> +
                        </button>
                        {receiptZoom !== 1 && (
                          <button
                            type="button"
                            className="btn-admin-action"
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#1E293B', color: '#94A3B8', border: '1px solid #475569' }}
                            onClick={() => setReceiptZoom(1)}
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div>
                        <a
                          href={receiptBlobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-admin-action"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#15803D',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                          title="Open original screenshot in high-resolution in a new browser tab"
                        >
                          <ExternalLink size={12} /> Open in New Tab
                        </a>
                      </div>
                    </div>

                    <div className="modal-screenshot-scroll">
                      <img
                        src={receiptBlobUrl}
                        alt="Payment receipt screenshot"
                        className="modal-screenshot-img"
                        style={{
                          transform: `scale(${receiptZoom})`,
                          transformOrigin: 'center center',
                          cursor: receiptZoom === 1 ? 'zoom-in' : 'zoom-out',
                        }}
                        onClick={() => setReceiptZoom(z => z === 1 ? 1.75 : 1)}
                        title="Click image to toggle zoom"
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '16px 20px', maxWidth: '540px', width: '100%', color: '#92400E', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#B45309', fontWeight: 700, fontSize: '14px' }}>
                      <AlertCircle size={20} />
                      <span>Payment Screenshot Unavailable on Server</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '12.5px', lineHeight: 1.5, color: '#78350F' }}>
                      {receiptError?.message || 'The payment screenshot file for this registration is no longer on the server.'}
                    </p>
                    <div style={{ background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 12px', color: '#1E293B', marginBottom: '10px' }}>
                      <div><strong>UTR Reference:</strong> <code>{modalRegistration.upiTransactionId || 'None'}</code></div>
                      <div><strong>Amount:</strong> ₹{modalRegistration.paymentAmount || 500}</div>
                      <div><strong>Payment Status:</strong> {modalRegistration.paymentStatus}</div>
                      <div><strong>Payment Date:</strong> {modalRegistration.paymentDate ? new Date(modalRegistration.paymentDate).toLocaleDateString() : '—'}</div>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#92400E', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {modalRegistration.paymentStatus === 'PAID'
                        ? 'Note: This participant\'s payment has already been verified and confirmed.'
                        : 'If manual re-verification is required, you may ask the participant to re-upload their receipt proof.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="summit-modal-footer">
              <button
                type="button"
                className="btn-admin-action"
                style={{ padding: '8px 14px', background: '#E2E8F0', color: '#334155' }}
                onClick={handleCloseModal}
              >
                Close
              </button>

              {modalRegistration.paymentStatus !== 'PAID' && (
                <>
                  <button
                    type="button"
                    className="btn-admin-action btn-admin-reject"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    disabled={actionLoading}
                    onClick={() => handleRejectPayment(modalRegistration.registrationId)}
                  >
                    Reject Pay
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action btn-admin-approve"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    disabled={actionLoading}
                    onClick={() => handleApprovePayment(modalRegistration.registrationId)}
                  >
                    Approve Pay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Offline Payment Recording Modal */}
      {offlineModalReg && (
        <div className="summit-modal-backdrop" onClick={() => setOfflineModalReg(null)}>
          <div className="summit-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="summit-modal-header">
              <h3>Record Offline Payment – {offlineModalReg.registrationId}</h3>
              <button className="summit-modal-close" onClick={() => setOfflineModalReg(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitOfflinePayment}>
              <div className="summit-modal-body">
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
                  Recording offline payment for <strong>{offlineModalReg.fullName || offlineModalReg.name}</strong> ({offlineModalReg.email}).
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#08243B' }}>Amount (₹)</label>
                  <input
                    type="number"
                    value={offlineForm.amount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                    required
                    style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#08243B' }}>Payment Method</label>
                  <select
                    value={offlineForm.method}
                    onChange={(e) => setOfflineForm({ ...offlineForm, method: e.target.value })}
                    style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '14px' }}
                  >
                    <option value="Cash at Venue">Cash at Venue Desk</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="Direct UPI to Organizer">Direct UPI to Organizer</option>
                    <option value="Cheque / DD">Cheque / Demand Draft</option>
                    <option value="Other">Other Offline Mode</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#08243B' }}>Payment Date</label>
                  <input
                    type="date"
                    value={offlineForm.paymentDate}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentDate: e.target.value })}
                    required
                    style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#08243B' }}>Verification Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={offlineForm.notes}
                    onChange={(e) => setOfflineForm({ ...offlineForm, notes: e.target.value })}
                    placeholder="Enter any reference, receipt book number, or verification details..."
                    style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={offlineForm.approve}
                    onChange={(e) => setOfflineForm({ ...offlineForm, approve: e.target.checked })}
                  />
                  <span style={{ fontSize: '13.5px', color: '#08243B', fontWeight: 600 }}>
                    Mark payment as Approved (will confirm seat if registration is also approved)
                  </span>
                </label>
              </div>

              <div className="summit-modal-footer">
                <button
                  type="button"
                  className="btn-admin-action"
                  style={{ padding: '8px 14px', background: '#E2E8F0', color: '#334155' }}
                  onClick={() => setOfflineModalReg(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-action btn-admin-approve"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                  disabled={actionLoading}
                >
                  Save Offline Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Verification Notes Modal */}
      {notesModalReg && (
        <div className="summit-modal-backdrop" onClick={() => setNotesModalReg(null)}>
          <div className="summit-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="summit-modal-header">
              <h3>Admin Verification Notes – {notesModalReg.registrationId}</h3>
              <button className="summit-modal-close" onClick={() => setNotesModalReg(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitNotes}>
              <div className="summit-modal-body">
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  Add private admin notes regarding verification, phone checks, or payment references for <strong>{notesModalReg.fullName || notesModalReg.name}</strong>.
                </p>

                <textarea
                  rows={5}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Enter verification notes..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="summit-modal-footer">
                <button
                  type="button"
                  className="btn-admin-action"
                  style={{ padding: '8px 14px', background: '#E2E8F0', color: '#334155' }}
                  onClick={() => setNotesModalReg(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-action btn-admin-approve"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                  disabled={actionLoading}
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="summit-modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div
            className="summit-modal-box"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="summit-modal-header" style={{ background: '#064B36', color: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Change Organizer Password</h3>
              <button
                type="button"
                className="btn-close-modal"
                style={{ color: '#FFFFFF' }}
                onClick={() => setShowPasswordModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="summit-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  Update password for account <strong>{adminDisplayName}</strong>. Password must be at least 8 characters.
                </p>

                {passwordError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 12px', borderRadius: '6px', fontSize: '13px' }}>
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px', color: '#1E293B' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px', color: '#1E293B' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px', color: '#1E293B' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div className="summit-modal-footer">
                <button
                  type="button"
                  className="btn-admin-action"
                  style={{ padding: '8px 14px', background: '#E2E8F0', color: '#334155' }}
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-action btn-admin-approve"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
