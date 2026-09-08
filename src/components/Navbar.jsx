import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import barakahLogo from '../assets/Barakah-logo.png';

const Navbar = ({ onRegister = () => window.dispatchEvent(new CustomEvent('registration-open')) }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  const links = ['About', 'Agenda', 'Speakers', 'Sponsors', 'Venue', 'Contact'];
  const jump = (id) => { setOpen(false); document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="Barakah Summit Home">
          <span className="brand-logo-wrap"><img src={barakahLogo} alt="Barakah icon" className="brand-logo" /></span>
          <span className="brand-text"><strong>HALAL<br /><b>WEALTH</b><small>SUMMIT 2026</small></strong></span>
        </Link>
        <div className="nav-links"><button className="nav-link active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>{links.map((link) => <button className="nav-link" key={link} onClick={() => jump(link)}>{link}</button>)}</div>
        <Link to="/webinar-register" className="nav-register nav-register--webinar">Register for Webinar <ArrowUpRight size={16} /></Link>
        <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="mobile-menu"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>{links.map((link) => <button key={link} onClick={() => jump(link)}>{link}</button>)}<Link className="nav-register nav-register--webinar" to="/webinar-register" onClick={() => setOpen(false)}>Register for Webinar <ArrowUpRight size={16} /></Link></div>}
    </nav>
  );
};

export default Navbar;
