import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

function Profile({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  console.log(user);
  return (
    <div className="profile-sidebar" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 340,
      maxWidth: '90vw',
      height: '100vh',
      background: '#181818',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.4)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 24px 24px',
      transition: 'transform 0.3s',
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>&times;</button>
      <div style={{ marginTop: 32, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #333',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              background: '#222'
            }}
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: '#9b27b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#fff',
              fontWeight: 700,
              border: '4px solid #222'
            }}
          >
            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
      <h3 style={{ color: '#fff', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{user.displayName || 'User'}</h3>
      <p style={{ color: '#aaa', marginBottom: 32, textAlign: 'center', fontSize: 16 }}>{user.email}</p>
      <button onClick={() => signOut(auth)} className="btn btn-danger" style={{ width: 120, fontWeight: 500, fontSize: 17, borderRadius: 8 }}>Sign Out</button>
    </div>
  );
}

export default Profile;