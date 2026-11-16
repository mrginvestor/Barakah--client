import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminApi from '../config/adminApi';

function extractTokenOrId(decodedText) {
  if (!decodedText) return '';
  const trimmed = String(decodedText).trim();
  const match = trimmed.match(/\/checkin\/verify\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

const CheckIn = () => {
  const [selectedEvent, setSelectedEvent] = useState('INVESTOR_MISSION'); // 'INVESTOR_MISSION' | 'MAIN_SUMMIT'
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  const processCheckIn = async (val) => {
    const raw = String(val || inputVal || '').trim();
    if (!raw) return;
    const token = extractTokenOrId(raw);

    setLoading(true);
    setScanResult(null);

    try {
      if (selectedEvent === 'INVESTOR_MISSION') {
        const res = await adminApi.post('/api/admin/investor-mission/checkin', { token });
        setScanResult({
          type: 'success',
          message: res.data.message || 'Check-in successful!',
          participantName: res.data.participantName,
          registrationId: res.data.registrationId,
          checkedInAt: res.data.checkedInAt,
          checkedInBy: res.data.checkedInBy,
        });
      } else {
        const res = await adminApi.post('/api/check-in', { registrationId: token });
        setScanResult({
          type: 'success',
          message: res.data.message || 'Check-in successful!',
          registrationId: token,
        });
      }
      setInputVal('');
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 || data?.alreadyCheckedIn) {
        setScanResult({
          type: 'warning',
          message: data?.message || 'Already Checked In',
          participantName: data?.participantName,
          registrationId: data?.registrationId,
          checkedInAt: data?.checkedInAt,
          checkedInBy: data?.checkedInBy,
        });
      } else {
        setScanResult({
          type: 'error',
          message: data?.message || 'Check-in failed. Please verify the ticket or credentials.',
          participantName: data?.participantName,
          registrationId: data?.registrationId,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processCheckIn(inputVal);
  };

  useEffect(() => {
    let html5QrcodeScanner = null;
    if (scannerActive) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      html5QrcodeScanner = new Html5QrcodeScanner('qr-reader-container', config, false);
      html5QrcodeScanner.render(
        (decodedText) => {
          processCheckIn(decodedText);
        },
        (error) => {
          // ignore frame errors
        }
      );
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (_) {}
      }
    };
  }, [scannerActive, selectedEvent]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-20 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Navigation Back */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/admin/investor-mission"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#053726] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <span className="text-xs text-slate-500 font-medium">Entrance Check-In System</span>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#053726] text-white p-6 text-center">
            <span className="inline-block bg-[#80DF35] text-[#053726] text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
              Organizer Pass Scanner
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Event Entrance Check-In</h1>
            <p className="text-xs text-[#D8AE54] mt-1 font-semibold">
              Scan participant QR code or enter Registration ID manually
            </p>
          </div>

          {/* Event Selector */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => { setSelectedEvent('INVESTOR_MISSION'); setScanResult(null); }}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                selectedEvent === 'INVESTOR_MISSION'
                  ? 'bg-[#053726] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Investor Mission 2026
            </button>
            <button
              type="button"
              onClick={() => { setSelectedEvent('MAIN_SUMMIT'); setScanResult(null); }}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                selectedEvent === 'MAIN_SUMMIT'
                  ? 'bg-[#082B49] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Main Summit 2027
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Camera Scanner Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => setScannerActive((prev) => !prev)}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  scannerActive
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-[#053726] text-white hover:bg-[#064B36]'
                }`}
              >
                <Camera size={18} />
                {scannerActive ? 'Stop Camera Scanner' : 'Open Camera QR Scanner'}
              </button>
            </div>

            {/* Camera Viewport Container */}
            {scannerActive && (
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                <div id="qr-reader-container" className="w-full text-white text-center"></div>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Hold the participant's QR code steadily in front of the camera.
                </p>
              </div>
            )}

            {/* Manual Entry Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {selectedEvent === 'INVESTOR_MISSION'
                  ? 'Enter Registration ID or Check-In Token'
                  : 'Enter Main Summit Registration ID'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={
                      selectedEvent === 'INVESTOR_MISSION'
                        ? 'e.g. SS26-00001 or scan token...'
                        : 'e.g. HWS26-00001...'
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#053726] uppercase font-mono"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#D8AE54] text-[#053726] font-extrabold px-5 py-3 rounded-xl hover:bg-[#E6C875] transition-colors text-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Search size={16} />
                  {loading ? 'Checking...' : 'Check In'}
                </button>
              </div>
            </form>

            {/* Feedback Cards */}
            {scanResult && (
              <div
                className={`p-5 rounded-xl border text-sm transition-all ${
                  scanResult.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : scanResult.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {scanResult.type === 'success' && <CheckCircle2 className="text-green-600" size={24} />}
                    {scanResult.type === 'warning' && <AlertTriangle className="text-amber-600" size={24} />}
                    {scanResult.type === 'error' && <XCircle className="text-red-600" size={24} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-base">
                      {scanResult.type === 'success' && '✓ Check-In Confirmed'}
                      {scanResult.type === 'warning' && '⚠️ Already Checked In'}
                      {scanResult.type === 'error' && '❌ Verification Failed'}
                    </h3>
                    <p className="text-xs leading-relaxed">{scanResult.message}</p>

                    {scanResult.participantName && (
                      <div className="mt-2 pt-2 border-t border-current/15 text-xs space-y-1 font-medium">
                        <div>
                          Participant: <strong>{scanResult.participantName}</strong>
                        </div>
                        {scanResult.registrationId && (
                          <div>
                            Registration ID: <strong>{scanResult.registrationId}</strong>
                          </div>
                        )}
                        {scanResult.checkedInAt && (
                          <div>
                            Checked In At:{' '}
                            <strong>{new Date(scanResult.checkedInAt).toLocaleTimeString()}</strong>
                          </div>
                        )}
                        {scanResult.checkedInBy && (
                          <div className="text-[11px] opacity-80">
                            Verified by: {scanResult.checkedInBy}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
