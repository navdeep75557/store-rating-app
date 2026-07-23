import { useEffect, useState } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import SortableTh from '../components/SortableTh';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
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

  async function rate(store, value) {
    setError('');
    setMessage('');
    try {
      if (store.myRating) {
        await api.put(`/stores/ratings/${store.id}`, { rating: value });
      } else {
        await api.post('/stores/ratings', { storeId: store.id, rating: value });
      }
      setMessage(`Rating for "${store.name}" saved`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  }

  return (
    <div className="page">
      <h2>Browse Stores</h2>
      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="filter-bar">
        <input
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <button onClick={load}>Search</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <SortableTh field="name" label="Store Name" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="address" label="Address" sortBy={sortBy} order={order} onSort={onSort} />
            <SortableTh field="rating" label="Overall Rating" sortBy={sortBy} order={order} onSort={onSort} />
            <th>Your Rating</th>
            <th>Rate This Store</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.overallRating.toFixed(1)} / 5</td>
              <td>{s.myRating ? `${s.myRating} / 5` : 'Not rated yet'}</td>
              <td>
                <StarRating value={s.myRating || 0} onChange={(v) => rate(s, v)} />
              </td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan={5}>No stores found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
