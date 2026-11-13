import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MainSummitRegisterPage from './pages/MainSummitRegisterPage';
import SmallSummitRegisterPage from './pages/SmallSummitRegisterPage';
import SmallSummitPaymentPage from './pages/SmallSummitPaymentPage';
import SmallSummitConfirmationPage from './pages/SmallSummitConfirmationPage';
import MainSummitAdminDashboard from './pages/MainSummitAdminDashboard';
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
  const isDecSummitFlowRoute =
    location.pathname === '/dec-summit-registration' ||
    location.pathname.startsWith('/dec-summit-payment') ||
    location.pathname.startsWith('/dec-summit-confirmation') ||
    location.pathname === '/small-summit-registration' ||
    location.pathname.startsWith('/small-summit-payment') ||
    location.pathname.startsWith('/small-summit-confirmation') ||
    location.pathname.startsWith('/summit-payment');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTopOnNavigation />
      {!isWebinarRoute && !isDecSummitFlowRoute && !isAdminRoute && <Navbar />}
      <Routes>
        {/* Main Summit 2026 Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/main-summit-registration" element={<MainSummitRegisterPage />} />
        <Route path="/summit-registration" element={<MainSummitRegisterPage />} />
        <Route path="/summit-register" element={<Navigate to="/main-summit-registration" replace />} />

        {/* DEC Summit 50-Capacity UPI & Offline Flow Routes */}
        <Route path="/dec-summit-registration" element={<SmallSummitRegisterPage />} />
        <Route path="/dec-summit-payment/:registrationId" element={<SmallSummitPaymentPage />} />
        <Route path="/dec-summit-confirmation/:registrationId" element={<SmallSummitConfirmationPage />} />
        <Route path="/small-summit-registration" element={<SmallSummitRegisterPage />} />
        <Route path="/small-summit-payment/:registrationId" element={<SmallSummitPaymentPage />} />
        <Route path="/small-summit-confirmation/:registrationId" element={<SmallSummitConfirmationPage />} />
        <Route path="/summit-payment/:registrationId" element={<SmallSummitPaymentPage />} />

        {/* Preserved Webinar Route */}
        <Route path="/webinar-register" element={<WebinarRegisterPage />} />

        {/* Legal & Compliance Pages */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/refunds" element={<Navigate to="/refund-policy" replace />} />
        <Route path="/cancellation-policy" element={<Navigate to="/refund-policy" replace />} />

        {/* Admin Operations */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<WebinarAdminDashboard />} />
          <Route path="/admin/main-summit" element={<MainSummitAdminDashboard />} />
          <Route path="/admin/dec-summit" element={<AdminDashboard />} />
          <Route path="/admin/small-summit" element={<AdminDashboard />} />
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
