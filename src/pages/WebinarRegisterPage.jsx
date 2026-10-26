import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Video, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-number-input/max';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import phoneMetadata from 'libphonenumber-js/metadata.max.json';
import 'react-phone-number-input/style.css';
import API_URL from '../config/api';
import './WebinarRegisterPage.css';

const initialForm = {
  fullName: '',
  email: '',
  whatsapp: '',
  country: 'India',
  state: '',
  city: '',
  ageGroup: '',
  otherAgeGroup: '',
  occupation: '',
  otherOccupation: '',
  financialInterests: [],
  otherFinancialInterest: '',
  webinarSource: '',
  otherWebinarSource: '',
  questionsOrTopics: '',
  consent: true,
};

const countryList = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
  'Malaysia',
  'Qatar',
  'United Kingdom',
  'United States',
  'Oman',
  'Kuwait',
  'Bahrain',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Canada',
  'Australia',
  'Indonesia',
  'South Africa',
  'Turkey',
  'Germany',
  'France',
  'New Zealand',
  'Egypt',
  'Jordan',
  'Brunei',
  'Maldives',
  'Other Country',
];

const countryToCode = {
  'India': 'IN',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Qatar': 'QA',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Oman': 'OM',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Canada': 'CA',
  'Australia': 'AU',
  'Indonesia': 'ID',
  'South Africa': 'ZA',
  'Turkey': 'TR',
  'Germany': 'DE',
  'France': 'FR',
  'New Zealand': 'NZ',
  'Egypt': 'EG',
  'Jordan': 'JO',
  'Brunei': 'BN',
  'Maldives': 'MV',
};

const ageGroupOptions = [
  'Under 18',
  '18–24',
  '25–34',
  '35–44',
  '45–54',
  '55 and above',
  'Other',
];

const occupationOptions = [
  'Student',
  'Salaried Employee',
  'Self-Employed',
  'Business Owner',
  'Entrepreneur / Startup Founder',
  'Homemaker',
  'Freelancer',
  'Investor',
  'Retired',
  'Unemployed / Job Seeker',
  'Other',
];

const financialTopics = [
  'Personal Financial Planning',
  'Halal Investments',
  'Savings and Wealth Management',
  'Business and Entrepreneurship',
  'Trade and Business Ethics',
  'Retirement Planning',
  'Generational Wealth Planning',
  'Islamic Finance Principles',
  'Learning the Basics of Finance',
  'Other',
];

const webinarSourceOptions = [
  'WhatsApp',
  'Friends or Family',
  'Social Media',
  'Email',
  'Website',
  'Other',
];

function getMaximumMobileLength(country) {
  const metadata = phoneMetadata.countries[country];
  const mobileLengths = metadata?.[11]?.[1]?.[1];
  const possibleLengths = Array.isArray(mobileLengths) && mobileLengths.length
    ? mobileLengths
    : metadata?.[3];
  return Array.isArray(possibleLengths) ? Math.max(...possibleLengths) : 15;
}

function getCountryName(country) {
  try {
    return country ? new Intl.DisplayNames(['en'], { type: 'region' }).of(country) : 'the selected country';
  } catch {
    return 'the selected country';
  }
}

