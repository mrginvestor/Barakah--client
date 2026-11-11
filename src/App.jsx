import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import WebinarAdminDashboard from './pages/WebinarAdminDashboard';
import CheckIn from './pages/CheckIn';
import WebinarRegisterPage from './pages/WebinarRegisterPage';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function ScrollToTopOnNavigation() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isWebinarRoute = location.pathname === '/webinar-register' || location.pathname.startsWith('/webinar-register/');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTopOnNavigation />
      {!isWebinarRoute && !isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/webinar-register" element={<WebinarRegisterPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/refunds" element={<Navigate to="/refund-policy" replace />} />
        <Route path="/cancellation-policy" element={<Navigate to="/refund-policy" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<WebinarAdminDashboard />} />
          <Route path="/admin/summit" element={<AdminDashboard />} />
          <Route path="/admin/check-in" element={<CheckIn />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
