"use client";

import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { PartySelector } from "./PartySelector";
import { PerformanceTypeSelector } from "./PerformanceTypeSelector";
import { PerformanceInfoFields } from "./PerformanceInfoFields";
import { ParticipantList } from "./ParticipantList";
import { SongSourceSelector } from "./SongSourceSelector";
import { SongLinkFields } from "./SongLinkFields";
import { SongUploadField } from "./SongUploadField";
import { PlaybackRangeFields } from "./PlaybackRangeFields";
import { StageDurationField } from "./StageDurationField";
import { PerformanceReview } from "./PerformanceReview";
import { Button } from "@/components/ui/Button";
import { sangeetClientSchema } from "@/lib/validation/sangeet";
import type { SangeetClientInput } from "@/lib/validation/sangeet";
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

interface ErrorState {
  [key: string]: string;
}

const initialFormState: FormState = {
  weddingParty: null,
  performanceType: null,
  performanceTitle: "",
  performanceCategory: "",
  leadPerformer: "",
  contactNumber: "",
  participants: [],
  songSource: null,
  songUrl: "",
  playbackStartTime: "",
  playbackEndTime: "",
  fullSong: false,
  audioFile: null,
  audioFileName: "",
  audioFileSize: 0,
  audioMimeType: "",
  estimatedStageDurationMinutes: 5,
};

const translations = {
  en: {
    heading: "Take the Stage, Make a Memory",
    subheading:
      "We would love to have you be part of our Sangeet celebration. Share your performance details and the song you would like us to play.",
    errorSubmitting: "Error submitting registration",
    submitButton: "Register Performance",
    submitting: "Registering...",
    successHeading: "Performance Registered!",
    successMessage: "Your performance has been successfully registered.",
    tryAgain: "Try Again",
    viewDetails: "View Details",
  },
  hi: {
    heading: "आइए, इस शाम को यादगार बनाएं",
    subheading:
      "हमारी संगीत संध्या में आपकी प्रस्तुति का हमें बेसब्री से इंतज़ार रहेगा। अपनी प्रस्तुति और पसंदीदा गीत की जानकारी साझा करें।",
    errorSubmitting: "पंजीकरण जमा करने में त्रुटि",
    submitButton: "प्रस्तुति पंजीकृत करें",
    submitting: "पंजीकृत किया जा रहा है...",
    successHeading: "प्रस्तुति सफलतापूर्वक पंजीकृत!",
    successMessage:
      "आपकी प्रस्तुति सफलतापूर्वक पंजीकृत हो गई है।",
    tryAgain: "फिर से कोशिश करें",
    viewDetails: "विवरण देखें",
  },
};

type Language = "en" | "hi";

// Helper to generate UUIDs on client
function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers without randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface SangeetRegistrationFormProps {
  language: Language;
}

