import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  MapPin,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Award,
  Sparkles,
  PieChart,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  X,
  Maximize2,
  Share2,
  Compass,
  FileCheck,
  Check,
} from 'lucide-react';
import API_URL from '../config/api';
import barakahLogo from '../assets/Barakah-logo.png';
import speakerPhoto from '../assets/Basith image.png';
import posterImg from '../assets/investor-mission-poster.jpg';
import './InvestorMissionLandingPage.css';

export default function InvestorMissionLandingPage() {
  const [capacity, setCapacity] = useState({
    maxCapacity: 50,
    registrationFee: 500,
    availableSeats: 50,
    isSoldOut: false,
    loading: true,
  });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    document.title = 'INVESTOR MISSION 2026 | The Halal Way of Investing | SIO Coimbatore & Halal Wealth';
    let isMounted = true;

    axios
      .get(`${API_URL}/api/investor-mission/availability`)
      .catch(() => axios.get(`${API_URL}/api/dec-summit/availability`))
      .catch(() => axios.get(`${API_URL}/api/small-summit/availability`))
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCapacity({
            maxCapacity: res.data.maxCapacity || 50,
            registrationFee: res.data.registrationFee || 500,
            availableSeats: res.data.availableSeats ?? 50,
            isSoldOut: Boolean(res.data.isSoldOut) || (res.data.availableSeats !== undefined && res.data.availableSeats <= 0),
            loading: false,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load Investor Mission capacity:', err);
        if (isMounted) setCapacity((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'INVESTOR MISSION 2026 – The Halal Way of Investing',
        text: 'Join Abdul Basith (Licensed Financial Consultant) on Sunday, 06 Dec 2026 in Coimbatore. Limited to 50 seats.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const learningThemes = [
    {
      code: '01',
      title: 'Foundations of Halal Investing',
      subtitle: 'Principles & Core Boundaries',
      desc: 'Understand the fundamental tenets of Islamic finance: why interest (Riba) distorts wealth, the prohibition of excessive uncertainty (Gharar), and identifying permissible commercial activities.',
      takeaways: ['Defining permissible vs impermissible wealth', 'Riba in modern banking vs real trade', 'Gharar & Maysir in speculative assets'],
      icon: BookOpen,
    },
    {
      code: '02',
      title: 'Identifying Halal Investment Opportunities',
      subtitle: 'Screening Standards in Action',
      desc: 'Learn how to filter global and Indian investment avenues using recognized Shariah screening guidelines (AAOIFI, Islamic Indices) to ensure your money works only in permissible businesses.',
      takeaways: ['Business activity screening (core revenue)', 'Financial ratio screening (debt & liquidity thresholds)', 'How to read a Shariah compliance report'],
      icon: CheckCircle2,
    },
    {
      code: '03',
      title: 'Stocks, Mutual Funds and ETFs',
      subtitle: 'Equity Markets & Dividend Purification',
      desc: 'Explore how equity instruments can be assessed from an Islamic standpoint. Discover the exact process of identifying non-permissible dividend components and purifying them responsibly.',
      takeaways: ['Evaluating bluechip & growth stocks', 'Shariah-compliant Mutual Funds & ETFs', 'Practical formula for dividend purification'],
      icon: TrendingUp,
    },
    {
      code: '04',
      title: 'Building Wealth Without Riba',
      subtitle: 'Ethical Alternatives to Debt',
      desc: 'Discover ethical approaches to capital growth that do not rely on fixed interest, debt exploitation, or financial speculation. Learn how genuine profit-and-loss sharing creates sustainable barakah.',
      takeaways: ['Mudarabah & Musharakah principles simplified', 'Real estate vs equities vs precious metals', 'Avoiding interest traps in mortgages & car loans'],
      icon: DollarSign,
    },
    {
      code: '05',
      title: 'Financial Planning & Retirement',
      subtitle: 'Long-term Generational Security',
      desc: 'Develop a disciplined multi-decade strategy for life milestones, children\'s higher education, and retirement without falling back on interest-bearing endowment plans or conventional annuities.',
      takeaways: ['Designing a 20-year halal retirement fund', 'Employer PF, Gratuity & NPS Shariah guidelines', 'Cash flow management for Muslim households'],
      icon: PieChart,
    },
    {
      code: '06',
      title: 'Common Investment Mistakes',
      subtitle: 'Risk Discipline & Scam Avoidance',
      desc: 'Unpack the psychological traps and deceptive schemes that frequently target community investors under the guise of "halal guaranteed returns". Learn to safeguard your hard-earned capital.',
      takeaways: ['Red flags of Ponzi schemes disguised as halal', 'FOMO and crypto-speculation pitfalls', 'Risk diversification and realistic return expectations'],
      icon: AlertCircle,
    },
    {
      code: '07',
      title: 'Zakat, Savings & Wealth Purification',
      subtitle: 'Obligations & Spiritual Growth',
      desc: 'Master the accurate calculation of Zakat across modern assets: equities, retirement accounts, gold, and liquid cash. Learn how giving preserves and multiplies wealth according to the Sunnah.',
      takeaways: ['Accurate Nisab calculation across portfolios', 'Zakat on active trading vs long-term holdings', 'Integrating philanthropy into monthly financial habits'],
      icon: Award,
    },
  ];

  const targetAudiences = [
    {
      num: '01',
      title: 'Students & Beginners',
      desc: 'Looking to build sound early financial awareness, avoid youth debt, and start investing ethically right from their first salary or allowance.',
      tag: 'Early Career',
    },
    {
      num: '02',
      title: 'Young Professionals',
      desc: 'Earning an income and seeking practical, interest-free alternatives for monthly savings, SIPs, emergency funds, and long-term asset growth.',
      tag: 'Salaried',
    },
    {
      num: '03',
      title: 'Business Owners',
      desc: 'Aiming to manage business capital, cash reserves, and corporate growth ethically without relying on interest-heavy working capital loans.',
      tag: 'Commerce',
    },
    {
      num: '04',
      title: 'Entrepreneurs',
      desc: 'Searching for Shariah-conscious fundraising, halal venture structures, equity-sharing agreements, and sustainable expansion models.',
      tag: 'Founders',
    },
    {
      num: '05',
      title: 'Halal Wealth Seekers',
      desc: 'Anyone tired of ambiguous financial advice who wants unequivocal, vetted clarity on what is permissible and what must be strictly avoided.',
      tag: 'Clarity',
    },
    {
      num: '06',
      title: 'Existing Investors',
      desc: 'Already active in the stock market or mutual funds and seeking to audit their portfolios against Shariah financial screening benchmarks.',
      tag: 'Portfolio Audit',
    },
    {
      num: '07',
      title: 'Families & Parents',
      desc: 'Dedicated to securing children\'s education, marriage funds, home ownership, and interest-free retirement without compromising faith.',
      tag: 'Long Term',
    },
  ];

  const faqs = [
    {
      q: 'What is Investor Mission 2026?',
      a: 'Investor Mission 2026 is an exclusive in-person educational conference organized by SIO Coimbatore in collaboration with Halal Wealth. It focuses on the principles of Islamic investing, Shariah screening, building wealth without Riba, and practical long-term financial planning.',
    },
    {
      q: 'When and where is the event taking place?',
      a: 'The event takes place on Sunday, 06 December 2026 in Coimbatore. The specific central venue address will be shared directly with all confirmed registrants alongside their entry pass.',
    },
    {
      q: 'Why is attendance limited to only 50 participants?',
      a: 'To maintain a high-touch, workshop-style editorial atmosphere where every attendee can interact directly with speaker Abdul Basith, ask detailed portfolio questions, and engage in real case studies, seats are strictly capped at 50 confirmed attendees.',
    },
    {
      q: 'How does the ₹500 registration fee work?',
      a: 'The ₹500 fee covers admission, event materials, and refreshments. You can pay online via PhonePe QR / UPI deep link (to ANAS RAHMAN H, 6380413253@ybl) and upload your receipt, or select Offline Payment to settle at the venue.',
    },
    {
      q: 'What language will the session be conducted in?',
      a: 'The presentation and core financial concepts are delivered in clear English, with conversational Tamil explanations and real-world regional context during discussions and Q&A.',
    },
    {
      q: 'Do I need prior financial or stock market experience?',
      a: 'Not at all. The curriculum starts with foundational Islamic ethics and builds systematically towards practical investment strategies. Whether you are a total beginner or an experienced investor, you will gain immense clarity.',
    },
  ];

  return (
    <div className="im-landing-page">
      {/* 1. TOP HEADER & BRAND BAR */}
      <header className="im-header">
        <div className="im-header-inner">
          <div className="im-header-brand">
            <Link to="/" className="im-brand-link" title="Halal Wealth">
              <img src={barakahLogo} alt="Halal Wealth Logo" className="im-brand-logo" />
              <div className="im-brand-text">
                <span className="im-brand-kicker">SIO COIMBATORE &amp; HALAL WEALTH</span>
                <span className="im-brand-title">INVESTOR MISSION 2026</span>
              </div>
            </Link>
          </div>

          <nav className="im-header-nav" aria-label="Page Sections">
            <button type="button" onClick={() => scrollToSection('about')}>Why Mission</button>
            <button type="button" onClick={() => scrollToSection('learning')}>Curriculum</button>
            <button type="button" onClick={() => scrollToSection('webinar')}>Previous Webinar</button>
            <button type="button" onClick={() => scrollToSection('speaker')}>Speaker</button>
            <button type="button" onClick={() => scrollToSection('logistics')}>Logistics</button>
            <button type="button" onClick={() => scrollToSection('faqs')}>FAQs</button>
          </nav>

          <div className="im-header-actions-group">
            <button
              type="button"
              onClick={handleShare}
              className="im-btn-share"
              title="Share event link"
            >
              {copiedLink ? <Check size={14} color="#80DF35" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <Link to="/investor-mission-registration" className="im-btn-header">
              <span>REGISTER NOW</span>
              <span className="im-btn-header-badge">₹500</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="im-hero-section">
          {/* Subtle geometric upward growth accents inspired by the poster */}
          <div className="im-hero-growth-motif" aria-hidden="true" />
          <div className="im-hero-glow" aria-hidden="true" />

          <div className="im-container im-hero-container">
            {/* Left Content */}
            <div className="im-hero-content">
              {/* Tagline Pill */}
              <div className="im-tagline-badge">
                <Sparkles size={13} className="im-tagline-spark" />
                <span>THE HALAL WAY OF</span>
              </div>

              {/* Poster-Inspired Title with Upward Arrow Symbol */}
              <div className="im-hero-title-group">
                <h1 className="im-hero-title">
                  INVESTOR<br />
                  <span className="im-hero-title-highlight">MISSION</span>
                </h1>
                <div className="im-hero-arrow-graphic" aria-hidden="true">
                  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                    <path
                      d="M12 56L12 36C12 24.9543 20.9543 16 32 16L56 16M56 16L40 6M56 16L40 26"
                      stroke="#80DF35"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Year Bar with Poster Line */}
              <div className="im-hero-year-bar">
                <span className="im-hero-year">2026</span>
                <span className="im-hero-year-line" />
              </div>

              <p className="im-hero-subtitle">
                An exclusive educational gathering in Coimbatore designed to help individuals discover a more informed, ethical, and Shariah-conscious approach to investing and long-term wealth creation.
              </p>

              {/* Handcrafted Visual Pills: "Limited Seats Only" & "From Ideas into Impact" */}
              <div className="im-human-notes-bar">
                <div className="im-handwritten-note">
                  <span className="im-hw-text">Limited Seats Only</span>
                  <svg width="34" height="26" viewBox="0 0 40 32" fill="none" className="im-hw-arrow">
                    <path
                      d="M6 4 C 12 18, 22 14, 28 26 M 20 25 L 28 27 L 30 19"
                      stroke="#D8AE54"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="im-ideas-impact-badge">
                  <span>From ideas into Impact</span>
                </div>
              </div>

              {/* Poster-Style Date & Meta Strip */}
              <div className="im-hero-meta-strip">
                <div className="im-date-block">
                  <div className="im-date-eyebrow">2026 Sunday</div>
                  <div className="im-date-row">
                    <strong className="im-date-month">December</strong>
                    <span className="im-date-pill">06</span>
                  </div>
                </div>

                <div className="im-meta-divider" />

                <div className="im-meta-speaker">
                  <span className="im-meta-label">KEYNOTE SPEAKER</span>
                  <strong className="im-meta-speaker-name">abdul basith</strong>
                  <span className="im-meta-speaker-role">Licensed Financial Consultant</span>
                </div>

                <div className="im-meta-divider" />

                <div className="im-meta-seat-counter">
                  <span className="im-meta-label">CONFIRMED CAPACITY</span>
                  <strong className="im-meta-seat-val">
                    {capacity.loading ? '50 Seats' : capacity.isSoldOut ? 'Event Full' : `${capacity.availableSeats} of 50 Left`}
                  </strong>
                  <span className="im-meta-seat-note">Coimbatore Venue</span>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="im-hero-actions">
                <Link
                  to="/investor-mission-registration"
                  className="im-btn-primary"
                  title="Reserve Your Seat for Investor Mission 2026"
                >
                  <span>REGISTER NOW – ₹{capacity.registrationFee}</span>
                  <ArrowRight size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="im-btn-secondary"
                  title="Watch Previous Webinar with Abdul Basith"
                >
                  <Play size={16} fill="currentColor" />
                  <span>PREVIOUS WEBINAR</span>
                </button>
              </div>

              {/* Trust & Collaboration Badge */}
              <div className="im-hero-trust-bar">
                <ShieldCheck size={18} style={{ color: '#80DF35', flexShrink: 0 }} />
                <span>
                  Presented by <strong>SIO Coimbatore</strong> in collaboration with <strong>Halal Wealth</strong>
                </span>
              </div>
            </div>

            {/* Right: Authentic Official Poster Display Frame */}
            <div className="im-hero-poster-column">
              <div className="im-poster-card-wrap">
                <div className="im-poster-label-tag">
                  <Sparkles size={13} />
                  <span>OFFICIAL EVENT POSTER</span>
                </div>

                <div
                  className="im-poster-frame"
                  onClick={() => setIsPosterModalOpen(true)}
                  title="Click to view full high-resolution poster"
                >
                  <img
                    src={posterImg}
                    alt="Investor Mission 2026 Official Poster – SIO Coimbatore"
                    className="im-poster-img"
                    onError={(e) => {
                      e.currentTarget.src = speakerPhoto;
                    }}
                  />
                  <div className="im-poster-hover-overlay">
                    <Maximize2 size={24} color="#FFFFFF" />
                    <span>Click to Zoom Poster</span>
                  </div>
                </div>

                {/* Direct quick action under poster */}
                <div className="im-poster-footer-card">
                  <div className="im-poster-footer-text">
                    <strong>Coimbatore • Sunday 06 Dec</strong>
                    <span>₹500 • Strict 50 Seats Limit</span>
                  </div>
                  <Link
                    to="/investor-mission-registration"
                    className="im-poster-quick-btn"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ABOUT THE MISSION (Human Editorial Story) */}
        <section id="about" className="im-section im-about-section">
          <div className="im-container">
            <div className="im-editorial-header">
              <span className="im-kicker">EDUCATIONAL INITIATIVE</span>
              <h2 className="im-editorial-title">WHY INVESTOR MISSION 2026?</h2>
              <p className="im-editorial-lead">
                Navigating modern financial opportunities without compromising ethical principles, personal faith, or long-term peace of mind.
              </p>
            </div>

            <div className="im-editorial-split">
              <div className="im-editorial-col-left">
                <p className="im-highlight-p">
                  Every day, individuals and young families in our community are surrounded by investment products: index funds, stock tips, crypto schemes, peer-to-peer lending, real estate chit funds, and employer retirement packages.
                </p>
                <p>
                  Yet beneath the promise of returns lies a critical question that few mainstream financial advisors can answer: <strong>"Is this truly permissible, ethical, and Riba-free?"</strong>
                </p>
                <p>
                  <strong>Investor Mission 2026</strong> was conceived by SIO Coimbatore and Halal Wealth to provide grounded, rigorous, and actionable answers. We do not sell financial products or make speculative return guarantees. Our single objective is financial literacy anchored in Islamic principles.
                </p>
              </div>

              <div className="im-editorial-col-right">
                <div className="im-quote-box">
                  <div className="im-quote-mark">“</div>
                  <p className="im-quote-text">
                    Our focus is not simply on accumulating wealth, but on understanding how wealth is lawfully earned, ethically preserved, and responsibly invested while respecting Islamic values.
                  </p>
                  <div className="im-quote-author">
                    <strong>Abdul Basith</strong>
                    <span>Licensed Financial Consultant &amp; Keynote Speaker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Foundational Pillars */}
            <div className="im-pillars-grid">
              <div className="im-pillar-card">
                <div className="im-pillar-badge">PILLAR 01</div>
                <h3>Shariah Consciousness</h3>
                <p>
                  Clear boundaries on avoiding interest (Riba), excessive ambiguity (Gharar), and gambling or exploitation (Maysir) in contemporary banking and equity products.
                </p>
              </div>

              <div className="im-pillar-card">
                <div className="im-pillar-badge">PILLAR 02</div>
                <h3>Practical Literacy</h3>
                <p>
                  Actionable methodologies to evaluate Indian and global stocks, ETFs, mutual funds, real estate contracts, and retirement portfolios on your own terms.
                </p>
              </div>

              <div className="im-pillar-card">
                <div className="im-pillar-badge">PILLAR 03</div>
                <h3>Responsible Growth</h3>
                <p>
                  Balancing lawful earnings, ethical consumption, accurate Zakat obligations, and family security without resorting to interest-bearing debt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 7 THEMES CURRICULUM */}
        <section id="learning" className="im-section im-learning-section">
          <div className="im-container">
            <div className="im-editorial-header">
              <span className="im-kicker">CURRICULUM &amp; WORKSHOP MODULES</span>
              <h2 className="im-editorial-title">WHAT WILL YOU EXPLORE AT INVESTOR MISSION?</h2>
              <p className="im-editorial-lead">
                Seven focused modules designed to give you end-to-end clarity on Islamic personal finance, stock screening, and ethical retirement.
              </p>
            </div>

            <div className="im-curriculum-list">
              {learningThemes.map((theme) => {
                const IconComp = theme.icon;
                return (
                  <div key={theme.code} className="im-curriculum-item">
                    <div className="im-curriculum-num">{theme.code}</div>
                    <div className="im-curriculum-main">
                      <div className="im-curriculum-head">
                        <div>
                          <span className="im-curriculum-sub">{theme.subtitle}</span>
                          <h3 className="im-curriculum-title">{theme.title}</h3>
                        </div>
                        <div className="im-curriculum-icon-wrap">
                          <IconComp size={20} />
                        </div>
                      </div>
                      <p className="im-curriculum-desc">{theme.desc}</p>
                      <div className="im-curriculum-takeaways">
                        {theme.takeaways.map((t, i) => (
                          <span key={i} className="im-takeaway-pill">
                            <CheckCircle2 size={13} className="im-pill-check" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. PREVIOUS WEBINAR SHOWCASE (YOUTUBE RECORDING) */}
        <section id="webinar" className="im-section im-webinar-section">
          <div className="im-container">
            <div className="im-webinar-wrapper">
              <div className="im-webinar-grid">
                {/* Left Info */}
                <div className="im-webinar-details">
                  <div className="im-tagline-badge" style={{ background: 'rgba(128, 223, 53, 0.15)', borderColor: '#80DF35' }}>
                    <Sparkles size={13} className="im-tagline-spark" />
                    <span>ONGOING EDUCATIONAL SESSIONS</span>
                  </div>

                  <h2 className="im-webinar-heading">
                    LEARN FROM OUR PREVIOUS SESSIONS
                  </h2>

                  <p className="im-webinar-intro">
                    Before joining us in Coimbatore, watch our full foundational webinar on <strong>Halal Investments &amp; Retirement Planning</strong> led by speaker Abdul Basith.
                  </p>

                  <div className="im-webinar-key-topics">
                    <h4>Key Discussion Points in the Recording:</h4>
                    <ul>
                      <li><Check size={14} className="im-check-green" /> Shariah-compliant investing principles and screening benchmarks.</li>
                      <li><Check size={14} className="im-check-green" /> Identifying permissible vs prohibited business operations.</li>
                      <li><Check size={14} className="im-check-green" /> Demystifying stocks, index funds, mutual funds, and ETFs.</li>
                      <li><Check size={14} className="im-check-green" /> Building wealth without Riba or speculative debt.</li>
                      <li><Check size={14} className="im-check-green" /> Retirement planning without relying on interest-based schemes.</li>
                      <li><Check size={14} className="im-check-green" /> Balancing spending, emergency savings, and annual Zakat.</li>
                    </ul>
                  </div>

                  <div className="im-webinar-action-row">
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="im-btn-watch-modal"
                    >
                      <Play size={16} fill="currentColor" />
                      <span>WATCH RECORDING IN POPUP</span>
                    </button>

                    <a
                      href="https://youtu.be/dam9grDGDpY?si=MNVFsmet8grttPf0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="im-link-youtube"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Right Interactive Video Card */}
                <div className="im-webinar-media">
                  <div className="im-video-card" onClick={() => setIsVideoModalOpen(true)}>
                    <img
                      src="https://img.youtube.com/vi/dam9grDGDpY/maxresdefault.jpg"
                      alt="Halal Investments and Retirement Planning with Abdul Basith"
                      className="im-video-thumb"
                      onError={(e) => {
                        e.currentTarget.src = speakerPhoto;
                      }}
                    />
                    <div className="im-video-overlay-tint" />
                    <button
                      type="button"
                      className="im-video-play-btn"
                      aria-label="Play Webinar Video"
                    >
                      <Play size={28} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
                    </button>
                    <div className="im-video-caption">
                      <strong>Halal Investments &amp; Retirement Planning</strong>
                      <span>Keynote by Abdul Basith • Full 1-Hour Educational Session</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. KEYNOTE SPEAKER PROFILE */}
        <section id="speaker" className="im-section im-speaker-section">
          <div className="im-container">
            <div className="im-editorial-header">
              <span className="im-kicker">KEYNOTE EXPERT</span>
              <h2 className="im-editorial-title">MEET YOUR SPEAKER</h2>
              <p className="im-editorial-lead">
                Direct insights from an experienced practitioner dedicated to ethical financial education.
              </p>
            </div>

            <div className="im-speaker-card">
              <div className="im-speaker-portrait-wrap">
                <img
                  src={speakerPhoto}
                  alt="Abdul Basith – Licensed Financial Consultant"
                  className="im-speaker-portrait"
                />
                <div className="im-speaker-badge-overlay">
                  <span>KEYNOTE SPEAKER</span>
                </div>
              </div>

              <div className="im-speaker-content">
                <span className="im-speaker-eyebrow">LICENSED FINANCIAL CONSULTANT</span>
                <h3 className="im-speaker-title">abdul basith</h3>
                <p className="im-speaker-role-sub">Islamic Finance Advocate &amp; Ethical Wealth Strategist</p>

                <div className="im-speaker-bio-paragraphs">
                  <p>
                    <strong>Abdul Basith</strong> is a Licensed Financial Consultant who has dedicated his professional career to bridging the gap between modern financial markets and authentic Islamic jurisprudence.
                  </p>
                  <p>
                    Through extensive consulting, workshops, and webinars, he advises salaried professionals, entrepreneurs, and families on structuring their wealth responsibly — proving that adherence to divine principles does not mean sacrificing financial security or growth.
                  </p>
                  <p>
                    At <strong>Investor Mission 2026</strong>, Abdul Basith will deliver direct, practical presentations and facilitate an extended open Q&amp;A session where attendees can bring their real-world investment scenarios.
                  </p>
                </div>

                <div className="im-speaker-pillars-row">
                  <div className="im-speaker-pill">
                    <CheckCircle2 size={16} className="im-pill-icon" />
                    <span>Certified Financial Expertise</span>
                  </div>
                  <div className="im-speaker-pill">
                    <CheckCircle2 size={16} className="im-pill-icon" />
                    <span>Real-World Equity &amp; Portfolio Audits</span>
                  </div>
                  <div className="im-speaker-pill">
                    <CheckCircle2 size={16} className="im-pill-icon" />
                    <span>Actionable, Jargon-Free Guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. TARGET AUDIENCE */}
        <section className="im-section im-audience-section">
          <div className="im-container">
            <div className="im-editorial-header">
              <span className="im-kicker">WHO SHOULD ATTEND?</span>
              <h2 className="im-editorial-title">DESIGNED FOR CLARITY AT EVERY STAGE</h2>
              <p className="im-editorial-lead">
                Whether you are starting from zero or reviewing an active portfolio, this gathering offers relevant, high-impact guidance.
              </p>
            </div>

            <div className="im-audience-grid">
              {targetAudiences.map((aud) => (
                <div key={aud.num} className="im-audience-card">
                  <div className="im-aud-top">
                    <span className="im-aud-num">{aud.num}</span>
                    <span className="im-aud-tag">{aud.tag}</span>
                  </div>
                  <h4 className="im-aud-title">{aud.title}</h4>
                  <p className="im-aud-desc">{aud.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. EVENT LOGISTICS & SUMMARY */}
        <section id="logistics" className="im-section im-logistics-section">
          <div className="im-container">
            <div className="im-logistics-card">
              <div className="im-logistics-header">
                <span className="im-kicker" style={{ color: '#D8AE54' }}>CONFERENCE BRIEF</span>
                <h2 className="im-logistics-title">INVESTOR MISSION 2026</h2>
                <span className="im-logistics-tagline">THE HALAL WAY OF INVESTING • COIMBATORE</span>
              </div>

              <div className="im-logistics-grid">
                <div className="im-logistic-item">
                  <Calendar size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">Date &amp; Schedule</span>
                    <strong className="im-log-val">Sunday, 06 December 2026</strong>
                    <small>Morning to Afternoon Session</small>
                  </div>
                </div>

                <div className="im-logistic-item">
                  <MapPin size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">City &amp; Venue</span>
                    <strong className="im-log-val">Coimbatore, Tamil Nadu</strong>
                    <small>Central venue shared with confirmed attendees</small>
                  </div>
                </div>

                <div className="im-logistic-item">
                  <User size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">Speaker</span>
                    <strong className="im-log-val">Abdul Basith</strong>
                    <small>Licensed Financial Consultant</small>
                  </div>
                </div>

                <div className="im-logistic-item">
                  <DollarSign size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">Registration Fee</span>
                    <strong className="im-log-val">₹500 / Participant</strong>
                    <small>All-inclusive • Online UPI or Venue Payment</small>
                  </div>
                </div>

                <div className="im-logistic-item">
                  <Users size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">Capacity Limit</span>
                    <strong className="im-log-val">Strictly 50 Participants</strong>
                    <small>Guaranteed seat upon admin verification</small>
                  </div>
                </div>

                <div className="im-logistic-item">
                  <Award size={22} className="im-log-icon" />
                  <div>
                    <span className="im-log-label">Organisers</span>
                    <strong className="im-log-val">SIO Coimbatore &amp; Halal Wealth</strong>
                    <small>Social: @sio_coimbatore</small>
                  </div>
                </div>
              </div>

              {/* Two-step confirmation process explanation */}
              <div className="im-step-flow-box">
                <h4>How Your Seat Is Reserved:</h4>
                <div className="im-step-flow-steps">
                  <div className="im-step-box">
                    <span className="im-step-badge">STEP 1</span>
                    <strong>Register Online</strong>
                    <p>Submit your name, email, 10-digit mobile number, location and occupation.</p>
                  </div>
                  <div className="im-step-arrow">&rarr;</div>
                  <div className="im-step-box">
                    <span className="im-step-badge">STEP 2</span>
                    <strong>Complete Payment (₹500)</strong>
                    <p>Pay via PhonePe QR / UPI deep link or choose Offline Payment at venue.</p>
                  </div>
                  <div className="im-step-arrow">&rarr;</div>
                  <div className="im-step-box">
                    <span className="im-step-badge">STEP 3</span>
                    <strong>Confirmed Seat Pass</strong>
                    <p>Our team verifies your registration and issues your official entry confirmation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FREQUENTLY ASKED QUESTIONS */}
        <section id="faqs" className="im-section im-faqs-section">
          <div className="im-container">
            <div className="im-editorial-header">
              <span className="im-kicker">QUESTIONS &amp; ANSWERS</span>
              <h2 className="im-editorial-title">FREQUENTLY ASKED QUESTIONS</h2>
              <p className="im-editorial-lead">
                Everything you need to know about attending Investor Mission 2026.
              </p>
            </div>

            <div className="im-faqs-grid">
              {faqs.map((faq, i) => (
                <div key={i} className="im-faq-card">
                  <h4 className="im-faq-q">
                    <HelpCircle size={18} className="im-faq-icon" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="im-faq-a">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. CLOSING CALL TO ACTION */}
        <section className="im-cta-section">
          <div className="im-container im-cta-container">
            <div className="im-cta-inner">
              <div className="im-tagline-badge" style={{ background: 'rgba(128, 223, 53, 0.2)', borderColor: '#80DF35' }}>
                <Sparkles size={13} className="im-tagline-spark" />
                <span>LIMITED 50-SEAT WORKSHOP</span>
              </div>

              <h2 className="im-cta-heading">
                YOUR JOURNEY TOWARDS HALAL INVESTING STARTS HERE.
              </h2>

              <p className="im-cta-desc">
                Be part of an authentic, in-depth educational gathering focused on Islamic finance, Shariah screening, and responsible wealth creation. Reserve your seat early before the 50-seat threshold is reached.
              </p>

              <div className="im-cta-fee-pill">
                <span>Registration Fee:</span>
                <strong>₹{capacity.registrationFee}</strong>
                <small>(All Inclusive)</small>
              </div>

              <div className="im-cta-btn-wrap">
                <Link
                  to="/investor-mission-registration"
                  className="im-btn-cta"
                  title="Register for Investor Mission 2026"
                >
                  <span>RESERVE YOUR SEAT TODAY</span>
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="im-cta-meta-notes">
                <span>⚡ Instant PhonePe / UPI Payment or Offline Option</span>
                <span>•</span>
                <span>📋 Official Attendee Confirmation Pass</span>
                <span>•</span>
                <span>🤝 Live Q&amp;A with Abdul Basith</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 11. COMPACT EVENT-SPECIFIC FOOTER */}
      <footer className="im-footer">
        <div className="im-container im-footer-inner">
          <div className="im-footer-brand">
            <strong className="im-footer-title">INVESTOR MISSION 2026</strong>
            <p className="im-footer-tagline">The Halal Way of Investing • Sunday, 06 Dec 2026 • Coimbatore</p>
            <p className="im-footer-org">
              Organised by <strong>SIO Coimbatore</strong> in collaboration with <strong>Halal Wealth</strong>
            </p>
            <div className="im-footer-social">
              <span>Follow SIO Coimbatore: </span>
              <strong>@sio_coimbatore</strong>
            </div>
          </div>

          <div className="im-footer-contact">
            <span className="im-footer-contact-title">Event Inquiries &amp; Payment Support</span>
            <a href="tel:6380413253" className="im-footer-link">
              <Phone size={14} style={{ color: '#D8AE54' }} />
              <span>+91 6380413253 (Anas Rahman H)</span>
            </a>
            <a href="mailto:info@halalwealth.finance" className="im-footer-link">
              <Mail size={14} style={{ color: '#D8AE54' }} />
              <span>info@halalwealth.finance</span>
            </a>
            <span className="im-footer-subtext">UPI: 6380413253@ybl • ₹500 Registration Fee</span>
          </div>

          <div className="im-footer-legal">
            <div className="im-footer-legal-links">
              <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
              <span>•</span>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span>•</span>
              <Link to="/refund-policy">Refund Policy</Link>
            </div>
            <p className="im-footer-copy">
              &copy; 2026 SIO Coimbatore &amp; Halal Wealth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 12. INTERACTIVE YOUTUBE WEBINAR MODAL */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Previous Webinar Video Player"
          className="im-modal-backdrop"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div className="im-video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="im-modal-header">
              <div>
                <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '15px' }}>
                  Halal Investments &amp; Retirement Planning
                </strong>
                <span style={{ fontSize: '12px', color: '#80DF35' }}>
                  Keynote by Abdul Basith (Licensed Financial Consultant)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="im-modal-close"
                aria-label="Close video player"
              >
                <X size={20} />
              </button>
            </div>

            <div className="im-modal-video-frame">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dam9grDGDpY?autoplay=1&rel=0"
                title="Halal Investments and Retirement Planning – Abdul Basith"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="im-iframe-player"
              />
            </div>

            <div className="im-modal-footer">
              <p>
                Ready to attend the live in-person session in Coimbatore?
              </p>
              <Link
                to="/investor-mission-registration"
                className="im-btn-modal-reg"
                onClick={() => setIsVideoModalOpen(false)}
              >
                <span>Register for Dec 06 (₹500)</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 13. POSTER LIGHTBOX MODAL */}
      {isPosterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Investor Mission 2026 Official Poster View"
          className="im-modal-backdrop"
          onClick={() => setIsPosterModalOpen(false)}
        >
          <div className="im-poster-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(false)}
              className="im-poster-modal-close"
              aria-label="Close poster view"
            >
              <X size={24} />
            </button>
            <div className="im-poster-modal-body">
              <img
                src={posterImg}
                alt="Full High-Resolution Poster – Investor Mission 2026"
                className="im-poster-modal-img"
              />
            </div>
            <div className="im-poster-modal-footer">
              <div className="im-poster-modal-meta">
                <strong>INVESTOR MISSION 2026</strong>
                <span>Sunday, 06 December 2026 • Coimbatore • SIO Coimbatore</span>
              </div>
              <Link
                to="/investor-mission-registration"
                className="im-btn-modal-reg"
                onClick={() => setIsPosterModalOpen(false)}
              >
                <span>Register Now (₹500)</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
