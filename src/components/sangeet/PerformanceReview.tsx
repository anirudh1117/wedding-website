"use client";

import { Button } from "@/components/ui/Button";
import { formatDuration, parseTimestamp } from "@/lib/sangeet/helpers";

interface FormState {
  weddingParty: "groom" | "bride" | null;
  performanceType: "solo" | "group" | null;
  performanceTitle: string;
  performanceCategory: string;
  leadPerformer: string;
  contactNumber: string;
  participants: Array<{ id: string; name: string }>;
  songSource: "link" | "upload" | null;
  songUrl: string;
  playbackStartTime: string;
  playbackEndTime: string;
  fullSong: boolean;
  audioFile: File | null;
  audioFileName: string;
  audioFileSize: number;
  audioMimeType: string;
  estimatedStageDurationMinutes: number;
}

interface PerformanceReviewProps {
  language: "en" | "hi";
  performanceId: string;
  formState: FormState;
  onReset: () => void;
}

const translations = {
  en: {
    success: "✓ Performance Successfully Registered!",
    performanceId: "Performance ID",
    allSetMessage:
      "Thank you for registering your performance. The organizers have received your submission and will reach out if they have any questions.",
    registerAnother: "Register Another Performance",
    backToHome: "Back to Home",
    partyLabel: "Family",
    typeLabel: "Performance Type",
    titleLabel: "Performance Title",
    categoryLabel: "Category",
    leadLabel: "Lead Performer",
    contactLabel: "Contact Number",
    participantsLabel: "Participants",
    songLabel: "Song",
    artistLabel: "Artist",
    sourceLabel: "Source",
    durationLabel: "Duration",
    stageLabel: "Est. Stage Duration",
  },
  hi: {
    success: "✓ प्रस्तुति सफलतापूर्वक पंजीकृत!",
    performanceId: "प्रस्तुति ID",
    allSetMessage:
      "आपकी प्रस्तुति पंजीकृत करने के लिए धन्यवाद। आयोजकों को आपकी प्रस्तुति मिल गई है और यदि उनके पास कोई सवाल है तो वे आपसे संपर्क करेंगे।",
    registerAnother: "दूसरी प्रस्तुति पंजीकृत करें",
    backToHome: "होम पर वापस जाएं",
    partyLabel: "पक्ष",
    typeLabel: "प्रस्तुति का प्रकार",
    titleLabel: "प्रस्तुति का शीर्षक",
    categoryLabel: "श्रेणी",
    leadLabel: "मुख्य प्रदर्शनकारी",
    contactLabel: "संपर्क संख्या",
    participantsLabel: "प्रतिभागी",
    songLabel: "गीत",
    artistLabel: "कलाकार",
    sourceLabel: "स्रोत",
    durationLabel: "अवधि",
    stageLabel: "अनुमानित मंच अवधि",
  },
};

export function PerformanceReview({
  language,
  performanceId,
  formState,
  onReset,
}: PerformanceReviewProps) {
  const t = translations[language];

  const partyLabel =
    formState.weddingParty === "groom"
      ? language === "en"
        ? "Groom's Side"
        : "लड़के वाले"
      : language === "en"
        ? "Bride's Side"
        : "लड़की वाले";

  const typeLabel =
    formState.performanceType === "solo"
      ? language === "en"
        ? "Solo"
        : "एकल"
      : language === "en"
        ? "Group"
        : "समूह";

  const sourceLabel =
    formState.songSource === "link"
      ? language === "en"
        ? "Link"
        : "लिंक"
      : language === "en"
        ? "Upload"
        : "अपलोड";

  const playbackDuration =
    formState.playbackStartTime && formState.playbackEndTime
      ? (() => {
          const startSec = parseTimestamp(formState.playbackStartTime);
          const endSec = parseTimestamp(formState.playbackEndTime);
          if (startSec !== null && endSec !== null && endSec > startSec) {
            return formatDuration(endSec - startSec);
          }
          return null;
        })()
      : null;

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Success Header */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <h2 className="text-2xl font-semibold text-green-900 dark:text-green-200">
          {t.success}
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          {t.allSetMessage}
        </p>
      </div>

      {/* Performance ID */}
      <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {t.performanceId}
        </p>
        <p className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
          {performanceId}
        </p>
      </div>

      {/* Review Details */}
      <div className="space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {language === "en" ? "Performance Details" : "प्रस्तुति विवरण"}
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.partyLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {partyLabel}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.typeLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {typeLabel}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.titleLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formState.performanceTitle}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.categoryLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formState.performanceCategory}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.leadLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formState.leadPerformer}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.contactLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formState.contactNumber}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.participantsLabel}
            </span>
            <span className="text-right font-medium text-gray-900 dark:text-gray-100">
              {formState.participants.map((p) => p.name).join(", ")}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {language === "en" ? "Playback Mode" : "प्लेबैक मोड"}
            </span>
            <span className="text-right font-medium text-gray-900 dark:text-gray-100">
              {formState.fullSong
                ? (language === "en" ? "Full Song" : "पूरा गीत")
                : (language === "en" ? "Custom Range" : "कस्टम रेंज")}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.sourceLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {sourceLabel}
            </span>
          </div>

          {formState.songSource === "link" && formState.songUrl && (
            <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {language === "en" ? "URL" : "URL"}
              </span>
              <a
                href={formState.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 truncate"
              >
                {language === "en" ? "Open Link" : "लिंक खोलें"}
              </a>
            </div>
          )}

          {playbackDuration && (
            <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {t.durationLabel}
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {playbackDuration}
              </span>
            </div>
          )}

          <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {t.stageLabel}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formState.estimatedStageDurationMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button onClick={onReset} className="w-full">
          {t.registerAnother}
        </Button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="block w-full rounded-lg border border-amber-600 px-4 py-3 text-center text-sm font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-900/20"
        >
          {t.backToHome}
        </a>
      </div>
    </div>
  );
}
