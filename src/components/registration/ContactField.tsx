"use client";

type ContactFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  placeholder: string;
};

export function ContactField({ value, onChange, error, label, placeholder }: ContactFieldProps) {
  const localDigits = value.replace(/^\+91/, "").replace(/\D/g, "").slice(0, 10);

  return (
    <div className="space-y-2">
      <label htmlFor="contactNumber" className="input-label">
        <span className="input-label__primary">{label}</span>
      </label>

      <div className={`field field--phone focus-ring ${error ? "border-[var(--error)]" : ""}`}>
        <span className="field--phone-prefix" aria-hidden="true">
          +91
        </span>
        <input
          id="contactNumber"
          name="contactNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          className="field--phone-input"
          value={localDigits}
          aria-invalid={error ? true : false}
          aria-describedby={error ? "contactNumber-error" : undefined}
          onChange={(event) => {
            const nextDigits = event.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(nextDigits);
          }}
        />
      </div>

      {error ? (
        <p id="contactNumber-error" className="error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
