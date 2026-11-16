import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const [state, setState] = useState('checking');
  const [sessionRole, setSessionRole] = useState(() => window.sessionStorage.getItem('admin-role') || '');
  const [attempt, setAttempt] = useState(0);

  const isInvestorMissionAdminRoute = location.pathname.startsWith('/investor-mission-admin');

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expireSession = () => setState('unauthorized');
    window.addEventListener('admin-session-expired', expireSession);

    if (!token) {
      setState('unauthorized');
    } else {
      adminApi.get('/api/admin/session')
        .then((res) => {
          if (!active) return;
          const role = res.data?.role || 'ROLE_ADMIN';
          setSessionRole(role);
          window.sessionStorage.setItem('admin-role', role);
          if (res.data?.displayName) {
            window.sessionStorage.setItem('admin-display-name', res.data.displayName);
          }
          setState('authorized');
        })
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
    const loginTarget = isInvestorMissionAdminRoute ? '/investor-mission-admin/login' : '/admin/login';
    return <Navigate to={loginTarget} replace state={{ from: location.pathname }} />;
  }

  if (state === 'forbidden') {
    const loginTarget = isInvestorMissionAdminRoute ? '/investor-mission-admin/login' : '/admin/login';
    return (
      <main className="admin-gate">
        <section>
          <h1>Admin access required</h1>
          <p>This account does not have permission to access this area.</p>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
              window.sessionStorage.removeItem('admin-role');
              setState('unauthorized');
            }}
          >
            Return to login
          </button>
        </section>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="admin-gate">
        <section>
          <h1>Could not verify your session</h1>
          <p>Check your connection and try again.</p>
          <button type="button" onClick={() => { setState('checking'); setAttempt(value => value + 1); }}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  // Role-based route segregation for INVESTOR_MISSION_ADMIN
  if (sessionRole === 'INVESTOR_MISSION_ADMIN') {
    const forbiddenForIM = [
      '/admin/dashboard',
      '/admin/main-summit',
      '/admin/campaigns',
      '/admin/webinars',
    ];
    if (forbiddenForIM.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`))) {
      return <Navigate to="/investor-mission-admin/dashboard" replace />;
    }
  }

  return <Outlet />;
}