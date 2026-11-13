import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2,
  Clock,
  Banknote,
  AlertCircle,
  Phone,
  Mail,
  User,
  Hash,
  MapPin,
  Calendar,
  ArrowLeft,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import API_URL from '../config/api';
import Footer from '../components/Footer';
import barakahLogo from '../assets/Barakah-logo.png';
import './SmallSummitRegisterPage.css';

export default function SmallSummitConfirmationPage() {
  const { registrationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regData, setRegData] = useState(null);

  useEffect(() => {
    document.title = 'DEC Summit Registration Received | Halal Wealth';
    if (!registrationId) return;

    axios
      .get(`${API_URL}/api/dec-summit/payment/${registrationId}`)
      .catch(() => axios.get(`${API_URL}/api/small-summit/payment/${registrationId}`))
      .catch(() => axios.get(`${API_URL}/api/summit/payment/${registrationId}`))
      .then((res) => {
        if (res.data?.success) {
          setRegData(res.data);
        } else {
          setError(res.data?.message || 'Unable to retrieve registration details.');
        }
      })
      .catch((err) => {
        console.error('Error fetching registration confirmation:', err);
        setError(err.response?.data?.message || 'Registration details not found.');
      })
      .finally(() => setLoading(false));
  }, [registrationId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="small-summit-page">
      {/* Brand Header */}
      <header className="ssp-header" role="banner">
        <div className="ssp-header-container">
          <div className="ssp-brand-section">
            <Link to="/" className="ssp-brand-link" title="Halal Wealth Summit Homepage">
              <div className="ssp-brand-logo-wrap">
                <img src={barakahLogo} alt="Halal Wealth Logo" className="ssp-brand-logo" />
              </div>
              <div className="ssp-brand-headings">
                <span className="ssp-brand-kicker">HALAL WEALTH</span>
                <h1 className="ssp-brand-title">DEC SUMMIT</h1>
              </div>
            </Link>
            <p className="ssp-brand-tagline">
              Exclusive gathering focused on Islamic finance, halal wealth and ethical investments.
            </p>
          </div>

          <div className="ssp-header-badges" aria-label="Event Badges">
            <div className="ssp-badge ssp-badge--fee">
              <span className="ssp-badge-label">Registration Fee</span>
              <span className="ssp-badge-value">₹500</span>
            </div>
            <div className="ssp-badge ssp-badge--capacity">
              <span className="ssp-badge-label">Attendance Mode</span>
              <span className="ssp-badge-value">Offline / Venue</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="ssp-main-container">
        {loading ? (
          <div className="ssp-form-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className="ssp-spinner" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#0B2D49', fontSize: '18px', margin: 0 }}>
              Loading registration confirmation...
            </h3>
          </div>
        ) : error ? (
          <div className="ssp-form-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <AlertCircle size={44} style={{ color: '#DC2626', margin: '0 auto 16px' }} />
            <h2 style={{ color: '#08243B', marginBottom: '8px' }}>Registration Not Found</h2>
            <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 24px' }}>{error}</p>
            <Link to="/dec-summit-registration" className="ssp-btn-submit" style={{ display: 'inline-flex', width: 'auto', padding: '0 24px' }}>
              Register for DEC Summit
            </Link>
          </div>
        ) : (
          <div className="ssp-form-card" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {/* Status Hero */}
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '24px',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  border: '2px solid #3B82F6',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#D8AE54',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                REGISTRATION SUBMISSION RECEIVED
              </span>
              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#08243B',
                  margin: '0 0 10px 0',
                }}
              >
                DEC SUMMIT REGISTRATION RECEIVED
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: '#475569',
                  maxWidth: '560px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                Your offline registration request has been submitted successfully.
              </p>
            </div>

            {/* Instruction Notice Banner */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                marginBottom: '28px',
              }}
            >
              <Banknote size={24} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#92400E', fontSize: '14.5px', marginBottom: '4px' }}>
                  Please complete your payment of ₹500 at the event venue or contact the organizers.
                </strong>
                <p style={{ margin: 0, color: '#B45309', fontSize: '13px', lineHeight: 1.45 }}>
                  Your registration status is currently <strong>PENDING ADMIN APPROVAL</strong>. The organizer desk will record your payment upon arrival and confirm your seat.
                </p>
              </div>
            </div>

            {/* Registration Details Grid */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#08243B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 18px 0',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                Participant Registration Summary
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '18px 24px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Participant Name
                  </span>
                  <strong style={{ fontSize: '15px', color: '#08243B' }}>
                    {regData?.fullName || regData?.name || '—'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Registration ID
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#0B2D49',
                      backgroundColor: '#FFFFFF',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    {regData?.registrationId || registrationId}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Registered Email
                  </span>
                  <span style={{ fontSize: '14px', color: '#334155' }}>{regData?.email || '—'}</span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Registered Mobile
                  </span>
                  <span style={{ fontSize: '14px', color: '#334155' }}>
                    {regData?.countryCode || '+91'} {regData?.mobileNumber || regData?.phone || '—'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Payment Method
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#5B21B6',
                      backgroundColor: '#EDE9FE',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    <Banknote size={14} /> OFFLINE / AT VENUE
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Registration Fee
                  </span>
                  <strong style={{ fontSize: '15px', color: '#08243B' }}>₹500</strong>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Registration Status
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: regData?.registrationStatus === 'CONFIRMED' ? '#166534' : '#92400E',
                      backgroundColor: regData?.registrationStatus === 'CONFIRMED' ? '#DCFCE7' : '#FEF3C7',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    <Clock size={13} />
                    {regData?.registrationStatus === 'CONFIRMED'
                      ? 'REGISTRATION APPROVED'
                      : 'PENDING ADMIN APPROVAL'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Payment Status
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: regData?.paymentStatus === 'PAID' ? '#166534' : '#5B21B6',
                      backgroundColor: regData?.paymentStatus === 'PAID' ? '#DCFCE7' : '#EDE9FE',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    <Clock size={13} />
                    {regData?.paymentStatus === 'PAID'
                      ? 'PAID & CONFIRMED'
                      : 'PENDING OFFLINE PAYMENT'}
                  </span>
                </div>
              </div>

              {/* Note callout */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px dashed #CBD5E1',
                  fontSize: '12.5px',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                <strong>Note:</strong> Seat confirmation is subject to admin approval and offline payment verification. Seats are capped at 50 participants.
              </div>
            </div>

            {/* Organizer Contact Info */}
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '28px',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#08243B', margin: '0 0 10px 0' }}>
                Event Coordinator &amp; Payment Support
              </h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px 0' }}>
                If you have questions about venue location or offline payment, contact our team:
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <a
                  href="tel:6380413253"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#0B2D49',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={16} style={{ color: '#D8AE54' }} />
                  +91 6380413253 (Anas Rahman H)
                </a>
                <a
                  href="mailto:info@halalwealth.finance"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#0B2D49',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={16} style={{ color: '#D8AE54' }} />
                  info@halalwealth.finance
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="ssp-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '46px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#08243B',
                }}
              >
                <Printer size={16} />
                Print / Save Slip
              </button>

              <Link
                to="/"
                className="ssp-btn-submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '46px',
                  padding: '0 24px',
                  fontSize: '14px',
                  width: 'auto',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
