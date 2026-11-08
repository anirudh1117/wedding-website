"use client";

interface SongLinkFieldsProps {
  language: "en" | "hi";
  songUrl: string;
  playbackStartTime: string;
  playbackEndTime: string;
  fullSong: boolean;
  onFieldChange: (field: string, value: string | number | boolean | File | null) => void;
  errors: Record<string, string>;
}

export function SongLinkFields({
  language,
  songUrl,
  playbackStartTime,
  playbackEndTime,
  fullSong,
  onFieldChange,
  errors,
}: SongLinkFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg bg-white p-4 dark:bg-gray-800">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          {language === "en" ? "Song URL (HTTPS)" : "गीत URL (HTTPS)"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="url"
          value={songUrl}
          onChange={(e) => onFieldChange("songUrl", e.target.value)}
          placeholder={
            language === "en"
              ? "https://youtu.be/... or https://open.spotify.com/..."
              : "https://youtu.be/... या https://open.spotify.com/..."
          }
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        />
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {language === "en"
            ? "YouTube, Spotify, SoundCloud, or another valid HTTPS music link"
            : "YouTube, Spotify, SoundCloud, या अन्य वैध HTTPS संगीत लिंक"}
        </p>
        {errors.songUrl && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.songUrl}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            {language === "en" ? "Playback Start" : "प्लेबैक शुरुआत"}
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={playbackStartTime}
            onChange={(e) =>
              onFieldChange("playbackStartTime", e.target.value)
            }
            placeholder="MM:SS"
            disabled={fullSong}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-600 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700"
            required={!fullSong}
          />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {language === "en" ? "e.g. 01:30" : "उदाहरण: 01:30"}
          </p>
          {errors.playbackStartTime && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.playbackStartTime}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            {language === "en" ? "Playback End" : "प्लेबैक अंत"}
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={playbackEndTime}
            onChange={(e) =>
              onFieldChange("playbackEndTime", e.target.value)
            }
            placeholder="MM:SS"
            disabled={fullSong}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-600 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700"
            required={!fullSong}
          />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {language === "en" ? "e.g. 04:15" : "उदाहरण: 04:15"}
          </p>
          {errors.playbackEndTime && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.playbackEndTime}
            </p>
          )}
        </div>
      </div>

      {/* Full Song Checkbox */}
      <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
        <input
          type="checkbox"
          id="fullSongLink"
          checked={fullSong}
          onChange={(e) => onFieldChange("fullSong", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600"
        />
        <label
          htmlFor="fullSongLink"
          className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {language === "en"
            ? "Use full song (no need to specify start and end times)"
            : "पूरा गीत उपयोग करें (शुरुआत और अंत का समय निर्दिष्ट करने की आवश्यकता नहीं)"}
        </label>
      </div>
    </div>
  );
}

