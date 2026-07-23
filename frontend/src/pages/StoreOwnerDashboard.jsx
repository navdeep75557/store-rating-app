import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/store-owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return (
    <div className="page">
      <h2>My Store</h2>
      {error && <div className="alert-error">{error}</div>}
      {data && (
        <>
          <div className="card detail-card">
            <p>
              <strong>Store:</strong> {data.store.name}
            </p>
            <p>
              <strong>Address:</strong> {data.store.address}
            </p>
            <p>
              <strong>Average Rating:</strong> {data.averageRating.toFixed(1)} / 5
            </p>
          </div>

          <h3>Users Who Rated Your Store</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Rated On</th>
              </tr>
            </thead>
            <tbody>
              {data.raters.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.user.name}</td>
                  <td>{r.user.email}</td>
                  <td>{r.user.address}</td>
                  <td>{r.rating} / 5</td>
                  <td>{new Date(r.ratedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.raters.length === 0 && (
                <tr>
                  <td colSpan={5}>No ratings submitted yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
