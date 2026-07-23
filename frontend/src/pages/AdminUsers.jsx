import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SortableTh from '../components/SortableTh';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [error, setError] = useState('');

  // New-user form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
  const [formError, setFormError] = useState('');

  async function load() {
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  function onSort(field) {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add user');
    }
  }

  return (
    <div className="page">
      <h2>Users</h2>
      {error && <div className="alert-error">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="SYSTEM_ADMIN">System Administrator</option>
          <option value="NORMAL_USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
        <button onClick={load}>Apply Filters</button>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add User'}</button>
      </div>

      {showForm && (
        <form className="card inline-form" onSubmit={handleAddUser}>
          {formError && <div className="alert-error">{formError}</div>}
          <label>
            Name (20-60 chars)
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={20}
              maxLength={60}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Address (max 400 chars)
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              maxLength={400}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </label>
          <button type="submit">Create User</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <SortableTh field="name" label="Name" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="email" label="Email" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="address" label="Address" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="role" label="Role" sortBy={sortBy} order={order} onSort={onSort} />
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role.replace('_', ' ')}</td>
              <td>
                <Link to={`/admin/users/${u.id}`}>View</Link>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
