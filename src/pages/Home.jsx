import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, HandCoins, Linkedin, MapPin, Mic2, Users, WalletCards } from 'lucide-react';
import RegistrationModal from '../components/RegistrationModal';
import IslamicPattern from '../components/IslamicPattern';
import barakahLogo from '../assets/Barakah-logo.png';
import summitBackground from '../assets/Basith image.png';


const themes = [['Islamic Finance', WalletCards, 'A principled foundation for modern financial systems.'], ['Halal Investments', ArrowRight, 'Capital that creates lasting, positive impact.'], ['Wealth Management', HandCoins, 'Building resilient prosperity for generations.'], ['Sukuk & Capital Markets', CalendarDays, 'Exploring the future of ethical capital.'], ['Takaful', Users, 'Shared protection built on mutual responsibility.'], ['Ethical Entrepreneurship', Mic2, 'Ideas and enterprise with purpose at the centre.']];
const speakers = [['Mohamed Riyaz', 'State President', 'Solidarity Youth Organisation'], ['Mohamed Hasan', 'Human Resources ', 'MRG Engineering'], ['Abdul Basith', 'Shariah Scholar', 'Islamic Finance Expert'], ['Mohamed Fayaz', 'Software Engineer ', 'MRG Engineering'], ['Kashif Khan', 'Managing Director', 'Islamic Finance Council UK']];
const dayOne = [['08:00 AM', 'Registration & Networking'], ['09:30 AM', 'Opening Ceremony'], ['10:00 AM', 'Keynote Address'], ['11:30 AM', 'Panel Discussion'], ['01:00 PM', 'Lunch & Networking'], ['02:30 PM', 'Technical Sessions'], ['04:30 PM', 'Fireside Chat'], ['06:00 PM', 'Networking Session']];
const Reveal = ({ children, className = '' }) => <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: .65 }}>{children}</motion.div>;

