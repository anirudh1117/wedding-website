"use client";

interface PartySelectorProps {
  value: "groom" | "bride" | null;
  onChange: (party: "groom" | "bride") => void;
  language: "en" | "hi";
  error?: string;
}

const labels = {
  en: {
    groom: "Groom's Side (लड़के वाले)",
    bride: "Bride's Side (लड़की वाले)",
  },
  hi: {
    groom: "लड़के वाले",
    bride: "लड़की वाले",
  },
};

export function PartySelector({
  value,
  onChange,
  language,
  error,
}: PartySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["groom", "bride"] as const).map((party) => (
          <button
            key={party}
            type="button"
            onClick={() => onChange(party)}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              value === party
                ? "border-amber-600 bg-amber-100 shadow-md"
                : "border-gray-300 bg-white hover:border-amber-400"
            }`}
          >
            <span
              className={`block font-semibold ${
                value === party
                  ? "text-amber-900"
                  : "text-gray-900"
              }`}
            >
              {labels[language][party]}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
