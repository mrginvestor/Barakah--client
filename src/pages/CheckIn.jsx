import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const CheckIn = () => {
  const [regId, setRegId] = useState('');
  const [message, setMessage] = useState(null);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/check-in`, { registrationId: regId });
      setMessage({ type: 'success', text: res.data.message });
      setRegId('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error processing check-in' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 px-6 flex justify-center">
      <div className="bg-white border border-[#0F4C75]/25 rounded-xl shadow-lg p-8 w-full max-w-md h-fit">
        <h1 className="text-2xl font-heading font-bold text-[#082B49] mb-6 text-center">Manual QR Check-In</h1>
        <form onSubmit={handleCheckIn} className="space-y-4">
          <input 
            value={regId}
            onChange={(e) => setRegId(e.target.value)}
            placeholder="Enter Registration ID (e.g. HWS26-00001)" 
            className="w-full border border-[#0F4C75]/25 p-3 rounded text-[#082B49] focus:outline-none focus:ring-2 focus:ring-[#082B49]"
            required
          />
          <button type="submit" className="w-full bg-[#D4AF5A] text-[#082B49] font-bold py-3 rounded hover:bg-[#E6C875] transition-colors">Check In Attendee</button>
        </form>
        {message && (
          <div className={`mt-6 p-4 rounded text-center font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
