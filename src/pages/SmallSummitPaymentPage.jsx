import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Copy,
  Check,
  ExternalLink,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  CreditCard,
  Info,
  X,
} from 'lucide-react';
import API_URL from '../config/api';
import barakahLogo from '../assets/Barakah-logo.png';
import phonepeQrImg from '../assets/phonepe-qr.jpg';
import './SummitPaymentPage.css';

const DEC_ACCOUNT_DETAILS = {
  accountName: 'ANAS RAHMAN H',
  upiId: '6380413253@ybl',
  phone: '6380413253',
  fee: 500,
  maxCapacity: 50,
};

export default function SmallSummitPaymentPage() {
  const { registrationId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regData, setRegData] = useState(null);

  // Copy states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Device & UPI direct payment states
  const [deviceType, setDeviceType] = useState('desktop');
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [upiLaunchStatus, setUpiLaunchStatus] = useState('idle'); // 'idle' | 'opening-phonepe' | 'fallback-ready' | 'ios-launched'

  // Upload Form State
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Submit & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
          if (res.data.upiTransactionId) {
            setUpiTransactionId(res.data.upiTransactionId);
          }
          if (res.data.paymentNotes) {
            setPaymentNotes(res.data.paymentNotes);
          }
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
    const upi = regData?.upiDetails?.upiId || DEC_ACCOUNT_DETAILS.upiId;
    navigator.clipboard.writeText(upi).then(() => {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    });
  };

  const handleCopyPhone = () => {
    const phone = regData?.upiDetails?.phoneNumber || DEC_ACCOUNT_DETAILS.phone;
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    });
  };

  const handleFileChange = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Please upload a JPG, PNG, or WebP screenshot.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds maximum size limit of 5 MB.');
      return;
    }

    setScreenshotFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshotFile(null);
    setPreviewUrl('');
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!screenshotFile && !regData?.paymentScreenshot) {
      setUploadError('Please select and upload your UPI payment screenshot.');
      return;
    }

    if (!upiTransactionId.trim() || upiTransactionId.trim().length < 6) {
      setUploadError('Please enter a valid 12-digit UPI reference / UTR number.');
      return;
    }

    if (!paymentDate) {
      setUploadError('Please specify the date of payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (screenshotFile) {
        formData.append('receipt', screenshotFile);
      }
      formData.append('registrationId', registrationId);
      formData.append('upiTransactionId', upiTransactionId.trim());
      formData.append('paymentDate', paymentDate);
      if (paymentNotes.trim()) {
        formData.append('paymentNotes', paymentNotes.trim());
      }

      const res = await axios
        .post(`${API_URL}/api/investor-mission/payment/${registrationId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .catch(() =>
          axios.post(`${API_URL}/api/dec-summit/payment/${registrationId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        )
        .catch(() =>
          axios.post(`${API_URL}/api/small-summit/payment/${registrationId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        )
        .catch(() =>
          axios.post(`${API_URL}/api/summit/payment/${registrationId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );

      if (res.data?.success) {
        setSubmitSuccess(true);
        fetchPaymentDetails();
      } else {
        setUploadError(res.data?.message || 'Failed to submit payment proof.');
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Unable to upload payment proof. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
    `cu=INR`,
    `tn=${encodeURIComponent('Investor Mission Registration')}`,
    `tr=${encodeURIComponent(uniquePaymentRef)}`,
  ].join('&');

  // Standard UPI URI (works across UPI apps on Android and iOS)
  const standardUpiDeepLink = `upi://pay?${upiQueryParams}`;

  // Android PhonePe Intent URI targeting com.phonepe.app directly
  const androidPhonePeIntent = `intent://pay?${upiQueryParams}#Intent;scheme=upi;package=com.phonepe.app;end`;

  const handlePayViaUpiApp = () => {
    // 1. Desktop: Prevent broken protocol handler; open guidance modal with QR code & UPI ID instructions
    if (deviceType === 'desktop') {
      setShowDesktopModal(true);
      return;
    }

    // 2. Android:
    // - Attempt to open PhonePe directly using package identifier com.phonepe.app
    // - If PhonePe is not installed or cannot handle the intent, provide automatic & manual fallback to standard UPI intent
    if (deviceType === 'android') {
      setUpiLaunchStatus('opening-phonepe');

      const startTime = Date.now();
      let fallbackTriggered = false;

      const runFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        setUpiLaunchStatus('fallback-ready');
        window.location.href = standardUpiDeepLink;
      };

      // Fallback timer: if browser page remains visible after 1800ms, PhonePe didn't take over
      const timer = setTimeout(() => {
        if (document.visibilityState === 'visible' && Date.now() - startTime < 3500) {
          runFallback();
        }
      }, 1800);

      const handleAppOpen = () => {
        if (document.hidden) {
          clearTimeout(timer);
        }
      };

      window.addEventListener('pagehide', handleAppOpen, { once: true });
      window.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(timer);
      }, { once: true });

      // Trigger PhonePe intent directly
      window.location.href = androidPhonePeIntent;
      return;
    }

    // 3. iOS:
    // - Use standard UPI payment link where supported
    // - Provide clear fallback instructions if app cannot be opened
    if (deviceType === 'ios') {
      setUpiLaunchStatus('ios-launched');
      window.location.href = standardUpiDeepLink;
      return;
    }

    // Default fallback
    window.location.href = standardUpiDeepLink;
  };

  const handleOpenAnyUpiApp = () => {
    setUpiLaunchStatus('fallback-ready');
    window.location.href = standardUpiDeepLink;
  };

  return (
    <div className="summit-flow-page investor-mission-payment-page">
      {/* Header */}
      <header className="summit-flow-header" role="banner" style={{ background: '#064B36', borderBottom: '2px solid #80DF35' }}>
        <div className="summit-flow-container summit-flow-header-inner" style={{ maxWidth: '1080px', margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <Link to="/investor-mission" className="summit-flow-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#FFFFFF' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #80DF35' }}>
              <img src={barakahLogo} alt="Halal Wealth Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
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

      <main className="summit-flow-container summit-flow-main" style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* Progress Tracker */}
        <div className="summit-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
          <div className="summit-step-item done" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#E2E8F0', color: '#138C3B', fontSize: '12.5px', fontWeight: 600 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#138C3B', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              <Check size={12} />
            </span>
            <span className="step-text">Details Registered</span>
          </div>
          <div className="summit-step-connector active" style={{ width: '28px', height: '2px', background: '#80DF35' }} />
          <div className="summit-step-item active" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#064B36', color: '#FFFFFF', border: '1px solid #80DF35', fontSize: '12.5px', fontWeight: 700 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#80DF35', color: '#064B36', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
              2
            </span>
            <span className="step-text">UPI Payment &amp; Proof (₹{fee})</span>
          </div>
        </div>

        {/* Status Banners */}
        {isPaid && (
          <div className="summit-status-card paid" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#14532D' }}>
            <CheckCircle2 size={36} color="#15803D" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Confirmed &amp; Seat Secured!</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Assalamu Alaikum {fullName}, your payment of ₹{fee} has been verified and your seat is confirmed for <strong>Investor Mission 2026</strong>. An official confirmation email has been dispatched to <strong>{email}</strong>.
              </p>
            </div>
          </div>
        )}

        {isPendingVerification && !submitSuccess && (
          <div className="summit-status-card review" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#92400E' }}>
            <Clock size={36} color="#B45309" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Verification in Progress</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Your payment screenshot and UTR reference have been received. Our team will verify your payment against bank records and approve your confirmed summit pass shortly.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="summit-status-card rejected" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#991B1B' }}>
            <XCircle size={36} color="#B91C1C" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Proof Needs Correction</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {rejectionReason || 'We could not verify your previous payment screenshot or UTR number. Please verify your reference or re-upload a clear receipt screenshot below.'}
              </p>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="summit-status-card success-banner" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', color: '#14532D' }}>
            <CheckCircle2 size={36} color="#15803D" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Proof Submitted Successfully!</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Your payment proof and UTR have been submitted. An administrator will verify your payment and confirm your registration shortly.
              </p>
            </div>
          </div>
        )}

        {/* Section Intro */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: '#138C3B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            INVESTOR MISSION 2026
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#064B36', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Complete Your Registration
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
            Registration Fee: <strong style={{ color: '#0B2D49', fontSize: '17px' }}>₹{fee}</strong> • Limited to {DEC_ACCOUNT_DETAILS.maxCapacity} Participants
          </p>
        </div>

        {/* Main 2-Column Grid: Left QR & Account / Right Upload */}
        <div className="summit-payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
          {/* LEFT: PhonePe QR & Account Details */}
          <div className="summit-card payment-info-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '28px', boxShadow: '0 4px 16px rgba(11, 45, 73, 0.05)' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', color: '#D8AE54', textTransform: 'uppercase' }}>
                STEP 2A: SCAN &amp; PAY
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#08243B', margin: '4px 0 6px' }}>
                PhonePe Payment Details
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Scan &amp; Pay using the PhonePe app or any UPI application (Google Pay, Paytm, BHIM).
              </p>
            </div>

            {/* Fee Pill */}
            <div style={{ background: 'rgba(216, 174, 84, 0.12)', border: '1px solid #D8AE54', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#08243B', fontWeight: 600 }}>
                  Registration Fee
                </span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#08243B' }}>
                  ₹{fee}
                </span>
              </div>
              <span style={{ background: '#0B2D49', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                All Inclusive
              </span>
            </div>

            {/* Original PhonePe QR Code (Uncropped, Unmodified, High-Quality) */}
            <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px 14px', marginBottom: '22px' }}>
              <div style={{ maxWidth: '280px', margin: '0 auto', background: '#FFFFFF', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
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
              <p style={{ margin: '12px 0 0', fontSize: '13px', fontWeight: 600, color: '#0B2D49' }}>
                Scan &amp; Pay using PhonePe App
              </p>
              <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                Works with PhonePe, Google Pay, Paytm, BHIM &amp; Banking UPI apps
              </span>
            </div>

            {/* Payment Account Details */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#08243B', margin: '0 0 12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                Payment Account Details
              </h3>

              {/* Account Name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>Account Name:</span>
                <strong style={{ color: '#08243B' }}>{DEC_ACCOUNT_DETAILS.accountName}</strong>
              </div>

              {/* UPI ID with Copy Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13.5px' }}>
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
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Phone Number with Copy Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '13.5px' }}>
                <span style={{ color: '#64748B' }}>Phone Number:</span>
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
                    <span>{copiedPhone ? 'Copied' : 'Copy Phone'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Direct UPI Intent Link / PhonePe Integration */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
              <button
                type="button"
                onClick={handlePayViaUpiApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  height: '48px',
                  borderRadius: '6px',
                  background: '#08243B',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  border: '1.5px solid #D8AE54',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(8, 36, 59, 0.15)',
                }}
                title="Pay directly via PhonePe or UPI App"
              >
                <Smartphone size={18} color="#D8AE54" />
                <span>PAY DIRECTLY VIA UPI APP</span>
                <ExternalLink size={15} color="#D8AE54" style={{ opacity: 0.9 }} />
              </button>

              <small style={{ display: 'block', marginTop: '8px', fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
                {deviceType === 'desktop'
                  ? '💻 Desktop mode: Click to view mobile instructions or scan the QR code above'
                  : deviceType === 'android'
                  ? '⚡ Opens PhonePe directly prefilled with ₹500 (or other UPI apps if unavailable)'
                  : '⚡ Opens your installed UPI app prefilled with ₹500'}
              </small>

              {/* Status & Fallback Notifications */}
              {upiLaunchStatus === 'opening-phonepe' && (
                <div style={{ marginTop: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px 14px', textAlign: 'left', fontSize: '12.5px', color: '#1E293B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, color: '#0B2D49' }}>
                    <Clock size={16} color="#D8AE54" />
                    <span>Opening PhonePe App...</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    If PhonePe did not open automatically on your Android device, tap below:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleOpenAnyUpiApp}
                      style={{
                        background: '#0B2D49',
                        color: '#FFFFFF',
                        border: '1px solid #D8AE54',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Open Any UPI App (GPay / Paytm / BHIM)
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={{
                        background: '#FFFFFF',
                        color: '#08243B',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedUpi ? 'Copied' : 'Copy UPI ID'}
                    </button>
                  </div>
                </div>
              )}

              {upiLaunchStatus === 'fallback-ready' && (
                <div style={{ marginTop: '12px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '6px', padding: '12px 14px', textAlign: 'left', fontSize: '12.5px', color: '#92400E' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700 }}>
                    <AlertCircle size={16} color="#B45309" />
                    <span>PhonePe App Not Responding</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', lineHeight: 1.4 }}>
                    If PhonePe is not installed, you can use Google Pay, Paytm, BHIM, or any other UPI app:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleOpenAnyUpiApp}
                      style={{
                        background: '#08243B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Open Any Other UPI App
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={{
                        background: '#FFFFFF',
                        color: '#08243B',
                        border: '1px solid #FCD34D',
                        borderRadius: '4px',
                        padding: '7px 12px',
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

              {upiLaunchStatus === 'ios-launched' && (
                <div style={{ marginTop: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '6px', padding: '12px 14px', textAlign: 'left', fontSize: '12.5px', color: '#0369A1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700 }}>
                    <Info size={16} color="#0284C7" />
                    <span>iOS / iPhone Payment Guidance</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', lineHeight: 1.4, color: '#0369A1' }}>
                    If Safari did not launch your UPI app automatically, please scan the QR code above or copy our UPI ID:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ background: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid #BAE6FD', fontWeight: 700, color: '#0B2D49', fontSize: '12px' }}>
                      {DEC_ACCOUNT_DETAILS.upiId}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={{
                        background: copiedUpi ? '#15803D' : '#0B2D49',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedUpi ? 'Copied' : 'Copy UPI ID'}
                    </button>
                  </div>
                </div>
              )}

              {/* Secondary quick option on mobile */}
              {deviceType !== 'desktop' && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleOpenAnyUpiApp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0B2D49',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '4px 8px',
                    }}
                  >
                    Pay via Google Pay, Paytm, or Other UPI App
                  </button>
                </div>
              )}

              {/* Post-payment guidance reminder */}
              <div style={{ marginTop: '14px', background: 'rgba(216, 174, 84, 0.1)', border: '1px dashed #D8AE54', borderRadius: '6px', padding: '10px 12px', fontSize: '11.5px', color: '#08243B', lineHeight: 1.45, textAlign: 'left' }}>
                <strong>📌 Important:</strong> After completing ₹{fee} payment in PhonePe/UPI, return here to upload your payment receipt screenshot and enter your 12-digit UTR in <strong>Step 2B</strong>.
              </div>
            </div>
          </div>

          {/* RIGHT: Upload Payment Receipt Proof */}
          <div className="summit-card payment-upload-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '28px', boxShadow: '0 4px 16px rgba(11, 45, 73, 0.05)' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', color: '#D8AE54', textTransform: 'uppercase' }}>
                STEP 2B: SUBMIT PROOF
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#08243B', margin: '4px 0 6px' }}>
                Upload Payment Receipt
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Upload your payment screenshot and enter the 12-digit UTR number for verification.
              </p>
            </div>

            {uploadError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: '6px', padding: '12px 16px', color: '#991B1B', fontSize: '13.5px', marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} noValidate>
              {/* File Dropzone */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#08243B', marginBottom: '6px' }}>
                  Payment Screenshot <span style={{ color: '#DC2626' }}>*</span>
                </label>

                {!previewUrl ? (
                  <label
                    htmlFor="receipt-file"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      id="receipt-file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <Upload size={30} color="#0B2D49" style={{ marginBottom: '8px' }} />
                    <strong style={{ fontSize: '14px', color: '#08243B', display: 'block' }}>
                      Click or drag payment screenshot here
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      PNG, JPG, JPEG or WebP (Max 5 MB)
                    </span>
                  </label>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px', background: '#F8FAFC' }}>
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#08243B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {screenshotFile?.name || 'receipt-image'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {screenshotFile ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{ display: 'block', background: 'none', border: 'none', color: '#DC2626', fontSize: '12px', padding: '4px 0', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove / Choose another
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* UPI Transaction / UTR Field */}
              <div style={{ marginBottom: '18px' }}>
                <label htmlFor="upiTransactionId" style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#08243B', marginBottom: '6px' }}>
                  UPI Transaction ID / UTR Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  id="upiTransactionId"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                  placeholder="e.g. 423456789012"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontFamily: 'inherit',
                    fontSize: '14.5px',
                    color: '#08243B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                  Locate the 12-digit UTR or UPI Reference No. in your PhonePe / bank confirmation.
                </span>
              </div>

              {/* Payment Date Field */}
              <div style={{ marginBottom: '18px' }}>
                <label htmlFor="paymentDate" style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#08243B', marginBottom: '6px' }}>
                  Payment Date <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontFamily: 'inherit',
                    fontSize: '14.5px',
                    color: '#08243B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              {/* Optional Notes Field */}
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="paymentNotes" style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#08243B', marginBottom: '6px' }}>
                  Additional Notes <small style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</small>
                </label>
                <input
                  type="text"
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via PhonePe from HDFC Bank account"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '10px 14px',
                    fontFamily: 'inherit',
                    fontSize: '14.5px',
                    color: '#08243B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isPaid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#08243B',
                    color: '#FFFFFF',
                    border: '1px solid #D8AE54',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    cursor: isSubmitting || isPaid ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || isPaid ? 0.65 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(8, 36, 59, 0.2)',
                  }}
                >
                  {isSubmitting
                    ? 'Uploading Proof...'
                    : isPaid
                    ? 'Payment Confirmed'
                    : 'SUBMIT PAYMENT PROOF FOR VERIFICATION'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                <ShieldCheck size={18} color="#064B36" style={{ flexShrink: 0 }} />
                <span>
                  Our administrative team verifies all payments directly with bank records before confirming your Investor Mission 2026 seat.
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
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
              maxWidth: '460px',
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
              UPI applications (PhonePe, Google Pay, Paytm) run on mobile devices. Choose how you would like to complete your ₹{fee} payment:
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0B2D49', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <strong style={{ color: '#08243B', display: 'block', marginBottom: '2px' }}>Scan PhonePe QR Code</strong>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>Use your phone camera or PhonePe to scan the QR code displayed on this page.</span>
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
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>After paying ₹{fee}, enter your 12-digit UTR and upload your payment screenshot on this page to secure your seat.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopModal(false)}
              style={{
                width: '100%',
                height: '42px',
                background: '#08243B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              Back to Payment Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