export function SangeetRegistrationForm({
  language,
}: SangeetRegistrationFormProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<ErrorState>({});
  const [snackbarError, setSnackbarError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<{
    performanceId: string;
    rowNumber: number;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const t = translations[language];

  const handlePartyChange = (party: "groom" | "bride") => {
    setFormState((prev) => ({ ...prev, weddingParty: party }));
    setErrors((prev) => ({ ...prev, weddingParty: "" }));
  };

  const handlePerformanceTypeChange = (type: "solo" | "group") => {
    setFormState((prev) => ({ ...prev, performanceType: type }));
    setErrors((prev) => ({ ...prev, performanceType: "" }));
  };

  const handleFieldChange = (field: string, value: string | number | boolean | File | null) => {
    setFormState((prev) => ({ ...prev, [field]: value } as FormState));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAudioFileSelect = (file: File | null) => {
    if (!file) {
      setFormState((prev) => ({
        ...prev,
        audioFile: null,
        audioFileName: "",
        audioFileSize: 0,
        audioMimeType: "",
      }));
      setErrors((prev) => ({ ...prev, audioFile: "" }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      audioFile: file,
      audioFileName: file.name,
      audioFileSize: file.size,
      audioMimeType: file.type,
    }));
    setErrors((prev) => ({ ...prev, audioFile: "" }));
  };

  const handleParticipantChange = (
    id: string,
    name: string,
  ) => {
    setFormState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === id ? { ...p, name } : p,
      ),
    }));
    setErrors((prev) => ({ ...prev, participants: "" }));
  };

  const handleAddParticipant = () => {
    setFormState((prev) => ({
      ...prev,
      participants: [...prev.participants, { id: generateUuid(), name: "" }],
    }));
  };

  const handleRemoveParticipant = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  };

  const handleResetForm = () => {
    setFormState(initialFormState);
    setErrors({});
    setSnackbarError("");
    setSuccessState(null);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setSnackbarError("");

      if (successState) {
        handleResetForm();
        return;
      }

      // Validate using client schema
      try {
        // Build client input
        const clientInput: SangeetClientInput = {
          weddingParty: formState.weddingParty as "groom" | "bride",
          performanceType: formState.performanceType as "solo" | "group",
          performanceTitle: formState.performanceTitle,
          performanceCategory: formState.performanceCategory,
          leadPerformer: formState.leadPerformer,
          contactNumber: formState.contactNumber,
          participants: formState.participants,
          songSource: formState.songSource as "link" | "upload",
          fullSong: formState.fullSong,
          songUrl: formState.songUrl || undefined,
          playbackStartTime: formState.playbackStartTime || undefined,
          playbackEndTime: formState.playbackEndTime || undefined,
          audioFileName: formState.audioFileName || undefined,
          audioFileSize: formState.audioFileSize || undefined,
          audioMimeType: formState.audioMimeType || undefined,
          estimatedStageDurationMinutes:
            formState.estimatedStageDurationMinutes,
        };

        // Validate
        const validated = await sangeetClientSchema.parseAsync(clientInput);

        setIsSubmitting(true);

        // Prepare payload
        const payload: Record<string, string | number | boolean | object> = {
          ...validated,
          turnstileToken: "",
        };

        // Prepare audio if uploaded
        if (validated.songSource === "upload" && formState.audioFile) {
          const audioBuffer = await formState.audioFile.arrayBuffer();
          const audioBytes = new Uint8Array(audioBuffer);
          
          // Encode as base64 for transmission
          const binaryString = Array.from(audioBytes)
            .map((byte) => String.fromCharCode(byte))
            .join("");
          const base64Audio = btoa(binaryString);
          
          payload.audioBytes = base64Audio;
        }

        // Submit
        const response = await fetch("/api/sangeet-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as {
          ok?: boolean;
          code?: string;
          message?: string;
          performanceId?: string;
          rowNumber?: number;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Registration failed");
        }

        setSuccessState({
          performanceId: result.performanceId ?? "",
          rowNumber: result.rowNumber ?? 0,
        });

        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch (error) {
        const fallbackMessage =
          t.errorSubmitting;

        const extractFriendlyError = (raw: unknown): string => {
          if (typeof raw === "string") {
            const trimmed = raw.trim();
            if (!trimmed) return fallbackMessage;
            try {
              const parsed = JSON.parse(trimmed);
              if (typeof parsed === "string") return parsed;
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  if (
                    item &&
                    typeof item === "object" &&
                    "message" in item &&
                    typeof (item as { message?: unknown }).message === "string" &&
                    (item as { message: string }).message.trim()
                  ) {
                    return (item as { message: string }).message;
                  }
                }
              }
              if (parsed && typeof parsed === "object") {
                const candidates = [
                  parsed.message,
                  parsed.error,
                  parsed.details,
                  parsed.title,
                ];
                for (const candidate of candidates) {
                  if (typeof candidate === "string" && candidate.trim()) {
                    return candidate;
                  }
                }
              }
            } catch {
              // Ignore parse error and return the raw string.
            }
            return trimmed;
          }

          if (raw && typeof raw === "object") {
            const candidate = raw as Record<string, unknown>;
            const directMessage = typeof candidate.message === "string" ? candidate.message : "";
            if (directMessage) return directMessage;
            if (typeof candidate.error === "string" && candidate.error.trim()) return candidate.error;
            return fallbackMessage;
          }

          return fallbackMessage;
        };

        const message = error instanceof Error ? extractFriendlyError(error.message) : fallbackMessage;

        // Parse Zod errors
        if (error && typeof error === "object" && "errors" in error) {
          const zodErrors = (error as { errors: Array<{ path: Array<string | number>; message: string }> }).errors;
          const newErrors: ErrorState = {};
          for (const err of zodErrors) {
            const path = err.path[0] || "form";
            newErrors[String(path)] = err.message;
          }
          setErrors(newErrors);
        } else {
          setSnackbarError(message);
        }
        
        // Auto-scroll to top to show error
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, successState, t],
  );

  if (successState) {
    return (
      <PerformanceReview
        language={language}
        performanceId={successState.performanceId}
        formState={formState}
        onReset={handleResetForm}
      />
    );
  }

  return (
    <>
      {snackbarError && (
        <div 
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4 sm:px-6 sm:py-6" 
          style={{ willChange: "transform" }}
          role="region"
          aria-live="polite"
          aria-label={language === "en" ? "Error notification" : "त्रुटि सूचना"}
        >
          <div
            role="alert"
            aria-live="assertive"
            className="pointer-events-auto max-w-sm rounded-lg border border-red-200 bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <p>{snackbarError}</p>
              <button
                type="button"
                onClick={() => setSnackbarError("")}
                className="flex-shrink-0 rounded px-2 py-1 text-xs font-semibold text-red-50 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0"
                aria-label={language === "en" ? "Close error" : "त्रुटि बंद करें"}
              >
                {language === "en" ? "Close" : "बंद करें"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="sangeet-form w-full max-w-2xl space-y-8"
      >
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-semibold text-amber-900 dark:text-amber-200 sm:text-3xl">
          {t.heading}
        </h1>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
          {t.subheading}
        </p>
      </div>

      {/* Party Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-900">
          {language === "en" ? "Which family are you from?" : "आप किस पक्ष से हैं?"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <PartySelector
          value={formState.weddingParty}
          onChange={handlePartyChange}
          language={language}
          error={errors.weddingParty}
        />
      </div>

      {formState.weddingParty && (
        <>
          {/* Performance Type */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">
              {language === "en"
                ? "What kind of performance are you registering?"
                : "आप किस प्रकार की प्रस्तुति पंजीकृत कर रहे हैं?"}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <PerformanceTypeSelector
              value={formState.performanceType}
              onChange={handlePerformanceTypeChange}
              language={language}
              error={errors.performanceType}
            />
          </div>

          {formState.performanceType && (
            <>
              {/* Performance Info */}
              <PerformanceInfoFields
                language={language}
                performanceTitle={formState.performanceTitle}
                performanceCategory={formState.performanceCategory}
                leadPerformer={formState.leadPerformer}
                contactNumber={formState.contactNumber}
                onFieldChange={handleFieldChange}
                errors={errors}
              />

              {/* Participants */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[var(--deep-ink)]">
                  {language === "en"
                    ? "Participant Details"
                    : "प्रतिभागी विवरण"}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <ParticipantList
                  language={language}
                  performanceType={formState.performanceType}
                  participants={formState.participants}
                  onParticipantChange={handleParticipantChange}
                  onAddParticipant={handleAddParticipant}
                  onRemoveParticipant={handleRemoveParticipant}
                  error={errors.participants}
                />
              </div>

              {/* Song Source */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[var(--deep-ink)]">
                  {language === "en"
                    ? "How will you provide the song?"
                    : "आप गीत कैसे प्रदान करेंगे?"}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <SongSourceSelector
                  value={formState.songSource}
                  onChange={(source) =>
                    handleFieldChange("songSource", source)
                  }
                  language={language}
                  error={errors.songSource}
                />
              </div>

              {formState.songSource && (
                <>
                  {formState.songSource === "link" && (
                    <SongLinkFields
                      language={language}
                      songUrl={formState.songUrl}
                      playbackStartTime={formState.playbackStartTime}
                      playbackEndTime={formState.playbackEndTime}
                      fullSong={formState.fullSong}
                      onFieldChange={handleFieldChange}
                      errors={errors}
                    />
                  )}

                  {formState.songSource === "upload" && (
                    <SongUploadField
                      language={language}
                      audioFile={formState.audioFile}
                      fullSong={formState.fullSong}
                      onFileSelect={handleAudioFileSelect}
                      onFullSongChange={(checked) =>
                        handleFieldChange("fullSong", checked)
                      }
                      error={errors.audioFile || errors.audioFileName || errors.audioFileSize}
                    />
                  )}

                  {!formState.fullSong &&
                    ((formState.songSource === "upload" &&
                      !formState.fullSong) ||
                      (formState.songSource === "link" &&
                        formState.playbackStartTime &&
                        formState.playbackEndTime)) && (
                      <PlaybackRangeFields
                        language={language}
                        songSource={formState.songSource}
                        playbackStartTime={formState.playbackStartTime}
                        playbackEndTime={formState.playbackEndTime}
                        onFieldChange={handleFieldChange}
                      />
                    )}

                  {formState.songSource === "upload" && formState.fullSong && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                      {language === "en"
                        ? "Full uploaded song selected. Playback time range is not required."
                        : "पूरी अपलोड की गई फ़ाइल चुनी गई है। प्लेबैक समय रेंज आवश्यक नहीं है।"}
                    </div>
                  )}

                  {/* Stage Duration */}
                  <StageDurationField
                    language={language}
                    estimatedStageDurationMinutes={
                      formState.estimatedStageDurationMinutes
                    }
                    onFieldChange={handleFieldChange}
                    error={errors.estimatedStageDurationMinutes}
                  />

                  {/* Submit Button */}
                  <div className="space-y-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? t.submitting : t.submitButton}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      </form>
    </>
  );
}
