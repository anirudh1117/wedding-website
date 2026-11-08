"use client";

import { bytesToReadableSize, sanitizeFileName } from "@/lib/registration/helpers";
import { CircleUserRound, FileText, Trash2, Upload } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { AppLanguage } from "./i18n";

type GuestEntryProps = {
  index: number;
  total: number;
  animateOnMount?: boolean;
  isRemoving?: boolean;
  language: AppLanguage;
  labels: {
    guest: string;
    remove: string;
    removeAria: string;
    fullName: string;
    fullNamePlaceholder: string;
    aadhaar: string;
    fileHint: string;
    chooseFile: string;
    selectedFilePrefix: string;
  };
  fullNameField: UseFormRegisterReturn<`guests.${number}.fullName`>;
  fileLabelId: string;
  fullNameError?: string;
  fileError?: string;
  selectedFile?: File;
  canRemove: boolean;
  onRemove: () => void;
  onFilePicked: (file: File | undefined) => void;
};

export function GuestEntry({
  index,
  total,
  animateOnMount = false,
  isRemoving = false,
  language,
  labels,
  fullNameField,
  fileLabelId,
  fullNameError,
  fileError,
  selectedFile,
  canRemove,
  onRemove,
  onFilePicked,
}: GuestEntryProps) {
  const guestLabelClassName =
    language === "hi"
      ? "text-[1.1rem] font-[family-name:var(--font-hindi-display)]"
      : "text-[1.1rem] font-medium";

  return (
    <section className={`guest-entry ${animateOnMount ? "guest-entry--new" : ""} ${isRemoving ? "guest-entry--removing" : ""} p-4 sm:p-5`}>

      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg text-[var(--primary)]">
          <CircleUserRound className="h-4 w-4" aria-hidden="true" />
          <span className={guestLabelClassName}>{labels.guest}</span>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-strong)]">{index + 1} / {total}</span>
        </h3>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="guest-remove-btn focus-ring inline-flex min-h-[44px] items-center gap-1 rounded-lg px-3 text-sm disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={labels.removeAria + " " + (index + 1)}
        >
          <Trash2 className="h-4 w-4" />
          {labels.remove}
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={`guest-${index}-fullName`} className="input-label">
            <span className="input-label__primary">{labels.fullName}</span>
          </label>
          <input
            id={`guest-${index}-fullName`}
            type="text"
            className="field focus-ring"
            placeholder={labels.fullNamePlaceholder}
            aria-invalid={fullNameError ? true : false}
            aria-describedby={fullNameError ? `guest-${index}-fullName-error` : undefined}
            {...fullNameField}
          />
          {fullNameError ? (
            <p id={`guest-${index}-fullName-error`} className="error-text">
              {String(fullNameError)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label id={fileLabelId} className="input-label">
            <span className="input-label__primary">{labels.aadhaar}</span>
          </label>
          <p className="text-xs text-[var(--muted-strong)]">{labels.fileHint}</p>

          <label
            htmlFor={`guest-${index}-aadhaarFile`}
            className="focus-ring flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--muted)]"
          >
            <Upload className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            {labels.chooseFile}
          </label>

          <input
            id={`guest-${index}-aadhaarFile`}
            type="file"
            name={`guest-${index}-aadhaarFile`}
            className="sr-only"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            aria-labelledby={fileLabelId}
            aria-invalid={fileError ? true : false}
            aria-describedby={fileError ? `guest-${index}-file-error` : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0];
              onFilePicked(file);
            }}
          />

          {selectedFile ? (
            <div className="file-chip rounded-xl p-3 text-sm">
              <p className="inline-flex items-center gap-2 text-[var(--foreground)]">
                <FileText className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                {sanitizeFileName(selectedFile.name)}
              </p>
              <p className="mt-1 text-xs">{labels.selectedFilePrefix} • {bytesToReadableSize(selectedFile.size)}</p>
            </div>
          ) : null}

          {fileError ? (
            <p id={`guest-${index}-file-error`} className="error-text">
              {String(fileError)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
