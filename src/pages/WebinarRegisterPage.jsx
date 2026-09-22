import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  country: '',
  businessName: '',
  businessWebsite: '',
  designation: '',
  industry: '',
  businessRole: '',
  businessRoleOther: '',
  businessType: '',
  businessTypeOther: '',
  financialInterests: [],
  financialInterestsOther: '',
  financialChallenge: '',
  referralSource: '',
  referralSourceOther: '',
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

const financialTopics = ['Business Financial Planning', 'Cash Flow Management', 'Working Capital Management', 'Business Loans & Financing', 'Investment Planning', 'Tax Planning', 'Profitability Improvement', 'Financial Risk Management', 'Business Valuation', 'Wealth Management for Business Owners', 'Investment Opportunities', 'Business Expansion & Funding', 'Other'];
const referralSources = ['WhatsApp', 'Instagram', 'Facebook', 'YouTube', 'Friend / Colleague', 'Website', 'Other'];
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

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.slice(0, 10);
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
      if (field === 'businessRole') next.designation = value;
      if (field === 'businessType') next.industry = value;
      if (field === 'referralSource' && value !== 'Other') {
        next.referralSourceOther = '';
      }
      return next;
    });
    setErrors((current) => {
      const nextErrors = { ...current, [field]: undefined };
      if (field === 'referralSource' && value !== 'Other') nextErrors.referralSourceOther = undefined;
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
        ...(isRemoving && topic === 'Other' ? { financialInterestsOther: '' } : {}),
      };
    });
    setErrors((current) => {
      const next = { ...current, financialInterests: undefined };
      if (topic === 'Other') {
        next.financialInterestsOther = undefined;
      }
      return next;
    });
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!String(form.fullName || '').trim() || String(form.fullName).trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }

    const normalizedPhone = String(form.phone || '').trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!/^\S+@\S+\.\S+$/.test(String(form.email || '').trim())) {
      nextErrors.email = 'Please enter a valid email address.';
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
    } else if (form.businessRole === 'Other' && !String(form.businessRoleOther || '').trim()) {
      nextErrors.businessRoleOther = 'Please specify your role.';
    }

    if (!String(form.businessType || '').trim()) {
      nextErrors.businessType = 'Please select your business type.';
    } else if (form.businessType === 'Other' && !String(form.businessTypeOther || '').trim()) {
      nextErrors.businessTypeOther = 'Please specify your business type.';
    }

    if (!Array.isArray(form.financialInterests) || form.financialInterests.length < 1) {
      nextErrors.financialInterests = 'Please select at least one topic.';
    } else if (form.financialInterests.includes('Other') && !String(form.financialInterestsOther || '').trim()) {
      nextErrors.financialInterestsOther = 'Please specify your financial topic.';
    }

    if (!String(form.referralSource || '').trim()) {
      nextErrors.referralSource = 'Please tell us how you heard about this webinar.';
    } else if (form.referralSource === 'Other' && !String(form.referralSourceOther || '').trim()) {
      nextErrors.referralSourceOther = 'Please specify how you heard about this webinar.';
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
      const finalRole = form.businessRole === 'Other' ? String(form.businessRoleOther || '').trim() : form.businessRole;
      const finalType = form.businessType === 'Other' ? String(form.businessTypeOther || '').trim() : form.businessType;
      const finalInterests = form.financialInterests.filter(Boolean);
      const finalOtherInterest = form.financialInterests.includes('Other')
        ? String(form.financialInterestsOther || '').trim()
        : '';
      const finalReferral = form.referralSource === 'Other' ? String(form.referralSourceOther || '').trim() : form.referralSource;

      const payload = {
        fullName: String(form.fullName).trim(),
        city: String(form.city).trim(),
        state: String(form.state || '').trim(),
        country: String(form.country || '').trim(),
        businessName: String(form.businessName).trim(),
        businessRole: finalRole,
        businessType: finalType,
        designation: String(form.designation || finalRole).trim(),
        industry: String(form.industry || finalType).trim(),
        financialInterests: finalInterests,
        financialInterestsOther: finalOtherInterest,
        financialChallenge: String(form.financialChallenge || '').trim(),
        referralSource: finalReferral,
        phone: String(form.phone).trim(),
        email: String(form.email).trim().toLowerCase(),
        businessWebsite: normalizeWebsite(form.businessWebsite),
        consent: form.consent,
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
                    className={errors.phone ? 'field-error' : ''}
                    value={form.phone}
                    onChange={(event) => updateField('phone', normalizePhone(event.target.value))}
                    placeholder="9876543210"
                    inputMode="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
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
                  <span>City / Location</span>
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

                <label className="field">
                  <span>State</span>
                  <input type="text" value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="Enter your state" autoComplete="address-level1" />
                </label>

                <label className="field">
                  <span>Country</span>
                  <input type="text" value={form.country} onChange={(event) => updateField('country', event.target.value)} placeholder="Enter your country" autoComplete="country-name" />
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

                <div className="field">
                  <span>Designation / Occupation *</span>
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

                  {form.businessRole === 'Other' && (
                    <div className="other-specify-wrap">
                      <span className="other-specify-label">Please specify your role *</span>
                      <input
                        type="text"
                        className={errors.businessRoleOther ? 'field-error' : ''}
                        value={form.businessRoleOther}
                        onChange={(event) => updateField('businessRoleOther', event.target.value)}
                        placeholder="Please enter your role"
                        aria-invalid={Boolean(errors.businessRoleOther)}
                        autoFocus
                      />
                      {errors.businessRoleOther && <small className="error-text">{errors.businessRoleOther}</small>}
                    </div>
                  )}
                </div>

                <div className="field">
                  <span>Industry *</span>
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

                  {form.businessType === 'Other' && (
                    <div className="other-specify-wrap">
                      <span className="other-specify-label">Please specify your business type *</span>
                      <input
                        type="text"
                        className={errors.businessTypeOther ? 'field-error' : ''}
                        value={form.businessTypeOther}
                        onChange={(event) => updateField('businessTypeOther', event.target.value)}
                        placeholder="Please enter your business type"
                        aria-invalid={Boolean(errors.businessTypeOther)}
                        autoFocus
                      />
                      {errors.businessTypeOther && <small className="error-text">{errors.businessTypeOther}</small>}
                    </div>
                  )}
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

                {form.financialInterests.includes('Other') && (
                  <div className="other-specify-wrap other-specify-wrap--checkbox">
                    <span className="other-specify-label">Please specify your financial topic *</span>
                    <input
                      type="text"
                      className={errors.financialInterestsOther ? 'field-error' : ''}
                      value={form.financialInterestsOther}
                      onChange={(event) => updateField('financialInterestsOther', event.target.value)}
                      placeholder="Please enter your topic"
                      aria-invalid={Boolean(errors.financialInterestsOther)}
                      autoFocus
                    />
                    {errors.financialInterestsOther && <small className="error-text">{errors.financialInterestsOther}</small>}
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

                <div className="field full-width">
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

                  {form.referralSource === 'Other' && (
                    <div className="other-specify-wrap">
                      <span className="other-specify-label">Please specify how you heard about this webinar *</span>
                      <input
                        type="text"
                        className={errors.referralSourceOther ? 'field-error' : ''}
                        value={form.referralSourceOther}
                        onChange={(event) => updateField('referralSourceOther', event.target.value)}
                        placeholder="Please enter your answer"
                        aria-invalid={Boolean(errors.referralSourceOther)}
                        autoFocus
                      />
                      {errors.referralSourceOther && <small className="error-text">{errors.referralSourceOther}</small>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section consent-section">
              <div className="section-title">
                <span className="section-number">5</span>
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
