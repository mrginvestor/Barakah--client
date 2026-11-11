import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Calendar, FileText, Info, Lock, ShieldCheck, Mail, Phone, MapPin, UserCheck, AlertTriangle } from 'lucide-react';
import Footer from '../components/Footer';
import { LEGAL_CONFIG } from '../config/legalConfig';
import './LegalPage.css';

const SECTIONS = [
  { id: 'introduction', num: '1', title: 'Introduction' },
  { id: 'personal-information-collected', num: '2', title: 'Personal Information Collected' },
  { id: 'registration-information', num: '3', title: 'Registration Information' },
  { id: 'payment-information', num: '4', title: 'Payment Information' },
  { id: 'how-information-used', num: '5', title: 'How Personal Information Is Used' },
  { id: 'payment-security', num: '6', title: 'Payment Security' },
  { id: 'sharing-third-parties', num: '7', title: 'Sharing of Information with Third Parties' },
  { id: 'cookies-analytics', num: '8', title: 'Cookies and Website Analytics' },
  { id: 'data-storage-security', num: '9', title: 'Data Storage and Security' },
  { id: 'data-retention', num: '10', title: 'Data Retention' },
  { id: 'user-privacy-rights', num: '11', title: 'User Privacy Rights' },
  { id: 'third-party-websites', num: '12', title: 'Third-Party Websites' },
  { id: 'children-privacy', num: '13', title: "Children's Privacy" },
  { id: 'policy-updates', num: '14', title: 'Policy Updates' },
  { id: 'contact-grievances', num: '15', title: 'Contact and Privacy Grievances' },
  { id: 'applicable-indian-laws', num: '16', title: 'Applicable Indian Laws' },
];

