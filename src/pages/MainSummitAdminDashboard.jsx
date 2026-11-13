import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import adminApi, { ADMIN_TOKEN_KEY } from '../config/adminApi';
import './AdminDashboard.css';

const filterFields = [
  ['profession', 'Profession', 'currentProfession'],
  ['ageGroup', 'Age Group', 'ageGroup'],
  ['gender', 'Gender', 'gender'],
  ['country', 'Country', 'country'],
  ['knowledge', 'Knowledge Level', 'islamicFinanceKnowledge'],
  ['participation', 'Participation Mode', 'participationMode'],
  ['community', 'WhatsApp Community', 'whatsappCommunity'],
  ['status', 'Status', 'status'],
];

const displayVal = (reg, key) => {
  if (key === 'whatsappCommunity') return reg[key] ? 'Yes' : 'No';
  return reg[key] || '—';
};

export default function MainSummitAdminDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/api/registrations');
      setRegistrations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load main summit registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate('/admin/login');
  };

  const getOptions = (fieldKey) => [
    ...new Set(
      registrations
        .map((reg) => displayVal(reg, fieldKey))
        .filter((val) => val && val !== '—')
    ),
  ];

  const filtered = useMemo(() => {
    return registrations.filter((reg) => {
      // Search
      if (query.trim()) {
        const haystack = [
          reg.fullName,
          reg.name,
          reg.email,
          reg.whatsappNumber,
          reg.phone,
          reg.registrationId,
          reg.city,
          reg.state,
          reg.country,
          reg.organization,
          reg.currentProfession,
          reg.biggestFinancialChallenge,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(query.toLowerCase())) return false;
      }

      // Dropdown filters
      for (const [filterKey, , propKey] of filterFields) {
        const activeVal = filters[filterKey];
        if (activeVal && displayVal(reg, propKey) !== activeVal) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, query, filters]);

  return (
    <div className="admin-page">
      {/* Top Admin Navigation Header */}
      <div className="admin-nav-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          to="/admin/main-summit"
          style={{
            padding: '8px 16px',
            background: '#D4AF5A',
            color: '#082B49',
            fontWeight: 700,
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          Main Summit 2027 ({registrations.length})
        </Link>
        <Link
          to="/admin/investor-mission"
          style={{
            padding: '8px 16px',
            background: '#064B36',
            color: '#FFFFFF',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          Investor Mission 2026 (₹500 / 50 Seats) &rarr;
        </Link>
        <Link
          to="/admin/dashboard"
          style={{
            padding: '8px 16px',
            background: '#F1F5F9',
            color: '#334155',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          Webinar Campaigns &rarr;
        </Link>
        <Link
          to="/admin/check-in"
          style={{
            padding: '8px 16px',
            background: '#F1F5F9',
            color: '#334155',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          QR Check-In
        </Link>
        <button
          onClick={handleLogout}
          style={{
            marginLeft: 'auto',
            padding: '8px 14px',
            background: '#FEE2E2',
            color: '#991B1B',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Heading */}
      <div className="admin-heading">
        <div>
          <p className="eyebrow">HALAL WEALTH SUMMIT 2027 • 24 JANUARY 2027 • CHENNAI</p>
          <h1>Main Summit Registrations</h1>
          <p>Full 5-step attendee submissions, personal &amp; professional profiles, financial interests and check-in status.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong style={{ fontSize: '15px', color: '#082B49' }}>
            {filtered.length} of {registrations.length} Attendees
          </strong>
          <button className="text-button" onClick={loadData} title="Refresh records">
            <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          placeholder="Search name, email, WhatsApp, profession, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: '280px', flex: '1 1 280px' }}
        />
        {filterFields.map(([filterKey, label, propKey]) => (
          <select
            key={filterKey}
            value={filters[filterKey] || ''}
            onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '13px' }}
          >
            <option value="">All {label}s</option>
            {getOptions(propKey).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
        {Object.keys(filters).some((k) => filters[k]) && (
          <button
            onClick={() => setFilters({})}
            style={{ padding: '8px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="admin-section">
        <h2>Registered Participants</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Participant</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Location</th>
                <th>Profession</th>
                <th>Exp</th>
                <th>Knowledge</th>
                <th>Participation</th>
                <th>Community</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg._id} onClick={() => setSelected(reg)} style={{ cursor: 'pointer' }}>
                  <td>
                    <strong style={{ color: '#082B49' }}>{reg.registrationId}</strong>
                  </td>
                  <td>
                    <strong>{reg.fullName || reg.name}</strong>
                    {reg.gender && <small style={{ display: 'block', color: '#64748B' }}>{reg.gender}, {reg.ageGroup}</small>}
                  </td>
                  <td>{reg.whatsappNumber || reg.phone}</td>
                  <td>{reg.email}</td>
                  <td>{[reg.city, reg.state, reg.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>
                    <div>{reg.currentProfession === 'Other' ? `Other: ${reg.otherProfession}` : (reg.currentProfession || '—')}</div>
                    {reg.organization && <small style={{ color: '#64748B' }}>{reg.organization}</small>}
                  </td>
                  <td>{reg.professionalExperience ?? '—'} yrs</td>
                  <td>{reg.islamicFinanceKnowledge || '—'}</td>
                  <td>{reg.participationMode || '—'}</td>
                  <td>
                    {reg.whatsappCommunity ? (
                      <span style={{ color: '#16A34A', fontWeight: 600 }}>Yes</span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>No</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-status ${reg.status === 'Checked-In' ? 'checked' : ''}`}>
                      {reg.status || 'Confirmed'}
                    </span>
                  </td>
                  <td>{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && !loading && (
            <p className="admin-empty">No main summit registrations match your filters.</p>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="summit-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="summit-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="summit-modal-header">
              <h3>Attendee Dossier – {selected.registrationId}</h3>
              <button className="summit-modal-close" onClick={() => setSelected(null)}>
                &times;
              </button>
            </div>

            <div className="summit-modal-body" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Full Name:</span>
                  <strong>{selected.fullName || selected.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Email:</span>
                  <strong>{selected.email}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>WhatsApp:</span>
                  <strong>{selected.countryCode} {selected.whatsappNumber || selected.phone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Location:</span>
                  <strong>{[selected.city, selected.state, selected.country].filter(Boolean).join(', ')}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Age Group &amp; Gender:</span>
                  <strong>{selected.ageGroup} • {selected.gender}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Profession:</span>
                  <strong>{selected.currentProfession === 'Other' ? selected.otherProfession : selected.currentProfession} ({selected.professionalExperience} yrs)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Participation Mode:</span>
                  <strong>{selected.participationMode}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>WhatsApp Community:</span>
                  <strong>{selected.whatsappCommunity ? 'Yes (Wants invite)' : 'No'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>How they heard:</span>
                  <strong>{selected.referralSource === 'Other' ? selected.otherReferralSource : selected.referralSource}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Current Knowledge:</span>
                  <strong>{selected.islamicFinanceKnowledge}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748B', display: 'block' }}>Financial Topics of Interest:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {Array.isArray(selected.financialInterests) && selected.financialInterests.map((t) => (
                      <span key={t} style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748B', display: 'block' }}>Biggest Financial Challenge:</span>
                  <div style={{ background: '#F8FAFC', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', marginTop: '4px', fontStyle: 'italic' }}>
                    "{selected.biggestFinancialChallenge || 'None specified'}"
                  </div>
                </div>
              </div>
            </div>

            <div className="summit-modal-footer">
              <button
                type="button"
                className="btn-admin-action"
                style={{ padding: '8px 16px', background: '#E2E8F0', color: '#334155' }}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
