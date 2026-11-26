import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import API_URL from '../config/api';
import sioCoimbatoreLogo from '../assets/sio-coimbatore-logo.png';
import solidarityLogo from '../assets/solidarity-logo.png';
import './SummitPaymentPage.css';

const DEC_ACCOUNT_DETAILS = {
  accountName: 'ANAS RAHMAN H',
  upiId: '6380413253@ybl',
  phone: '6380413253',
  fee: 500,
  maxCapacity: 50,
};

export default function SmallSummitPaymentSubmissionPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regData, setRegData] = useState(null);

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

  const fetchRegistration = () => {
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
          if (res.data.paymentDate) {
            try {
              const d = new Date(res.data.paymentDate).toISOString().split('T')[0];
              setPaymentDate(d);
            } catch (_) {}
          }
        } else {
          setError(res.data?.message || 'Unable to retrieve registration details.');
        }
      })
      .catch((err) => {
        console.error('Error loading Investor Mission registration details:', err);
        setError(err.response?.data?.message || 'Registration not found or connection error.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Investor Mission 2026 Submit Payment Proof | Halal Wealth';
    fetchRegistration();
  }, [registrationId]);

  const handleFileChange = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Please upload a JPG, PNG, or WebP payment screenshot.');
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

    const cleanUtr = upiTransactionId.trim();
    if (!cleanUtr || cleanUtr.length < 6 || cleanUtr.length > 35) {
      setUploadError('Please enter a valid 12-digit UPI reference / UTR number (6–35 characters).');
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
      formData.append('upiTransactionId', cleanUtr);
      formData.append('paymentDate', paymentDate);
      if (paymentNotes.trim()) {
        formData.append('paymentNotes', paymentNotes.trim());
      }

      const postProofWithFallback = async (data) => {
        try {
          return await axios.post(`${API_URL}/api/investor-mission/payment/${registrationId}/submit`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (err1) {
          if (err1.response?.status === 404) {
            try {
              return await axios.post(`${API_URL}/api/dec-summit/payment/${registrationId}/submit`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            } catch (err2) {
              if (err2.response?.status === 404) {
                return await axios.post(`${API_URL}/api/small-summit/payment/${registrationId}/submit`, data, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
              }
              throw err2;
            }
          }
          throw err1;
        }
      };

      const res = await postProofWithFallback(formData);

      if (res.data?.success) {
        setSubmitSuccess(true);
        fetchRegistration();
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

  return (
    <div className="summit-flow-page investor-mission-submission-page">
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

      <main className="summit-flow-container summit-flow-main" style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Progress Tracker */}
        <div className="summit-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div className="summit-step-item done" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#E2E8F0', color: '#138C3B', fontSize: '12.5px', fontWeight: 600 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#138C3B', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              <Check size={12} />
            </span>
            <span className="step-text">Details Registered</span>
          </div>
          <div className="summit-step-connector done" style={{ width: '24px', height: '2px', background: '#138C3B' }} />
          <div className="summit-step-item done" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#E2E8F0', color: '#138C3B', fontSize: '12.5px', fontWeight: 600 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#138C3B', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              <Check size={12} />
            </span>
            <span className="step-text">UPI App Payment</span>
          </div>
          <div className="summit-step-connector active" style={{ width: '24px', height: '2px', background: '#80DF35' }} />
          <div className="summit-step-item active" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#064B36', color: '#FFFFFF', border: '1px solid #80DF35', fontSize: '12.5px', fontWeight: 700 }}>
            <span className="step-num" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#80DF35', color: '#064B36', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
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
                View Confirmed Pass &amp; Check-In QR <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {isPendingVerification && !submitSuccess && (
          <div className="summit-status-card review" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '28px', color: '#92400E' }}>
            <Clock size={32} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700 }}>Payment Verification in Progress</h3>
              <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.5 }}>
                Your payment screenshot and UTR reference have been received. Our team will verify your payment against bank records and approve your confirmed summit pass shortly.
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
                  View Registration Status <ArrowRight size={14} />
                </Link>
              </div>
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
          <div className="summit-status-card success-banner" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '28px', color: '#14532D' }}>
            <CheckCircle2 size={36} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800 }}>Proof Submitted Successfully!</h3>
              <p style={{ margin: '0 0 14px', fontSize: '14px', lineHeight: 1.5 }}>
                Alhamdulillah! Your UPI payment screenshot and 12-digit UTR reference have been recorded. Our administration team is verifying your payment with our bank records. Your official seat confirmation email will be dispatched once verified.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                  View Registration Status <ArrowRight size={15} />
                </Link>
                <Link
                  to="/investor-mission"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #86EFAC',
                    color: '#15803D',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Event Overview
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Head */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: '#138C3B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            STEP 3 OF 3: PAYMENT VERIFICATION
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#064B36', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Submit Payment Details
          </h1>
          <p style={{ fontSize: '14.5px', color: '#475569', margin: 0 }}>
            Upload your payment screenshot and enter the 12-digit UTR reference number to complete your ₹{fee} registration.
          </p>
        </div>

        {/* Participant Summary Box */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', fontWeight: 600 }}>
                Participant Name
              </span>
              <strong style={{ fontSize: '15px', color: '#08243B' }}>{fullName}</strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', fontWeight: 600 }}>
                Registration ID
              </span>
              <code style={{ fontSize: '14px', fontWeight: 700, color: '#064B36', background: '#F0FDF4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                {registrationId}
              </code>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', fontWeight: 600 }}>
                Discounted Registration Fee
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <del style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textDecorationThickness: '1.5px' }}>₹15,000</del>
                <strong style={{ fontSize: '19px', fontWeight: 900, color: '#138C3B' }}>₹{fee}</strong>
                <span style={{ background: '#80DF35', color: '#053726', fontSize: '10px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                  ONLY
                </span>
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Original Fee: <del>₹15,000</del> • Save ₹14,500
              </span>
            </div>
          </div>
        </div>

        {/* Main Submission Form Card */}
        <div className="summit-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 20px rgba(6, 75, 54, 0.08)' }}>
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#08243B', margin: '0 0 6px' }}>
              Payment Proof &amp; Reference
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Please provide the screenshot of your completed ₹{fee} payment along with the UTR number from your UPI application (PhonePe, Google Pay, Paytm, or BHIM).
            </p>
          </div>

          {uploadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: '6px', padding: '12px 16px', color: '#991B1B', fontSize: '13.5px', marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProof} noValidate>
            {/* 1. Payment Screenshot Upload Field */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#08243B', marginBottom: '6px' }}>
                Payment Screenshot <span style={{ color: '#DC2626' }}>*</span>
              </label>

              {!previewUrl ? (
                <label
                  htmlFor="screenshot-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '8px',
                    padding: '28px 16px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="file"
                    id="screenshot-upload"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', border: '1px solid #BFDBFE' }}>
                    <Upload size={22} color="#1D4ED8" />
                  </div>
                  <strong style={{ fontSize: '14.5px', color: '#08243B', display: 'block' }}>
                    Click or drag payment screenshot here
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                    Supports PNG, JPG, JPEG, or WebP (Maximum size: 5 MB)
                  </span>
                </label>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px', background: '#F8FAFC' }}>
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <FileCheck size={16} color="#15803D" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#08243B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {screenshotFile?.name || 'receipt-image'}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                      {screenshotFile ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '12.5px', padding: '4px 0 0 0', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Remove / Choose another screenshot
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. UPI Transaction ID / UTR Field */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="upiTransactionId" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#08243B', marginBottom: '6px' }}>
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
                  height: '48px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14.5px',
                  color: '#08243B',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
                required
              />
              <span style={{ display: 'block', fontSize: '12px', color: '#64748B', marginTop: '5px', lineHeight: 1.4 }}>
                💡 Locate the 12-digit UTR or UPI Reference Number in your PhonePe, Google Pay, Paytm, or bank SMS confirmation.
              </span>
            </div>

            {/* 3. Payment Date Field */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="paymentDate" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#08243B', marginBottom: '6px' }}>
                Payment Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14.5px',
                  color: '#08243B',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            {/* 4. Optional Notes Field */}
            <div style={{ marginBottom: '26px' }}>
              <label htmlFor="paymentNotes" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#08243B', marginBottom: '6px' }}>
                Additional Notes <small style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</small>
              </label>
              <input
                type="text"
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Paid via Google Pay from HDFC Bank account"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14.5px',
                  color: '#08243B',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 5. Submit Button */}
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
                  height: '50px',
                  backgroundColor: isPaid ? '#15803D' : '#064B36',
                  color: '#FFFFFF',
                  border: '1.5px solid #80DF35',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  cursor: isSubmitting || isPaid ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || isPaid ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(6, 75, 54, 0.25)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="summit-spinner" style={{ width: '20px', height: '20px', borderTopColor: '#FFFFFF', borderWidth: '2px' }} />
                    <span>Submitting Payment Details...</span>
                  </>
                ) : isPaid ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Payment Already Verified</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT PAYMENT DETAILS</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '18px', fontSize: '12.5px', color: '#475569', lineHeight: 1.5, background: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <ShieldCheck size={20} color="#064B36" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#08243B', display: 'block', marginBottom: '2px' }}>Manual Admin Verification</strong>
                <span>
                  Our administrative team directly verifies every transaction with official bank records before confirming seats. Capacity is strictly limited to {DEC_ACCOUNT_DETAILS.maxCapacity} participants.
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Back Link to Payment page */}
        <div style={{ marginTop: '28px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link
            to={`/investor-mission-payment/${registrationId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#064B36',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Payment Details &amp; QR Code
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Link
            to="/investor-mission"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748B',
              fontSize: '13.5px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Investor Mission Overview
          </Link>
        </div>
      </main>
    </div>
  );
}
