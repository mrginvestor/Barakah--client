import { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import adminApi from '../config/adminApi';
import API_URL from '../config/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
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

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi
        .get('/api/admin/investor-mission/registrations')
        .catch(() => adminApi.get('/api/admin/dec-summit/registrations'))
        .catch(() => adminApi.get('/api/admin/small-summit/registrations'))
        .catch(() => adminApi.get('/api/admin/summit/registrations')),
      adminApi
        .get('/api/admin/investor-mission/stats')
        .catch(() => adminApi.get('/api/admin/dec-summit/stats'))
        .catch(() => adminApi.get('/api/admin/small-summit/stats'))
        .catch(() => adminApi.get('/api/admin/summit/stats')),
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
    setReceiptBlobUrl('');
    setReceiptLoading(true);

    try {
      const res = await adminApi
        .get(`/api/admin/investor-mission/receipt/${reg.registrationId}`, { responseType: 'blob' })
        .catch(() => adminApi.get(`/api/admin/dec-summit/receipt/${reg.registrationId}`, { responseType: 'blob' }))
        .catch(() => adminApi.get(`/api/admin/small-summit/receipt/${reg.registrationId}`, { responseType: 'blob' }))
        .catch(() => adminApi.get(`/api/admin/summit/receipt/${reg.registrationId}`, { responseType: 'blob' }));
      const url = URL.createObjectURL(res.data);
      setReceiptBlobUrl(url);
    } catch (err) {
      console.error('Failed to load receipt blob:', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    setModalRegistration(null);
    setReceiptBlobUrl('');
  };

  // 1. Approve Registration Details
  const handleApproveRegistration = async (regId) => {
    if (!window.confirm(`Approve participant registration details for ${regId}?`)) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/approve-registration`)
        .catch(() => adminApi.post(`/api/admin/dec-summit/registrations/${regId}/approve-registration`))
        .catch(() => adminApi.post(`/api/admin/small-summit/registrations/${regId}/approve-registration`));
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
        .catch(() => adminApi.post(`/api/admin/dec-summit/registrations/${regId}/reject-registration`, { reason }))
        .catch(() => adminApi.post(`/api/admin/small-summit/registrations/${regId}/reject-registration`, { reason }));
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
    if (!window.confirm(`Approve payment for ${regId}? Dual approval will confirm the seat.`)) return;
    setActionLoading(true);
    try {
      const res = await adminApi
        .post(`/api/admin/investor-mission/registrations/${regId}/approve-payment`)
        .catch(() => adminApi.post(`/api/admin/dec-summit/registrations/${regId}/approve-payment`))
        .catch(() => adminApi.post(`/api/admin/small-summit/registrations/${regId}/approve-payment`))
        .catch(() => adminApi.post(`/api/admin/summit/registrations/${regId}/approve`));
      alert(res.data?.message || 'Payment approved.');
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
        .catch(() => adminApi.post(`/api/admin/dec-summit/registrations/${regId}/reject-payment`, { reason }))
        .catch(() => adminApi.post(`/api/admin/small-summit/registrations/${regId}/reject-payment`, { reason }))
        .catch(() => adminApi.post(`/api/admin/summit/registrations/${regId}/reject`, { reason }));
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
        .catch(() =>
          adminApi.post(`/api/admin/dec-summit/registrations/${offlineModalReg.registrationId}/record-offline-payment`, {
            paymentAmount: Number(offlineForm.amount) || 500,
            paymentDate: offlineForm.paymentDate,
            offlinePaymentMethod: offlineForm.method,
            adminVerificationNotes: offlineForm.notes,
            approvePayment: offlineForm.approve,
          })
        )
        .catch(() =>
          adminApi.post(`/api/admin/small-summit/registrations/${offlineModalReg.registrationId}/record-offline-payment`, {
            paymentAmount: Number(offlineForm.amount) || 500,
            paymentDate: offlineForm.paymentDate,
            offlinePaymentMethod: offlineForm.method,
            adminVerificationNotes: offlineForm.notes,
            approvePayment: offlineForm.approve,
          })
        );
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
        .catch(() =>
          adminApi.post(`/api/admin/dec-summit/registrations/${notesModalReg.registrationId}/notes`, {
            adminVerificationNotes: notesText,
          })
        )
        .catch(() =>
          adminApi.post(`/api/admin/small-summit/registrations/${notesModalReg.registrationId}/notes`, {
            adminVerificationNotes: notesText,
          })
        );
      alert(res.data?.message || 'Verification notes saved.');
      setNotesModalReg(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Top Admin Navigation Header */}
      <div className="admin-nav-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
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
        <Link
          to="/admin/investor-mission"
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
        <Link
          to="/admin/check-in"
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

      {/* Heading */}
      <div className="admin-heading">
        <div>
          <p className="eyebrow">INVESTOR MISSION 2026 • 50 PARTICIPANTS • ₹500</p>
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

      {/* Registrations Table */}
      <div className="admin-section">
        <h2>Participant Records</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Participant</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Occupation / Org</th>
                <th>Expectations</th>
                <th>Payment Method</th>
                <th>Registration Approval</th>
                <th>Payment Approval</th>
                <th>Seat Status</th>
                <th>Proof / UTR</th>
                <th>Admin Actions</th>
                <th>Registered Date</th>
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
                    <td>
                      <strong>{reg.registrationId}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{reg.fullName || reg.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <div>{reg.email}</div>
                        <div style={{ color: '#64748B' }}>
                          {reg.countryCode || '+91'} {reg.mobileNumber || reg.phone || reg.whatsappNumber}
                        </div>
                      </div>
                    </td>
                    <td>
                      {[reg.city, reg.district, reg.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>
                        <div>
                          {reg.occupation === 'Other' && reg.otherOccupation
                            ? `Other (${reg.otherOccupation})`
                            : reg.occupation || reg.currentProfession || '—'}
                        </div>
                        {reg.organization && <small style={{ color: '#64748B' }}>{reg.organization}</small>}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: '12px',
                          maxWidth: '160px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#334155',
                          cursor: reg.sessionExpectations ? 'help' : 'default',
                        }}
                        title={reg.sessionExpectations || ''}
                      >
                        {reg.sessionExpectations || '—'}
                      </div>
                    </td>
                    <td>
                      {isOffline ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#EDE9FE',
                            color: '#5B21B6',
                            border: '1px solid #DDD6FE',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          <Banknote size={12} /> OFFLINE
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#E0F2FE',
                            color: '#0369A1',
                            border: '1px solid #BAE6FD',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          <Smartphone size={12} /> ONLINE
                        </span>
                      )}
                    </td>
                    <td>
                      {isRegApproved ? (
                        <span className="admin-badge-paid">APPROVED</span>
                      ) : isRegRejected ? (
                        <span className="admin-badge-rejected">REJECTED</span>
                      ) : (
                        <span className="admin-badge-pending">PENDING</span>
                      )}
                    </td>
                    <td>
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
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        >
                          PENDING OFFLINE
                        </span>
                      ) : (
                        <span className="admin-badge-pending">PENDING</span>
                      )}
                    </td>
                    <td>
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
                            fontSize: '11.5px',
                          }}
                        >
                          PENDING ({!isRegApproved && !isPayApproved ? 'Reg & Pay' : !isRegApproved ? 'Reg' : 'Pay'})
                        </span>
                      )}
                    </td>
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
                            <code style={{ fontSize: '11px', background: '#F1F5F9', padding: '1px 4px', borderRadius: '3px' }}>
                              {reg.upiTransactionId}
                            </code>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>No UTR</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        {/* Registration Approval Actions */}
                        {!isRegApproved && !isRegRejected && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn-admin-action btn-admin-approve"
                              onClick={() => handleApproveRegistration(reg.registrationId)}
                              title="Approve registration details"
                            >
                              Approve Reg
                            </button>
                            <button
                              type="button"
                              className="btn-admin-action btn-admin-reject"
                              onClick={() => handleRejectRegistration(reg.registrationId)}
                              title="Reject registration details"
                            >
                              Reject Reg
                            </button>
                          </div>
                        )}

                        {/* Payment Approval Actions */}
                        {!isPayApproved && !isPayRejected && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {isOffline ? (
                              <button
                                type="button"
                                className="btn-admin-action"
                                style={{ background: '#7C3AED', color: '#FFFFFF' }}
                                onClick={() => handleOpenOfflineModal(reg)}
                                title="Record offline payment"
                              >
                                Record Offline Pay
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-admin-action btn-admin-approve"
                                onClick={() => handleApprovePayment(reg.registrationId)}
                                title="Approve payment"
                              >
                                Approve Pay
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-admin-action btn-admin-reject"
                              onClick={() => handleRejectPayment(reg.registrationId)}
                              title="Reject payment"
                            >
                              Reject Pay
                            </button>
                          </div>
                        )}

                        {/* Notes Button */}
                        <button
                          type="button"
                          className="btn-admin-action"
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onClick={() => handleOpenNotesModal(reg)}
                          title="Add or view admin notes"
                        >
                          <MessageSquare size={11} />
                          {reg.adminVerificationNotes || reg.adminNotes ? 'View Notes' : 'Add Note'}
                        </button>
                      </div>
                    </td>
                    <td>
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
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
      </div>

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
                  <div style={{ color: '#FFFFFF' }}>Loading secure screenshot...</div>
                ) : receiptBlobUrl ? (
                  <img
                    src={receiptBlobUrl}
                    alt="Payment receipt screenshot"
                    className="modal-screenshot-img"
                  />
                ) : (
                  <div style={{ color: '#FCA5A5' }}>Failed to load screenshot from server.</div>
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
                    Reject Payment
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action btn-admin-approve"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    disabled={actionLoading}
                    onClick={() => handleApprovePayment(modalRegistration.registrationId)}
                  >
                    Approve Payment
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
    </div>
  );
}
