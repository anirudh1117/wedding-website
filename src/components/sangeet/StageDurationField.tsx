"use client";

import { MIN_STAGE_DURATION_MINUTES, MAX_STAGE_DURATION_MINUTES } from "@/lib/sangeet/constants";

interface StageDurationFieldProps {
  language: "en" | "hi";
  estimatedStageDurationMinutes: number;
  onFieldChange: (field: string, value: number) => void;
  error?: string;
}

export function StageDurationField({
  language,
  estimatedStageDurationMinutes,
  onFieldChange,
  error,
}: StageDurationFieldProps) {
  return (
    <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
        {language === "en"
          ? "Estimated Performance Duration (minutes)"
          : "प्रस्तुति की अनुमानित अवधि (मिनट)"}
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="mt-3 space-y-3">
        <input
          type="number"
          value={estimatedStageDurationMinutes}
          onChange={(e) =>
            onFieldChange(
              "estimatedStageDurationMinutes",
              parseInt(e.target.value, 10) || 1,
            )
          }
          min={MIN_STAGE_DURATION_MINUTES}
          max={MAX_STAGE_DURATION_MINUTES}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        />

        <div className="text-xs text-gray-600 dark:text-gray-400">
          {language === "en"
            ? "This includes song playback, entrances, setup, and stage movements. The organizers use this to schedule your performance."
            : "इसमें गीत चलाना, प्रवेश, सेटअप और मंच की गतिविधियां शामिल हैं। आयोजक इसका उपयोग आपकी प्रस्तुति को शेड्यूल करने के लिए करते हैं।"}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
