import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data.user))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load user'));
  }, [id]);

  return (
    <div className="page">
      <Link to="/admin/users">&larr; Back to Users</Link>
      <h2>User Details</h2>
      {error && <div className="alert-error">{error}</div>}
      {user && (
        <div className="card detail-card">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Address:</strong> {user.address}
          </p>
          <p>
            <strong>Role:</strong> {user.role.replace('_', ' ')}
          </p>
          {user.role === 'STORE_OWNER' && (
            <p>
              <strong>Store Rating:</strong> {user.rating != null ? user.rating.toFixed(1) : 'N/A'} / 5
            </p>
          )}
        </div>
      )}
    </div>
  );
}
