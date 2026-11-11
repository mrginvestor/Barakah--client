import { Link, useLocation } from 'react-router-dom';
import { Linkedin, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { LEGAL_CONFIG } from '../config/legalConfig';

export default function Footer() {
  const location = useLocation();

  const handleContactClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer id="contact" className="footer" role="contentinfo" aria-label="Site Footer">
      <div>
        <p className="eyebrow">VENUE</p>
        <strong>{LEGAL_CONFIG.city}, {LEGAL_CONFIG.country}</strong>
        <small>Venue details coming soon</small>
      </div>

      <div>
        <p className="eyebrow">EMAIL</p>
        <strong>
          <a
            href={`mailto:${LEGAL_CONFIG.contactEmail}`}
            style={{ color: '#FFFFFF', textDecoration: 'none' }}
            title={`Email ${LEGAL_CONFIG.contactEmail}`}
          >
            {LEGAL_CONFIG.contactEmail}
          </a>
        </strong>
        <small>Official Communications</small>
      </div>

      <div>
        <p className="eyebrow">WHATSAPP / CALL</p>
        <strong>
          <a
            href={`tel:${LEGAL_CONFIG.contactPhone.replace(/\s+/g, '')}`}
            style={{ color: '#FFFFFF', textDecoration: 'none' }}
            title={`Call ${LEGAL_CONFIG.contactPhone}`}
          >
            {LEGAL_CONFIG.contactPhone}
          </a>
        </strong>
        <small>
          <a
            href={`https://wa.me/${LEGAL_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#A5D6A7', textDecoration: 'underline' }}
          >
            Chat on WhatsApp
          </a>
        </small>
      </div>

      <div>
        <p className="eyebrow">FOLLOW US</p>
        <div className="socials" aria-label="Social media channels">
          <a
            href="https://www.youtube.com/@ethicalfinancebasithtamil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube Channel"
            title="Halal Wealth on YouTube"
            style={{ color: '#D4AF5A' }}
          >
            <span>▶</span>
          </a>
          <a
            href="https://www.instagram.com/ethicalfinancebasith.tamil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Profile"
            title="Halal Wealth on Instagram"
            style={{ color: '#D4AF5A' }}
          >
            <span>◎</span>
          </a>
          <a
            href="https://chat.whatsapp.com/DNaN5HnNifI3eQ5yv265i9?s=cl&p=a&mlu=4&ilr=4&iam=2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Community"
            title="Join Halal Wealth WhatsApp Community"
            style={{ color: '#D4AF5A' }}
          >
            <span>💬</span>
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Page"
            title="Halal Wealth on LinkedIn"
            style={{ color: '#D4AF5A' }}
          >
            <Linkedin size={18} />
          </a>
        </div>
        <small style={{ marginTop: '8px', display: 'block', color: 'rgba(255,255,255,0.7)' }}>
          Ethical &amp; Shariah-Compliant Finance
        </small>
      </div>

      <div className="footer-bottom">
        <span>
          &copy; 2026 {LEGAL_CONFIG.brandName}. All Rights Reserved.
        </span>

        <nav aria-label="Legal & Policy Links" className="footer-legal-nav">
          <Link to="/terms-and-conditions" className="footer-legal-link">
            Terms &amp; Conditions
          </Link>
          <span className="footer-sep" aria-hidden="true">&bull;</span>
          <Link to="/privacy-policy" className="footer-legal-link">
            Privacy Policy
          </Link>
          <span className="footer-sep" aria-hidden="true">&bull;</span>
          <Link to="/refund-policy" className="footer-legal-link">
            Refund &amp; Cancellation Policy
          </Link>
          <span className="footer-sep" aria-hidden="true">&bull;</span>
          <Link to="/#contact" onClick={handleContactClick} className="footer-legal-link">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}

