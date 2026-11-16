import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, LockKeyhole, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config/api';
import { ADMIN_TOKEN_KEY } from '../config/adminApi';
import posterImg from '../assets/investor-mission-poster.jpg';
import './InvestorMissionAdminLogin.css';

export default function InvestorMissionAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter your admin Login ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/investor-mission/login`,
        { username: trimmedUsername, password },
        { timeout: 30000 }
      );

      const { token, role, displayName } = response.data;
      if (token) {
        window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        window.sessionStorage.setItem('admin-role', role || 'INVESTOR_MISSION_ADMIN');
        window.sessionStorage.setItem('admin-display-name', displayName || 'SIO Coimbatore');
        navigate('/investor-mission-admin/dashboard', { replace: true });
      } else {
        setError('Login failed: Authentication token was not received.');
      }
    } catch (requestError) {
      if (requestError.code === 'ECONNABORTED' || requestError.message?.includes('timeout')) {
        setError('Server response timed out. Please check your connection and try again.');
      } else if (requestError.response?.status === 429) {
        setError(requestError.response?.data?.message || 'Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.');
      } else {
        setError(requestError.response?.data?.message || 'Invalid Login ID or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="imal-page">
      <div className="imal-shell">
        {/* Navigation Bar */}
        <div className="imal-top-bar">
          <Link to="/investor-mission" className="imal-back-btn">
            <ArrowLeft size={14} />
            <span>Back to Event Page</span>
          </Link>
          <span className="imal-top-tag">Organizer Administration</span>
        </div>

        {/* Two-Column Card */}
        <div className="imal-card">
          {/* LEFT SIDE – EVENT BRANDING */}
          <section className="imal-brand-column" aria-label="Event Information">
            <div className="imal-brand-content">
              <div className="imal-brand-meta">
                <span className="imal-org-badge">
                  SIO COIMBATORE &bull; HALAL WEALTH
                </span>
                <h2 className="imal-event-title">INVESTOR MISSION 2026</h2>
                <p className="imal-event-tagline">THE HALAL WAY OF INVESTING</p>
              </div>

              {/* Official Poster Artwork */}
              <div className="imal-poster-box">
                <img
                  src={posterImg}
                  alt="Investor Mission 2026 Official Poster"
                  className="imal-poster-img"
                />
              </div>

              <div className="imal-brand-summary">
                <p className="imal-brand-desc">
                  Manage registrations, payment verification and participant attendance for Investor Mission 2026.
                </p>
                <div className="imal-brand-pill">
                  <span>Sunday, 06 December 2026 &bull; Coimbatore</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE – ADMIN LOGIN */}
          <section className="imal-form-column" aria-labelledby="imal-login-title">
            <div className="imal-form-wrapper">
              <div className="imal-form-header">
                <span className="imal-kicker">INVESTOR MISSION 2026</span>
                <h1 id="imal-login-title" className="imal-heading">
                  Welcome Back
                </h1>
                <p className="imal-subheading">
                  Sign in to manage your event operations.
                </p>
              </div>

              <form className="imal-form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="imal-alert" role="alert">
                    <AlertCircle size={16} className="imal-alert-icon" />
                    <span className="imal-alert-text">{error}</span>
                  </div>
                )}

                {/* Field 1: Admin Login ID */}
                <div className="imal-field-group">
                  <label htmlFor="imal-username" className="imal-label">
                    Admin Login ID
                  </label>
                  <div className="imal-input-shell">
                    <User size={16} className="imal-input-icon" aria-hidden="true" />
                    <input
                      id="imal-username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your admin ID"
                      className="imal-input"
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="imal-field-group">
                  <label htmlFor="imal-password" className="imal-label">
                    Password
                  </label>
                  <div className="imal-input-shell">
                    <LockKeyhole size={16} className="imal-input-icon" aria-hidden="true" />
                    <input
                      id="imal-password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="imal-input imal-input-pwd"
                      required
                    />
                    <button
                      type="button"
                      className="imal-pw-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="imal-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="imal-btn-loading">
                      <span className="imal-spinner" />
                      <span>AUTHENTICATING...</span>
                    </span>
                  ) : (
                    <span>SIGN IN TO DASHBOARD</span>
                  )}
                </button>
              </form>

              <footer className="imal-footer">
                <p className="imal-footer-text">
                  Authorized access only &middot; SIO Coimbatore
                </p>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
