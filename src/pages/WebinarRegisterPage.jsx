import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  businessName: '',
  businessWebsite: '',
  businessRole: '',
  businessType: '',
  businessAge: '',
  employeeCount: '',
  annualTurnover: '',
  financialInterests: [],
  financialChallenge: '',
  referralSource: '',
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
  'Other',
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
  'Other',
];

const businessAges = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', 'More than 10 years'];
const employeeCounts = ['1–5', '6–10', '11–25', '26–50', '51–100', '100+'];
const turnoverOptions = ['Below ₹25 Lakhs', '₹25 Lakhs – ₹1 Crore', '₹1 – ₹5 Crores', '₹5 – ₹10 Crores', '₹10 – ₹50 Crores', 'Above ₹50 Crores', 'Prefer not to disclose'];
const financialTopics = ['Business Financial Planning', 'Cash Flow Management', 'Working Capital Management', 'Business Loans & Financing', 'Investment Planning', 'Tax Planning', 'Profitability Improvement', 'Financial Risk Management', 'Business Valuation', 'Wealth Management for Business Owners', 'Investment Opportunities', 'Business Expansion & Funding', 'Other'];
const referralSources = ['WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'Friend / Business Network', 'Email', 'Website', 'Other'];
const benefitItems = [
  'Practical Financial Insights',
  'Smarter Business Decisions',
  'Business Growth Strategies',
  'Sustainable Wealth Planning',
];

function normalizeWebsite(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (!/\s/.test(trimmed) && !trimmed.includes('://')) return `https://${trimmed}`;
  return trimmed;
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
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const toggleInterest = (topic) => {
    setForm((current) => {
      const selected = current.financialInterests.includes(topic)
        ? current.financialInterests.filter((item) => item !== topic)
        : [...current.financialInterests, topic];
      return { ...current, financialInterests: selected };
    });
    setErrors((current) => ({ ...current, financialInterests: undefined }));
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.fullName || '').trim() || String(form.fullName).trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }

    const normalizedPhone = String(form.phone || '').replace(/\s+/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Please enter a valid mobile number with country code.';
    }

    if (!/^\S+@\S+\.\S+$/.test(String(form.email || '').trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!String(form.city || '').trim()) {
      nextErrors.city = 'Please enter your city or location.';
    }

    if (!String(form.businessName || '').trim()) {
      nextErrors.businessName = 'Please enter your business name.';
    }

    const normalizedWebsite = normalizeWebsite(form.businessWebsite);
    if (!normalizedWebsite) {
      nextErrors.businessWebsite = 'Please enter your business website.';
    } else {
      try {
        const website = new URL(normalizedWebsite);
        if (!['http:', 'https:'].includes(website.protocol) || !website.hostname) {
          throw new Error('invalid');
        }
      } catch {
        nextErrors.businessWebsite = 'Please enter a valid business website URL.';
      }
    }

    if (!String(form.businessRole || '').trim()) {
      nextErrors.businessRole = 'Please select your role.';
    }

    if (!String(form.businessType || '').trim()) {
      nextErrors.businessType = 'Please select your business type.';
    }

    if (!String(form.businessAge || '').trim()) {
      nextErrors.businessAge = 'Please tell us how long your business has been operating.';
    }

    if (!String(form.employeeCount || '').trim()) {
      nextErrors.employeeCount = 'Please select the number of employees.';
    }

    if (!Array.isArray(form.financialInterests) || form.financialInterests.length < 1) {
      nextErrors.financialInterests = 'Please select at least one topic.';
    }

    if (!String(form.referralSource || '').trim()) {
      nextErrors.referralSource = 'Please tell us how you heard about this webinar.';
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
      const payload = {
        ...form,
        phone: String(form.phone).trim(),
        email: String(form.email).trim().toLowerCase(),
        businessWebsite: normalizeWebsite(form.businessWebsite),
        financialInterests: form.financialInterests,
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
          <h1>
            Grow<br />
            Stronger<br />
            Build<br />
            Smarter
          </h1>
          <p className="promo-copy">Practical financial insights for business owners, entrepreneurs, and professionals.</p>

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
            <span className="panel-tag">NOV 2024<span>•</span>Online Webinar</span>
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
                    className={errors.phone ? 'field-error' : ''}
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+91 98765 43210"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <small className="error-text">{errors.phone}</small>}
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
                  <span>City / Location *</span>
                  <input
                    type="text"
                    className={errors.city ? 'field-error' : ''}
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    placeholder="Enter your city or location"
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city && <small className="error-text">{errors.city}</small>}
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">2</span>
                <h3>Business Information</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field">
                  <span>Business / Company Name *</span>
                  <input
                    type="text"
                    className={errors.businessName ? 'field-error' : ''}
                    value={form.businessName}
                    onChange={(event) => updateField('businessName', event.target.value)}
                    placeholder="Your company name"
                    autoComplete="organization"
                    aria-invalid={Boolean(errors.businessName)}
                  />
                  {errors.businessName && <small className="error-text">{errors.businessName}</small>}
                </label>

                <label className="field">
                  <span>Business Website *</span>
                  <input
                    type="url"
                    className={errors.businessWebsite ? 'field-error' : ''}
                    value={form.businessWebsite}
                    onChange={(event) => updateField('businessWebsite', event.target.value)}
                    placeholder="https://www.yourbusiness.com"
                    autoComplete="url"
                    aria-invalid={Boolean(errors.businessWebsite)}
                  />
                  {errors.businessWebsite && <small className="error-text">{errors.businessWebsite}</small>}
                </label>

                <label className="field">
                  <span>Your Role in the Business *</span>
                  <select
                    className={errors.businessRole ? 'field-error' : ''}
                    value={form.businessRole}
                    onChange={(event) => updateField('businessRole', event.target.value)}
                    aria-invalid={Boolean(errors.businessRole)}
                  >
                    <option value="">Select role</option>
                    {businessRoles.map((role) => (
                      <option value={role} key={role}>{role}</option>
                    ))}
                  </select>
                  {errors.businessRole && <small className="error-text">{errors.businessRole}</small>}
                </label>

                <label className="field">
                  <span>Business Type *</span>
                  <select
                    className={errors.businessType ? 'field-error' : ''}
                    value={form.businessType}
                    onChange={(event) => updateField('businessType', event.target.value)}
                    aria-invalid={Boolean(errors.businessType)}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option value={type} key={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && <small className="error-text">{errors.businessType}</small>}
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">3</span>
                <h3>Business Profile</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field">
                  <span>How long have you been operating your business? *</span>
                  <select
                    className={errors.businessAge ? 'field-error' : ''}
                    value={form.businessAge}
                    onChange={(event) => updateField('businessAge', event.target.value)}
                    aria-invalid={Boolean(errors.businessAge)}
                  >
                    <option value="">Select duration</option>
                    {businessAges.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                  {errors.businessAge && <small className="error-text">{errors.businessAge}</small>}
                </label>

                <label className="field">
                  <span>Number of Employees *</span>
                  <select
                    className={errors.employeeCount ? 'field-error' : ''}
                    value={form.employeeCount}
                    onChange={(event) => updateField('employeeCount', event.target.value)}
                    aria-invalid={Boolean(errors.employeeCount)}
                  >
                    <option value="">Select employees</option>
                    {employeeCounts.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                  {errors.employeeCount && <small className="error-text">{errors.employeeCount}</small>}
                </label>

                <label className="field full-width">
                  <span>Approximate Annual Business Turnover</span>
                  <select
                    value={form.annualTurnover}
                    onChange={(event) => updateField('annualTurnover', event.target.value)}
                  >
                    <option value="">Select turnover</option>
                    {turnoverOptions.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">4</span>
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
              </fieldset>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">5</span>
                <h3>Additional Information</h3>
              </div>

              <div className="fields-grid two-col">
                <label className="field full-width">
                  <span>What is the biggest financial challenge your business currently faces?</span>
                  <textarea
                    value={form.financialChallenge}
                    onChange={(event) => updateField('financialChallenge', event.target.value)}
                    placeholder="Briefly describe the main challenge your business is facing."
                    rows="4"
                  />
                </label>

                <label className="field">
                  <span>How did you hear about this webinar? *</span>
                  <select
                    className={errors.referralSource ? 'field-error' : ''}
                    value={form.referralSource}
                    onChange={(event) => updateField('referralSource', event.target.value)}
                    aria-invalid={Boolean(errors.referralSource)}
                  >
                    <option value="">Select</option>
                    {referralSources.map((source) => (
                      <option value={source} key={source}>{source}</option>
                    ))}
                  </select>
                  {errors.referralSource && <small className="error-text">{errors.referralSource}</small>}
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
