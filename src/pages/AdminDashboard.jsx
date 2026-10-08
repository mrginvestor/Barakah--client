import { useEffect, useMemo, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { Link } from 'react-router-dom';
import adminApi from '../config/adminApi';

const fields = [['profession', 'Profession', 'currentProfession'], ['ageGroup', 'Age Group', 'ageGroup'], ['gender', 'Gender', 'gender'], ['country', 'Country', 'country'], ['knowledge', 'Knowledge', 'islamicFinanceKnowledge'], ['participation', 'Participation', 'participationMode'], ['community', 'WhatsApp', 'whatsappCommunity'], ['status', 'Status', 'status']];
const display = (registration, key) => key === 'whatsappCommunity' ? (registration[key] ? 'Yes' : 'No') : (registration[key] || '—');

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    adminApi.get('/api/registrations').then(response => setRegistrations(response.data)).catch(error => console.error(error));
  }, []);

  const options = key => [...new Set(registrations.map(registration => display(registration, key)).filter(value => value !== '—'))];
  const filtered = useMemo(() => registrations.filter(registration => {
    const haystack = [registration.fullName, registration.name, registration.email, registration.whatsappNumber, registration.phone, registration.registrationId, registration.city, registration.organization].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase()) && Object.entries(filters).every(([key, value]) => !value || display(registration, key) === value);
  }), [registrations, query, filters]);

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">PRIVATE OPERATIONS</p>
          <h1>Summit registrations</h1>
          <p>Review summit participant records.</p>
        </div>
        <div>
          <Link className="text-button" to="/admin/dashboard">Webinar registrations</Link>
          <strong>{filtered.length} total registrations</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <input placeholder="Search name, email, WhatsApp, business or ID" value={query} onChange={event => setQuery(event.target.value)} />
        {fields.map(([key, label]) => (
          <select key={key} value={filters[key] || ''} onChange={event => setFilters({ ...filters, [key]: event.target.value })}>
            <option value="">{label}</option>
            {options(fields.find(item => item[0] === key)[2]).map(option => <option key={option}>{option}</option>)}
          </select>
        ))}
      </div>

      <div className="admin-section">
        <h2>Summit Registrations</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{['Registration ID', 'Name', 'WhatsApp', 'Email', 'Location', 'Profession', 'Experience', 'Knowledge', 'Participation', 'Community', 'Status', 'Registered'].map(label => <th key={label}>{label}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(registration => (
                <tr key={registration._id} onClick={() => setSelected(registration)}>
                  <td>{registration.registrationId}</td>
                  <td>{registration.fullName || registration.name}</td>
                  <td>{registration.whatsappNumber || registration.phone}</td>
                  <td>{registration.email}</td>
                  <td>{[registration.city, registration.state, registration.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>{registration.currentProfession || '—'}</td>
                  <td>{registration.professionalExperience ?? '—'} yrs</td>
                  <td>{registration.islamicFinanceKnowledge || '—'}</td>
                  <td>{registration.participationMode || '—'}</td>
                  <td>{display(registration, 'whatsappCommunity')}</td>
                  <td><span className={`admin-status ${registration.status === 'Checked-In' ? 'checked' : ''}`}>{registration.status}</span></td>
                  <td>{registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="admin-empty">No summit registrations match these filters.</p>}
        </div>
      </div>
    </div>
  );
}

