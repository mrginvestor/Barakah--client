import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Ticket,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import API_URL from '../config/api';
import sioCoimbatoreLogo from '../assets/sio-coimbatore-logo.png';
import solidarityLogo from '../assets/solidarity-logo.png';
import posterImg from '../assets/investor-mission-poster.jpg';
import './SmallSummitRegisterPage.css';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Uttar Pradesh',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Assam',
  'Odisha',
  'Jammu and Kashmir',
  'Goa',
  'Other / Outside India',
];

const OCCUPATION_OPTIONS = [
  'Business Owner',
  'Entrepreneur',
  'Student',
  'Employee',
  'Professional',
  'Investor',
  'Other',
];

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+966', label: 'Saudi Arabia (+966)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+1', label: 'USA / Canada (+1)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+60', label: 'Malaysia (+60)' },
  { code: '+974', label: 'Qatar (+974)' },
  { code: '+968', label: 'Oman (+968)' },
  { code: '+973', label: 'Bahrain (+973)' },
  { code: '+965', label: 'Kuwait (+965)' },
];

export default function SmallSummitRegisterPage() {
  const navigate = useNavigate();

  const [capacity, setCapacity] = useState({
    maxCapacity: 80,
    registrationFee: 500,
    availableSeats: 80,
    isSoldOut: false,
    loading: true,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    state: 'Tamil Nadu',
    district: '',
    city: '',
    occupation: '',
    otherOccupation: '',
    organization: '',
    sessionExpectations: '',
    paymentMethod: 'ONLINE', // Online UPI is mandatory
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch real-time seat availability
  useEffect(() => {
    document.title = 'Investor Mission 2026 Registration | Halal Wealth';
    let isMounted = true;
    axios
      .get(`${API_URL}/api/investor-mission/availability`)
      .catch(() => axios.get(`${API_URL}/api/dec-summit/availability`))
      .catch(() => axios.get(`${API_URL}/api/small-summit/availability`))
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCapacity({
            maxCapacity: res.data.maxCapacity || 80,
            registrationFee: res.data.registrationFee || 500,
            availableSeats: res.data.availableSeats ?? 80,
            isSoldOut: Boolean(res.data.isSoldOut) || (res.data.availableSeats !== undefined && res.data.availableSeats <= 0),
            loading: false,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load Investor Mission capacity:', err);
        if (isMounted) setCapacity((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};

    // 1. Full Name Validation:
    // Required, Minimum 3 characters, Letters and normal spaces only, Reject numbers and invalid special characters
    const cleanName = formData.fullName.trim();
    if (!cleanName || cleanName.length < 3) {
      errs.fullName = 'Full Name is required (minimum 3 characters).';
    } else if (/\d/.test(cleanName) || !/^[a-zA-Z\s]+$/.test(cleanName)) {
      errs.fullName = 'Full name must contain only letters and normal spaces.';
    }

    // 2. Email Address Validation:
    // Required, validate correct email format, trimmed
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    // 3. Mobile Number Validation:
    // Required, accept exactly 10 digits for Indian mobile numbers, numbers only
    const cleanMobile = formData.mobileNumber.trim();
    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      errs.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    // 4. Location Details Validation:
    if (!formData.state.trim()) {
      errs.state = 'Please select your state.';
    }
    if (!formData.district.trim()) {
      errs.district = 'District is required.';
    }
    if (!formData.city.trim()) {
      errs.city = 'City / Town is required.';
    }

    // 5. Professional Information Validation:
    if (!formData.occupation) {
      errs.occupation = 'Please select your occupation.';
    }
    if (formData.occupation === 'Other' && !formData.otherOccupation.trim()) {
      errs.otherOccupation = 'Please specify your occupation.';
    }

    // 6. Session Expectations Validation:
    // Required, Minimum 10 characters, Maximum 500 characters
    const cleanExpectations = formData.sessionExpectations.trim();
    if (!cleanExpectations || cleanExpectations.length < 10) {
      errs.sessionExpectations = 'Please describe what you expect to learn from this session (minimum 10 characters).';
    } else if (cleanExpectations.length > 500) {
      errs.sessionExpectations = 'Session expectations must not exceed 500 characters.';
    }

    // 7. Terms & Conditions Validation:
    if (!formData.termsAccepted) {
      errs.termsAccepted = 'You must agree to the Terms & Conditions and Privacy Policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      const firstError = document.querySelector('.ssp-field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        countryCode: '+91',
        state: formData.state.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        occupation: formData.occupation,
        otherOccupation: formData.occupation === 'Other' ? formData.otherOccupation.trim() : '',
        organization: formData.organization.trim(),
        sessionExpectations: formData.sessionExpectations.trim(),
        paymentMethod: 'ONLINE',
        termsAccepted: true,
      };

      const postWithFallback = async (data) => {
        try {
          return await axios.post(`${API_URL}/api/investor-mission/register`, data);
        } catch (err1) {
          if (err1.response?.status === 404) {
            try {
              return await axios.post(`${API_URL}/api/dec-summit/register`, data);
            } catch (err2) {
              if (err2.response?.status === 404) {
                return await axios.post(`${API_URL}/api/small-summit/register`, data);
              }
              throw err2;
            }
          }
          throw err1;
        }
      };

      const res = await postWithFallback(payload);

      if (res.data?.success && (res.data?.registrationId || res.data?.redirectUrl)) {
        navigate(res.data.redirectUrl || `/investor-mission-payment/${res.data.registrationId}`);
      } else {
        setFormError(res.data?.message || 'Failed to complete registration.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to submit registration. Please check your details and try again.';
      setFormError(msg);
      if (err.response?.data?.redirectUrl) {
        setTimeout(() => {
          navigate(err.response.data.redirectUrl);
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="small-summit-page">
      {/* 1. HEADER: OFFICIAL INVESTOR MISSION 2026 POSTER */}
      <header className="ssp-poster-header" role="banner">
        <div className="ssp-poster-stage">
          <div className="ssp-poster-card">
            <img
              src={posterImg}
              alt="Investor Mission 2026 – The Halal Way of Investing Official Poster"
              className="ssp-header-poster-img"
            />
          </div>
        </div>

        {/* 2. COMPACT EVENT INFORMATION BAR */}
        <div className="ssp-compact-info-bar" aria-label="Event Key Highlights">
          <div className="ssp-compact-info-container">
            <div className="ssp-compact-info-item">
              <span className="ssp-compact-info-label">Event Date</span>
              <strong className="ssp-compact-info-val">Sunday, 06 Dec 2026</strong>
            </div>

            <div className="ssp-compact-divider" aria-hidden="true" />

            <div className="ssp-compact-info-item">
              <span className="ssp-compact-info-label">Event Format</span>
              <strong className="ssp-compact-info-val">In-Person Masterclass</strong>
            </div>

            <div className="ssp-compact-divider" aria-hidden="true" />

            <div className={`ssp-compact-info-item ${capacity.isSoldOut ? 'is-soldout' : ''}`}>
              <span className="ssp-compact-info-label">Seat Status</span>
              <strong className="ssp-compact-info-val">
                {capacity.loading ? (
                  'Checking...'
                ) : capacity.isSoldOut ? (
                  'Registration Closed'
                ) : (
                  'Limited Seats Available'
                )}
              </strong>
            </div>

            <div className="ssp-compact-divider" aria-hidden="true" />

            <div className="ssp-compact-info-item">
              <span className="ssp-compact-info-label">Official Venue</span>
              <a
                href="https://maps.app.goo.gl/4hwJsFTMujiSVDMEA"
                target="_blank"
                rel="noopener noreferrer"
                className="ssp-compact-info-val ssp-compact-venue-link"
                title="View Location on Google Maps"
              >
                Siruthuli Noyyal Life Centre, Coimbatore ↗
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 4. FORM CONTAINER AND ALIGNMENT (Centered, Max-width 850px) */}
      <main className="ssp-main-container">
        {/* Step Indicator */}
        <div className="ssp-progress-bar" aria-label="Registration Progress">
          <div className="ssp-progress-step active">
            <span className="ssp-step-circle">1</span>
            <span className="ssp-step-name">Participant Registration</span>
          </div>
          <div className="ssp-progress-divider" aria-hidden="true" />
          <div className="ssp-progress-step">
            <span className="ssp-step-circle">2</span>
            <span className="ssp-step-name">Payment Verification</span>
          </div>
        </div>

        {/* Dynamic Capacity Banner */}
        <div className={`ssp-capacity-banner ${capacity.isSoldOut ? 'is-soldout' : ''}`} role="status">
          <div className="ssp-capacity-icon-wrap">
            <Users size={18} />
          </div>
          <div className="ssp-capacity-content">
            {capacity.isSoldOut ? (
              <>
                <strong>INVESTOR MISSION REGISTRATION FULL</strong>
                <span>
                  All seats for this exclusive gathering have been filled and confirmed.
                </span>
              </>
            ) : (
              <>
                <strong>HURRY UP! REGISTER YOUR SEAT NOW</strong>
                <span>
                  Limited seats available. Complete your registration and payment verification to secure your place at Investor Mission 2026.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="ssp-form-card">
          <div className="ssp-card-intro">
            <div className="ssp-intro-header-row">
              <div className="ssp-intro-title-group">
                <span className="ssp-intro-eyebrow">OFFICIAL REGISTRATION</span>
                <h2 className="ssp-intro-title">Investor Mission 2026 Registration</h2>
              </div>
              <div className="ssp-intro-organizer-logos">
                <div className="ssp-intro-sio-wrap">
                  <img src={sioCoimbatoreLogo} alt="SIO Coimbatore Logo" className="ssp-intro-sio-logo" />
                </div>
                <img src={solidarityLogo} alt="Solidarity Youth Organisation – Tamil Nadu" className="ssp-intro-solidarity-logo" />
              </div>
            </div>
            <p className="ssp-intro-date">
              Sunday, 06 December 2026
            </p>
            <p className="ssp-intro-venue-address">
              <strong>Siruthuli Noyyal Life Centre</strong>
            </p>
            <div className="ssp-intro-venue-map">
              <a
                href="https://maps.app.goo.gl/4hwJsFTMujiSVDMEA"
                target="_blank"
                rel="noopener noreferrer"
                className="ssp-intro-map-link"
              >
                View Location on Google Maps ↗
              </a>
            </div>
            <p className="ssp-intro-guidance">
              Please provide accurate participant details to register for the Investor Mission 2026 gathering.
            </p>
          </div>

          {formError && (
            <div className="ssp-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {capacity.isSoldOut ? (
            <div className="ssp-soldout-card">
              <span className="ssp-soldout-badge">Capacity Reached</span>
              <h2>Registration Closed</h2>
              <p>
                This exclusive Investor Mission gathering is currently full and confirmed. We thank you for your overwhelming interest.
              </p>
              <Link to="/investor-mission" className="ssp-btn-secondary">
                Return to Investor Mission
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ssp-form" noValidate>
              {/* SECTION 1: PERSONAL INFORMATION */}
              <section className="ssp-section" aria-labelledby="section-personal-heading">
                <div className="ssp-section-heading">
                  <span className="ssp-section-badge">1</span>
                  <h3 id="section-personal-heading" className="ssp-section-title">
                    Personal Information
                  </h3>
                </div>

                <div className="ssp-grid-2">
                  {/* Full Name */}
                  <div className="ssp-form-group">
                    <label htmlFor="fullName" className="ssp-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Abdul Rahman"
                      className={`ssp-input ${errors.fullName ? 'has-error' : ''}`}
                      autoComplete="name"
                      aria-required="true"
                    />
                    {errors.fullName && (
                      <span className="ssp-field-error" role="alert">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="ssp-form-group">
                    <label htmlFor="email" className="ssp-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. abdul@example.com"
                      className={`ssp-input ${errors.email ? 'has-error' : ''}`}
                      autoComplete="email"
                      aria-required="true"
                    />
                    {errors.email && (
                      <span className="ssp-field-error" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="ssp-form-group ssp-grid-full">
                    <label htmlFor="mobileNumber" className="ssp-label">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <div className="ssp-phone-group">
                      <div className="ssp-country-badge" aria-label="Country Code India">
                        +91
                      </div>
                      <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData((prev) => ({ ...prev, mobileNumber: val }));
                          if (errors.mobileNumber) {
                            setErrors((prev) => ({ ...prev, mobileNumber: '' }));
                          }
                        }}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        className={`ssp-input ssp-phone-input ${errors.mobileNumber ? 'has-error' : ''}`}
                        autoComplete="tel-national"
                        aria-required="true"
                      />
                    </div>
                    {errors.mobileNumber && (
                      <span className="ssp-field-error" role="alert">
                        {errors.mobileNumber}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 2: LOCATION DETAILS */}
              <section className="ssp-section" aria-labelledby="section-location-heading">
                <div className="ssp-section-heading">
                  <span className="ssp-section-badge">2</span>
                  <h3 id="section-location-heading" className="ssp-section-title">
                    Location Details
                  </h3>
                </div>

                <div className="ssp-grid-2">
                  {/* State */}
                  <div className="ssp-form-group">
                    <label htmlFor="state" className="ssp-label">
                      State <span className="req">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`ssp-select ${errors.state ? 'has-error' : ''}`}
                      aria-required="true"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <span className="ssp-field-error" role="alert">
                        {errors.state}
                      </span>
                    )}
                  </div>

                  {/* District */}
                  <div className="ssp-form-group">
                    <label htmlFor="district" className="ssp-label">
                      District <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Chennai"
                      className={`ssp-input ${errors.district ? 'has-error' : ''}`}
                      aria-required="true"
                    />
                    {errors.district && (
                      <span className="ssp-field-error" role="alert">
                        {errors.district}
                      </span>
                    )}
                  </div>

                  {/* City / Town */}
                  <div className="ssp-form-group ssp-grid-full">
                    <label htmlFor="city" className="ssp-label">
                      City / Town <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Anna Nagar"
                      className={`ssp-input ${errors.city ? 'has-error' : ''}`}
                      aria-required="true"
                    />
                    {errors.city && (
                      <span className="ssp-field-error" role="alert">
                        {errors.city}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 3: PROFESSIONAL INFORMATION */}
              <section className="ssp-section" aria-labelledby="section-professional-heading">
                <div className="ssp-section-heading">
                  <span className="ssp-section-badge">3</span>
                  <h3 id="section-professional-heading" className="ssp-section-title">
                    Professional Information
                  </h3>
                </div>

                <div className="ssp-grid-2">
                  {/* Occupation */}
                  <div className="ssp-form-group">
                    <label htmlFor="occupation" className="ssp-label">
                      Occupation <span className="req">*</span>
                    </label>
                    <select
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className={`ssp-select ${errors.occupation ? 'has-error' : ''}`}
                      aria-required="true"
                    >
                      <option value="">Select your occupation</option>
                      {OCCUPATION_OPTIONS.map((occ) => (
                        <option key={occ} value={occ}>
                          {occ}
                        </option>
                      ))}
                    </select>
                    {errors.occupation && (
                      <span className="ssp-field-error" role="alert">
                        {errors.occupation}
                      </span>
                    )}
                  </div>

                  {/* Organisation / Company Name */}
                  <div className="ssp-form-group">
                    <label htmlFor="organization" className="ssp-label">
                      Organisation / Company Name <span className="opt">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="e.g. Crescent Financials"
                      className="ssp-input"
                    />
                  </div>

                  {/* Conditional Other Occupation Input */}
                  {formData.occupation === 'Other' && (
                    <div className="ssp-form-group ssp-grid-full">
                      <label htmlFor="otherOccupation" className="ssp-label">
                        Please specify your occupation <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="otherOccupation"
                        name="otherOccupation"
                        value={formData.otherOccupation}
                        onChange={handleChange}
                        placeholder="Enter your exact occupation or profession"
                        className={`ssp-input ${errors.otherOccupation ? 'has-error' : ''}`}
                        aria-required="true"
                      />
                      {errors.otherOccupation && (
                        <span className="ssp-field-error" role="alert">
                          {errors.otherOccupation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4: SESSION EXPECTATIONS */}
              <section className="ssp-section" aria-labelledby="section-expectations-heading">
                <div className="ssp-section-heading">
                  <span className="ssp-section-badge">4</span>
                  <h3 id="section-expectations-heading" className="ssp-section-title">
                    Session Expectations
                  </h3>
                </div>

                <div className="ssp-form-group">
                  <label htmlFor="sessionExpectations" className="ssp-label">
                    What do you expect in this session? <span className="req">*</span>
                  </label>
                  <textarea
                    id="sessionExpectations"
                    name="sessionExpectations"
                    rows={4}
                    maxLength={500}
                    value={formData.sessionExpectations}
                    onChange={handleChange}
                    placeholder="Tell us what you hope to learn from this session (minimum 10 characters)..."
                    className={`ssp-textarea ${errors.sessionExpectations ? 'has-error' : ''}`}
                    aria-required="true"
                  />
                  <div className="ssp-textarea-meta">
                    {errors.sessionExpectations ? (
                      <span className="ssp-field-error" role="alert">
                        {errors.sessionExpectations}
                      </span>
                    ) : (
                      <span className="ssp-field-hint">
                        Share your key learning objectives or questions for our speakers.
                      </span>
                    )}
                    <span className="ssp-char-counter">
                      {formData.sessionExpectations.length} / 500 characters (min. 10)
                    </span>
                  </div>
                </div>
              </section>

              {/* SECTION 5: CONSENT */}
              <section className="ssp-section" aria-labelledby="section-consent-heading">
                <div className="ssp-section-heading">
                  <span className="ssp-section-badge">5</span>
                  <h3 id="section-consent-heading" className="ssp-section-title">
                    Consent &amp; Acceptance
                  </h3>
                </div>

                <div className="ssp-consent-box">
                  <label className="ssp-checkbox-label">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="ssp-checkbox"
                      aria-required="true"
                    />
                    <span className="ssp-checkbox-text">
                      I agree to the{' '}
                      <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                        Terms &amp; Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </Link>
                      . I understand that my registration is subject to verification and approval.
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <span
                      className="ssp-field-error"
                      role="alert"
                      style={{ display: 'block', marginTop: '8px' }}
                    >
                      {errors.termsAccepted}
                    </span>
                  )}
                </div>
              </section>

              {/* PRIMARY BUTTON DESIGN: SUBMIT REGISTRATION */}
              <div className="ssp-actions">
                <button
                  type="submit"
                  disabled={isSubmitting || capacity.isSoldOut}
                  className="ssp-btn-submit"
                >
                  {isSubmitting ? (
                    'Submitting Registration...'
                  ) : capacity.isSoldOut ? (
                    'Investor Mission Registration Full'
                  ) : (
                    <span>SUBMIT REGISTRATION →</span>
                  )}
                </button>
              </div>

              <div className="ssp-trust-note">
                <ShieldCheck size={16} style={{ color: '#064B36' }} />
                <span>
                  Your personal details are encrypted and strictly used for Investor Mission 2026 coordination.
                </span>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
