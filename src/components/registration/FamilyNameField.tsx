"use client";

type FamilyNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  placeholder: string;
};

export function FamilyNameField({ value, onChange, error, label, placeholder }: FamilyNameFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="familyName" className="input-label">
        <span className="input-label__primary">{label}</span>
      </label>
      <input
        id="familyName"
        name="familyName"
        type="text"
        className="field focus-ring"
        placeholder={placeholder}
        value={value}
        required
        aria-invalid={error ? true : false}
        aria-describedby={error ? "familyName-error" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id="familyName-error" className="error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
