import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Footer from '../components/Footer';
import { LEGAL_CONFIG } from '../config/legalConfig';
import './LegalPage.css';

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
    <div className="legal-page-root">
      <main className="legal-document-container" id="main-content">
        {/* Header */}
        <header className="legal-doc-header">
          <div className="legal-doc-kicker">
            <Link to="/">Halal Wealth</Link>
            <span className="legal-doc-kicker-sep">/</span>
            <span>Legal</span>
          </div>
          <h1 className="legal-doc-title">Privacy Policy</h1>
          <p className="legal-doc-intro">
            Your privacy and digital trust are foundational to {LEGAL_CONFIG.businessName}.
            This Privacy Policy explains transparently how we collect, handle, protect, and process your personal data
            when you register for our events, visit {LEGAL_CONFIG.websiteUrl}, or communicate with our team.
          </p>
          <div className="legal-doc-meta">
            <span>Last updated: <strong>{LEGAL_CONFIG.lastUpdated}</strong></span>
            <span className="legal-doc-meta-dot">&bull;</span>
            <span>Effective: <strong>{LEGAL_CONFIG.effectiveDate}</strong></span>
            <span className="legal-doc-meta-dot">&bull;</span>
            <span>Framework: <strong>DPDP Act 2023 &amp; IT Act 2000</strong></span>
          </div>
        </header>

        {/* Main Document Body */}
        <article className="legal-doc-body">
          {/* Section 1 */}
          <section id="introduction" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">1.</span>
              <span>Introduction</span>
            </h2>
            <p className="legal-prose">
              <strong>{LEGAL_CONFIG.businessName}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{' '}
              <a href={LEGAL_CONFIG.websiteUrl} target="_blank" rel="noopener noreferrer">
                {LEGAL_CONFIG.websiteUrl}
              </a>
              . We are committed to safeguarding the privacy, confidentiality, and security of our attendees,
              subscribers, and website visitors.
            </p>
            <p className="legal-prose">
              This Privacy Policy details our practices concerning the collection, storage, processing, transfer,
              and protection of personal information in accordance with applicable Indian laws, including the
              <strong> Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>,
              and the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="personal-information-collected" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">2.</span>
              <span>Personal Information Collected</span>
            </h2>
            <p className="legal-prose">
              We collect only the minimum necessary personal data required to register participants, provide educational event access,
              verify attendee identity, process registration fees through authorized payment gateways, and deliver essential event communications.
            </p>
            <p className="legal-prose">The categories of information we collect include:</p>
            <ul className="legal-bullet-list">
              <li><strong>Contact &amp; Identity Data:</strong> Full name, email address, WhatsApp/mobile number, country code, city, state, and country.</li>
              <li><strong>Demographic Information:</strong> Age group (e.g. 18–24, 25–34, etc.) and gender (for event demographic planning and seating arrangements).</li>
              <li><strong>Professional Background:</strong> Current profession, organization or business name, job title, and years of experience.</li>
              <li><strong>Educational Preferences &amp; Topics:</strong> Stated financial interests (e.g., Shariah-compliant investments, estate planning, retirement), self-assessed Islamic finance knowledge level, and specific financial challenges/questions submitted for speaker Q&amp;A sessions.</li>
              <li><strong>Technical &amp; Log Data:</strong> Anonymized IP addresses, browser types, device categories, operating systems, and timestamp logs for cybersecurity monitoring and server health.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="registration-information" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">3.</span>
              <span>Registration Information</span>
            </h2>
            <p className="legal-prose">
              When you submit a registration for the Halal Wealth Summit or an educational webinar, your information is used to:
            </p>
            <ul className="legal-bullet-list">
              <li>Generate your unique Registration ID or Reference ID (e.g., HWS26-XXXXX or HWW-N26-XXXXX).</li>
              <li>Issue your registration confirmation email containing your participation schedule and access pass.</li>
              <li>Send critical event reminders, schedule adjustments, venue updates, and virtual webinar joining credentials (such as secure Zoom links and meeting passcodes).</li>
              <li>Verify your badge and streamline on-site or digital check-in on the day of the event.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="payment-information" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">4.</span>
              <span>Payment Information</span>
            </h2>

            <div className="legal-editorial-note">
              <div className="legal-editorial-note-title">Zero Card &amp; Banking Credential Storage Guarantee</div>
              <p>
                <strong>{LEGAL_CONFIG.businessName} DOES NOT collect, process, or store sensitive payment instrument data.</strong>
              </p>
              <p>
                We strictly <strong>never store or handle</strong> credit card numbers, debit card numbers, CVV/CVC codes,
                card expiration dates, net banking passwords, or Unified Payments Interface (UPI) personal identification numbers (PINs).
              </p>
              <p>
                All monetary transactions for summit registrations or paid webinars are handled directly by Reserve Bank of India (RBI)
                authorized third-party payment aggregators and payment gateways (such as Razorpay, Cashfree, or other authorized partners)
                that operate under strict <strong>Payment Card Industry Data Security Standard (PCI-DSS) Level 1</strong> compliance.
              </p>
            </div>

            <p className="legal-prose">
              For accounting, tax compliance, invoice generation, and dispute resolution purposes, we receive and store only
              the non-sensitive transaction metadata provided by the payment gateway, including:
            </p>
            <ul className="legal-bullet-list">
              <li>Payment Gateway Order ID and Transaction Reference ID.</li>
              <li>Transaction date, time, and currency (INR).</li>
              <li>Amount paid and transaction status (e.g. <code>captured</code>, <code>pending</code>, <code>failed</code>, or <code>refunded</code>).</li>
              <li>Payment method category (e.g. UPI, Net Banking, Debit Card, Credit Card) without any underlying account or card digits.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="how-information-used" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">5.</span>
              <span>How Personal Information Is Used</span>
            </h2>
            <p className="legal-prose">
              We process your personal information strictly for legitimate educational and administrative purposes, including:
            </p>
            <ul className="legal-bullet-list">
              <li><strong>Fulfilling Event Registrations:</strong> Managing seat allocations, badge printing, and event attendee records.</li>
              <li><strong>Operational Communication:</strong> Dispatching confirmation emails, joining links, schedule updates, feedback forms, and session recordings.</li>
              <li><strong>Customer Support:</strong> Responding to inquiries regarding registration status, payment queries, or technical assistance.</li>
              <li><strong>Community Engagement:</strong> Sending invitations to our voluntary WhatsApp community or educational newsletter only if you have explicitly opted in.</li>
              <li><strong>Legal &amp; Tax Compliance:</strong> Maintaining accounting books, GST records, and audit trails required under Indian laws.</li>
              <li><strong>Fraud &amp; Abuse Prevention:</strong> Detecting duplicate submissions, preventing bot activity, and protecting website security.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="payment-security" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">6.</span>
              <span>Payment Security</span>
            </h2>
            <p className="legal-prose">
              Payment security is governed by industry-standard encryption protocols:
            </p>
            <ul className="legal-bullet-list">
              <li><strong>TLS / SSL Encryption:</strong> All communication between your browser, our website, and the payment gateway is encrypted using 256-bit Transport Layer Security (TLS).</li>
              <li><strong>Tokenization:</strong> Payment aggregators utilize RBI-compliant card tokenization where applicable, replacing sensitive card numbers with encrypted digital tokens.</li>
              <li><strong>PCI-DSS Certified Partners:</strong> Our third-party payment gateways maintain valid PCI-DSS certification, adhering to stringent physical, electronic, and procedural controls.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="sharing-third-parties" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">7.</span>
              <span>Sharing of Information with Third Parties</span>
            </h2>
            <div className="legal-editorial-note legal-editorial-note--highlight">
              <div className="legal-editorial-note-title">Zero Data Commercialization Policy</div>
              <p>
                <strong>We do not sell, rent, lease, trade, or monetize your personal data to any third party for marketing or advertising purposes.</strong>
              </p>
            </div>
            <p className="legal-prose">
              We share personal information strictly with vetted service providers who assist us in delivering our services, subject to strict confidentiality agreements:
            </p>
            <ul className="legal-bullet-list">
              <li><strong>Payment Gateways:</strong> To authorize and process transactions securely.</li>
              <li><strong>Cloud &amp; Infrastructure Providers:</strong> Highly secure database and application hosting services with restricted administrative access.</li>
              <li><strong>Transactional Email &amp; Messaging Providers:</strong> Services utilized to dispatch registration receipts, verification tokens, and webinar alerts.</li>
              <li><strong>Law Enforcement / Regulatory Bodies:</strong> Only when legally compelled by a valid subpoena, court order, or official directive issued by competent Indian law enforcement agencies under applicable statutes.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="cookies-analytics" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">8.</span>
              <span>Cookies and Website Analytics</span>
            </h2>
            <p className="legal-prose">
              Our website uses minimal, functional cookies and secure browser storage strictly necessary for website operation,
              session security, and navigation state. We may collect anonymized web analytics to evaluate page loading speed,
              understand which topics generate interest, and optimize mobile responsiveness.
            </p>
            <p className="legal-prose">
              You can configure your browser to decline cookies or notify you when a cookie is placed. Note that disabling essential
              functional cookies may impact the performance of registration forms or administrative portals.
            </p>
          </section>

          {/* Section 9 */}
          <section id="data-storage-security" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">9.</span>
              <span>Data Storage and Security</span>
            </h2>
            <p className="legal-prose">
              We implement reasonable security practices and procedures as required under Rule 8 of the Information Technology
              (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              Our technical safeguards include:
            </p>
            <ul className="legal-bullet-list">
              <li>Encrypted database connections and secure environment variable credential storage.</li>
              <li>Role-based access controls (RBAC) ensuring that only authorized administrators have access to participant rosters.</li>
              <li>Encrypted HTTPS communication across all public and administrative endpoints.</li>
              <li>Automated rate-limiting and security headers (Helmet.js) preventing unauthorized brute-force or injection attacks.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="data-retention" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">10.</span>
              <span>Data Retention</span>
            </h2>
            <p className="legal-prose">
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including:
            </p>
            <ul className="legal-bullet-list">
              <li>Administering the specific summit, webinar edition, and issuing attendance verification records.</li>
              <li>Resolving potential billing disputes, chargebacks, or refund requests.</li>
              <li>Complying with statutory book-keeping, financial audits, and taxation requirements under Indian law (typically up to 7 financial years for transaction records).</li>
            </ul>
            <p className="legal-prose">
              Once data is no longer required for operational or statutory obligations, it is securely deleted, anonymized, or purged from our active systems.
            </p>
          </section>

          {/* Section 11 */}
          <section id="user-privacy-rights" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">11.</span>
              <span>User Privacy Rights</span>
            </h2>
            <p className="legal-prose">
              Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian data protection frameworks,
              you are entitled to the following rights as a Data Principal:
            </p>
            <ul className="legal-bullet-list">
              <li><strong>Right to Access Information:</strong> You may request a summary of the personal data we hold about you and the processing activities undertaken.</li>
              <li><strong>Right to Correction &amp; Updation:</strong> You have the right to request correction of inaccurate, incomplete, or outdated personal data.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request deletion of your personal data when it is no longer required for the purpose for which it was collected, subject to statutory retention mandates.</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw your consent at any time. Withdrawal of consent does not affect the lawfulness of processing conducted prior to withdrawal.</li>
              <li><strong>Right of Grievance Redressal:</strong> You have the right to accessible grievance redressal regarding any aspect of personal data processing.</li>
            </ul>

            <div className="legal-editorial-note">
              <div className="legal-editorial-note-title">How to Exercise Your Privacy Rights</div>
              <p>
                To submit an access, correction, deletion, or consent withdrawal request, please send an email from your
                registered email address to{' '}
                <a href={`mailto:${LEGAL_CONFIG.grievanceEmail}`}>
                  {LEGAL_CONFIG.grievanceEmail}
                </a>{' '}
                with the Subject Line: <strong>&ldquo;Privacy Request - [Your Full Name]&rdquo;</strong>.
                We will verify your identity and respond within the statutory timeframe (normally within 30 calendar days).
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="third-party-websites" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">12.</span>
              <span>Third-Party Websites</span>
            </h2>
            <p className="legal-prose">
              Our website and communication emails may contain links to external third-party websites (e.g. YouTube, Instagram,
              WhatsApp, Zoom, Google Forms). We do not control and are not responsible for the privacy practices, content,
              or security of these external platforms. We encourage you to review their respective privacy policies before
              providing any personal information.
            </p>
          </section>

          {/* Section 13 */}
          <section id="children-privacy" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">13.</span>
              <span>Children&apos;s Privacy</span>
            </h2>
            <p className="legal-prose">
              Our website, summits, and webinars are designed for adults, professionals, entrepreneurs, and students aged 18 and older.
              We do not knowingly collect personal data from individuals under 18 years of age without verifiable parental or guardian consent.
              If we become aware that a minor has submitted personal information without appropriate guardian authorization,
              we will take immediate steps to delete such records from our databases.
            </p>
          </section>

          {/* Section 14 */}
          <section id="policy-updates" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">14.</span>
              <span>Policy Updates</span>
            </h2>
            <p className="legal-prose">
              We may periodically revise this Privacy Policy to reflect changes in our operational procedures, educational offerings,
              payment gateway relationships, or Indian statutory regulations. When changes are made, the revised policy will be posted
              with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Section 15 */}
          <section id="contact-grievances" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">15.</span>
              <span>Contact and Privacy Grievances</span>
            </h2>
            <p className="legal-prose">
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023,
              the contact details of our Grievance Officer are designated below:
            </p>

            <div className="legal-contact-list">
              <div className="legal-contact-entry">
                <span className="legal-contact-label">Designated Official</span>
                <span className="legal-contact-value">{LEGAL_CONFIG.grievanceOfficer.title}</span>
                <span className="legal-contact-note">{LEGAL_CONFIG.grievanceOfficer.organization}</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Grievance Email</span>
                <span className="legal-contact-value">
                  <a href={`mailto:${LEGAL_CONFIG.grievanceOfficer.email}`}>
                    {LEGAL_CONFIG.grievanceOfficer.email}
                  </a>
                </span>
                <span className="legal-contact-note">Direct privacy inquiries</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Contact Number</span>
                <span className="legal-contact-value">
                  <a href={`tel:${LEGAL_CONFIG.grievanceOfficer.phone.replace(/\s+/g, '')}`}>
                    {LEGAL_CONFIG.grievanceOfficer.phone}
                  </a>
                </span>
                <span className="legal-contact-note">Mon–Fri, 10:00 AM – 5:00 PM IST</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Postal / Registered Address</span>
                <span className="legal-contact-value">{LEGAL_CONFIG.grievanceOfficer.address}</span>
                <span className="legal-contact-note">Turnaround: {LEGAL_CONFIG.grievanceOfficer.responseTimeline}</span>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section id="applicable-indian-laws" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">16.</span>
              <span>Applicable Indian Laws</span>
            </h2>
            <p className="legal-prose">
              This Privacy Policy is formulated and enforced under the jurisdiction of the Republic of India and complies explicitly with:
            </p>
            <ul className="legal-bullet-list">
              <li><strong>The Information Technology Act, 2000</strong> (and its amendments).</li>
              <li><strong>The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.</li>
              <li><strong>The Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the applicable rules and notifications enacted thereunder.</li>
              <li><strong>Reserve Bank of India (RBI) directives</strong> on tokenization, payment security, and data storage for payment systems.</li>
            </ul>
            <p className="legal-prose">
              Any dispute or grievance regarding data privacy arising under this policy shall be subject to the exclusive jurisdiction
              of the competent courts situated in <strong>{LEGAL_CONFIG.jurisdictionCity}</strong>.
            </p>
          </section>
        </article>
      </main>

      {/* Back to Top Subtle Button */}
      {showBackToTop && (
        <button
          type="button"
          className="legal-doc-back-to-top"
          onClick={scrollToTop}
          aria-label="Scroll back to top of the page"
          title="Back to Top"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
      )}

      {/* Reused Footer */}
      <Footer />
    </div>
  );
}
