import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CheckIn from './pages/CheckIn';
import WebinarRegisterPage from './pages/WebinarRegisterPage';
import Navbar from './components/Navbar';

function AppRoutes() {
  const location = useLocation();
  const isWebinarRoute = location.pathname === '/webinar-register' || location.pathname.startsWith('/webinar-register/');

  return (
    <>
      {!isWebinarRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/webinar-register" element={<WebinarRegisterPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/check-in" element={<CheckIn />} />
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
