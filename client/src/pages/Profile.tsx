import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import '../css/profile.css';

function Profile({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  console.log(user);
  return (
    <div className="profile-sidebar">
      <button onClick={onClose} className="profile-close-btn">&times;</button>
      <div className="profile-avatar-container">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            className="profile-avatar"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
      <h3 className="profile-name">{user.displayName || 'User'}</h3>
      <p className="profile-email">{user.email}</p>
      <button onClick={() => signOut(auth)} className="btn btn-danger profile-signout-btn">Sign Out</button>
    </div>
  );
}

export default Profile;