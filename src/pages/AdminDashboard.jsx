import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const fields = [['profession', 'Profession', 'currentProfession'], ['ageGroup', 'Age Group', 'ageGroup'], ['gender', 'Gender', 'gender'], ['country', 'Country', 'country'], ['knowledge', 'Knowledge', 'islamicFinanceKnowledge'], ['participation', 'Participation', 'participationMode'], ['community', 'WhatsApp', 'whatsappCommunity'], ['status', 'Status', 'status']];
const display = (registration, key) => key === 'whatsappCommunity' ? (registration[key] ? 'Yes' : 'No') : (registration[key] || '—');
const webinarText = (value) => String(value || '').trim() || '—';
const webinarInterests = (registration) => {
  if (!Array.isArray(registration.financialInterests)) return '—';
  const values = registration.financialInterests.map((interest) => {
    if (typeof interest === 'string') return interest;
    return interest?.label || interest?.name || interest?.value || '';
  }).filter(Boolean);
  if (registration.otherFinancialInterest) values.push(`Others: ${registration.otherFinancialInterest}`);
  return values.length ? values.join(', ') : '—';
};
export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [webinarRegistrations, setWebinarRegistrations] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/registrations`).then(response => setRegistrations(response.data)).catch(error => console.error(error));
    axios.get(`${API_URL}/api/webinar/registrations`).then(response => setWebinarRegistrations(response.data)).catch(error => console.error(error));
  }, []);

  const options = key => [...new Set(registrations.map(registration => display(registration, key)).filter(value => value !== '—'))];
  const filtered = useMemo(() => registrations.filter(registration => {
    const haystack = [registration.fullName, registration.name, registration.email, registration.whatsappNumber, registration.phone, registration.registrationId, registration.city, registration.organization].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase()) && Object.entries(filters).every(([key, value]) => !value || display(registration, key) === value);
  }), [registrations, query, filters]);

  const webinarFiltered = useMemo(() => webinarRegistrations.filter(registration => {
    const haystack = [registration.fullName, registration.email, registration.whatsapp, registration.location, registration.designation, registration.industry, webinarInterests(registration), registration.financialChallenge, registration.webinarSource].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [webinarRegistrations, query]);

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">PRIVATE OPERATIONS</p>
          <h1>Registration Dashboard</h1>
          <p>Review summit participants and webinar registrations.</p>
        </div>
        <strong>{filtered.length + webinarFiltered.length} total registrations</strong>
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

      <div className="admin-section">
        <h2>Webinar Registrations</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{['Full Name', 'WhatsApp / Mobile', 'Email', 'Location', 'Designation / Occupation', 'Industry', 'Financial Interests', 'Financial Challenge', 'Webinar Source', 'Consent', 'Registered'].map(label => <th key={label}>{label}</th>)}</tr>
            </thead>
            <tbody>
              {webinarFiltered.map(registration => (
                <tr key={registration._id} onClick={() => setSelectedWebinar(registration)}>
                  <td>{webinarText(registration.fullName)}</td>
                  <td>{webinarText(registration.whatsapp)}</td>
                  <td>{webinarText(registration.email)}</td>
                  <td>{webinarText(registration.location)}</td>
                  <td>{webinarText(registration.designation)}</td>
                  <td>{webinarText(registration.industry)}</td>
                  <td className="webinar-cell--wide webinar-cell--wrap">{webinarInterests(registration)}</td>
                  <td className="webinar-cell--challenge">{webinarText(registration.financialChallenge)}</td>
                  <td>{webinarText(registration.webinarSource || registration.referralSource)}</td>
                  <td>{registration.consent === true ? 'Yes' : registration.consent === false ? 'No' : '—'}</td>
                  <td>{registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!webinarFiltered.length && <p className="admin-empty">No webinar registrations yet.</p>}
        </div>
      </div>

      {selectedWebinar && (
        <div className="admin-detail" role="dialog" aria-modal="true" aria-label="Webinar registration details">
          <article>
            <button type="button" onClick={() => setSelectedWebinar(null)}>Close</button>
            <p className="eyebrow">WEBINAR REGISTRATION</p>
            <h2>{webinarText(selectedWebinar.fullName)}</h2>
            <AdminDetailSection title="Personal Information" rows={[
              ['WhatsApp / Mobile Number', selectedWebinar.whatsapp || selectedWebinar.phone],
              ['Email', selectedWebinar.email],
              ['Location', selectedWebinar.location],
            ]} />
            <AdminDetailSection title="Business Information" rows={[
              ['Designation / Occupation', selectedWebinar.designation],
              ['Industry', selectedWebinar.industry],
            ]} />
            <AdminDetailSection title="Financial Interests" rows={[
              ['Selected Interests', webinarInterests(selectedWebinar)],
              ['Other Financial Interest', selectedWebinar.otherFinancialInterest],
            ]} />
            <AdminDetailSection title="Additional Information" rows={[
              ['Financial Challenge', selectedWebinar.financialChallenge],
            ]} />
            <AdminDetailSection title="Webinar Information" rows={[
              ['How they heard about the webinar', selectedWebinar.webinarSource],
            ]} />
            <AdminDetailSection title="Consent" rows={[
              ['Consent', selectedWebinar.consent === true ? 'Yes' : selectedWebinar.consent === false ? 'No' : '—'],
            ]} />
          </article>
        </div>
      )}
    </div>
  );
}

function AdminDetailSection({ title, rows }) {
  return (
    <section className="admin-detail-section">
      <h3>{title}</h3>
      {rows.map(([label, value]) => <p key={label}><strong>{label}</strong><span>{webinarText(value)}</span></p>)}
    </section>
  );
}
