const ratings = [1, 2, 3, 4, 5] as const;
type Rating = typeof ratings[number];

interface RatingDotsProps {
  value: number | null;
  name: string;
  onChange?: (value: Rating) => void;
  readOnly?: boolean;
}

export function RatingDots({ value, name, onChange, readOnly = false }: RatingDotsProps) {
  return (
    <div className="cp-rating" role="radiogroup" aria-label="Rating">
      {ratings.map(rating => (
        <label className="cp-rating-option" key={rating}>
          <input
            className="visually-hidden"
            type="radio"
            name={name}
            value={rating}
            aria-label={"Rating " + rating + " of 5"}
            checked={value === rating}
            disabled={readOnly}
            onChange={() => onChange?.(rating)}
          />
          <span
            className={value !== null && rating <= value ? "cp-dot cp-dot-filled" : "cp-dot"}
            aria-hidden="true"
          />
        </label>
      ))}
    </div>
  );
}
