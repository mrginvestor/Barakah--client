import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Calendar, ChevronRight, FileText, Info, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import { LEGAL_CONFIG } from '../config/legalConfig';
import './LegalPage.css';

const SECTIONS = [
  { id: 'introduction', num: '1', title: 'Introduction' },
  { id: 'about-services', num: '2', title: 'About Our Services' },
  { id: 'eligibility-registration', num: '3', title: 'Eligibility and Registration' },
  { id: 'registration-fees', num: '4', title: 'Registration Fees and Payments' },
  { id: 'event-participation', num: '5', title: 'Event Participation' },
  { id: 'event-postponement', num: '6', title: 'Event Postponement or Cancellation' },
  { id: 'educational-disclaimer', num: '7', title: 'Educational Disclaimer' },
  { id: 'intellectual-property', num: '8', title: 'Intellectual Property' },
  { id: 'third-party-services', num: '9', title: 'Third-Party Services' },
  { id: 'limitation-liability', num: '10', title: 'Limitation of Liability' },
  { id: 'privacy', num: '11', title: 'Privacy' },
  { id: 'changes-to-terms', num: '12', title: 'Changes to Terms' },
  { id: 'governing-law', num: '13', title: 'Governing Law and Jurisdiction – India' },
  { id: 'contact-information', num: '14', title: 'Contact Information' },
];

