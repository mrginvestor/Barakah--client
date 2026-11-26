import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2,
  Clock,
  Banknote,
  Smartphone,
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
import sioCoimbatoreLogo from '../assets/sio-coimbatore-logo.png';
import solidarityLogo from '../assets/solidarity-logo.png';
import './SmallSummitRegisterPage.css';

export default function SmallSummitConfirmationPage() {
  const { registrationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regData, setRegData] = useState(null);

  useEffect(() => {
    document.title = 'Investor Mission 2026 Registration Received | Halal Wealth';
    if (!registrationId) return;

    axios
      .get(`${API_URL}/api/investor-mission/payment/${registrationId}`)
      .catch(() => axios.get(`${API_URL}/api/dec-summit/payment/${registrationId}`))
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
            <Link to="/investor-mission" className="ssp-brand-link" title="Investor Mission 2026 Overview">
              <div className="ssp-brand-logos-row">
                <img src={sioCoimbatoreLogo} alt="SIO Coimbatore Logo" className="ssp-brand-sio-logo" />
                <div className="ssp-brand-solidarity-wrap">
                  <img src={solidarityLogo} alt="Solidarity Youth Organisation – Tamil Nadu" className="ssp-brand-solidarity-logo" />
                </div>
              </div>
              <div className="ssp-brand-headings">
                <span className="ssp-brand-kicker">SIO COIMBATORE &amp; HALAL WEALTH PRESENTS</span>
                <h1 className="ssp-brand-title">INVESTOR MISSION 2026</h1>
              </div>
            </Link>
            <p className="ssp-brand-tagline">
              The Halal Way of Investing • Sunday, 06 December 2026 • Siruthuli Noyyal Life Centre, Coimbatore
            </p>
          </div>

          <div className="ssp-header-badges" aria-label="Event Badges">
            <div className="ssp-badge ssp-badge--fee">
              <span className="ssp-badge-label">Special Discount Fee</span>
              <span className="ssp-badge-value">
                <del style={{ opacity: 0.65, fontSize: '12px', marginRight: '6px' }}>₹15,000</del>
                <span style={{ color: '#80DF35', fontWeight: 900 }}>₹{regData?.registrationFee || 500} ONLY</span>
              </span>
            </div>
            <div className="ssp-badge ssp-badge--capacity">
              <span className="ssp-badge-label">Attendance Mode</span>
              <span className="ssp-badge-value">In-Person / Venue</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="ssp-main-container">
        {loading ? (
          <div className="ssp-form-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className="ssp-spinner" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#064B36', fontSize: '18px', margin: 0 }}>
              Loading registration confirmation...
            </h3>
          </div>
        ) : error ? (
          <div className="ssp-form-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <AlertCircle size={44} style={{ color: '#DC2626', margin: '0 auto 16px' }} />
            <h2 style={{ color: '#064B36', marginBottom: '8px' }}>Registration Not Found</h2>
            <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 24px' }}>{error}</p>
            <Link to="/investor-mission-registration" className="ssp-btn-submit" style={{ display: 'inline-flex', width: 'auto', padding: '0 24px' }}>
              Register for Investor Mission 2026
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
                  color: '#138C3B',
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
                  color: '#064B36',
                  margin: '0 0 10px 0',
                }}
              >
                INVESTOR MISSION 2026 REGISTRATION RECEIVED
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
                {regData?.paymentMethod === 'OFFLINE'
                  ? 'Your offline registration request has been submitted successfully.'
                  : 'Your registration details have been received successfully.'}
              </p>
            </div>

            {/* Instruction Notice Banner */}
            {regData?.paymentStatus === 'PAID' || regData?.registrationStatus === 'CONFIRMED' ? (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  marginBottom: '28px',
                }}
              >
                <CheckCircle2 size={24} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#166534', fontSize: '14.5px', marginBottom: '4px' }}>
                    Registration &amp; Payment Confirmed
                  </strong>
                  <p style={{ margin: 0, color: '#15803D', fontSize: '13px', lineHeight: 1.45 }}>
                    Alhamdulillah! Your seat for Investor Mission 2026 is confirmed. Please keep your Registration ID handy for event check-in on 06 December 2026.
                  </p>
                </div>
              </div>
            ) : regData?.paymentStatus === 'PENDING_VERIFICATION' ? (
              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  marginBottom: '28px',
                }}
              >
                <Clock size={24} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#0369A1', fontSize: '14.5px', marginBottom: '4px' }}>
                    Payment Proof Under Verification
                  </strong>
                  <p style={{ margin: 0, color: '#0284C7', fontSize: '13px', lineHeight: 1.45 }}>
                    We have received your UPI payment proof{regData?.upiTransactionId ? ` (UTR: ${regData.upiTransactionId})` : ''}. Our admin team will verify your payment and issue your final confirmation shortly.
                  </p>
                </div>
              </div>
            ) : regData?.paymentMethod === 'OFFLINE' ? (
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
                    Payment of ₹500 to be Recorded at Venue
                  </strong>
                  <p style={{ margin: 0, color: '#B45309', fontSize: '13px', lineHeight: 1.45 }}>
                    Your offline registration request is registered. The organizer desk will record your payment upon arrival and confirm your seat.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '28px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', maxWidth: '480px' }}>
                  <AlertCircle size={24} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', color: '#92400E', fontSize: '14.5px', marginBottom: '4px' }}>
                      UPI Payment Pending (₹500)
                    </strong>
                    <p style={{ margin: 0, color: '#B45309', fontSize: '13px', lineHeight: 1.45 }}>
                      Please complete your payment via UPI to secure your seat before registrations close.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/investor-mission-payment/${regData?.registrationId || registrationId}`}
                  className="ssp-btn-submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '40px',
                    padding: '0 18px',
                    fontSize: '13px',
                    width: 'auto',
                    textDecoration: 'none',
                    margin: 0,
                  }}
                >
                  Pay ₹500 via UPI &rarr;
                </Link>
              </div>
            )}

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
                      color: regData?.paymentMethod === 'OFFLINE' ? '#5B21B6' : '#166534',
                      backgroundColor: regData?.paymentMethod === 'OFFLINE' ? '#EDE9FE' : '#DCFCE7',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {regData?.paymentMethod === 'OFFLINE' ? (
                      <>
                        <Banknote size={14} /> OFFLINE / AT VENUE
                      </>
                    ) : (
                      <>
                        <Smartphone size={14} /> ONLINE / UPI
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                    Discounted Registration Fee
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <del style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>₹15,000</del>
                    <strong style={{ fontSize: '17px', fontWeight: 900, color: '#138C3B' }}>
                      ₹{regData?.registrationFee || 500}
                    </strong>
                    <span style={{ background: '#80DF35', color: '#053726', fontSize: '10px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                      ONLY
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    Original Fee: <del>₹15,000</del>
                  </span>
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
                      color: regData?.paymentStatus === 'PAID' ? '#166534' : regData?.paymentStatus === 'PENDING_VERIFICATION' ? '#0369A1' : '#5B21B6',
                      backgroundColor: regData?.paymentStatus === 'PAID' ? '#DCFCE7' : regData?.paymentStatus === 'PENDING_VERIFICATION' ? '#E0F2FE' : '#EDE9FE',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    <Clock size={13} />
                    {regData?.paymentStatus === 'PAID'
                      ? 'PAID & CONFIRMED'
                      : regData?.paymentStatus === 'PENDING_VERIFICATION'
                      ? 'UNDER VERIFICATION'
                      : regData?.paymentMethod === 'OFFLINE'
                      ? 'PENDING OFFLINE PAYMENT'
                      : 'PENDING PAYMENT'}
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
                <strong>Note:</strong> Seat confirmation is subject to admin approval and payment verification. Seats are capped at 80 participants.
              </div>
            </div>

            {/* Official Venue Information */}
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '28px',
                background: '#F8FAFC',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#053726', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: '#16A34A' }} />
                Official Event Venue
              </h4>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#053726', margin: '0 0 4px 0' }}>
                Siruthuli Noyyal Life Centre
              </p>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                Ukkadam Sungam Bypass Rd, Shanmuga Nagar, Ramanathapuram, Coimbatore, Tamil Nadu 641023, India.
              </p>
              <a
                href="https://maps.google.com/?q=Siruthuli+Noyyal+Life+Centre,+Ukkadam+Sungam+Bypass+Rd,+Shanmuga+Nagar,+Ramanathapuram,+Coimbatore,+Tamil+Nadu+641023"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#053726',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                <span>Open in Google Maps &amp; Get Directions &rarr;</span>
              </a>
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
                If you have questions about venue location or payment verification, contact our team:
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
                to="/investor-mission"
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
                Return to Investor Mission Overview
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
