import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CheckIn from './pages/CheckIn';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/check-in" element={<CheckIn />} />
      </Routes>
    </Router>
  );
}

export default App;
