import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { ADMIN_TOKEN_KEY } from '../config/adminApi';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setColdStartNotice(false);

    const trimmedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Enter a valid admin email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    const slowTimer = setTimeout(() => {
      setColdStartNotice(true);
    }, 2500);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/login`,
        { email: trimmedEmail, password },
        { timeout: 45000 },
      );
      clearTimeout(slowTimer);
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      clearTimeout(slowTimer);
      setColdStartNotice(false);
      if (requestError.code === 'ECONNABORTED' || requestError.message?.includes('timeout')) {
        setError('Server response timed out. The server may be waking up from sleep. Please try signing in again.');
      } else {
        setError(requestError.response?.data?.message || 'Unable to sign in right now. Check your connection and try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <span className="admin-login-mark"><ShieldCheck size={25} strokeWidth={1.7} /></span>
          <span>HALAL WEALTH</span>
          <small>WEBINAR OPERATIONS</small>
        </div>
        <div className="admin-login-copy">
          <p className="admin-login-eyebrow">AUTHORIZED ACCESS</p>
          <h1 id="admin-login-title">Admin sign in</h1>
          <p>Sign in to manage webinar registrations.</p>
        </div>
        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Admin email</span>
            <input
              autoComplete="username"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="name@halalwealth.finance"
              aria-invalid={Boolean(error && !/^\S+@\S+\.\S+$/.test(email.trim()))}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <span className="admin-password-field">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="button" className="admin-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          {coldStartNotice && loading && (
            <div className="admin-login-notice" role="status">
              <span className="admin-login-notice-spinner" aria-hidden="true" />
              <span>Connecting to secure server… If the server was idle, it may take a few moments to spin up.</span>
            </div>
          )}
          <button className="admin-login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="admin-login-foot"><LockKeyhole size={14} /> Authorized administrators only</p>
      </section>
    </main>
  );
}