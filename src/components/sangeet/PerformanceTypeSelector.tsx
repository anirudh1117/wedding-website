"use client";

interface PerformanceTypeSelectorProps {
  value: "solo" | "group" | null;
  onChange: (type: "solo" | "group") => void;
  language: "en" | "hi";
  error?: string;
}

const labels = {
  en: {
    solo: "Solo (एकल प्रस्तुति)",
    group: "Group (समूह प्रस्तुति)",
  },
  hi: {
    solo: "एकल प्रस्तुति",
    group: "समूह प्रस्तुति",
  },
};

const descriptions = {
  en: {
    solo: "Single performer",
    group: "Multiple performers",
  },
  hi: {
    solo: "एक प्रदर्शनकारी",
    group: "कई प्रदर्शनकारी",
  },
};

export function PerformanceTypeSelector({
  value,
  onChange,
  language,
  error,
}: PerformanceTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["solo", "group"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === type
                ? "border-amber-600 bg-amber-100 shadow-md"
                : "border-gray-300 bg-white hover:border-amber-400"
            }`}
          >
            <div
              className={`font-semibold ${
                value === type
                  ? "text-amber-900"
                  : "text-gray-900"
              }`}
            >
              {labels[language][type]}
            </div>
            <div
              className={`text-xs ${
                value === type
                  ? "text-amber-900"
                  : "text-gray-600"
              }`}
            >
              {descriptions[language][type]}
            </div>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
