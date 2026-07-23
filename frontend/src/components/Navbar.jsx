import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Store Rating</Link>
      </div>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        {user && user.role === 'SYSTEM_ADMIN' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/stores">Stores</Link>
          </>
        )}
        {user && user.role === 'NORMAL_USER' && <Link to="/stores">Stores</Link>}
        {user && user.role === 'STORE_OWNER' && <Link to="/store-owner">My Store</Link>}
        {user && (
          <>
            <Link to="/update-password">Update Password</Link>
            <span className="navbar-user">
              {user.name} ({user.role.replace('_', ' ')})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