export default function PrivacyPolicy() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    document.title = `Privacy Policy | ${LEGAL_CONFIG.brandName}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Privacy Policy for ${LEGAL_CONFIG.brandName} (${LEGAL_CONFIG.websiteUrl}) explaining personal data collection, payment security compliance, and user rights under the Digital Personal Data Protection Act, 2023.`
      );
    }
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="legal-page-wrapper">
      {/* Hero Header */}
      <header className="legal-hero" role="banner">
        <div className="legal-hero-inner">
          <nav aria-label="Breadcrumbs" className="legal-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="legal-breadcrumbs-sep" aria-hidden="true">/</span>
            <span>Legal</span>
            <span className="legal-breadcrumbs-sep" aria-hidden="true">/</span>
            <span aria-current="page">Privacy Policy</span>
          </nav>

          <p className="legal-hero-eyebrow">HALAL WEALTH &bull; DATA PROTECTION</p>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-desc">
            Your privacy and digital trust are foundational to {LEGAL_CONFIG.businessName}.
            This Privacy Policy explains transparently how we collect, handle, protect, and process your personal data
            when you register for our events, visit {LEGAL_CONFIG.websiteUrl}, or communicate with our team.
          </p>

          <div className="legal-meta-row">
            <span className="legal-badge">
              <Calendar size={13} aria-hidden="true" />
              Effective Date: {LEGAL_CONFIG.effectiveDate}
            </span>
            <span className="legal-badge">
              <FileText size={13} aria-hidden="true" />
              Last Updated: {LEGAL_CONFIG.lastUpdated}
            </span>
            <span className="legal-badge">
              <ShieldCheck size={13} aria-hidden="true" />
              DPDP Act 2023 Compliant
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="legal-content-container" id="main-content">
        {/* Quick Navigation / Table of Contents */}
        <nav className="legal-toc-card" aria-label="Table of Contents">
          <div className="legal-toc-header">
            <h2 className="legal-toc-title">
              <Info size={16} aria-hidden="true" />
              Table of Contents
            </h2>
            <small style={{ color: '#4A5568', fontSize: '12px' }}>16 Sections</small>
          </div>
          <ul className="legal-toc-grid">
            {SECTIONS.map((sec) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`}>
                  <span className="legal-toc-num">{sec.num}.</span>
                  <span>{sec.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Policy Body */}
        <article className="legal-article">
          {/* Section 1 */}
          <section id="introduction" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2 className="legal-section-heading">Introduction</h2>
            </div>
            <p className="legal-paragraph">
              <strong>{LEGAL_CONFIG.businessName}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{' '}
              <a href={LEGAL_CONFIG.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1B5E20' }}>
                {LEGAL_CONFIG.websiteUrl}
              </a>
              . We are committed to safeguarding the privacy, confidentiality, and security of our attendees,
              subscribers, and website visitors.
            </p>
            <p className="legal-paragraph">
              This Privacy Policy details our practices concerning the collection, storage, processing, transfer,
              and protection of personal information in accordance with applicable Indian laws, including the
              <strong> Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>,
              and the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="personal-information-collected" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2 className="legal-section-heading">Personal Information Collected</h2>
            </div>
            <p className="legal-paragraph">
              We collect only the minimum necessary personal data required to register participants, provide educational event access,
              verify attendee identity, process registration fees through authorized payment gateways, and deliver essential event communications.
            </p>
            <p className="legal-paragraph">The categories of information we collect include:</p>
            <ul className="legal-list">
              <li><strong>Contact &amp; Identity Data:</strong> Full name, email address, WhatsApp/mobile number, country code, city, state, and country.</li>
              <li><strong>Demographic Information:</strong> Age group (e.g. 18–24, 25–34, etc.) and gender (for event demographic planning and seating arrangements).</li>
              <li><strong>Professional Background:</strong> Current profession, organization/business name, job title, and years of experience.</li>
              <li><strong>Educational Preferences &amp; Topics:</strong> Stated financial interests (e.g., Shariah-compliant investments, estate planning, retirement), self-assessed Islamic finance knowledge level, and specific financial challenges/questions submitted for speaker Q&amp;A sessions.</li>
              <li><strong>Technical &amp; Log Data:</strong> Anonymized IP addresses, browser types, device categories, operating systems, and timestamp logs for cybersecurity monitoring and server health.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="registration-information" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2 className="legal-section-heading">Registration Information</h2>
            </div>
            <p className="legal-paragraph">
              When you submit a registration for the Halal Wealth Summit or an educational webinar, your information is used to:
            </p>
            <ul className="legal-list">
              <li>Generate your unique Registration ID / Reference ID (e.g., HWS26-XXXXX or HWW-N26-XXXXX).</li>
              <li>Issue your registration confirmation email containing your participation schedule and access pass.</li>
              <li>Send critical event reminders, schedule adjustments, venue updates, and virtual webinar joining credentials (such as secure Zoom links and meeting passcodes).</li>
              <li>Verify your badge and streamline on-site or digital check-in on the day of the event.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="payment-information" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2 className="legal-section-heading">Payment Information</h2>
            </div>

            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <Lock size={18} aria-hidden="true" />
                <span>Zero Card / Banking Credential Storage Guarantee</span>
              </div>
              <p className="legal-callout-text">
                <strong>{LEGAL_CONFIG.businessName} DOES NOT collect, process, or store sensitive payment instrument data.</strong>
              </p>
              <p className="legal-callout-text" style={{ marginTop: '8px' }}>
                We strictly <strong>never store or handle</strong> credit card numbers, debit card numbers, CVV/CVC codes,
                card expiration dates, net banking passwords, or Unified Payments Interface (UPI) personal identification numbers (PINs).
              </p>
              <p className="legal-callout-text" style={{ marginTop: '8px' }}>
                All monetary transactions for summit registrations or paid webinars are handled directly by Reserve Bank of India (RBI)
                authorized third-party payment aggregators and payment gateways (such as Razorpay, Cashfree, or other authorized partners)
                that operate under strict <strong>Payment Card Industry Data Security Standard (PCI-DSS) Level 1</strong> compliance.
              </p>
            </div>

            <p className="legal-paragraph">
              For accounting, tax compliance, invoice generation, and dispute resolution purposes, we receive and store only
              the non-sensitive transaction metadata provided by the payment gateway, including:
            </p>
            <ul className="legal-list">
              <li>Payment Gateway Order ID and Transaction Reference ID.</li>
              <li>Transaction date, time, and currency (INR).</li>
              <li>Amount paid and transaction status (e.g. <code>captured</code>, <code>pending</code>, <code>failed</code>, or <code>refunded</code>).</li>
              <li>Payment method category (e.g. UPI, Net Banking, Debit Card, Credit Card) without any underlying account or card digits.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="how-information-used" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2 className="legal-section-heading">How Personal Information Is Used</h2>
            </div>
            <p className="legal-paragraph">
              We process your personal information strictly for legitimate educational and administrative purposes, including:
            </p>
            <ul className="legal-list">
              <li><strong>Fulfilling Event Registrations:</strong> Managing seat allocations, badge printing, and event attendee records.</li>
              <li><strong>Operational Communication:</strong> Dispatching confirmation emails, joining links, schedule updates, feedback forms, and session recordings.</li>
              <li><strong>Customer Support:</strong> Responding to inquiries regarding registration status, payment queries, or technical assistance.</li>
              <li><strong>Community Engagement:</strong> Sending invitations to our voluntary WhatsApp community or educational newsletter only if you have explicitly opted in.</li>
              <li><strong>Legal &amp; Tax Compliance:</strong> Maintaining accounting books, GST records, and audit trails required under Indian laws.</li>
              <li><strong>Fraud &amp; Abuse Prevention:</strong> Detecting duplicate submissions, preventing bot activity, and protecting website security.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="payment-security" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2 className="legal-section-heading">Payment Security</h2>
            </div>
            <p className="legal-paragraph">
              Payment security is governed by industry-standard encryption protocols:
            </p>
            <ul className="legal-list">
              <li><strong>TLS / SSL Encryption:</strong> All communication between your browser, our website, and the payment gateway is encrypted using 256-bit Transport Layer Security (TLS).</li>
              <li><strong>Tokenization:</strong> Payment aggregators utilize RBI-compliant card tokenization where applicable, replacing sensitive card numbers with encrypted digital tokens.</li>
              <li><strong>PCI-DSS Certified Partners:</strong> Our third-party payment gateways maintain valid PCI-DSS certification, adhering to stringent physical, electronic, and procedural controls.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="sharing-third-parties" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">7</span>
              <h2 className="legal-section-heading">Sharing of Information with Third Parties</h2>
            </div>
            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <UserCheck size={18} aria-hidden="true" />
                <span>Zero Data Commercialization Policy</span>
              </div>
              <p className="legal-callout-text">
                <strong>We do not sell, rent, lease, trade, or monetize your personal data to any third party for marketing or advertising purposes.</strong>
              </p>
            </div>
            <p className="legal-paragraph">
              We share personal information strictly with vetted service providers who assist us in delivering our services, subject to strict confidentiality agreements:
            </p>
            <ul className="legal-list">
              <li><strong>Payment Gateways:</strong> To authorize and process transactions securely.</li>
              <li><strong>Cloud &amp; Infrastructure Providers:</strong> Highly secure database and application hosting services with restricted administrative access.</li>
              <li><strong>Transactional Email &amp; Messaging Providers:</strong> Services utilized to dispatch registration receipts, verification tokens, and webinar alerts.</li>
              <li><strong>Law Enforcement / Regulatory Bodies:</strong> Only when legally compelled by a valid subpoena, court order, or official directive issued by competent Indian law enforcement agencies under applicable statutes.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="cookies-analytics" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">8</span>
              <h2 className="legal-section-heading">Cookies and Website Analytics</h2>
            </div>
            <p className="legal-paragraph">
              Our website uses minimal, functional cookies and secure browser storage strictly necessary for website operation,
              session security, and navigation state. We may collect anonymized web analytics to evaluate page loading speed,
              understand which topics generate interest, and optimize mobile responsiveness.
            </p>
            <p className="legal-paragraph">
              You can configure your browser to decline cookies or notify you when a cookie is placed. Note that disabling essential
              functional cookies may impact the performance of registration forms or administrative portals.
            </p>
          </section>

          {/* Section 9 */}
          <section id="data-storage-security" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">9</span>
              <h2 className="legal-section-heading">Data Storage and Security</h2>
            </div>
            <p className="legal-paragraph">
              We implement reasonable security practices and procedures as required under Rule 8 of the Information Technology
              (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              Our technical safeguards include:
            </p>
            <ul className="legal-list">
              <li>Encrypted database connections and secure environment variable credential storage.</li>
              <li>Role-based access controls (RBAC) ensuring that only authorized administrators have access to participant rosters.</li>
              <li>Encrypted HTTPS communication across all public and administrative endpoints.</li>
              <li>Automated rate-limiting and security headers (Helmet.js) preventing unauthorized brute-force or injection attacks.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="data-retention" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">10</span>
              <h2 className="legal-section-heading">Data Retention</h2>
            </div>
            <p className="legal-paragraph">
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including:
            </p>
            <ul className="legal-list">
              <li>Administering the specific summit, webinar edition, and issuing attendance verification records.</li>
              <li>Resolving potential billing disputes, chargebacks, or refund requests.</li>
              <li>Complying with statutory book-keeping, financial audits, and taxation requirements under Indian law (typically up to 7 financial years for transaction records).</li>
            </ul>
            <p className="legal-paragraph">
              Once data is no longer required for operational or statutory obligations, it is securely deleted, anonymized, or purged from our active systems.
            </p>
          </section>

          {/* Section 11 */}
          <section id="user-privacy-rights" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">11</span>
              <h2 className="legal-section-heading">User Privacy Rights</h2>
            </div>
            <p className="legal-paragraph">
              Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian data protection frameworks,
              you are entitled to the following rights as a Data Principal:
            </p>
            <ul className="legal-list">
              <li><strong>Right to Access Information:</strong> You may request a summary of the personal data we hold about you and the processing activities undertaken.</li>
              <li><strong>Right to Correction &amp; Updation:</strong> You have the right to request correction of inaccurate, incomplete, or outdated personal data.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request deletion of your personal data when it is no longer required for the purpose for which it was collected, subject to statutory retention mandates.</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw your consent at any time. Withdrawal of consent does not affect the lawfulness of processing conducted prior to withdrawal.</li>
              <li><strong>Right of Grievance Redressal:</strong> You have the right to accessible grievance redressal regarding any aspect of personal data processing.</li>
            </ul>
            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <Mail size={18} aria-hidden="true" />
                <span>How to Exercise Your Privacy Rights</span>
              </div>
              <p className="legal-callout-text">
                To submit an access, correction, deletion, or consent withdrawal request, please send an email from your
                registered email address to{' '}
                <a href={`mailto:${LEGAL_CONFIG.grievanceEmail}`} style={{ color: '#1B5E20', fontWeight: 600 }}>
                  {LEGAL_CONFIG.grievanceEmail}
                </a>{' '}
                with the Subject Line: <strong>&ldquo;Privacy Request - [Your Full Name]&rdquo;</strong>.
                We will verify your identity and respond within the statutory timeframe (normally within 30 days).
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="third-party-websites" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">12</span>
              <h2 className="legal-section-heading">Third-Party Websites</h2>
            </div>
            <p className="legal-paragraph">
              Our website and communication emails may contain links to external third-party websites (e.g. YouTube, Instagram,
              WhatsApp, Zoom, Google Forms). We do not control and are not responsible for the privacy practices, content,
              or security of these external platforms. We encourage you to review their respective privacy policies before
              providing any personal information.
            </p>
          </section>

          {/* Section 13 */}
          <section id="children-privacy" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">13</span>
              <h2 className="legal-section-heading">Children&apos;s Privacy</h2>
            </div>
            <p className="legal-paragraph">
              Our website, summits, and webinars are designed for adults, professionals, entrepreneurs, and students aged 18 and older.
              We do not knowingly collect personal data from individuals under 18 years of age without verifiable parental or guardian consent.
              If we become aware that a minor has submitted personal information without appropriate guardian authorization,
              we will take immediate steps to delete such records from our databases.
            </p>
          </section>

          {/* Section 14 */}
          <section id="policy-updates" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">14</span>
              <h2 className="legal-section-heading">Policy Updates</h2>
            </div>
            <p className="legal-paragraph">
              We may periodically revise this Privacy Policy to reflect changes in our operational procedures, educational offerings,
              payment gateway relationships, or Indian statutory regulations. When changes are made, the revised policy will be posted
              with an updated &ldquo;Last Updated&rdquo; date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Section 15 */}
          <section id="contact-grievances" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">15</span>
              <h2 className="legal-section-heading">Contact and Privacy Grievances</h2>
            </div>
            <p className="legal-paragraph">
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023,
              the contact details of our Grievance Officer are designated below:
            </p>

            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <strong>Designated Official</strong>
                <p>{LEGAL_CONFIG.grievanceOfficer.title}</p>
                <small style={{ color: '#64748B' }}>{LEGAL_CONFIG.grievanceOfficer.organization}</small>
              </div>

              <div className="legal-contact-item">
                <strong>Grievance Email</strong>
                <p>
                  <a href={`mailto:${LEGAL_CONFIG.grievanceOfficer.email}`}>
                    {LEGAL_CONFIG.grievanceOfficer.email}
                  </a>
                </p>
                <small style={{ color: '#64748B' }}>Direct attention for privacy requests</small>
              </div>

              <div className="legal-contact-item">
                <strong>Contact Number</strong>
                <p>
                  <a href={`tel:${LEGAL_CONFIG.grievanceOfficer.phone.replace(/\s+/g, '')}`}>
                    {LEGAL_CONFIG.grievanceOfficer.phone}
                  </a>
                </p>
                <small style={{ color: '#64748B' }}>Mon–Fri, 10:00 AM – 5:00 PM IST</small>
              </div>

              <div className="legal-contact-item">
                <strong>Postal / Registered Address</strong>
                <p>{LEGAL_CONFIG.grievanceOfficer.address}</p>
                <small style={{ color: '#64748B' }}>Response turnaround: {LEGAL_CONFIG.grievanceOfficer.responseTimeline}</small>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section id="applicable-indian-laws" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">16</span>
              <h2 className="legal-section-heading">Applicable Indian Laws</h2>
            </div>
            <p className="legal-paragraph">
              This Privacy Policy is formulated and enforced under the jurisdiction of the Republic of India and complies explicitly with:
            </p>
            <ul className="legal-list">
              <li><strong>The Information Technology Act, 2000</strong> (and its amendments).</li>
              <li><strong>The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.</li>
              <li><strong>The Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the applicable rules and notifications enacted thereunder.</li>
              <li><strong>Reserve Bank of India (RBI) directives</strong> on tokenization, payment security, and data storage for payment systems.</li>
            </ul>
            <p className="legal-paragraph">
              Any dispute or grievance regarding data privacy arising under this policy shall be subject to the exclusive jurisdiction
              of the competent courts situated in <strong>{LEGAL_CONFIG.jurisdictionCity}</strong>.
            </p>
          </section>
        </article>
      </main>

      {/* Back to Top Accessible Button */}
      {showBackToTop && (
        <button
          type="button"
          className="legal-back-to-top"
          onClick={scrollToTop}
          aria-label="Scroll back to top of the page"
          title="Back to Top"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      )}

      {/* Global Reused Footer */}
      <Footer />
    </div>
  );
}

