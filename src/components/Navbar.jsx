import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const Navbar = ({ onRegister = () => window.dispatchEvent(new CustomEvent('registration-open')) }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  const links = ['About', 'Agenda', 'Speakers', 'Sponsors', 'Venue', 'Contact'];
  const jump = (id) => { setOpen(false); document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">✦</span><span>BARAKAH<small>SUMMIT 2026</small></span></Link>
        <div className="nav-links"><button className="nav-link active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>{links.map((link) => <button className="nav-link" key={link} onClick={() => jump(link)}>{link}</button>)}</div>
        <button className="nav-register" onClick={onRegister}>Register now <ArrowUpRight size={16} /></button>
        <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="mobile-menu"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>{links.map((link) => <button key={link} onClick={() => jump(link)}>{link}</button>)}<button className="nav-register" onClick={() => { setOpen(false); onRegister(); }}>Register now <ArrowUpRight size={16} /></button></div>}
    </nav>
  );
};

export default Navbar;
