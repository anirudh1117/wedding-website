"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { usePetalCelebration } from "@/hooks/usePetalCelebration";
import {
  MAX_AADHAAR_FILE_BYTES,
  REGISTRATION_MAX_GUESTS,
  ACCEPTED_AADHAAR_EXTENSIONS,
  ACCEPTED_AADHAAR_MIME_TYPES,
} from "@/lib/registration/constants";
import {
  getFileExtension,
  normalizeIndianPhone,
  sanitizeFileName,
} from "@/lib/registration/helpers";
import { buildEncryptedEnvelope } from "@/lib/security/encryption";
import {
  registrationClientSchema,
  type RegistrationClientInput,
} from "@/lib/validation/registration";
import { ContactField } from "./ContactField";
import { FamilyNameField } from "./FamilyNameField";
import { GuestEntry } from "./GuestEntry";
import { type AppLanguage, pickLocalizedText, registrationCopy } from "./i18n";
import { PartySelector } from "./PartySelector";
import { RegistrationReview } from "./RegistrationReview";

type SubmitStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

function createGuest() {
  return {
    fullName: "",
  };
}

type RegistrationFormProps = {
  language: AppLanguage;
};

export function RegistrationForm({ language }: RegistrationFormProps) {
  const copy = registrationCopy[language];
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ state: "idle" });
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [guestFiles, setGuestFiles] = useState<Record<string, File | undefined>>({});
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [animateGuestFieldId, setAnimateGuestFieldId] = useState<string | null>(null);
  const [removingGuestFieldId, setRemovingGuestFieldId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { triggerPetalCelebration, overlay } = usePetalCelebration(prefersReducedMotion);
  const pendingGuestFocusIndex = useRef<number | null>(null);
  const fieldsRef = useRef<Array<{ fieldId: string }>>([]);
  const familyNameManuallyEdited = useRef(false);

  const localizeMessage = (message?: string) => {
    if (!message) {
      return undefined;
    }

    return pickLocalizedText(message, language);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationClientInput>({
    resolver: zodResolver(registrationClientSchema),
    defaultValues: {
      weddingParty: undefined,
      contactNumber: "",
      guests: [createGuest()],
      familyName: "",
      consentConfirmed: false,
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guests",
    keyName: "fieldId",
  });

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    if (pendingGuestFocusIndex.current === null) {
      return;
    }

    const nextIndex = pendingGuestFocusIndex.current;
    const nextField = fields[nextIndex];
    if (!nextField) {
      return;
    }

    setAnimateGuestFieldId(nextField.fieldId);

    window.setTimeout(() => {
      const input = document.getElementById(`guest-${nextIndex}-fullName`);
      input?.focus();
      input?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      setAnimateGuestFieldId(null);
    }, 40);

    pendingGuestFocusIndex.current = null;
  }, [fields, prefersReducedMotion]);

  const watchedGuests = useWatch({ control, name: "guests" });
  const firstGuestName = watchedGuests?.[0]?.fullName ?? "";
  const familyName = useWatch({ control, name: "familyName" });
  const selectedParty = useWatch({ control, name: "weddingParty" });
  const contactNumber = useWatch({ control, name: "contactNumber" });

  useEffect(() => {
    if (!familyNameManuallyEdited.current) {
      setValue("familyName", firstGuestName.trim(), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [firstGuestName, setValue]);

  const reviewGuests = useMemo(
    () =>
      fields.map((field, index) => ({
        fullName: watchedGuests?.[index]?.fullName ?? "",
        fileName: sanitizeFileName(guestFiles[field.fieldId]?.name),
      })),
    [fields, watchedGuests, guestFiles],
  );

  const validateGuestFiles = () => {
    let hasError = false;

    for (const field of fields) {
      const file = guestFiles[field.fieldId];

      if (!file) {
        hasError = true;
        setFileErrors((prev) => ({
          ...prev,
          [field.fieldId]: copy.validation.fileRequired,
        }));
        continue;
      }

      if (file.size > MAX_AADHAAR_FILE_BYTES) {
        hasError = true;
        setFileErrors((prev) => ({
          ...prev,
          [field.fieldId]: copy.validation.fileSize,
        }));
        continue;
      }

      const extension = getFileExtension(file.name);
      if (!ACCEPTED_AADHAAR_EXTENSIONS.includes(extension as (typeof ACCEPTED_AADHAAR_EXTENSIONS)[number])) {
        hasError = true;
        setFileErrors((prev) => ({
          ...prev,
          [field.fieldId]: copy.validation.fileType,
        }));
        continue;
      }

      const mimeType = file.type.toLowerCase();
      if (!ACCEPTED_AADHAAR_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_AADHAAR_MIME_TYPES)[number])) {
        hasError = true;
        setFileErrors((prev) => ({
          ...prev,
          [field.fieldId]: copy.validation.fileMetadata,
        }));
      }
    }

    return !hasError;
  };

  const onSubmit = handleSubmit(async (values) => {
    setFileErrors({});
    if (!validateGuestFiles()) {
      setSubmitStatus({
        state: "error",
        message: copy.submit.documentError,
      });
      return;
    }

    if (!consentConfirmed || values.consentConfirmed !== true) {
      setSubmitStatus({
        state: "error",
        message: copy.submit.consentError,
      });
      return;
    }

    setSubmitStatus({ state: "pending" });

    try {
      const keyResponse = await fetch("/api/security/public-keys");
      if (!keyResponse.ok) {
        throw new Error(copy.submit.keyError);
      }

      const keyData = (await keyResponse.json()) as {
        registrationKeyId: string;
        registrationPublicKey: string;
        documentKeyId: string;
        documentPublicKey: string;
      };

      const registrationPayload = {
        weddingParty: values.weddingParty,
        contactNumber: values.contactNumber,
        familyName: values.familyName,
        guests: values.guests.map((guest) => ({
          fullName: guest.fullName,
        })),
        metadata: {
          submittedAtIso: new Date().toISOString(),
          source: "family-registration-form" as const,
        },
        consentConfirmed: true,
      };

      const registrationEnvelope = await buildEncryptedEnvelope({
        purpose: "registration",
        keyId: keyData.registrationKeyId,
        payload: new TextEncoder().encode(JSON.stringify(registrationPayload)),
        publicKeyPem: keyData.registrationPublicKey,
        aad: JSON.stringify({
          version: 1,
          purpose: "registration",
          keyId: keyData.registrationKeyId,
        }),
      });

      const guestDocumentPayloads = await Promise.all(
        values.guests.map(async (guest, index) => {
          const fieldId = fields[index]?.fieldId;
          const file = fieldId ? guestFiles[fieldId] : undefined;

          if (!file) {
            return null;
          }

          const envelope = await buildEncryptedEnvelope({
            purpose: "document",
            keyId: keyData.documentKeyId,
            payload: new Uint8Array(await file.arrayBuffer()),
            publicKeyPem: keyData.documentPublicKey,
            aad: JSON.stringify({
              version: 1,
              purpose: "document",
              keyId: keyData.documentKeyId,
              guestIndex: index,
              fileName: sanitizeFileName(file.name),
            }),
          });

          return {
            guestIndex: index,
            encryptedDocument: envelope,
            originalFileName: sanitizeFileName(file.name),
            mimeType: file.type,
            fileSize: file.size,
          };
        }),
      );

      const payload = {
        registrationData: registrationEnvelope,
        guestDocuments: guestDocumentPayloads.filter(Boolean),
        turnstileToken: "",
      };

      const response = await fetch("/api/family-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as
        | { ok: true; message: string; documentUploadConfirmed?: boolean }
        | { ok: false; message: string; documentUploadConfirmed?: boolean };

      if (result.documentUploadConfirmed) {
        triggerPetalCelebration("upload-success");
      }

      if (!response.ok || !result.ok) {
        setSubmitStatus({
          state: "error",
          message: result.message ? pickLocalizedText(result.message, language) : copy.submit.genericError,
        });
        return;
      }

      setSubmitStatus({
        state: "success",
        message: copy.submit.success,
      });
      triggerPetalCelebration("registration-success");
    } catch (error) {
      setSubmitStatus({
        state: "error",
        message: error instanceof Error ? error.message : copy.submit.networkError,
      });
    }
  });

  const removeGuestWithAnimation = (fieldId: string) => {
    if (fields.length <= 1) {
      return;
    }

    setRemovingGuestFieldId(fieldId);
    window.setTimeout(
      () => {
        const targetIndex = fieldsRef.current.findIndex((field) => field.fieldId === fieldId);
        if (targetIndex === -1) {
          setRemovingGuestFieldId(null);
          return;
        }

        setFileErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });

        setGuestFiles((prev) => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });

        remove(targetIndex);
        setRemovingGuestFieldId(null);
      },
      prefersReducedMotion ? 0 : 170,
    );
  };

  return (
    <>
      {overlay}
      <div className="royal-form-content p-4 sm:p-5 lg:p-6">
        <header className="mb-4 space-y-2 text-center sm:text-left">
          <p className="eyebrow">{copy.page.eyebrow}</p>
          <h1 className={`text-[2.2rem] leading-[0.96] text-[var(--primary)] sm:text-[2.8rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {copy.page.heading}
          </h1>
          <p className={`max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {copy.page.subtitle}
          </p>
        </header>

        <div className="royal-divider mb-4" aria-hidden="true" />

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <PartySelector
            value={selectedParty}
            language={language}
            label={copy.party.label}
            brideLabel={copy.party.bride}
            groomLabel={copy.party.groom}
            onChange={(party) => {
              if (selectedParty !== party) {
                triggerPetalCelebration("party-select");
              }
              setValue("weddingParty", party, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            error={localizeMessage(errors.weddingParty?.message)}
          />

          <ContactField
            value={contactNumber || ""}
            label={copy.contact.label}
            placeholder={copy.contact.placeholder}
            onChange={(value) => {
              const sanitizedDigits = value.replace(/\D/g, "").slice(0, 10);
              const normalized = sanitizedDigits ? normalizeIndianPhone(`+91${sanitizedDigits}`) : "";

              setValue("contactNumber", normalized, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            error={localizeMessage(errors.contactNumber?.message)}
          />

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className={`text-lg text-[var(--primary)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)] text-[1.3rem]" : "text-[1.2rem]"}`}>{copy.guests.heading}</h2>
              <button
                type="button"
                className="btn-secondary focus-ring inline-flex items-center gap-2 px-3 py-2 text-sm"
                onClick={() => {
                  if (fields.length >= REGISTRATION_MAX_GUESTS) {
                    return;
                  }

                  pendingGuestFocusIndex.current = fields.length;
                  append(createGuest());
                  triggerPetalCelebration("add-guest");
                }}
                disabled={fields.length >= REGISTRATION_MAX_GUESTS}
              >
                <Plus className="h-4 w-4" />
                {copy.guests.add}
              </button>
            </div>

            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted-strong)]">
              {copy.guests.maxHint}
            </p>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const guestError = errors.guests?.[index];
                const uxFileError = fileErrors[field.fieldId];
                const effectiveFileError = uxFileError;

                return (
                  <GuestEntry
                    key={field.fieldId}
                    index={index}
                    total={fields.length}
                    animateOnMount={animateGuestFieldId === field.fieldId}
                    isRemoving={removingGuestFieldId === field.fieldId}
                    language={language}
                    labels={{
                      guest: copy.guests.guestLabel,
                      remove: copy.guests.remove,
                      removeAria: copy.guests.remove,
                      fullName: copy.guests.nameLabel,
                      fullNamePlaceholder: copy.guests.namePlaceholder,
                      aadhaar: copy.guests.aadhaarLabel,
                      fileHint: copy.guests.fileHint,
                      chooseFile: copy.guests.chooseFile,
                      selectedFilePrefix: copy.guests.selectedFilePrefix,
                    }}
                    fullNameField={register(`guests.${index}.fullName`)}
                    fileLabelId={`guest-${index}-file-label`}
                    fullNameError={localizeMessage(guestError?.fullName?.message)}
                    fileError={effectiveFileError}
                    selectedFile={guestFiles[field.fieldId]}
                    canRemove={fields.length > 1}
                    onRemove={() => {
                      removeGuestWithAnimation(field.fieldId);
                    }}
                    onFilePicked={(file) => {
                      if (!file) {
                        setFileErrors((prev) => {
                          const next = { ...prev };
                          delete next[field.fieldId];
                          return next;
                        });
                        setGuestFiles((prev) => ({ ...prev, [field.fieldId]: undefined }));
                        return;
                      }

                      setGuestFiles((prev) => ({ ...prev, [field.fieldId]: file }));

                      if (file.size > MAX_AADHAAR_FILE_BYTES) {
                        setFileErrors((prev) => ({ ...prev, [field.fieldId]: copy.validation.fileSize }));
                        return;
                      }

                      const extension = getFileExtension(file.name);
                      if (!ACCEPTED_AADHAAR_EXTENSIONS.includes(extension as (typeof ACCEPTED_AADHAAR_EXTENSIONS)[number])) {
                        setFileErrors((prev) => ({ ...prev, [field.fieldId]: copy.validation.fileType }));
                        return;
                      }

                      const mimeType = file.type.toLowerCase();
                      if (!ACCEPTED_AADHAAR_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_AADHAAR_MIME_TYPES)[number])) {
                        setFileErrors((prev) => ({ ...prev, [field.fieldId]: copy.validation.fileMetadata }));
                        return;
                      }

                      setFileErrors((prev) => {
                        const next = { ...prev };
                        delete next[field.fieldId];
                        return next;
                      });
                    }}
                  />
                );
              })}
            </div>

            <div className="consent-card rounded-[1rem] p-3 text-sm text-[var(--muted)]">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(event) => {
                    const nextValue = event.target.checked;
                    setConsentConfirmed(nextValue);
                    setValue("consentConfirmed", nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  className="mt-1 h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                <span>
                  <span className={`block text-[1rem] text-[var(--foreground)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
                    {copy.consent.text}
                  </span>
                </span>
              </label>
            </div>
          </section>

          <FamilyNameField
            value={familyName || ""}
            label={copy.familyName.label}
            placeholder={copy.familyName.placeholder}
            onChange={(value) => {
              familyNameManuallyEdited.current = true;
              setValue("familyName", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            error={localizeMessage(errors.familyName?.message)}
          />

          {/*<RegistrationReview
            weddingParty={selectedParty}
            familyName={familyName || ""}
            contactNumber={contactNumber || ""}
            guests={reviewGuests}
            language={language}
            labels={{
              heading: copy.review.heading,
              party: copy.review.party,
              familyName: copy.review.familyName,
              contactNumber: copy.review.contactNumber,
              guests: copy.review.guests,
              notSelected: copy.review.notSelected,
              notProvided: copy.review.notProvided,
              namePending: copy.review.namePending,
              documentPrefix: copy.review.documentPrefix,
              partyBride: copy.party.brideReview,
              partyGroom: copy.party.groomReview,
              noFileSelected: copy.guests.noneSelected,
            }}
          />*/}

          <div aria-live="polite" className="min-h-6 text-sm">
            {submitStatus.state === "success" ? (
              <p className="success-text">{copy.submit.success}</p>
            ) : null}
            {submitStatus.state === "error" ? (
              <p className="error-text">{localizeMessage(submitStatus.message) ?? copy.submit.genericError}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || submitStatus.state === "pending"}
            className="btn-primary focus-ring w-full px-4"
            aria-busy={isSubmitting || submitStatus.state === "pending"}
          >
            {isSubmitting || submitStatus.state === "pending" ? copy.submit.pending : copy.submit.idle}
          </button>
        </form>
      </div>
    </>
  );
}
