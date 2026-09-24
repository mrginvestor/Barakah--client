import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';

const initialForm = {
  fullName: '',
  whatsapp: '',
  email: '',
  location: '',
  designation: '',
  industry: '',
  financialInterests: [],
  otherFinancialInterest: '',
  financialChallenge: '',
  webinarSource: '',
  consent: false,
};

const businessRoles = [
  'Founder / Owner',
  'Co-Founder',
  'Managing Director / CEO',
  'Director',
  'Partner',
  'Finance Head / CFO',
  'Manager',
];

const businessTypes = [
  'Manufacturing',
  'Trading',
  'Retail',
  'Wholesale',
  'E-commerce',
  'Service Business',
  'Professional Services',
  'Startup',
  'Education',
  'Technology / IT',
  'Real Estate',
  'Healthcare',
  'Food & Hospitality',
];

const financialTopics = ['Financial Planning', 'Loans and Financing', 'Investments and Wealth Management', 'Business Ethics', 'Others'];
const referralSources = ['WhatsApp', 'Instagram', 'Facebook', 'YouTube', 'Friend / Colleague', 'Website', 'Other'];
const benefitItems = [
  'Practical Financial Insights',
  'Smarter Business Decisions',
  'Business Growth Strategies',
  'Sustainable Wealth Planning',
];

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
}

function WebinarRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Business Finance Webinar Registration | Halal Wealth Finance';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Register for the Business Finance Webinar by Halal Wealth Finance and gain practical insights into business finance, cash flow, funding, planning, and growth.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Register for the Business Finance Webinar by Halal Wealth Finance and gain practical insights into business finance, cash flow, funding, planning, and growth.';
      document.head.appendChild(meta);
    }
  }, []);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      return next;
    });
    setErrors((current) => {
      const nextErrors = { ...current, [field]: undefined };
      return nextErrors;
    });
    setSubmitError('');
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
        ...(isRemoving && topic === 'Others' ? { otherFinancialInterest: '' } : {}),
      };
    });
    setErrors((current) => {
      const next = { ...current, financialInterests: undefined };
      if (topic === 'Others') next.otherFinancialInterest = undefined;
      return next;
    });
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.fullName || '').trim() || String(form.fullName).trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }

    const normalizedPhone = String(form.whatsapp || '').trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      nextErrors.whatsapp = 'Please enter a valid 10-digit mobile number.';
    }

    if (!/^\S+@\S+\.\S+$/.test(String(form.email || '').trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!String(form.designation || '').trim()) nextErrors.designation = 'Please select your designation or occupation.';
    if (!String(form.industry || '').trim()) nextErrors.industry = 'Please select your industry.';

    if (!Array.isArray(form.financialInterests) || form.financialInterests.length < 1) {
      nextErrors.financialInterests = 'Please select at least one topic.';
    } else if (form.financialInterests.includes('Others') && !String(form.otherFinancialInterest || '').trim()) {
      nextErrors.otherFinancialInterest = 'Please specify your financial interest.';
    }

    if (!String(form.webinarSource || '').trim()) {
      nextErrors.webinarSource = 'Please tell us how you heard about this webinar.';
    }

    if (!form.consent) {
      nextErrors.consent = 'Please agree to be contacted about this webinar and related programs.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitState('loading');
    setSubmitError('');

    try {
      const finalInterests = form.financialInterests.filter(Boolean);
      const cleanPhone = String(form.whatsapp || '').replace(/\D/g, '');
      const normalizedPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91')
        ? cleanPhone.slice(2)
        : (cleanPhone.length === 11 && cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone.slice(-10));

      const locParts = (form.location || '').split(',').map((s) => s.trim());
      const city = locParts[0] || 'Not Specified';
      const state = locParts[1] || '';
      const country = locParts[2] || (locParts.length === 2 ? locParts[1] : 'India');

      const businessName = form.fullName ? `${form.fullName}'s Business` : 'Business';
      const businessRole = form.designation || 'Founder / Owner';
      const businessType = form.industry || 'Technology / IT';
      const referralSource = form.webinarSource || 'Website';
      const otherInterest = String(form.otherFinancialInterest || '').trim();

      const payload = {
        fullName: String(form.fullName).trim(),
        location: String(form.location || '').trim(),
        whatsapp: normalizedPhone,
        phone: normalizedPhone,
        email: String(form.email).trim().toLowerCase(),
        designation: String(form.designation).trim(),
        industry: String(form.industry).trim(),
        financialInterests: finalInterests,
        otherFinancialInterest: otherInterest,
        financialInterestsOther: otherInterest,
        financialChallenge: String(form.financialChallenge || '').trim(),
        webinarSource: String(form.webinarSource).trim(),
        referralSource,
        consent: form.consent,
        city,
        state,
        country,
        businessName,
        businessWebsite: 'https://www.halalwealth.finance',
        businessRole,
        businessType,
        businessAge: 'Not Specified',
        employeeCount: 'Not Specified',
        annualTurnover: '',
      };

      await axios.post(`${API_URL}/api/webinar/register`, payload);
      setSuccess(true);
      setSubmitState('idle');
    } catch (error) {
      const message = error.response?.data?.message || 'We could not complete your registration right now. Please try again.';
      setSubmitError(message);
      setSubmitState('idle');
    }
  };

  if (success) {
    return (
      <main className="webinar-page">
        <section className="webinar-success-panel" aria-live="polite">
          <div className="success-badge">✓</div>
          <p className="eyebrow eyebrow--light">Business Finance Webinar</p>
          <h1>Registration Successful!</h1>
          <p>Thank you for registering for our Business Finance Webinar. We have received your registration details successfully.</p>
          <button type="button" className="gold-button webinar-success-button" onClick={() => navigate('/')}>
            Back to Website
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="webinar-page">
      <div className="webinar-shell" aria-label="Business Finance Webinar registration form">
        <aside className="webinar-aside">
          <div className="promo-badge">Business Finance Webinar</div>
          <h1 className="webinar-sidebar-title">Halal Trade, Investments &amp; Generational Wealth</h1>
          <p className="promo-copy webinar-sidebar-description">
            A truly successful Muslim enterprise is one that not only generates profit today but secures a legacy of Barakah for generations to come through honest dealings, trade ethics, and productive growth.
            <br /><br />
            The webinar also addresses the critical second half of wealth management: once profit is earned, where should it go? Learn how to structure financial planning, purify earnings, and navigate productive Halal investment avenues designed for business owners, corporate leaders, and startup founders.
          </p>

          <ul className="benefit-list">
            {benefitItems.map((item) => (
              <li key={item}>
                <span className="benefit-icon">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <blockquote className="promo-quote">
            “Better Financial Decisions for a Brighter Tomorrow”
          </blockquote>
        </aside>

        <section className="webinar-form-panel">
          <div className="form-panel-header">
            <div>
              <p className="eyebrow eyebrow--panel">Registration Form</p>
              <h2>Business Finance Webinar</h2>
            </div>
            <span className="panel-tag">04 Oct 2026<span>•</span>Online Webinar</span>
          </div>

          <p className="panel-description">
            Join our exclusive business finance webinar designed for business owners, entrepreneurs, and professionals. Gain practical insights into business finance, financial planning, cash flow, funding, investment, and business growth.
          </p>

          <form className="webinar-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">1</span>
                <h3>Personal Information</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field">
                  <span>Full Name *</span>
                  <input
                    type="text"
                    className={errors.fullName ? 'field-error' : ''}
                    value={form.fullName}
                    onChange={(event) => updateField('fullName', event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && <small className="error-text">{errors.fullName}</small>}
                </label>

                <label className="field">
                  <span>WhatsApp / Mobile Number *</span>
                  <input
                    type="tel"
                    className={errors.whatsapp ? 'field-error' : ''}
                    value={form.whatsapp}
                    onChange={(event) => updateField('whatsapp', normalizePhone(event.target.value))}
                    placeholder="9876543210"
                    inputMode="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.whatsapp)}
                  />
                  {errors.whatsapp && <small className="error-text">{errors.whatsapp}</small>}
                </label>

                <label className="field">
                  <span>Email Address *</span>
                  <input
                    type="email"
                    className={errors.email ? 'field-error' : ''}
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <small className="error-text">{errors.email}</small>}
                </label>

                <label className="field">
                  <span>Location</span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    placeholder="City, State, Country"
                    autoComplete="street-address"
                  />
                </label>

              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">2</span>
                <h3>Business Information</h3>
              </div>

              <div className="fields-grid two-col">
                <div className="field">
                  <span>Designation / Occupation *</span>
                  <select
                    className={errors.designation ? 'field-error' : ''}
                    value={form.designation}
                    onChange={(event) => updateField('designation', event.target.value)}
                    aria-invalid={Boolean(errors.designation)}
                  >
                    <option value="">Select role</option>
                    {businessRoles.map((role) => (
                      <option value={role} key={role}>{role}</option>
                    ))}
                  </select>
                  {errors.designation && <small className="error-text">{errors.designation}</small>}
                </div>

                <div className="field">
                  <span>Industry *</span>
                  <select
                    className={errors.industry ? 'field-error' : ''}
                    value={form.industry}
                    onChange={(event) => updateField('industry', event.target.value)}
                    aria-invalid={Boolean(errors.industry)}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option value={type} key={type}>{type}</option>
                    ))}
                  </select>
                  {errors.industry && <small className="error-text">{errors.industry}</small>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">3</span>
                <h3>Financial Interests</h3>
              </div>

              <fieldset className="checkbox-fieldset">
                <legend>Which financial topics are you interested in? *</legend>
                <div className="checkbox-grid">
                  {financialTopics.map((topic) => (
                    <label key={topic} className={`checkbox-item ${form.financialInterests.includes(topic) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.financialInterests.includes(topic)}
                        onChange={() => toggleInterest(topic)}
                      />
                      <span>{topic}</span>
                    </label>
                  ))}
                </div>
                {errors.financialInterests && <small className="error-text">{errors.financialInterests}</small>}

                {form.financialInterests.includes('Others') && (
                  <div className="other-specify-wrap other-specify-wrap--checkbox">
                    <span className="other-specify-label">Please specify your financial interest *</span>
                    <input
                      type="text"
                      className={errors.otherFinancialInterest ? 'field-error' : ''}
                      value={form.otherFinancialInterest}
                      onChange={(event) => updateField('otherFinancialInterest', event.target.value)}
                      placeholder="Please enter your financial interest"
                      aria-invalid={Boolean(errors.otherFinancialInterest)}
                      autoFocus
                    />
                    {errors.otherFinancialInterest && <small className="error-text">{errors.otherFinancialInterest}</small>}
                  </div>
                )}

              </fieldset>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">4</span>
                <h3>Additional Information</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field full-width">
                  <span>What is the biggest financial challenge you are currently facing?</span>
                  <textarea
                    value={form.financialChallenge}
                    onChange={(event) => updateField('financialChallenge', event.target.value)}
                    placeholder="Briefly describe the main challenge your business is facing."
                    rows="4"
                  />
                </label>

              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">5</span>
                <h3>Webinar Source</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field full-width">
                  <span>How did you hear about this webinar? *</span>
                  <select
                    className={errors.webinarSource ? 'field-error' : ''}
                    value={form.webinarSource}
                    onChange={(event) => updateField('webinarSource', event.target.value)}
                    aria-invalid={Boolean(errors.webinarSource)}
                  >
                    <option value="">Select</option>
                    {referralSources.map((source) => (
                      <option value={source} key={source}>{source}</option>
                    ))}
                  </select>
                  {errors.webinarSource && <small className="error-text">{errors.webinarSource}</small>}
                </label>
              </div>
            </div>

            <div className="form-section consent-section">
              <div className="section-title">
                <span className="section-number">6</span>
                <h3>Consent</h3>
              </div>

              <label className={`consent-box ${form.consent ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => updateField('consent', event.target.checked)}
                />
                <span>
                  I confirm that the information provided above is accurate and agree to be contacted regarding this webinar and related business/finance programs.
                </span>
              </label>
              {errors.consent && <small className="error-text">{errors.consent}</small>}
            </div>

            {submitError && <div className="webinar-error-box" role="alert">{submitError}</div>}

            <div className="submit-wrap">
              <button type="submit" className="gold-button webinar-submit" disabled={submitState === 'loading'}>
                {submitState === 'loading' ? <><span className="spinner" aria-hidden="true" /> Submitting...</> : 'Register for Webinar'}
              </button>
            </div>

            <div className="secure-note">
              <span>🔒</span>
              <span>Your information is secure and will only be used for webinar-related communication.</span>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default WebinarRegisterPage;
