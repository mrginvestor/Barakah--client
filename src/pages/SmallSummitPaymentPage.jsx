import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  CreditCard,
  Info,
  X,
  QrCode,
} from 'lucide-react';
import API_URL from '../config/api';
import sioCoimbatoreLogo from '../assets/sio-coimbatore-logo.png';
import solidarityLogo from '../assets/solidarity-logo.png';
import phonepeQrImg from '../assets/phonepe-qr.jpg';
import './SummitPaymentPage.css';

const DEC_ACCOUNT_DETAILS = {
  accountName: 'ANAS RAHMAN H',
  upiId: '6380413253@ybl',
  phone: '6380413253',
  fee: 500,
  currency: 'INR',
  maxCapacity: 50,
};

export default function SmallSummitPaymentPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regData, setRegData] = useState(null);

  // Copy states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Device & UPI direct payment states
  const [deviceType, setDeviceType] = useState('desktop');
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [upiLaunchStatus, setUpiLaunchStatus] = useState('idle'); // 'idle' | 'launched' | 'phonepe' | 'gpay' | 'paytm' | 'bhim'

  const fetchPaymentDetails = () => {
    if (!registrationId) return;
    setLoading(true);
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
        console.error('Error loading Investor Mission payment details:', err);
        setError(err.response?.data?.message || 'Registration not found or connection error.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Investor Mission 2026 Payment | Halal Wealth';
    fetchPaymentDetails();

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      if (/android/i.test(ua)) {
        setDeviceType('android');
      } else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        setDeviceType('ios');
      } else {
        setDeviceType('desktop');
      }
    }
  }, [registrationId]);

  const handleCopyUpi = () => {
    const upi = DEC_ACCOUNT_DETAILS.upiId;
    navigator.clipboard.writeText(upi).then(() => {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    });
  };

  const handleCopyPhone = () => {
    const phone = DEC_ACCOUNT_DETAILS.phone;
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="summit-flow-page">
        <div className="summit-flow-container summit-loading-box" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="summit-spinner" />
          <p style={{ marginTop: '16px', color: '#0B2D49', fontWeight: 600 }}>
            Loading your Investor Mission 2026 registration details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !regData) {
    return (
      <div className="summit-flow-page">
        <div className="summit-flow-container summit-error-box" style={{ maxWidth: '600px', margin: '60px auto', padding: '36px', textAlign: 'center', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ color: '#08243B', marginBottom: '8px' }}>Registration Not Found</h2>
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            {error || 'The requested registration ID could not be loaded.'}
          </p>
          <Link
            to="/investor-mission-registration"
            className="btn-summit-submit"
            style={{ display: 'inline-flex', padding: '12px 24px', textDecoration: 'none' }}
          >
            Go to Investor Mission Registration
          </Link>
        </div>
      </div>
    );
  }

  // If registrant selected offline payment, route them directly to the offline confirmation page
  if (regData?.paymentMethod === 'OFFLINE') {
    return <Navigate to={`/investor-mission-confirmation/${registrationId}`} replace />;
  }

  const {
    fullName,
    email,
    registrationFee,
    paymentStatus,
    rejectionReason,
  } = regData;

  const fee = registrationFee || DEC_ACCOUNT_DETAILS.fee;
  const isPaid = paymentStatus === 'PAID';
  const isPendingVerification = paymentStatus === 'PENDING_VERIFICATION';
  const isRejected = paymentStatus === 'REJECTED';

  // Dynamic unique registration reference for the payment transaction
  const uniquePaymentRef = String(regData?.registrationId || registrationId || 'INVESTORMISSION')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');

  // Exact parameters specified: pa, pn, am, cu, tn, tr
  const upiQueryParams = [
    `pa=${encodeURIComponent(DEC_ACCOUNT_DETAILS.upiId)}`,
    `pn=${encodeURIComponent(DEC_ACCOUNT_DETAILS.accountName)}`,
    `am=${encodeURIComponent(fee)}`,
    `cu=${DEC_ACCOUNT_DETAILS.currency}`,
    `tn=${encodeURIComponent('Investor Mission 2026')}`,
    `tr=${encodeURIComponent(uniquePaymentRef)}`,
  ].join('&');

  // Standard UPI URI (opens system UPI app chooser on Android, UPI handler on iOS)
  const standardUpiDeepLink = `upi://pay?${upiQueryParams}`;

  // App-specific Intent URIs for Android
  const androidPhonePeIntent = `intent://pay?${upiQueryParams}#Intent;scheme=upi;package=com.phonepe.app;end`;
  const androidGPayIntent = `intent://pay?${upiQueryParams}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  const androidPaytmIntent = `intent://pay?${upiQueryParams}#Intent;scheme=upi;package=net.one97.paytm;end`;
  const androidBhimIntent = `intent://pay?${upiQueryParams}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;

  const handlePayViaUpiApp = () => {
    // 1. Desktop: Prevent broken protocol handler; open guidance modal with QR code & UPI ID instructions
    if (deviceType === 'desktop') {
      setShowDesktopModal(true);
      return;
    }

    setUpiLaunchStatus('launched');
    window.location.href = standardUpiDeepLink;
  };

  const handleLaunchSpecificApp = (appName, appIntent) => {
    if (deviceType === 'desktop') {
      setShowDesktopModal(true);
      return;
    }

    setUpiLaunchStatus(appName);
    if (deviceType === 'android') {
      window.location.href = appIntent;
    } else {
      window.location.href = standardUpiDeepLink;
    }
  };

  const handleContinueToSubmission = () => {
    navigate(`/investor-mission-payment-submission/${registrationId}`);
  };

  return (
    <div className="summit-flow-page investor-mission-payment-page">
      {/* Header */}
      <header className="summit-flow-header" role="banner" style={{ background: '#064B36', borderBottom: '2px solid #80DF35' }}>
        <div className="summit-flow-container summit-flow-header-inner" style={{ maxWidth: '1080px', margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <Link to="/investor-mission" className="summit-flow-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#FFFFFF', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <img
                src={sioCoimbatoreLogo}
                alt="SIO Coimbatore Logo"
                style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0, display: 'block' }}
              />
              <div style={{ height: '40px', background: '#FFFFFF', borderRadius: '6px', padding: '3px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #80DF35', flexShrink: 0 }}>
                <img src={solidarityLogo} alt="Solidarity Youth Organisation – Tamil Nadu" style={{ height: '32px', width: 'auto', maxWidth: '110px', objectFit: 'contain' }} />
              </div>
            </div>
            <div className="summit-flow-title-block">
              <span style={{ fontSize: '10.5px', color: '#80DF35', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
                SIO COIMBATORE &amp; HALAL WEALTH
              </span>
              <strong style={{ fontSize: '17px', letterSpacing: '0.5px', color: '#FFFFFF', display: 'block', lineHeight: 1.2 }}>
                INVESTOR MISSION 2026
              </strong>
            </div>
          </Link>

          <div className="summit-flow-pill" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(128, 223, 53, 0.4)', borderRadius: '6px', padding: '6px 14px', color: '#FFFFFF' }}>
            <span style={{ fontSize: '13px' }}>
              Registration ID: <strong style={{ color: '#80DF35' }}>{registrationId}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="summit-flow-container summit-flow-main" style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Progress Tracker */}
        <div className="summit-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div className="summit-step-item done" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#E2E8F0', color: '#138C3B', fontSize: '12.5px', fontWeight: 600 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#138C3B', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              <Check size={12} />
            </span>
            <span className="step-text">Details Registered</span>
          </div>
          <div className="summit-step-connector active" style={{ width: '24px', height: '2px', background: '#80DF35' }} />
          <div className="summit-step-item active" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#064B36', color: '#FFFFFF', border: '1px solid #80DF35', fontSize: '12.5px', fontWeight: 700 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#80DF35', color: '#064B36', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
              2
            </span>
            <span className="step-text">UPI App Payment (₹{fee})</span>
          </div>
          <div className="summit-step-connector" style={{ width: '24px', height: '2px', background: '#CBD5E1' }} />
          <div className="summit-step-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#F1F5F9', color: '#64748B', fontSize: '12.5px', fontWeight: 600 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#CBD5E1', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              3
            </span>
            <span className="step-text">Submit Screenshot &amp; UTR</span>
          </div>
        </div>

        {/* Status Banners */}
        {isPaid && (
          <div className="summit-status-card paid" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#14532D' }}>
            <CheckCircle2 size={36} color="#15803D" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Confirmed &amp; Seat Secured!</h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.5 }}>
                Assalamu Alaikum {fullName}, your payment of ₹{fee} has been verified and your seat is confirmed for <strong>Investor Mission 2026</strong>. An official confirmation email has been dispatched to <strong>{email}</strong>.
              </p>
              <Link
                to={`/investor-mission-confirmation/${registrationId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#15803D',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                View Confirmed Pass <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {isPendingVerification && (
          <div className="summit-status-card review" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '28px', color: '#92400E' }}>
            <Clock size={32} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Verification in Progress</h3>
              <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.5 }}>
                Your payment screenshot and UTR reference have already been submitted. Our team is verifying your payment with our bank records.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to={`/investor-mission-confirmation/${registrationId}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#B45309',
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  View Status <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={handleContinueToSubmission}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    color: '#92400E',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Update / Re-submit Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="summit-status-card rejected" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#991B1B' }}>
            <XCircle size={36} color="#B91C1C" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Previous Payment Proof Needs Correction</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {rejectionReason || 'We could not verify your previous payment screenshot or UTR number. Please complete payment and upload clear proof.'}
              </p>
            </div>
          </div>
        )}

        {/* Section Intro */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: '#138C3B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            STEP 2 OF 3: UPI PAYMENT
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#064B36', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Investor Mission 2026 Payment
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
            Registration Fee: <strong style={{ color: '#064B36', fontSize: '17px' }}>₹{fee}</strong> (INR) • Limited to {DEC_ACCOUNT_DETAILS.maxCapacity} Participants
          </p>

          {/* Participant Details Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginTop: '16px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 20px', flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '14px', color: '#0F172A' }}>
              Participant: <strong style={{ color: '#064B36' }}>{fullName}</strong>
            </span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '14px', color: '#0F172A' }}>
              Registration ID: <strong style={{ color: '#138C3B', fontFamily: 'monospace' }}>{registrationId}</strong>
            </span>
          </div>
        </div>

        {/* Main Payment Container Card */}
        <div className="summit-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 20px rgba(6, 75, 54, 0.08)', marginBottom: '28px' }}>
          {/* Action A: PROMINENT UPI PAYMENT BUTTON */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '24px', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#D8AE54', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              INSTANT PAYMENT ON MOBILE
            </span>

            <button
              type="button"
              onClick={handlePayViaUpiApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '440px',
                minHeight: '54px',
                padding: '12px 24px',
                borderRadius: '8px',
                background: '#064B36',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                border: '2px solid #80DF35',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 20px rgba(6, 75, 54, 0.3)',
              }}
              title="Click to launch UPI app with prefilled payment details"
            >
              <Smartphone size={22} color="#80DF35" />
              <span>PAY ₹{fee} VIA UPI APP</span>
              <ExternalLink size={18} color="#80DF35" />
            </button>

            <p style={{ margin: '10px 0 0', fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
              {deviceType === 'desktop'
                ? '💻 Desktop mode: Click to see how to pay with your mobile phone or scan the QR code below.'
                : '⚡ Opens your installed UPI app prefilled with ₹500, payee ANAS RAHMAN H, and your Registration ID.'}
            </p>

            {/* Quick UPI App Chooser Buttons */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                Compatible with any UPI application:
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleLaunchSpecificApp('phonepe', androidPhonePeIntent)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#08243B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#5F259F' }} />
                  PhonePe
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchSpecificApp('gpay', androidGPayIntent)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#08243B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4285F4' }} />
                  Google Pay
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchSpecificApp('paytm', androidPaytmIntent)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#08243B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00BAF2' }} />
                  Paytm
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchSpecificApp('bhim', androidBhimIntent)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#08243B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00796B' }} />
                  BHIM
                </button>
              </div>
            </div>

            {/* Launch Status / In-App Guidance */}
            {upiLaunchStatus !== 'idle' && (
              <div style={{ marginTop: '16px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '14px 18px', textAlign: 'left', maxWidth: '520px', margin: '16px auto 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '13.5px', marginBottom: '4px' }}>
                  <Clock size={16} />
                  <span>UPI Payment Requested</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#14532D', lineHeight: 1.45 }}>
                  If your UPI app opened, please approve the ₹{fee} payment to <strong>{DEC_ACCOUNT_DETAILS.accountName}</strong>. Once done, return here and tap the continue button below.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleContinueToSubmission}
                    style={{
                      background: '#15803D',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    I Have Paid – Continue →
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      background: '#FFFFFF',
                      color: '#0B2D49',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedUpi ? 'Copied' : 'Copy UPI ID'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section B: QR Code & Manual Payment Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center', marginBottom: '28px' }}>
            {/* Left: Original PhonePe QR Code */}
            <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px 14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#D8AE54', display: 'block', marginBottom: '8px' }}>
                OR SCAN VIA PHONE CAMERA / QR SCANNER
              </span>
              <div style={{ maxWidth: '240px', margin: '0 auto', background: '#FFFFFF', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <img
                  src={phonepeQrImg}
                  alt="Official PhonePe QR Code – Anas Rahman H"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '4px',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <p style={{ margin: '10px 0 2px', fontSize: '13px', fontWeight: 700, color: '#0B2D49' }}>
                Official PhonePe QR Code
              </p>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                Amount: ₹{fee} • Payee: {DEC_ACCOUNT_DETAILS.accountName}
              </span>
            </div>

            {/* Right: Payment Account Details Table */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#08243B', margin: '0 0 14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                Payment Account Details
              </h3>

              {/* Account Holder */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>Account Holder:</span>
                <strong style={{ color: '#08243B' }}>{DEC_ACCOUNT_DETAILS.accountName}</strong>
              </div>

              {/* UPI ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E2E8F0', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>UPI ID:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, color: '#0B2D49', fontSize: '13px' }}>
                    {DEC_ACCOUNT_DETAILS.upiId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: copiedUpi ? '#15803D' : '#0B2D49',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E2E8F0', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>Phone / GPay:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#08243B' }}>{DEC_ACCOUNT_DETAILS.phone}</strong>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: copiedPhone ? '#15803D' : '#0B2D49',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Fixed Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>Fixed Fee:</span>
                <strong style={{ color: '#138C3B', fontSize: '16px' }}>₹{fee} {DEC_ACCOUNT_DETAILS.currency}</strong>
              </div>
            </div>
          </div>

          {/* Section C: PROMINENT CONTINUATION CARD & BUTTON */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F0FDF4 100%)',
              border: '2px solid #80DF35',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#064B36', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} color="#15803D" />
                <span>Next Step: Submit Payment Screenshot</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#08243B', margin: '0 0 8px' }}>
                Already Made Your ₹{fee} Payment?
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 18px' }}>
                After completing payment in PhonePe, Google Pay, Paytm, BHIM, or via QR code, continue to upload your screenshot and enter your 12-digit UTR reference number for administrative verification.
              </p>

              <button
                type="button"
                onClick={handleContinueToSubmission}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  maxWidth: '440px',
                  minHeight: '52px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: '#138C3B',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(19, 140, 59, 0.3)',
                }}
              >
                <span>I HAVE COMPLETED PAYMENT – CONTINUE</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Verification Notice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#64748B', lineHeight: 1.5, maxWidth: '780px', margin: '0 auto 24px', background: '#FFFFFF', padding: '14px 18px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <ShieldCheck size={20} color="#064B36" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#08243B', display: 'block', marginBottom: '2px' }}>Important Policy Notice</strong>
            <span>
              Opening a UPI app or deep link initiates a payment transaction but does not guarantee completion. Payment status remains pending until our administrative team verifies the official 12-digit UTR and payment screenshot against bank records. Confirmed passes are issued strictly up to the 50-participant limit.
            </span>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/investor-mission"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#064B36',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Investor Mission Overview
          </Link>
        </div>
      </main>

      {/* Desktop Payment Guidance Modal */}
      {showDesktopModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="desktop-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 36, 59, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowDesktopModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center',
              position: 'relative',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDesktopModal(false)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                color: '#0B2D49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Smartphone size={26} color="#0B2D49" />
            </div>

            <h3 id="desktop-modal-title" style={{ fontSize: '19px', fontWeight: 800, color: '#08243B', margin: '0 0 6px' }}>
              Pay via PhonePe / UPI on Mobile
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 18px' }}>
              UPI applications (PhonePe, Google Pay, Paytm, BHIM) run on your mobile smartphone. Choose how you would like to complete your ₹{fee} payment:
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0B2D49', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <strong style={{ color: '#08243B', display: 'block', marginBottom: '2px' }}>Scan PhonePe QR Code</strong>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>Open PhonePe, Google Pay, or your camera app and scan the QR code on this page.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0B2D49', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                  2
                </span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#08243B', display: 'block', marginBottom: '4px' }}>Or Copy UPI ID</strong>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '6px 10px' }}>
                    <code style={{ fontWeight: 700, color: '#0B2D49', fontSize: '13px' }}>{DEC_ACCOUNT_DETAILS.upiId}</code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={{
                        background: copiedUpi ? '#15803D' : '#0B2D49',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedUpi ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0B2D49', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <strong style={{ color: '#08243B', display: 'block', marginBottom: '2px' }}>Submit Screenshot &amp; UTR</strong>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>After paying ₹{fee}, tap &quot;I Have Completed Payment – Continue&quot; to submit your proof.</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDesktopModal(false);
                  handleContinueToSubmission();
                }}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#138C3B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                Continue to Submit Proof →
              </button>
              <button
                type="button"
                onClick={() => setShowDesktopModal(false)}
                style={{
                  height: '44px',
                  padding: '0 16px',
                  background: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
