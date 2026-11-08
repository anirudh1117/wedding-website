"use client";

import { useMemo } from "react";
import { formatDuration, parseTimestamp } from "@/lib/sangeet/helpers";

interface PlaybackRangeFieldsProps {
  language: "en" | "hi";
  songSource: "link" | "upload";
  playbackStartTime: string;
  playbackEndTime: string;
  onFieldChange: (field: string, value: string) => void;
}

export function PlaybackRangeFields({
  language,
  songSource,
  playbackStartTime,
  playbackEndTime,
  onFieldChange,
}: PlaybackRangeFieldsProps) {
  const playbackDuration = useMemo(() => {
    const startSec = parseTimestamp(playbackStartTime);
    const endSec = parseTimestamp(playbackEndTime);
    if (
      startSec !== null &&
      endSec !== null &&
      endSec > startSec
    ) {
      return formatDuration(endSec - startSec);
    }
    return null;
  }, [playbackStartTime, playbackEndTime]);

  if (songSource === "link") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/10">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {language === "en"
              ? "Playback Summary"
              : "प्लेबैक सारांश"}
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {language === "en" ? "Start:" : "शुरुआत:"}
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {playbackStartTime || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {language === "en" ? "End:" : "अंत:"}
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {playbackEndTime || "—"}
              </span>
            </div>
            {playbackDuration && (
              <div className="flex justify-between border-t border-amber-200 pt-2 dark:border-amber-800">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {language === "en"
                    ? "Duration:"
                    : "अवधि:"}
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-500">
                  {playbackDuration}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Upload source - show input fields for start/end time
  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
      <div>
        <label className="block text-sm font-semibold text-gray-900">
          {language === "en"
            ? "Playback Range (Optional)"
            : "प्लेबैक रेंज (वैकल्पिक)"}
        </label>
        <p className="mt-1 text-xs font-medium text-gray-700">
          {language === "en"
            ? "Specify which part of the song to play during the performance"
            : "प्रदर्शन के दौरान गीत का कौन सा हिस्सा बजाया जाए यह निर्दिष्ट करें"}
        </p>
      </div>

      <div className="rounded border border-amber-200 bg-amber-100/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
        {language === "en"
          ? "For uploaded audio, you can keep the whole song or set a start and end time."
          : "अपलोड की गई ऑडियो के लिए, आप पूरी ट्रैक रख सकते हैं या शुरू/अंत समय सेट कर सकते हैं।"}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-900">
            {language === "en" ? "Start Time" : "शुरुआत का समय"}
          </label>
          <input
            type="text"
            value={playbackStartTime}
            onChange={(e) =>
              onFieldChange("playbackStartTime", e.target.value)
            }
            placeholder="MM:SS"
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-xs font-medium text-gray-700">
            {language === "en"
              ? "e.g. 00:00 for start"
              : "उदाहरण: शुरुआत के लिए 00:00"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-900">
            {language === "en" ? "End Time" : "अंत का समय"}
          </label>
          <input
            type="text"
            value={playbackEndTime}
            onChange={(e) =>
              onFieldChange("playbackEndTime", e.target.value)
            }
            placeholder="MM:SS"
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-xs font-medium text-gray-700">
            {language === "en"
              ? "Leave empty to play full track"
              : "पूरा ट्रैक चलाने के लिए खाली छोड़ें"}
          </p>
        </div>
      </div>

      {playbackDuration && (
        <div className="rounded bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
          <span className="font-medium">
            {language === "en" ? "Duration:" : "अवधि:"}
          </span>{" "}
          <span className="font-mono font-semibold">{playbackDuration}</span>
        </div>
      )}
    </div>
  );
}
