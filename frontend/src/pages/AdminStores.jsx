import { useEffect, useState } from 'react';
import api from '../api/axios';
import SortableTh from '../components/SortableTh';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formError, setFormError] = useState('');

  async function load() {
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/admin/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }

  async function loadOwners() {
    try {
      const { data } = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
      setOwners(data.users);
    } catch {
      // non-fatal — owner dropdown just stays empty
    }
  }

  useEffect(() => {
    load();
    loadOwners();
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

  async function handleAddStore(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      setForm({ name: '', email: '', address: '', ownerId: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add store');
    }
  }

  return (
    <div className="page">
      <h2>Stores</h2>
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
        <button onClick={load}>Apply Filters</button>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Store'}</button>
      </div>

      {showForm && (
        <form className="card inline-form" onSubmit={handleAddStore}>
          {formError && <div className="alert-error">{formError}</div>}
          <label>
            Store Name (20-60 chars)
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
            Store Owner (optional)
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
              <option value="">— None —</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Create Store</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <SortableTh field="name" label="Name" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="email" label="Email" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="address" label="Address" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="rating" label="Rating" sortBy={sortBy} order={order} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
              <td>{parseFloat(s.rating).toFixed(1)} / 5</td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan={4}>No stores found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
