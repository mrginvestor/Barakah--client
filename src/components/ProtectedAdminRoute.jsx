import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const [state, setState] = useState('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expireSession = () => setState('unauthorized');
    window.addEventListener('admin-session-expired', expireSession);

    if (!token) {
      setState('unauthorized');
    } else {
      adminApi.get('/api/admin/session')
        .then(() => { if (active) setState('authorized'); })
        .catch((error) => {
          if (!active) return;
          setState(error.response?.status === 403 ? 'forbidden' : error.response?.status === 401 ? 'unauthorized' : 'error');
        });
    }

    return () => {
      active = false;
      window.removeEventListener('admin-session-expired', expireSession);
    };
  }, [attempt]);

  if (state === 'checking') {
    return <main className="admin-gate" aria-live="polite">Verifying admin session…</main>;
  }
  if (state === 'unauthorized') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  if (state === 'forbidden') {
    return <main className="admin-gate"><section><h1>Admin access required</h1><p>This account cannot access admin tools.</p><button type="button" onClick={() => { window.sessionStorage.removeItem(ADMIN_TOKEN_KEY); setState('unauthorized'); }}>Return to login</button></section></main>;
  }
  if (state === 'error') {
    return <main className="admin-gate"><section><h1>Could not verify your session</h1><p>Check your connection and try again.</p><button type="button" onClick={() => { setState('checking'); setAttempt(value => value + 1); }}>Retry</button></section></main>;
  }
  return <Outlet />;
}