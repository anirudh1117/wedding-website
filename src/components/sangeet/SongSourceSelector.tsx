"use client";

interface SongSourceSelectorProps {
  value: "link" | "upload" | null;
  onChange: (source: "link" | "upload") => void;
  language: "en" | "hi";
  error?: string;
}

const labels = {
  en: {
    link: "Song Link",
    upload: "Upload Audio File",
  },
  hi: {
    link: "गीत का लिंक",
    upload: "ऑडियो फ़ाइल अपलोड करें",
  },
};

const descriptions = {
  en: {
    link: "YouTube, Spotify, or other music platform",
    upload: "MP3, M4A, or WAV file",
  },
  hi: {
    link: "YouTube, Spotify, या अन्य संगीत प्लेटफॉर्म",
    upload: "MP3, M4A, या WAV फ़ाइल",
  },
};

export function SongSourceSelector({
  value,
  onChange,
  language,
  error,
}: SongSourceSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["link", "upload"] as const).map((source) => (
          <button
            key={source}
            type="button"
            onClick={() => onChange(source)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === source
                ? "border-amber-600 bg-amber-100 shadow-md"
                : "border-gray-300 bg-white hover:border-amber-400"
            }`}
          >
            <div
              className={`font-semibold ${
                value === source
                  ? "text-amber-900"
                  : "text-gray-900"
              }`}
            >
              {labels[language][source]}
            </div>
            <div
              className={`text-xs ${
                value === source
                  ? "text-amber-900"
                  : "text-gray-600"
              }`}
            >
              {descriptions[language][source]}
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
