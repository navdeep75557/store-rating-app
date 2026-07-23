// Clickable table header that toggles ascending/descending sort for a field
export default function SortableTh({ field, label, sortBy, order, onSort }) {
  const active = sortBy === field;
  const arrow = active ? (order === 'ASC' ? ' ▲' : ' ▼') : '';
  return (
    <th onClick={() => onSort(field)} className="sortable-th">
      {label}
      {arrow}
    </th>
  );
}
