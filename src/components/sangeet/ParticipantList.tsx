"use client";

import { Button } from "@/components/ui/Button";

interface ParticipantListProps {
  language: "en" | "hi";
  performanceType: "solo" | "group";
  participants: Array<{ id: string; name: string }>;
  onParticipantChange: (id: string, name: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
  error?: string;
}

export function ParticipantList({
  language,
  performanceType,
  participants,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
  error,
}: ParticipantListProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800">
        {participants.map((participant, index) => (
          <div key={participant.id} className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100">
                {language === "en"
                  ? `Participant ${index + 1}`
                  : `प्रतिभागी ${index + 1}`}
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) =>
                  onParticipantChange(participant.id, e.target.value)
                }
                placeholder={
                  language === "en"
                    ? "Enter participant name"
                    : "प्रतिभागी का नाम दर्ज करें"
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                required
                disabled={
                  performanceType === "solo"
                }
              />
            </div>
            {performanceType === "group" && participants.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveParticipant(participant.id)}
                className="mt-6 self-end rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                {language === "en" ? "Remove" : "हटाएं"}
              </button>
            )}
          </div>
        ))}
      </div>

      {performanceType === "group" && (
        <Button
          type="button"
          onClick={onAddParticipant}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          {language === "en"
            ? "+ Add Participant"
            : "+ प्रतिभागी जोड़ें"}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
