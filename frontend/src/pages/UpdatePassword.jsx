import { useState } from 'react';
import api from '../api/axios';

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const pwOk =
      newPassword.length >= 8 &&
      newPassword.length <= 16 &&
      /[A-Z]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);
    if (!pwOk) {
      setError('New password must be 8-16 characters with at least one uppercase letter and one special character');
      return;
    }

    try {
      await api.put('/auth/update-password', { currentPassword, newPassword });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Update Password</h2>
        {error && <div className="alert-error">{error}</div>}
        {message && <div className="alert-success">{message}</div>}
        <label>
          Current Password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label>
          New Password <span className="hint">(8-16 chars, 1 uppercase, 1 special char)</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
