import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Calendar, Clock, CreditCard, FileText, Info, RefreshCw, RotateCcw, ShieldCheck, Mail, Phone, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { LEGAL_CONFIG } from '../config/legalConfig';
import './LegalPage.css';

const SECTIONS = [
  { id: 'general-refund-policy', num: '1', title: 'General Refund Policy' },
  { id: 'participant-cancellation', num: '2', title: 'Participant-Initiated Cancellation' },
  { id: 'refund-eligibility', num: '3', title: 'Refund Eligibility' },
  { id: 'event-cancellation-by-us', num: '4', title: 'Event Cancellation by Halal Wealth' },
  { id: 'event-postponement', num: '5', title: 'Event Postponement or Rescheduling' },
  { id: 'failed-transactions', num: '6', title: 'Failed Transactions' },
  { id: 'duplicate-payments', num: '7', title: 'Duplicate Payments' },
  { id: 'refund-processing-time', num: '8', title: 'Refund Processing Time' },
  { id: 'refund-procedure', num: '9', title: 'Refund Request Procedure' },
  { id: 'contact-information', num: '10', title: 'Contact Information' },
];

export default function RefundPolicy() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    document.title = `Refund & Cancellation Policy | ${LEGAL_CONFIG.brandName}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Refund and Cancellation Policy for ${LEGAL_CONFIG.brandName} (${LEGAL_CONFIG.websiteUrl}) detailing event cancellation, rescheduling, duplicate transactions, and payment gateway refund processing.`
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
            <span aria-current="page">Refund &amp; Cancellation Policy</span>
          </nav>

          <p className="legal-hero-eyebrow">HALAL WEALTH &bull; PAYMENT COMPLIANCE</p>
          <h1 className="legal-hero-title">Refund &amp; Cancellation Policy</h1>
          <p className="legal-hero-desc">
            This policy sets forth the clear, fair, and transparent guidelines governing cancellations,
            postponements, failed transactions, duplicate payments, and refund processing for event registrations
            with {LEGAL_CONFIG.businessName}.
          </p>

          <div className="legal-meta-row">
            <span className="legal-badge">
              <Calendar size={13} aria-hidden="true" />
              Effective Date: {LEGAL_CONFIG.effectiveDate}
            </span>
            <span className="legal-badge">
              <Clock size={13} aria-hidden="true" />
              Processing: {LEGAL_CONFIG.refundPolicy.processingTimeline}
            </span>
            <span className="legal-badge">
              <ShieldCheck size={13} aria-hidden="true" />
              RBI Compliant Gateways
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
            <small style={{ color: '#4A5568', fontSize: '12px' }}>10 Sections</small>
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
          <section id="general-refund-policy" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2 className="legal-section-heading">General Refund Policy</h2>
            </div>
            <p className="legal-paragraph">
              At <strong>{LEGAL_CONFIG.businessName}</strong>, we are committed to transparent, principled, and fair customer service.
              All registrations for our paid summits, conferences, workshops, and webinars are subject to the specific refund and cancellation
              terms presented during the registration process and detailed within this policy.
            </p>
            <p className="legal-paragraph">
              Before registering, attendees are encouraged to review the event date, timings, venue or virtual broadcast mode, and ticket inclusions carefully.
              Because seat capacity, catering arrangements, conference halls, and speaker commitments are finalized well in advance,
              refunds must adhere strictly to the conditions outlined below.
            </p>
          </section>

          {/* Section 2 */}
          <section id="participant-cancellation" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2 className="legal-section-heading">Participant-Initiated Cancellation</h2>
            </div>
            <p className="legal-paragraph">
              If an attendee wishes to cancel their registration due to personal circumstances, the following framework applies:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Cancellation Window:</strong> Voluntary cancellation requests must be submitted within the specific refund
                window published on the registration/checkout page prior to payment. Where no specific pre-event cancellation window
                is stipulated for an event, registrations are generally non-refundable once confirmed, except in cases of event postponement or cancellation by organizers.
              </li>
              <li>
                <strong>Attendee Substitutions:</strong> If you are unable to attend in person, you may request to transfer your pass
                to a nominated colleague or friend by contacting us at least 48 hours before the event commencement, subject to administrative approval.
              </li>
              <li>
                <strong>No-Show Policy:</strong> Registered participants who fail to attend the event on the scheduled date (&ldquo;no-shows&rdquo;)
                without prior written notice are not eligible for a refund.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="refund-eligibility" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2 className="legal-section-heading">Refund Eligibility</h2>
            </div>
            <p className="legal-paragraph">
              A refund will be granted in full or pro-rata under the following verified circumstances:
            </p>
            <div className="legal-table-wrap">
              <table className="legal-table" aria-label="Refund Eligibility Matrix">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Eligibility Status</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Event Cancelled by Halal Wealth</strong></td>
                    <td>100% Full Refund of Registration Fee</td>
                    <td>Processed automatically or upon confirmation</td>
                  </tr>
                  <tr>
                    <td><strong>Event Postponed / Rescheduled</strong></td>
                    <td>Refund eligible if unable to attend new date</td>
                    <td>Request within {LEGAL_CONFIG.refundPolicy.postponementRefundWindow}</td>
                  </tr>
                  <tr>
                    <td><strong>Duplicate / Double Payment</strong></td>
                    <td>100% Refund of Excess Payment</td>
                    <td>Submit transaction IDs for immediate reconciliation</td>
                  </tr>
                  <tr>
                    <td><strong>Technical / Gateway Failure</strong></td>
                    <td>100% Reversal via Banking Network</td>
                    <td>Auto-reversed by bank/gateway within 3–5 working days</td>
                  </tr>
                  <tr>
                    <td><strong>Participant Voluntary Cancellation</strong></td>
                    <td>Subject to specific event registration terms</td>
                    <td>Submit written request prior to published cut-off</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section id="event-cancellation-by-us" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2 className="legal-section-heading">Event Cancellation by Halal Wealth</h2>
            </div>
            <p className="legal-paragraph">
              If {LEGAL_CONFIG.businessName} cancels an event, summit, or paid webinar in its entirety due to operational constraints,
              safety advisories, or unavoidable administrative reasons:
            </p>
            <ul className="legal-list">
              <li>All registered participants will receive a <strong>100% full refund</strong> of the registration fee paid.</li>
              <li>Refunds will be processed back to the original payment source used during registration.</li>
              <li>{LEGAL_CONFIG.businessName} is not liable for ancillary expenses incurred by participants, such as independent travel bookings, hotel reservations, or visa application fees.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="event-postponement" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2 className="legal-section-heading">Event Postponement or Rescheduling</h2>
            </div>
            <p className="legal-paragraph">
              If an event is postponed, rescheduled, or relocated due to weather conditions, venue constraints, administrative directives,
              or force majeure:
            </p>
            <ul className="legal-list">
              <li>Your existing registration and reference ID will <strong>automatically remain valid</strong> for the revised event date without requiring re-registration.</li>
              <li>
                If you are unable to attend on the revised date, you are entitled to request a full refund by notifying us within{' '}
                <strong>{LEGAL_CONFIG.refundPolicy.postponementRefundWindow}</strong> of the official postponement notification.
              </li>
              <li>Requests received after the published refund window expires will not be eligible for cancellation, but the pass may remain eligible for attendee substitution.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="failed-transactions" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2 className="legal-section-heading">Failed Transactions</h2>
            </div>
            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <AlertCircle size={18} aria-hidden="true" />
                <span>Interrupted or Failed Transaction Guidance</span>
              </div>
              <p className="legal-callout-text">
                If money is debited from your bank account, credit card, debit card, or UPI app, but our website displays a failure screen
                or does not generate a Registration ID due to network interruptions:
              </p>
              <ul className="legal-list" style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>This is an uncaptured or dropped transaction. The payment gateway and banking network typically auto-reconcile and reverse such charges within <strong>3 to 5 business days</strong> without requiring manual intervention.</li>
                <li>If the debited amount is not refunded after 5 business days, please email us with your bank transaction screenshot, UTR number, or payment reference ID so we can trace the transaction with our payment gateway partner.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="duplicate-payments" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">7</span>
              <h2 className="legal-section-heading">Duplicate Payments</h2>
            </div>
            <p className="legal-paragraph">
              Due to momentary browser lag or repeated button clicks, an attendee may occasionally be billed twice for a single registration pass.
              In such circumstances:
            </p>
            <ul className="legal-list">
              <li>Our finance team will verify the twin transactions with the payment gateway logs.</li>
              <li>Upon verification, the duplicate / excess payment will be <strong>fully refunded</strong> to the original payment instrument.</li>
              <li>Duplicate refunds are initiated within <strong>5–7 business days</strong> of verification.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="refund-processing-time" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">8</span>
              <h2 className="legal-section-heading">Refund Processing Time</h2>
            </div>

            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <CreditCard size={18} aria-hidden="true" />
                <span>Standard Turnaround Timeline</span>
              </div>
              <p className="legal-callout-text">
                Approved refunds are typically processed and credited within <strong>{LEGAL_CONFIG.refundPolicy.processingTimeline}</strong> from the date of refund approval.
              </p>
            </div>

            <p className="legal-paragraph">
              Please note the processing mechanics across various payment channels:
            </p>
            <ul className="legal-list">
              <li><strong>Original Payment Method:</strong> All refunds are issued strictly back to the original payment source (same bank account, credit card, debit card, or UPI ID) used during registration. We do not issue cash refunds or third-party transfers.</li>
              <li><strong>Banking Processing Cycles:</strong> While {LEGAL_CONFIG.businessName} initiates approved refunds within 48 to 72 hours, the exact settlement timeline depends on your issuing bank, card network (Visa, Mastercard, RuPay), and payment aggregator settlement cycles.</li>
              <li><strong>Email Notification:</strong> Once the refund instruction is registered with the payment gateway, an automated refund confirmation containing the Refund Reference ID will be dispatched to your registered email address.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="refund-procedure" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">9</span>
              <h2 className="legal-section-heading">Refund Request Procedure</h2>
            </div>
            <p className="legal-paragraph">
              To request a refund under any eligible circumstance, please follow this simple procedure:
            </p>
            <ol className="legal-list" style={{ listStyleType: 'decimal' }}>
              <li>
                Send an email from your registered email address to{' '}
                <a href={`mailto:${LEGAL_CONFIG.billingEmail}`} style={{ color: '#1B5E20', fontWeight: 600 }}>
                  {LEGAL_CONFIG.billingEmail}
                </a>.
              </li>
              <li>
                Use the subject line: <strong>&ldquo;Refund Request - [Your Registration ID or Reference ID]&rdquo;</strong>.
              </li>
              <li>
                Include the following essential details in your email body:
                <ul className="legal-list" style={{ marginTop: '8px' }}>
                  <li>Full Name of Attendee</li>
                  <li>Registered Email Address &amp; WhatsApp Number</li>
                  <li>Event Name (e.g. Halal Wealth Summit 2026 or Webinar Title)</li>
                  <li>Payment Gateway Transaction ID / Order ID</li>
                  <li>Date and Amount of Payment (INR)</li>
                  <li>Specific Reason for Refund Request (e.g., event postponement, duplicate payment, etc.)</li>
                </ul>
              </li>
            </ol>
            <p className="legal-paragraph">
              Our accounts team will review your submission, cross-reference the transaction with the payment gateway records,
              and update you on the approval status within 2 to 3 business days.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact-information" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">10</span>
              <h2 className="legal-section-heading">Contact Information</h2>
            </div>
            <p className="legal-paragraph">
              For any billing, transaction, or refund queries, please contact our dedicated accounts and support team:
            </p>

            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <strong>Accounts &amp; Billing Email</strong>
                <p>
                  <a href={`mailto:${LEGAL_CONFIG.billingEmail}`}>
                    {LEGAL_CONFIG.billingEmail}
                  </a>
                </p>
                <small style={{ color: '#64748B' }}>Primary channel for refund requests</small>
              </div>

              <div className="legal-contact-item">
                <strong>Support Helpline</strong>
                <p>
                  <a href={`tel:${LEGAL_CONFIG.contactPhone.replace(/\s+/g, '')}`}>
                    {LEGAL_CONFIG.contactPhone}
                  </a>
                </p>
                <small style={{ color: '#64748B' }}>Mon–Fri, 10:00 AM – 5:00 PM IST</small>
              </div>

              <div className="legal-contact-item">
                <strong>WhatsApp Inquiries</strong>
                <p>
                  <a
                    href={`https://wa.me/${LEGAL_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat on WhatsApp
                  </a>
                </p>
                <small style={{ color: '#64748B' }}>Quick operational support</small>
              </div>

              <div className="legal-contact-item">
                <strong>Registered Office</strong>
                <p>{LEGAL_CONFIG.registeredAddress}</p>
                <small style={{ color: '#64748B' }}>Republic of India</small>
              </div>
            </div>
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

