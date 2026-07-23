import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.name.length < 20 || form.name.length > 60) {
      setError('Name must be between 20 and 60 characters');
      return;
    }
    if (form.address.length > 400) {
      setError('Address must be at most 400 characters');
      return;
    }
    const pwOk =
      form.password.length >= 8 &&
      form.password.length <= 16 &&
      /[A-Z]/.test(form.password) &&
      /[^A-Za-z0-9]/.test(form.password);
    if (!pwOk) {
      setError('Password must be 8-16 characters with at least one uppercase letter and one special character');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Name <span className="hint">(20-60 characters)</span>
          <input value={form.name} onChange={update('name')} required minLength={20} maxLength={60} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>
        <label>
          Address <span className="hint">(max 400 characters)</span>
          <textarea value={form.address} onChange={update('address')} required maxLength={400} />
        </label>
        <label>
          Password <span className="hint">(8-16 chars, 1 uppercase, 1 special char)</span>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={8}
            maxLength={16}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
