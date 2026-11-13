import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Footer from '../components/Footer';
import { LEGAL_CONFIG } from '../config/legalConfig';
import './LegalPage.css';

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
    <div className="legal-page-root">
      <main className="legal-document-container" id="main-content">
        {/* Header */}
        <header className="legal-doc-header">
          <div className="legal-doc-kicker">
            <Link to="/">Halal Wealth</Link>
            <span className="legal-doc-kicker-sep">/</span>
            <span>Legal</span>
          </div>
          <h1 className="legal-doc-title">Terms &amp; Conditions</h1>
          <p className="legal-doc-intro">
            These Terms &amp; Conditions govern your access to and use of {LEGAL_CONFIG.websiteUrl},
            including event registrations, educational programmes, webinars, summits, and digital materials
            organized by {LEGAL_CONFIG.businessName}.
          </p>
          <div className="legal-doc-meta">
            <span>Last updated: <strong>{LEGAL_CONFIG.lastUpdated}</strong></span>
            <span className="legal-doc-meta-dot">&bull;</span>
            <span>Effective: <strong>{LEGAL_CONFIG.effectiveDate}</strong></span>
            <span className="legal-doc-meta-dot">&bull;</span>
            <span>Jurisdiction: <strong>India</strong></span>
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
              Welcome to <strong>{LEGAL_CONFIG.businessName}</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
              By accessing or using our website located at{' '}
              <a href={LEGAL_CONFIG.websiteUrl} target="_blank" rel="noopener noreferrer">
                {LEGAL_CONFIG.websiteUrl}
              </a>
              , registering for the Halal Wealth Summit, enrolling in our educational webinars, or engaging with our content,
              you agree to be bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;).
            </p>
            <p className="legal-prose">
              If you do not agree with any part of these Terms, you must refrain from using this website and from registering
              for any of our summits, webinars, or events. Please read these Terms carefully alongside our{' '}
              <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
              <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="about-services" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">2.</span>
              <span>About Our Services</span>
            </h2>
            <p className="legal-prose">
              {LEGAL_CONFIG.businessName} is an educational initiative committed to advancing ethical finance literacy,
              promoting awareness around Shariah-compliant investments, and empowering communities with principled financial education.
            </p>
            <p className="legal-prose">Our primary business activities and services include:</p>
            <ul className="legal-bullet-list">
              <li>Organising in-person conferences and summits, including the flagship Halal Wealth Summit.</li>
              <li>Hosting live and recorded online webinars on Shariah-compliant investments, personal finance, zakat, and wealth planning.</li>
              <li>Publishing educational articles, research perspectives, curriculum materials, and informational guides.</li>
              <li>Facilitating networking opportunities among professionals, entrepreneurs, and ethical investors.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="eligibility-registration" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">3.</span>
              <span>Eligibility and Registration</span>
            </h2>
            <p className="legal-prose">
              To register for our summit or webinars, you must be at least 18 years of age or possess legal parental or guardian
              consent under applicable Indian laws. By submitting a registration form, you represent and warrant that:
            </p>
            <ul className="legal-bullet-list">
              <li>All information provided during registration (including full name, email, WhatsApp number, and professional details) is truthful, accurate, and complete.</li>
              <li>You will maintain and promptly update your contact details to ensure timely delivery of event updates and joining credentials.</li>
              <li>Each registration is personal to the designated attendee. Registrations cannot be transferred, resold, or assigned to another individual without prior written approval from {LEGAL_CONFIG.businessName}.</li>
              <li>We reserve the right to decline or cancel any registration that contains fraudulent, misleading, or abusive information.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="registration-fees" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">4.</span>
              <span>Registration Fees and Payments</span>
            </h2>
            <p className="legal-prose">
              Where an event, summit pass, or webinar requires a registration fee, the fee will be clearly displayed
              in Indian Rupees (INR) on the registration or checkout page prior to purchase. Applicable statutory taxes
              (such as Goods and Services Tax, GST, where applicable) will be disclosed during the checkout process.
            </p>

            <div className="legal-editorial-note">
              <div className="legal-editorial-note-title">Third-Party Payment Gateway Processing</div>
              <p>
                All summit and event registration payments are processed securely through Reserve Bank of India (RBI)
                authorized third-party payment aggregators and payment gateways (including, but not limited to, Razorpay,
                Cashfree, or other authorized payment partners).
              </p>
              <p>
                <strong>{LEGAL_CONFIG.businessName} does not collect, access, handle, or store sensitive payment credentials</strong>,
                such as complete debit or credit card numbers, CVV numbers, card expiry dates, net banking passwords, or UPI PINs.
                All transactions are encrypted under industry-standard TLS protocols and processed in compliance with
                PCI-DSS standards by the respective payment gateway.
              </p>
            </div>

            <p className="legal-prose">
              Upon successful payment authorization by the payment gateway, a booking confirmation containing your Registration ID or Reference ID
              will be issued on-screen and dispatched to your registered email address. If funds are deducted from your account
              but a confirmation is not received due to a communication interruption, please consult our{' '}
              <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 5 */}
          <section id="event-participation" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">5.</span>
              <span>Event Participation</span>
            </h2>
            <p className="legal-prose">
              We strive to maintain a respectful, welcoming, and intellectually enriching environment across all in-person sessions,
              online webinars, and community discussion channels. By attending our events, you agree to:
            </p>
            <ul className="legal-bullet-list">
              <li>Conduct yourself in a professional, courteous, and Shariah-aligned manner, respecting speakers, fellow participants, and organisers.</li>
              <li>Refrain from any form of harassment, hate speech, disruptive behaviour, political agitation, or unsolicited commercial solicitation.</li>
              <li>Follow the instructions of summit coordinators, venue security, and webinar moderators.</li>
            </ul>
            <p className="legal-prose">
              {LEGAL_CONFIG.businessName} reserves the absolute right to deny admission, mute, or remove any participant
              whose conduct violates these standards or poses a disruption, without any obligation to provide a refund.
            </p>
          </section>

          {/* Section 6 */}
          <section id="event-postponement" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">6.</span>
              <span>Event Postponement or Cancellation</span>
            </h2>
            <p className="legal-prose">
              While we make every endeavor to host all scheduled summits and webinars as planned, unforeseen events may necessitate
              a change in date, venue, speaker line-up, format (e.g. transitioning from in-person to virtual), or outright cancellation.
              Such causes may include, without limitation: acts of God, extreme weather, government regulations, administrative directives,
              technical infrastructure outages, or speaker medical emergencies.
            </p>
            <p className="legal-prose">
              In the event of a postponement or rescheduling, existing registrations automatically remain valid for the revised date.
              Participants unable to attend on the revised date are eligible to submit a refund request in accordance with the terms
              detailed in our <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section id="educational-disclaimer" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">7.</span>
              <span>Educational Disclaimer</span>
            </h2>

            <div className="legal-editorial-note">
              <div className="legal-editorial-note-title">Educational &amp; Non-Advisory Notice</div>
              <p>
                <strong>{LEGAL_CONFIG.businessName} does not guarantee any investment returns, profits, or specific financial outcomes.</strong>
              </p>
              <p>
                All information presented at the Halal Wealth Summit, webinars, recorded sessions, presentations, articles,
                and digital guides is provided <strong>strictly for general educational and informational awareness purposes only</strong>.
              </p>
              <p>
                None of the content, speeches, or materials constitute personalized financial advice, investment recommendations,
                legal counsel, tax advisory, or formal religious rulings (fatwa). Every financial instrument carries inherent risk.
                Participants are strongly encouraged to conduct independent due diligence and consult licensed financial advisors,
                qualified legal counsel, and recognized Shariah scholars before making any investment or wealth management decisions.
              </p>
            </div>

            <p className="legal-prose">
              Any opinions expressed by guest speakers, panelists, sponsors, or attendees reflect their individual viewpoints
              and do not necessarily reflect the official stance or endorsement of {LEGAL_CONFIG.businessName}.
            </p>
          </section>

          {/* Section 8 */}
          <section id="intellectual-property" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">8.</span>
              <span>Intellectual Property</span>
            </h2>
            <p className="legal-prose">
              All materials published on {LEGAL_CONFIG.websiteUrl} and distributed during summits or webinars—including text,
              logos, branding, slide decks, curriculum frameworks, graphics, video recordings, and audio content—are the intellectual
              property of {LEGAL_CONFIG.businessName} or its respective licensors and speakers, protected under Indian and international
              copyright and trademark laws.
            </p>
            <p className="legal-prose">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access event materials solely for your
              personal, non-commercial educational use. You may not record, copy, reproduce, rebroadcast, distribute, modify, create
              derivative works of, or exploit commercially any content without our prior express written permission.
            </p>
          </section>

          {/* Section 9 */}
          <section id="third-party-services" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">9.</span>
              <span>Third-Party Services</span>
            </h2>
            <p className="legal-prose">
              Our website and event workflows integrate with third-party software and service providers, such as:
            </p>
            <ul className="legal-bullet-list">
              <li>Authorized Payment Gateways (for secure fee processing and transaction settlements).</li>
              <li>Video Conferencing Platforms (e.g. Zoom, for live virtual webinar broadcasts).</li>
              <li>Messaging &amp; Email Delivery Systems (e.g. WhatsApp, SMTP mail services, for reminders and links).</li>
              <li>Social Media Channels (e.g. YouTube, Instagram, LinkedIn).</li>
            </ul>
            <p className="legal-prose">
              Your use of any third-party service is governed by the respective terms of service and privacy policies of those providers.
              {LEGAL_CONFIG.businessName} is not responsible for the availability, uptime, security practices, or actions of third-party platforms.
            </p>
          </section>

          {/* Section 10 */}
          <section id="limitation-liability" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">10.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="legal-prose">
              To the maximum extent permitted by applicable Indian law:
            </p>
            <ul className="legal-bullet-list">
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
          <section id="privacy" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">11.</span>
              <span>Privacy</span>
            </h2>
            <p className="legal-prose">
              We value your personal privacy. Our data collection, usage, and protection practices are comprehensively set forth
              in our <Link to="/privacy-policy">Privacy Policy</Link>,
              which complies with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
              By using our services, you consent to the collection and processing of your information as described therein.
            </p>
          </section>

          {/* Section 12 */}
          <section id="changes-to-terms" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">12.</span>
              <span>Changes to Terms</span>
            </h2>
            <p className="legal-prose">
              We reserve the right to revise, update, or modify these Terms at any time to reflect operational, legal,
              or regulatory changes. When updates are published, we will revise the &ldquo;Last updated&rdquo; date at the top of this page.
              Your continued use of our website or participation in our events following the posting of amended Terms constitutes
              your full acceptance of those changes.
            </p>
          </section>

          {/* Section 13 */}
          <section id="governing-law" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">13.</span>
              <span>Governing Law and Jurisdiction – India</span>
            </h2>
            <p className="legal-prose">
              These Terms, their interpretation, and any disputes, claims, or controversies arising out of or in connection with
              your relationship with {LEGAL_CONFIG.businessName} shall be governed exclusively by and construed in accordance with
              the <strong>laws of the Republic of India</strong>, without regard to conflict of law principles.
            </p>
            <p className="legal-prose">
              You irrevocably agree that the <strong>competent courts situated in {LEGAL_CONFIG.jurisdictionCity}</strong> shall have
              exclusive jurisdiction to adjudicate and settle any dispute, controversy, or proceeding arising under or in relation to these Terms.
            </p>
          </section>

          {/* Section 14 */}
          <section id="contact-information" className="legal-doc-section">
            <h2 className="legal-section-title">
              <span className="legal-section-index">14.</span>
              <span>Contact Information</span>
            </h2>
            <p className="legal-prose">
              If you have any questions, clarifications, feedback, or legal inquiries regarding these Terms &amp; Conditions,
              please reach out to us using our official contact channels:
            </p>

            <div className="legal-contact-list">
              <div className="legal-contact-entry">
                <span className="legal-contact-label">Business Name</span>
                <span className="legal-contact-value">{LEGAL_CONFIG.registeredBusinessName}</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Official Email</span>
                <span className="legal-contact-value">
                  <a href={`mailto:${LEGAL_CONFIG.contactEmail}`}>
                    {LEGAL_CONFIG.contactEmail}
                  </a>
                </span>
                <span className="legal-contact-note">Official inquiries</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Phone / WhatsApp</span>
                <span className="legal-contact-value">
                  <a href={`tel:${LEGAL_CONFIG.contactPhone.replace(/\s+/g, '')}`}>
                    {LEGAL_CONFIG.contactPhone}
                  </a>
                </span>
                <span className="legal-contact-note">Mon–Fri, 10:00 AM – 5:00 PM IST</span>
              </div>

              <div className="legal-contact-entry">
                <span className="legal-contact-label">Registered Office</span>
                <span className="legal-contact-value">{LEGAL_CONFIG.registeredAddress}</span>
                <span className="legal-contact-note">Republic of India</span>
              </div>
            </div>
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
