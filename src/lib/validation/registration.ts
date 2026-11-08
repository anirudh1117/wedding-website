import { z } from "zod";
import {
  ACCEPTED_AADHAAR_MIME_TYPES,
  MAX_AADHAAR_FILE_BYTES,
  REGISTRATION_MAX_GUESTS,
} from "@/lib/registration/constants";
import {
  isLikelyValidIndianMobile,
  normalizeIndianPhone,
  sanitizeFileName,
} from "@/lib/registration/helpers";

export const weddingPartySchema = z.enum(["groom", "bride"], {
  error: "Please select a wedding party.",
});

export const guestClientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "अतिथि का नाम आवश्यक है। / Guest full name is required.")
    .max(120, "अतिथि का नाम बहुत लंबा है। / Guest full name is too long."),
});

export const registrationClientSchema = z.object({
  weddingParty: weddingPartySchema,
  contactNumber: z
    .string()
    .trim()
    .min(1, "परिवार का मुख्य संपर्क नंबर आवश्यक है। / Primary contact number is required.")
    .transform(normalizeIndianPhone)
    .refine((phone) => isLikelyValidIndianMobile(phone), {
      message: "कृपया वैध भारतीय मोबाइल नंबर दर्ज करें। / Enter a valid Indian mobile number.",
    }),
  guests: z
    .array(guestClientSchema)
    .min(1, "कम से कम एक अतिथि आवश्यक है। / At least one guest is required.")
    .max(REGISTRATION_MAX_GUESTS, `अधिकतम ${REGISTRATION_MAX_GUESTS} अतिथि ही जोड़ सकते हैं। / You can add up to ${REGISTRATION_MAX_GUESTS} guests.`),
  familyName: z
    .string()
    .trim()
    .min(1, "परिवार का नाम आवश्यक है। / Family name is required.")
    .max(120, "परिवार का नाम बहुत लंबा है। / Family name is too long."),
  consentConfirmed: z.boolean().refine((value) => value === true, {
    message: "कृपया पुष्टि करें कि आप इन दस्तावेज़ों को अपलोड करने के लिए अधिकृत हैं। / Please confirm that you are authorized to upload these guest documents.",
  }),
});

export const registrationMetadataSchema = z.object({
  submittedAtIso: z.string().datetime({ offset: true }),
  source: z.literal("family-registration-form"),
});

export const guestServerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "अतिथि का नाम आवश्यक है। / Guest full name is required.")
    .max(120, "अतिथि का नाम बहुत लंबा है। / Guest full name is too long."),
  aadhaarDocument: z.object({
    fileName: z
      .string()
      .trim()
      .min(1, "दस्तावेज़ का नाम आवश्यक है। / Document filename is required.")
      .max(255, "दस्तावेज़ नाम बहुत लंबा है। / Document filename is too long.")
      .transform(sanitizeFileName),
    fileSize: z
      .number()
      .positive("अमान्य फाइल साइज़। / Invalid file size.")
      .max(MAX_AADHAAR_FILE_BYTES, "दस्तावेज़ 5 MB से बड़ा है। / Document exceeds 5 MB limit."),
    mimeType: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (value) =>
          ACCEPTED_AADHAAR_MIME_TYPES.includes(
            value as (typeof ACCEPTED_AADHAAR_MIME_TYPES)[number],
          ),
        {
          message: "असमर्थित दस्तावेज़ प्रारूप। JPG, PNG या PDF का उपयोग करें। / Unsupported file metadata. Use JPG, PNG, or PDF.",
        },
      ),
  }),
});

export const registrationServerSchema = z.object({
  weddingParty: weddingPartySchema,
  contactNumber: z
    .string()
    .trim()
    .min(1, "परिवार का मुख्य संपर्क नंबर आवश्यक है। / Primary contact number is required.")
    .transform(normalizeIndianPhone)
    .refine((phone) => isLikelyValidIndianMobile(phone), {
      message: "कृपया वैध भारतीय मोबाइल नंबर दर्ज करें। / Enter a valid Indian mobile number.",
    }),
  familyName: z
    .string()
    .trim()
    .min(1, "परिवार का नाम आवश्यक है। / Family name is required.")
    .max(120, "परिवार का नाम बहुत लंबा है। / Family name is too long."),
  guests: z
    .array(guestServerSchema)
    .min(1, "कम से कम एक अतिथि आवश्यक है। / At least one guest is required.")
    .max(REGISTRATION_MAX_GUESTS, `अधिकतम ${REGISTRATION_MAX_GUESTS} अतिथि ही जोड़ सकते हैं। / You can add up to ${REGISTRATION_MAX_GUESTS} guests.`),
  metadata: registrationMetadataSchema,
  consentConfirmed: z.boolean().refine((value) => value === true, {
    message: "प्रस्तुत करने से पहले सहमति की पुष्टि आवश्यक है। / Consent confirmation is required before submitting documents.",
  }),
});

export type WeddingParty = z.infer<typeof weddingPartySchema>;
export type RegistrationClientInput = z.infer<typeof registrationClientSchema>;
export type RegistrationServerRequest = z.infer<typeof registrationServerSchema>;
