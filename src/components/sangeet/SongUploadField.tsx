"use client";

import { useRef } from "react";
import { ACCEPTED_AUDIO_EXTENSIONS, MAX_AUDIO_FILE_BYTES } from "@/lib/sangeet/constants";

interface SongUploadFieldProps {
  language: "en" | "hi";
  audioFile: File | null;
  fullSong: boolean;
  onFileSelect: (file: File | null) => void;
  onFullSongChange: (checked: boolean) => void;
  error?: string;
}

export function SongUploadField({
  language,
  audioFile,
  fullSong,
  onFileSelect,
  onFullSongChange,
  error,
}: SongUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textTone = "text-gray-900 dark:text-gray-100";
  const helperTone = "text-gray-600 dark:text-gray-400";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const maxSizeMB = MAX_AUDIO_FILE_BYTES / 1024 / 1024;

  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-gray-800">
      <div>
        <label className={`block text-sm font-semibold ${textTone}`}>
          {language === "en" ? "Audio File" : "ऑडियो फ़ाइल"}
          <span className="ml-1 text-red-500">*</span>
        </label>

        <div className="mt-2 space-y-3">
          {!audioFile ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO_EXTENSIONS.map((ext) => `.${ext}`).join(
                  ",",
                )}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex flex-col items-center gap-2 text-sm"
              >
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium text-amber-700">
                  {language === "en"
                    ? "Click to select or drag and drop"
                    : "चुनने के लिए क्लिक करें या खींचें और छोड़ें"}
                </span>
              </button>
              <p className={`mt-2 text-xs font-medium ${helperTone}`}>
                {language === "en"
                  ? `MP3, M4A, WAV (max ${maxSizeMB} MB)`
                  : `MP3, M4A, WAV (अधिकतम ${maxSizeMB} MB)`}
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 rounded bg-green-100 p-2 dark:bg-green-900">
                    <svg
                      className="h-5 w-5 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm11-4a1 1 0 00-1 1v1h1V7a1 1 0 00-1-1zm0 4a1 1 0 00-1 1v3h1v-3a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--deep-ink)] truncate">
                      {audioFile.name}
                    </p>
                    <p className="text-xs text-[var(--muted-strong)]">
                      {formatFileSize(audioFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  {language === "en" ? "Remove" : "हटाएं"}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Full Song Checkbox - For file uploads, by default the full song is used */}
      <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
        <input
          type="checkbox"
          id="fullSongUpload"
          checked={fullSong}
          onChange={(e) => onFullSongChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600"
        />
        <label
          htmlFor="fullSongUpload"
          className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {language === "en"
            ? "Use full uploaded file"
            : "अपलोड की गई पूरी फ़ाइल का उपयोग करें"}
        </label>
      </div>
    </div>
  );
}

