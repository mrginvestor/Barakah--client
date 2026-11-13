import { useNavigate } from 'react-router-dom';
import RegistrationModal from '../components/RegistrationModal';

export default function MainSummitRegisterPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 12px',
      }}
    >
      <RegistrationModal isOpen={true} onClose={() => navigate('/')} />
    </div>
  );
}
