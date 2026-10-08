import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import WebinarAdminDashboard from './pages/WebinarAdminDashboard';
import CheckIn from './pages/CheckIn';
import WebinarRegisterPage from './pages/WebinarRegisterPage';
import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function AppRoutes() {
  const location = useLocation();
  const isWebinarRoute = location.pathname === '/webinar-register' || location.pathname.startsWith('/webinar-register/');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isWebinarRoute && !isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/webinar-register" element={<WebinarRegisterPage />} />
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