export default function TermsAndConditions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    document.title = `Terms & Conditions | ${LEGAL_CONFIG.brandName}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Terms and Conditions for ${LEGAL_CONFIG.brandName} (${LEGAL_CONFIG.websiteUrl}) governing website use, summit registrations, educational webinars, and payment gateway transactions.`
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
            <span aria-current="page">Terms &amp; Conditions</span>
          </nav>

          <p className="legal-hero-eyebrow">HALAL WEALTH &bull; LEGAL TERMS</p>
          <h1 className="legal-hero-title">Terms &amp; Conditions</h1>
          <p className="legal-hero-desc">
            These Terms &amp; Conditions govern your access to and use of {LEGAL_CONFIG.websiteUrl},
            including event registrations, educational programmes, webinars, summits, and digital materials
            organized by {LEGAL_CONFIG.businessName}.
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
              Jurisdiction: India
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="legal-content-container" id="main-content">
        {/* Quick Navigation / Table of Contents */}
        <nav className="legal-toc-card" aria-label="Table of Contents">
          <div className="legal-toc-header">
            <h2 className="legal-toc-title">
              <Info size={16} aria-hidden="true" />
              Table of Contents
            </h2>
            <small style={{ color: '#4A5568', fontSize: '12px' }}>14 Sections</small>
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
              Welcome to <strong>{LEGAL_CONFIG.businessName}</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
              By accessing or using our website located at{' '}
              <a href={LEGAL_CONFIG.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1B5E20' }}>
                {LEGAL_CONFIG.websiteUrl}
              </a>
              , registering for the Halal Wealth Summit, enrolling in our educational webinars, or engaging with our content,
              you agree to be bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;).
            </p>
            <p className="legal-paragraph">
              If you do not agree with any part of these Terms, you must refrain from using this website and from registering
              for any of our summits, webinars, or events. Please read these Terms carefully alongside our{' '}
              <Link to="/privacy-policy" style={{ color: '#1B5E20', fontWeight: 600 }}>Privacy Policy</Link> and{' '}
              <Link to="/refund-policy" style={{ color: '#1B5E20', fontWeight: 600 }}>Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="about-services" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2 className="legal-section-heading">About Our Services</h2>
            </div>
            <p className="legal-paragraph">
              {LEGAL_CONFIG.businessName} is an educational initiative committed to advancing ethical finance literacy,
              promoting awareness around Shariah-compliant investments, and empowering communities with principled financial education.
            </p>
            <p className="legal-paragraph">Our primary business activities and services include:</p>
            <ul className="legal-list">
              <li>Organising in-person conferences and summits, including the flagship Halal Wealth Summit.</li>
              <li>Hosting live and recorded online webinars on Shariah-compliant investments, personal finance, zakat, and wealth planning.</li>
              <li>Publishing educational articles, research perspectives, curriculum materials, and informational guides.</li>
              <li>Facilitating networking opportunities among professionals, entrepreneurs, and ethical investors.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="eligibility-registration" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2 className="legal-section-heading">Eligibility and Registration</h2>
            </div>
            <p className="legal-paragraph">
              To register for our summit or webinars, you must be at least 18 years of age or possess legal parental/guardian
              consent under applicable Indian laws. By submitting a registration form, you represent and warrant that:
            </p>
            <ul className="legal-list">
              <li>All information provided during registration (including full name, email, WhatsApp number, and professional details) is truthful, accurate, and complete.</li>
              <li>You will maintain and promptly update your contact details to ensure timely delivery of event updates and joining credentials.</li>
              <li>Each registration is personal to the designated attendee. Registrations cannot be transferred, resold, or assigned to another individual without prior written approval from {LEGAL_CONFIG.businessName}.</li>
              <li>We reserve the right to decline or cancel any registration that contains fraudulent, misleading, or abusive information.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="registration-fees" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2 className="legal-section-heading">Registration Fees and Payments</h2>
            </div>
            <p className="legal-paragraph">
              Where an event, summit pass, or webinar requires a registration fee, the fee will be clearly displayed
              in Indian Rupees (INR) on the registration or checkout page prior to purchase. Applicable statutory taxes
              (such as Goods and Services Tax, GST, where applicable) will be disclosed during the checkout process.
            </p>

            <div className="legal-callout-box">
              <div className="legal-callout-header">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Third-Party Payment Gateway Processing</span>
              </div>
              <p className="legal-callout-text">
                All summit and event registration payments are processed securely through Reserve Bank of India (RBI)
                authorized third-party payment aggregators and payment gateways (including, but not limited to, Razorpay,
                Cashfree, or other authorized payment partners).
              </p>
              <p className="legal-callout-text" style={{ marginTop: '8px' }}>
                <strong>{LEGAL_CONFIG.businessName} does not collect, access, handle, or store sensitive payment credentials</strong>,
                such as complete debit/credit card numbers, CVV numbers, card expiry dates, net banking passwords, or UPI PINs.
                All transactions are encrypted under industry-standard TLS protocols and processed in compliance with
                PCI-DSS standards by the respective payment gateway.
              </p>
            </div>

            <p className="legal-paragraph">
              Upon successful payment authorization by the payment gateway, a booking confirmation containing your Registration ID / Reference ID
              will be issued on-screen and dispatched to your registered email address. If funds are deducted from your account
              but a confirmation is not received due to a communication interruption, please consult our{' '}
              <Link to="/refund-policy" style={{ color: '#1B5E20', fontWeight: 600 }}>Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 5 */}
          <section id="event-participation" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2 className="legal-section-heading">Event Participation</h2>
            </div>
            <p className="legal-paragraph">
              We strive to maintain a respectful, welcoming, and intellectually enriching environment across all in-person sessions,
              online webinars, and community discussion channels. By attending our events, you agree to:
            </p>
            <ul className="legal-list">
              <li>Conduct yourself in a professional, courteous, and Shariah-aligned manner, respecting speakers, fellow participants, and organisers.</li>
              <li>Refrain from any form of harassment, hate speech, disruptive behaviour, political agitation, or unsolicited commercial solicitation.</li>
              <li>Follow the instructions of summit coordinators, venue security, and webinar moderators.</li>
            </ul>
            <p className="legal-paragraph">
              {LEGAL_CONFIG.businessName} reserves the absolute right to deny admission, mute, or remove any participant
              whose conduct violates these standards or poses a disruption, without any obligation to provide a refund.
            </p>
          </section>

          {/* Section 6 */}
          <section id="event-postponement" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2 className="legal-section-heading">Event Postponement or Cancellation</h2>
            </div>
            <p className="legal-paragraph">
              While we make every endeavor to host all scheduled summits and webinars as planned, unforeseen events may necessitate
              a change in date, venue, speaker line-up, format (e.g. transitioning from in-person to virtual), or outright cancellation.
              Such causes may include, without limitation: acts of God, extreme weather, government regulations, administrative directives,
              technical infrastructure outages, or speaker medical emergencies.
            </p>
            <p className="legal-paragraph">
              In the event of a postponement or rescheduling, existing registrations automatically remain valid for the revised date.
              Participants unable to attend on the revised date are eligible to submit a refund request in accordance with the terms
              detailed in our <Link to="/refund-policy" style={{ color: '#1B5E20', fontWeight: 600 }}>Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section id="educational-disclaimer" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">7</span>
              <h2 className="legal-section-heading">Educational Disclaimer</h2>
            </div>

            <div className="legal-callout-box legal-callout-box--warning">
              <div className="legal-callout-header">
                <Info size={18} aria-hidden="true" />
                <span>Crucial Financial &amp; Legal Notice</span>
              </div>
              <p className="legal-callout-text">
                <strong>{LEGAL_CONFIG.businessName} does not guarantee any investment returns, profits, or specific financial outcomes.</strong>
              </p>
              <p className="legal-callout-text" style={{ marginTop: '8px' }}>
                All information presented at the Halal Wealth Summit, webinars, recorded sessions, presentations, articles,
                and digital guides is provided <strong>strictly for general educational and informational awareness purposes only</strong>.
              </p>
              <p className="legal-callout-text" style={{ marginTop: '8px' }}>
                None of the content, speeches, or materials constitute personalized financial advice, investment recommendations,
                legal counsel, tax advisory, or formal religious rulings (fatwa). Every financial instrument carries inherent risk.
                Participants are strongly encouraged to conduct independent due diligence and consult licensed financial advisors,
                qualified legal counsel, and recognized Shariah scholars before making any investment or wealth management decisions.
              </p>
            </div>

            <p className="legal-paragraph">
              Any opinions expressed by guest speakers, panelists, sponsors, or attendees reflect their individual viewpoints
              and do not necessarily reflect the official stance or endorsement of {LEGAL_CONFIG.businessName}.
            </p>
          </section>

          {/* Section 8 */}
          <section id="intellectual-property" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">8</span>
              <h2 className="legal-section-heading">Intellectual Property</h2>
            </div>
            <p className="legal-paragraph">
              All materials published on {LEGAL_CONFIG.websiteUrl} and distributed during summits or webinars—including text,
              logos, branding, slide decks, curriculum frameworks, graphics, video recordings, and audio content—are the intellectual
              property of {LEGAL_CONFIG.businessName} or its respective licensors and speakers, protected under Indian and international
              copyright and trademark laws.
            </p>
            <p className="legal-paragraph">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access event materials solely for your
              personal, non-commercial educational use. You may not record, copy, reproduce, rebroadcast, distribute, modify, create
              derivative works of, or exploit commercially any content without our prior express written permission.
            </p>
          </section>

          {/* Section 9 */}
          <section id="third-party-services" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">9</span>
              <h2 className="legal-section-heading">Third-Party Services</h2>
            </div>
            <p className="legal-paragraph">
              Our website and event workflows integrate with third-party software and service providers, such as:
            </p>
            <ul className="legal-list">
              <li>Authorized Payment Gateways (for secure fee processing and transaction settlements).</li>
              <li>Video Conferencing Platforms (e.g. Zoom, for live virtual webinar broadcasts).</li>
              <li>Messaging &amp; Email Delivery Systems (e.g. WhatsApp, SMTP mail services, for reminders and links).</li>
              <li>Social Media Channels (e.g. YouTube, Instagram, LinkedIn).</li>
            </ul>
            <p className="legal-paragraph">
              Your use of any third-party service is governed by the respective terms of service and privacy policies of those providers.
              {LEGAL_CONFIG.businessName} is not responsible for the availability, uptime, security practices, or actions of third-party platforms.
            </p>
          </section>

          {/* Section 10 */}
          <section id="limitation-liability" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">10</span>
              <h2 className="legal-section-heading">Limitation of Liability</h2>
            </div>
            <p className="legal-paragraph">
              To the maximum extent permitted by applicable Indian law:
            </p>
            <ul className="legal-list">
              <li>
                {LEGAL_CONFIG.businessName}, its organizers, directors, speakers, and affiliates shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including loss of profits, investment losses, data loss,
                or business disruption arising out of your access to or inability to access our website, events, or materials.
              </li>
              <li>
                In all circumstances, our aggregate liability arising out of or related to any event registration or use of our services
                shall be strictly limited to the actual registration fee paid by you for the specific event giving rise to the claim.
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section id="privacy" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">11</span>
              <h2 className="legal-section-heading">Privacy</h2>
            </div>
            <p className="legal-paragraph">
              We value your personal privacy. Our data collection, usage, and protection practices are comprehensively set forth
              in our <Link to="/privacy-policy" style={{ color: '#1B5E20', fontWeight: 600 }}>Privacy Policy</Link>,
              which complies with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
              By using our services, you consent to the collection and processing of your information as described therein.
            </p>
          </section>

          {/* Section 12 */}
          <section id="changes-to-terms" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">12</span>
              <h2 className="legal-section-heading">Changes to Terms</h2>
            </div>
            <p className="legal-paragraph">
              We reserve the right to revise, update, or modify these Terms at any time to reflect operational, legal,
              or regulatory changes. When updates are published, we will revise the &ldquo;Last Updated&rdquo; date at the top of this page.
              Your continued use of our website or participation in our events following the posting of amended Terms constitutes
              your full acceptance of those changes.
            </p>
          </section>

          {/* Section 13 */}
          <section id="governing-law" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">13</span>
              <h2 className="legal-section-heading">Governing Law and Jurisdiction – India</h2>
            </div>
            <p className="legal-paragraph">
              These Terms, their interpretation, and any disputes, claims, or controversies arising out of or in connection with
              your relationship with {LEGAL_CONFIG.businessName} shall be governed exclusively by and construed in accordance with
              the <strong>laws of the Republic of India</strong>, without regard to conflict of law principles.
            </p>
            <p className="legal-paragraph">
              You irrevocably agree that the <strong>competent courts situated in {LEGAL_CONFIG.jurisdictionCity}</strong> shall have
              exclusive jurisdiction to adjudicate and settle any dispute, controversy, or proceeding arising under or in relation to these Terms.
            </p>
          </section>

          {/* Section 14 */}
          <section id="contact-information" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-section-num">14</span>
              <h2 className="legal-section-heading">Contact Information</h2>
            </div>
            <p className="legal-paragraph">
              If you have any questions, clarifications, feedback, or legal inquiries regarding these Terms &amp; Conditions,
              please reach out to us using our official contact channels:
            </p>

            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <strong>Business Name</strong>
                <p>{LEGAL_CONFIG.registeredBusinessName}</p>
              </div>

              <div className="legal-contact-item">
                <strong>Official Email</strong>
                <p>
                  <a href={`mailto:${LEGAL_CONFIG.contactEmail}`}>
                    {LEGAL_CONFIG.contactEmail}
                  </a>
                </p>
              </div>

              <div className="legal-contact-item">
                <strong>Phone / WhatsApp</strong>
                <p>
                  <a href={`tel:${LEGAL_CONFIG.contactPhone.replace(/\s+/g, '')}`}>
                    {LEGAL_CONFIG.contactPhone}
                  </a>
                </p>
              </div>

              <div className="legal-contact-item">
                <strong>Registered Location</strong>
                <p>{LEGAL_CONFIG.registeredAddress}</p>
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