export default function WebinarRegisterPage() {
  const navigate = useNavigate();
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('IN');

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_URL}/api/webinar/status`)
      .then((response) => {
        if (isMounted && typeof response.data?.closed === 'boolean') {
          setIsRegistrationClosed(response.data.closed);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (success) {
      document.title = 'Halal Wealth Webinar – Registration Confirmed';
      return;
    }
    document.title = isRegistrationClosed
      ? 'Registration Closed – Halal Wealth Webinar'
      : 'Register – Halal Wealth Webinar | November 1, 2026';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = isRegistrationClosed
      ? 'Registration for the Halal Wealth Webinar has now closed.'
      : 'Register for the live Halal Wealth Webinar on Sunday, November 1, 2026. Practical Shariah-compliant strategies for investments, financial planning, and generational wealth.';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, [isRegistrationClosed, success]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    updateField('country', selectedCountry);
    const code = countryToCode[selectedCountry];
    if (code && code !== phoneCountry) {
      setPhoneCountry(code);
      updateField('whatsapp', '');
    }
  };

  const handleAgeGroupChange = (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      ageGroup: value,
      ...(value !== 'Other' ? { otherAgeGroup: '' } : {}),
    }));
    setErrors((current) => ({
      ...current,
      ageGroup: undefined,
      ...(value !== 'Other' ? { otherAgeGroup: undefined } : {}),
    }));
  };

  const handleOccupationChange = (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      occupation: value,
      ...(value !== 'Other' ? { otherOccupation: '' } : {}),
    }));
    setErrors((current) => ({
      ...current,
      occupation: undefined,
      ...(value !== 'Other' ? { otherOccupation: undefined } : {}),
    }));
  };

  const handleSourceChange = (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      webinarSource: value,
      ...(value !== 'Other' ? { otherWebinarSource: '' } : {}),
    }));
    setErrors((current) => ({
      ...current,
      webinarSource: undefined,
      ...(value !== 'Other' ? { otherWebinarSource: undefined } : {}),
    }));
  };

  const toggleInterest = (topic) => {
    setForm((current) => {
      const isRemoving = current.financialInterests.includes(topic);
      const selected = isRemoving
        ? current.financialInterests.filter((item) => item !== topic)
        : [...current.financialInterests, topic];
      return {
        ...current,
        financialInterests: selected,
        ...(isRemoving && topic === 'Other' ? { otherFinancialInterest: '' } : {}),
      };
    });
    setErrors((current) => {
      const next = { ...current, financialInterests: undefined };
      if (topic === 'Other') next.otherFinancialInterest = undefined;
      return next;
    });
    setSubmitError('');
  };

  const validatePhoneNumber = (value) => {
    const submittedPhone = String(value || '').trim();
    if (!submittedPhone) return null;

    const parsedPhone = parsePhoneNumberFromString(submittedPhone, phoneCountry);
    if (!parsedPhone || !parsedPhone.isValid() || parsedPhone.country !== phoneCountry) return null;

    return parsedPhone;
  };

  const handlePhoneChange = (value) => {
    if (!value) {
      updateField('whatsapp', '');
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(value, phoneCountry);
    if (parsedPhone && parsedPhone.nationalNumber.length > getMaximumMobileLength(phoneCountry)) {
      const maximumLength = getMaximumMobileLength(phoneCountry);
      updateField('whatsapp', `+${parsedPhone.countryCallingCode}${parsedPhone.nationalNumber.slice(0, maximumLength)}`);
      return;
    }
    updateField('whatsapp', value);
  };

  const preventPhoneOverflowKeydown = (event) => {
    if (!/^\d$/.test(event.key) || event.currentTarget.selectionStart !== event.currentTarget.selectionEnd) return;
    const parsedPhone = parsePhoneNumberFromString(event.currentTarget.value, phoneCountry);
    if (parsedPhone && parsedPhone.nationalNumber.length >= getMaximumMobileLength(phoneCountry)) {
      event.preventDefault();
    }
  };

  const preventPhoneOverflowPaste = (event) => {
    const pastedValue = event.clipboardData.getData('text');
    const pastedDigits = pastedValue.replace(/\D/g, '');
    if (!pastedDigits) return;

    const parsedPhone = parsePhoneNumberFromString(event.currentTarget.value, phoneCountry);
    const currentLength = parsedPhone?.nationalNumber.length || 0;
    const selectedDigits = event.currentTarget.value
      .slice(event.currentTarget.selectionStart, event.currentTarget.selectionEnd)
      .replace(/\D/g, '').length;
    const remainingLength = Math.max(0, currentLength - Math.min(currentLength, selectedDigits));
    if (remainingLength + pastedDigits.length > getMaximumMobileLength(phoneCountry)) {
      event.preventDefault();
    }
  };

  const validate = () => {
    const nextErrors = {};

    // Full Name
    if (!String(form.fullName || '').trim() || String(form.fullName).trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }

    // Email
    if (!/^\S+@\S+\.\S+$/.test(String(form.email || '').trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    // Mobile / WhatsApp
    const submittedPhone = String(form.whatsapp || '').trim();
    const parsedPhone = validatePhoneNumber(submittedPhone);
    if (!submittedPhone) {
      nextErrors.whatsapp = 'Please enter your mobile number.';
    } else if (!parsedPhone) {
      nextErrors.whatsapp = `Please enter a valid mobile number for ${getCountryName(phoneCountry)}.`;
    }

    // Country
    if (!String(form.country || '').trim()) {
      nextErrors.country = 'Please select your country.';
    }

    // Age Group (optional dropdown, but conditional Other is required)
    if (form.ageGroup === 'Other' && !String(form.otherAgeGroup || '').trim()) {
      nextErrors.otherAgeGroup = 'Please specify your age group.';
    }

    // Occupation (required dropdown, and conditional Other is required)
    if (!String(form.occupation || '').trim()) {
      nextErrors.occupation = 'Please select your occupation.';
    } else if (form.occupation === 'Other' && !String(form.otherOccupation || '').trim()) {
      nextErrors.otherOccupation = 'Please specify your occupation.';
    }

    // Financial Interests (multi-select, at least one required)
    if (!Array.isArray(form.financialInterests) || form.financialInterests.length < 1) {
      nextErrors.financialInterests = 'Please select at least one topic of interest.';
    } else if (form.financialInterests.includes('Other') && !String(form.otherFinancialInterest || '').trim()) {
      nextErrors.otherFinancialInterest = 'Please specify your financial topic of interest.';
    }

    // Webinar Source (optional dropdown, but conditional Other is required)
    if (form.webinarSource === 'Other' && !String(form.otherWebinarSource || '').trim()) {
      nextErrors.otherWebinarSource = 'Please specify how you heard about this webinar.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isRegistrationClosed) return;
    if (!validate()) {
      const firstError = document.querySelector('.field-error, [aria-invalid="true"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitState('loading');
    setSubmitError('');

    try {
      const parsedPhone = validatePhoneNumber(form.whatsapp);
      const normalizedPhone = parsedPhone?.number || form.whatsapp;

      const occupation = form.occupation === 'Other'
        ? String(form.otherOccupation || '').trim()
        : String(form.occupation || '').trim();

      const city = String(form.city || '').trim();
      const state = String(form.state || '').trim();
      const country = String(form.country || '').trim();
      const location = [city, state, country].filter(Boolean).join(', ');
      const questionsOrTopics = String(form.questionsOrTopics || '').trim();
      const otherInterest = String(form.otherFinancialInterest || '').trim();

      const payload = {
        fullName: String(form.fullName).trim(),
        email: String(form.email).trim().toLowerCase(),
        whatsapp: normalizedPhone,
        phoneCountry,
        country,
        state,
        city,
        location,
        ageGroup: String(form.ageGroup || '').trim(),
        otherAgeGroup: form.ageGroup === 'Other' ? String(form.otherAgeGroup || '').trim() : '',
        occupation,
        otherOccupation: form.occupation === 'Other' ? String(form.otherOccupation || '').trim() : '',
        designation: occupation,
        industry: '',
        companyName: '',
        businessWebsite: '',
        financialInterests: form.financialInterests,
        otherFinancialInterest: otherInterest,
        webinarSource: String(form.webinarSource || 'Website').trim(),
        otherWebinarSource: form.webinarSource === 'Other' ? String(form.otherWebinarSource || '').trim() : '',
        questionsOrTopics,
        additionalInfo: questionsOrTopics,
        financialChallenge: questionsOrTopics,
        webinarId: 'halal-wealth-nov-2026',
        webinarVersion: 'November 1, 2026 Webinar',
        consent: Boolean(form.consent),
      };

      await axios.post(`${API_URL}/api/webinar/register`, payload);
      setSuccess(true);
      setSubmitState('idle');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const message = error.response?.data?.message || 'We could not complete your registration right now. Please try again.';
      setSubmitError(message);
      setSubmitState('idle');
    }
  };

  if (isRegistrationClosed) {
    return (
      <div className="webinar-page-wrapper">
        <main className="webinar-form-section">
          <div className="webinar-form-container">
            <section className="webinar-closed-card" aria-live="polite">
              <div className="closed-icon-badge" aria-hidden="true">
                <AlertCircle size={32} />
              </div>
              <span className="webinar-badge">REGISTRATION CLOSED</span>
              <h1 className="webinar-closed-title">Registration Closed</h1>
              <p className="webinar-closed-subtitle">
                Thank you for your interest in the Halal Wealth Webinar: <strong>&ldquo;Halal Trade, Investments &amp; Generational Wealth&rdquo;</strong>.
              </p>
              <p className="webinar-closed-detail">
                Registration for this webinar has now closed. We appreciate your interest and support.
                Follow our community updates for announcements on future webinars and masterclasses.
              </p>
              <button type="button" className="btn-primary" onClick={() => navigate('/')}>
                Return to Home
              </button>
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="webinar-page-wrapper">
        <main className="webinar-form-section">
          <div className="webinar-form-container">
            <section className="webinar-card webinar-success-card" aria-live="polite">
              <div className="success-icon-badge" aria-hidden="true">
                <CheckCircle2 size={40} />
              </div>
              <span className="webinar-badge">REGISTRATION CONFIRMED</span>
              <h1 className="webinar-card-title">You&rsquo;re Registered!</h1>
              <p className="webinar-success-message">
                Thank you for registering for the <strong>Halal Wealth Webinar</strong>. We are thrilled to welcome you to this session.
              </p>

              <div className="webinar-event-summary">
                <div className="summary-item">
                  <span className="summary-label">TOPIC</span>
                  <span className="summary-value">Halal Trade, Investments &amp; Generational Wealth</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">DATE</span>
                  <span className="summary-value">Sunday, November 1, 2026</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">TIME</span>
                  <span className="summary-value">🇮🇳 India: 11:00 AM • 🇸🇬 Singapore: 1:30 PM • 🇦🇪 UAE: 9:30 AM • 🇸🇦 Saudi Arabia: 8:30 AM</span>
                </div>
              </div>

              <div className="webinar-next-steps">
                <h2 className="next-steps-heading">What Happens Next?</h2>
                <ul className="next-steps-list">
                  <li>Check your inbox for a registration confirmation email.</li>
                  <li>Your Zoom webinar joining details will be delivered to your registered email and WhatsApp.</li>
                  <li>Have a notebook or questions ready for the live interactive Q&amp;A session.</li>
                </ul>
              </div>

              <button type="button" className="btn-primary" onClick={() => navigate('/')}>
                <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Return to Home
              </button>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="webinar-page-wrapper">
      {/* Top Hero / Banner Section */}
      <header className="webinar-hero-banner" role="banner">
        <div className="webinar-hero-container">
          <div className="webinar-hero-grid">
            
            {/* Left Column: Live Badge and Main Title */}
            <div className="webinar-hero-col webinar-hero-col--left">
              <div className="webinar-hero-badge" aria-label="Webinar status: Live interactive webinar">
                <span className="live-dot" aria-hidden="true" />
                <span>LIVE INTERACTIVE WEBINAR</span>
              </div>
              <h1 className="webinar-hero-title">Halal Wealth Webinar</h1>
            </div>

            {/* Center Column: Webinar Topic and Description */}
            <div className="webinar-hero-col webinar-hero-col--center">
              <h2 className="webinar-hero-topic">Halal Investment &amp; Retirement Planning</h2>
              <p className="webinar-hero-description">
                Join our live webinar to learn about credible Shariah-compliant investment options, wealth-building strategies, and retirement planning. Open to professionals, business owners, homemakers, and investors seeking ethical financial growth.
              </p>
            </div>

            {/* Right Column: Information Cards Stack (Date, Time, Platform) */}
            <div className="webinar-hero-col webinar-hero-col--right">
              <div className="webinar-info-cards-stack">
                
                {/* Date Card */}
                <div className="webinar-info-card">
                  <div className="info-card-icon" aria-hidden="true">
                    <Calendar size={18} />
                  </div>
                  <div className="info-card-body">
                    <span className="info-card-label">DATE</span>
                    <strong className="info-card-value">Sunday, November 1, 2026</strong>
                  </div>
                </div>

                {/* Time Card */}
                <div className="webinar-info-card info-card--time">
                  <div className="info-card-icon" aria-hidden="true">
                    <Clock size={18} />
                  </div>
                  <div className="info-card-body">
                    <span className="info-card-label">TIME</span>
                    <div className="time-zones-list">
                      <div className="time-zone-row">
                        <span className="time-country">
                          <span className="tz-flag" role="img" aria-label="India">🇮🇳</span>
                          India:
                        </span>
                        <strong className="time-val">11:00 AM</strong>
                      </div>
                      <div className="time-zone-row">
                        <span className="time-country">
                          <span className="tz-flag" role="img" aria-label="Singapore">🇸🇬</span>
                          Singapore:
                        </span>
                        <strong className="time-val">1:30 PM</strong>
                      </div>
                      <div className="time-zone-row">
                        <span className="time-country">
                          <span className="tz-flag" role="img" aria-label="UAE">🇦🇪</span>
                          UAE:
                        </span>
                        <strong className="time-val">9:30 AM</strong>
                      </div>
                      <div className="time-zone-row">
                        <span className="time-country">
                          <span className="tz-flag" role="img" aria-label="Saudi Arabia">🇸🇦</span>
                          Saudi Arabia:
                        </span>
                        <strong className="time-val">8:30 AM</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Card */}
                <div className="webinar-info-card">
                  <div className="info-card-icon" aria-hidden="true">
                    <Video size={18} />
                  </div>
                  <div className="info-card-body">
                    <span className="info-card-label">PLATFORM</span>
                    <strong className="info-card-value">Online via Zoom</strong>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Registration Form Section */}
      <main className="webinar-form-section">
        <div className="webinar-form-container">
          <section className="webinar-card" aria-label="Webinar registration form card">
            <form className="webinar-form" onSubmit={handleSubmit} noValidate>
              
              {/* Section 1: Personal Information */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <span className="legend-number">1</span>
                  Personal Information
                </legend>

                <div className="form-grid">
                  <label className="field-group">
                    <span className="field-label">Full Name <span className="req">*</span></span>
                    <input
                      type="text"
                      className={`form-input ${errors.fullName ? 'field-error' : ''}`}
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
                  </label>

                  <label className="field-group">
                    <span className="field-label">Email Address <span className="req">*</span></span>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'field-error' : ''}`}
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <span className="field-error-text">{errors.email}</span>}
                  </label>

                  <label className="field-group field-span-2">
                    <span className="field-label">Mobile Number <span className="req">*</span></span>
                    <PhoneInput
                      className={`phone-input-wrap ${errors.whatsapp ? 'field-error' : ''}`}
                      international
                      withCountryCallingCode
                      defaultCountry={phoneCountry}
                      countrySelectProps={{ 'aria-label': 'Select mobile country code' }}
                      countryCallingCodeEditable={false}
                      value={form.whatsapp}
                      onChange={handlePhoneChange}
                      onKeyDown={preventPhoneOverflowKeydown}
                      onPaste={preventPhoneOverflowPaste}
                      onCountryChange={(country) => {
                        const nextCountry = country || 'IN';
                        setPhoneCountry(nextCountry);
                        updateField('whatsapp', '');
                        const mappedName = getCountryName(nextCountry);
                        if (mappedName && countryList.includes(mappedName)) {
                          updateField('country', mappedName);
                        }
                      }}
                      placeholder="Enter mobile number"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.whatsapp)}
                    />
                    {errors.whatsapp && <span className="field-error-text">{errors.whatsapp}</span>}
                  </label>

                  <label className="field-group">
                    <span className="field-label">Country <span className="req">*</span></span>
                    <select
                      className={`form-select ${errors.country ? 'field-error' : ''}`}
                      value={form.country}
                      onChange={handleCountryChange}
                      aria-invalid={Boolean(errors.country)}
                    >
                      <option value="">Select your country</option>
                      {countryList.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && <span className="field-error-text">{errors.country}</span>}
                  </label>

                  <label className="field-group">
                    <span className="field-label">State / Region <span className="opt">(Optional)</span></span>
                    <input
                      type="text"
                      className="form-input"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="State or Region"
                      autoComplete="address-level1"
                    />
                  </label>

                  <label className="field-group">
                    <span className="field-label">City <span className="opt">(Optional)</span></span>
                    <input
                      type="text"
                      className="form-input"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                      autoComplete="address-level2"
                    />
                  </label>

                  <div className="field-group">
                    <label className="field-label" htmlFor="age-group-select">Age Group <span className="opt">(Optional)</span></label>
                    <select
                      id="age-group-select"
                      className={`form-select ${errors.ageGroup ? 'field-error' : ''}`}
                      value={form.ageGroup}
                      onChange={handleAgeGroupChange}
                    >
                      <option value="">Select your age group</option>
                      {ageGroupOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {form.ageGroup === 'Other' && (
                    <div className="field-group field-span-2 conditional-box">
                      <label className="field-label" htmlFor="other-age-input">
                        Please specify your age group <span className="req">*</span>
                      </label>
                      <input
                        id="other-age-input"
                        type="text"
                        className={`form-input ${errors.otherAgeGroup ? 'field-error' : ''}`}
                        value={form.otherAgeGroup}
                        onChange={(e) => updateField('otherAgeGroup', e.target.value)}
                        placeholder="Please specify your age group"
                        aria-invalid={Boolean(errors.otherAgeGroup)}
                      />
                      {errors.otherAgeGroup && <span className="field-error-text">{errors.otherAgeGroup}</span>}
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Section 2: Occupation */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <span className="legend-number">2</span>
                  Occupation
                </legend>

                <div className="form-grid">
                  <div className="field-group field-span-2">
                    <label className="field-label" htmlFor="occupation-select">
                      Occupation <span className="req">*</span>
                    </label>
                    <select
                      id="occupation-select"
                      className={`form-select ${errors.occupation ? 'field-error' : ''}`}
                      value={form.occupation}
                      onChange={handleOccupationChange}
                      aria-invalid={Boolean(errors.occupation)}
                    >
                      <option value="">Select your occupation</option>
                      {occupationOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.occupation && <span className="field-error-text">{errors.occupation}</span>}
                  </div>

                  {form.occupation === 'Other' && (
                    <div className="field-group field-span-2 conditional-box">
                      <label className="field-label" htmlFor="other-occupation-input">
                        Please specify your occupation <span className="req">*</span>
                      </label>
                      <input
                        id="other-occupation-input"
                        type="text"
                        className={`form-input ${errors.otherOccupation ? 'field-error' : ''}`}
                        value={form.otherOccupation}
                        onChange={(e) => updateField('otherOccupation', e.target.value)}
                        placeholder="Please specify your occupation"
                        aria-invalid={Boolean(errors.otherOccupation)}
                      />
                      {errors.otherOccupation && <span className="field-error-text">{errors.otherOccupation}</span>}
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Section 3: Financial Topics of Interest */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <span className="legend-number">3</span>
                  Financial Topics of Interest <span className="req">*</span>
                </legend>
                <p className="section-hint">Select all topics you are interested in exploring during this webinar:</p>

                <div className="checkbox-grid">
                  {financialTopics.map((topic) => {
                    const isChecked = form.financialInterests.includes(topic);
                    return (
                      <label
                        key={topic}
                        className={`checkbox-pill ${isChecked ? 'checkbox-pill--selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInterest(topic)}
                        />
                        <span className="checkbox-custom" aria-hidden="true" />
                        <span className="checkbox-text">{topic}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.financialInterests && <span className="field-error-text" style={{ marginTop: '8px', display: 'block' }}>{errors.financialInterests}</span>}

                {form.financialInterests.includes('Other') && (
                  <div className="conditional-box" style={{ marginTop: '14px' }}>
                    <label className="field-label" htmlFor="other-interest-input">
                      Please specify your financial topic of interest <span className="req">*</span>
                    </label>
                    <input
                      id="other-interest-input"
                      type="text"
                      className={`form-input ${errors.otherFinancialInterest ? 'field-error' : ''}`}
                      value={form.otherFinancialInterest}
                      onChange={(e) => updateField('otherFinancialInterest', e.target.value)}
                      placeholder="Please specify your topic of interest"
                      aria-invalid={Boolean(errors.otherFinancialInterest)}
                    />
                    {errors.otherFinancialInterest && <span className="field-error-text">{errors.otherFinancialInterest}</span>}
                  </div>
                )}
              </fieldset>

              {/* Section 4: Additional Information */}
              <fieldset className="form-section">
                <legend className="section-legend">
                  <span className="legend-number">4</span>
                  Additional Information
                </legend>

                <div className="form-grid">
                  <div className="field-group field-span-2">
                    <label className="field-label" htmlFor="source-select">
                      How did you hear about this webinar? <span className="opt">(Optional)</span>
                    </label>
                    <select
                      id="source-select"
                      className={`form-select ${errors.webinarSource ? 'field-error' : ''}`}
                      value={form.webinarSource}
                      onChange={handleSourceChange}
                    >
                      <option value="">Select an option</option>
                      {webinarSourceOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {form.webinarSource === 'Other' && (
                    <div className="field-group field-span-2 conditional-box">
                      <label className="field-label" htmlFor="other-source-input">
                        Please specify how you heard about us <span className="req">*</span>
                      </label>
                      <input
                        id="other-source-input"
                        type="text"
                        className={`form-input ${errors.otherWebinarSource ? 'field-error' : ''}`}
                        value={form.otherWebinarSource}
                        onChange={(e) => updateField('otherWebinarSource', e.target.value)}
                        placeholder="Please specify how you heard about this webinar"
                        aria-invalid={Boolean(errors.otherWebinarSource)}
                      />
                      {errors.otherWebinarSource && <span className="field-error-text">{errors.otherWebinarSource}</span>}
                    </div>
                  )}

                  <div className="field-group field-span-2">
                    <label className="field-label" htmlFor="questions-input">
                      Questions or Topics You Would Like Us to Cover <span className="opt">(Optional)</span>
                    </label>
                    <textarea
                      id="questions-input"
                      className="form-textarea"
                      rows={3}
                      value={form.questionsOrTopics}
                      onChange={(e) => updateField('questionsOrTopics', e.target.value)}
                      placeholder="Any specific questions or topics you'd like our speakers to address..."
                    />
                  </div>
                </div>
              </fieldset>

              {/* Error banner */}
              {submitError && (
                <div className="submit-error-banner" role="alert">
                  <AlertCircle size={20} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Privacy notice & Consent */}
              <div className="form-footer-consent">
                <label className="consent-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => updateField('consent', e.target.checked)}
                  />
                  <span className="consent-text">
                    I agree to receive the webinar joining link, event reminders, and relevant Halal Wealth updates via email and WhatsApp.
                  </span>
                </label>

                <div className="privacy-note">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>
                    We respect your privacy. Your information will only be used for webinar access, reminders, and relevant Halal Wealth updates.
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <div className="form-submit-row">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitState === 'loading'}
                >
                  {submitState === 'loading' ? (
                    <span className="submit-spinner-text">Registering…</span>
                  ) : (
                    'Register for the Webinar'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