const Home = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(null); const [speakerIndex, setSpeakerIndex] = useState(0); const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => { const target = new Date('2026-11-29T09:00:00+05:30'); const tick = () => { const diff = Math.max(0, target - new Date()); setTime({ days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 }); }; tick(); const timer = setInterval(tick, 1000); const openRegistration = () => setModalOpen(true); window.addEventListener('registration-open', openRegistration); return () => { clearInterval(timer); window.removeEventListener('registration-open', openRegistration); }; }, []);
  const visibleSpeakers = speakers.slice(speakerIndex, speakerIndex + (typeof window !== 'undefined' && window.innerWidth < 700 ? 1 : 5));

  return (
        <main>
          <section className="hero geometric">
            <IslamicPattern className="hero-pattern" />
            <div className="hero-grid">
              <Reveal className="hero-copy">
                <div className="hero-logo-wrap">
                  <img src={barakahLogo} alt="Barakah logo" className="hero-logo" />
                </div>
                <p className="eyebrow">CHENNAI <i>•</i>  29 NOVEMBER 2026</p>
                <h1>HALAL<br /><em>WEALTH</em><br />SUMMIT <span>2026</span></h1>
                <p className="tagline">Shaping Ethical Wealth. Empowering the Future.</p>
                <div className="event-meta">
                  <span><CalendarDays /> NOVEMBER<br /><b>29, 2026</b></span>
                  <span><MapPin /> CHENNAI<br /><b>INDIA</b></span>
                  <span><Users /> <b>400+ ATTENDEES</b></span>
                </div>
                <div className="hero-actions">
                  <button data-register className="gold-button" onClick={() => setModalOpen(true)}>Register now <ArrowRight size={17} /></button>
                  <button className="outline-button">◉ &nbsp; Watch intro</button>
                </div>
              </Reveal>
              <div className="hero-visual">
                <div className="arch-image" role="img" aria-label="Professionals networking at a premium finance conference" style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 42, 34, 0.25), rgba(0, 42, 34, 0.55)), url(${summitBackground})` }} />
                <div className="countdown">
                  <p>THE SUMMIT BEGINS IN</p>
                  <div className="countdown-values">{Object.entries(time).map(([label, value]) => <span key={label}><b>{String(value).padStart(2, '0')}</b><small>{label.toUpperCase()}</small></span>)}</div>
                  </div>
                </div>
              </div>
            </section>
            <section className="stats">
              <div><Users /><b>400<span>+</span></b><small>EXPECTED PARTICIPANTS</small></div>
              <div><Mic2 /><b>20<span>+</span></b><small>EXPERT SPEAKERS</small></div>
              <div><CalendarDays /><b>10<span>+</span></b><small>INSIGHTFUL SESSIONS</small></div>
              <div><HandCoins /><b>1</b><small>DAY OF IMPACT</small></div>
            </section>
            <section id="about" className="about-section geometric">
              <Reveal className="about-copy">
                <p className="eyebrow">ABOUT THE SUMMIT</p>
                <h2>A Movement Towards<br /><em>Ethical & Sustainable</em><br />Prosperity</h2>
                <p>The Halal Wealth Summit brings together global thought leaders, investors, scholars, entrepreneurs and professionals to explore the vast opportunities in Islamic Finance and Halal Investments.</p>
                <button className="text-button">Discover more <ArrowRight size={17} /></button>
              </Reveal>
              <div className="theme-grid">{themes.map(([title, Icon, detail], index) => <motion.button whileHover={{ y: -5 }} key={title} className={`theme-card ${activeTheme === index ? 'selected' : ''}`} onClick={() => setActiveTheme(activeTheme === index ? null : index)}><Icon /><strong>{title}</strong>{activeTheme === index && <small>{detail}</small>}</motion.button>)}</div>
            </section>
            <section id="speakers" className="speakers-section">
              <div className="section-head">
                <div><p className="eyebrow">MEET THE MINDS</p><h2>Key Speakers</h2></div>
                <button className="text-button">View all speakers <ArrowRight size={17} /></button>
              </div>
              <div className="speaker-row">
                <button className="carousel-arrow" onClick={() => setSpeakerIndex(Math.max(0, speakerIndex - 1))}><ChevronLeft /></button>
                {visibleSpeakers.map(([name, role, org], index) => <article className="speaker-card" key={name}><div className={`speaker-photo photo-${speakerIndex + index}`}><span>{name.split(' ').map(word => word[0]).join('').slice(0, 2)}</span></div><h3>{name}</h3><p>{role}</p><small>{org}</small><a href="#contact" aria-label={`${name} LinkedIn`}><Linkedin size={15} /></a></article>)}
                <button className="carousel-arrow" onClick={() => setSpeakerIndex(Math.min(speakers.length - 1, speakerIndex + 1))}><ChevronRight /></button>
              </div>
            </section>
            <section id="agenda" className="agenda-section geometric">
              <div className="section-head">
                <div><p className="eyebrow">PLAN YOUR EXPERIENCE</p><h2>Agenda Overview</h2></div>
              </div>
              <div className="agenda-layout">
                <div className="timeline">{dayOne.map(([timeLabel, title]) => <div className="timeline-item" key={timeLabel}><time>{timeLabel}</time><span /><strong>{title}</strong></div>)}</div>
                <aside className="agenda-note"><CalendarDays /><p>29 NOVEMBER 2026</p><strong>CHENNAI, INDIA</strong><button className="gold-button">Learn more</button></aside>
              </div>
            </section>
            <section className="cta geometric">
              <p className="eyebrow">THE NEXT CHAPTER STARTS HERE</p>
              <h2>Be Part of the Future of <em>Halal Wealth</em></h2>
              <p>Learn. Connect. Invest. Grow.</p>
              <button className="gold-button" onClick={() => setModalOpen(true)}>Register now <ArrowRight size={17} /></button>
              <small>Limited Seats Available</small>
            </section>
            <footer id="contact" className="footer">
              <div><p className="eyebrow">VENUE</p><strong>Chennai, India</strong><small>Venue details coming soon</small></div>
              <div><p className="eyebrow">EMAIL</p><strong>info@halalwealthsummit.com</strong></div>
              <div><p className="eyebrow">WHATSAPP / CALL</p><strong>+91 12345 67890</strong></div>
              <div><p className="eyebrow">FOLLOW US</p><div className="socials"><Linkedin /><span>𝕏</span><span>◎</span><span>◉</span></div></div>
              <div className="footer-bottom"><span>© 2026 Halal Wealth Summit. All Rights Reserved.</span><span>Privacy Policy &nbsp; | &nbsp; Terms & Conditions</span></div>
            </footer>
          <RegistrationModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
};

export default Home;
