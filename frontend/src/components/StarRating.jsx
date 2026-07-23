// Interactive 1-5 star picker used for submitting/modifying a rating
export default function StarRating({ value, onChange, disabled }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="star-rating">
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(s)}
          role="button"
          aria-label={`Rate ${s} star`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
