import { z } from "zod";
import rawWeddingContent from "@/content/wedding-content.json";
import type { AppLanguage } from "@/lib/i18n/app-language";

const SUPPORTED_TIME_ZONES = ["Asia/Kolkata"] as const;

const localizedTextSchema = z.object({
  hi: z.string().min(1),
  en: z.string().min(1),
});

const timeZoneSchema = z.enum(SUPPORTED_TIME_ZONES);

const eventThemeSchema = z.enum([
  "marigold-yellow",
  "botanical-green",
  "emerald-midnight",
  "champagne-blush",
  "ivory-sindoor",
  "champagne-plum",
]);

const eventMotifSchema = z.enum([
  "marigold",
  "henna",
  "music",
  "rings",
  "varmala-mandap",
  "evening-lights",
]);

const eventLayoutSchema = z.enum(["featured", "timeline", "split", "editorial", "highlight", "minimal"]);

const eventTypeSchema = z.enum(["mehendi", "haldi", "sangeet", "engagement", "wedding", "reception"]);

const videoProviderSchema = z.enum(["google-drive", "direct-mp4"]);

function isValidIsoDateTime(value: string): boolean {
  if (Number.isNaN(Date.parse(value))) {
    return false;
  }

  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(value);
}

function isValidAssetReference(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const assetPathSchema = z
  .string()
  .refine(isValidAssetReference, "Expected a local asset path (starts with /) or an absolute http/https URL");

const optionalUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), "URL must start with http:// or https://")
  .nullable();

const mediaAssetSchema = z.object({
  src: assetPathSchema,
  alt: localizedTextSchema,
});

const weddingVenueSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  city: localizedTextSchema,
  shortAddress: localizedTextSchema,
  fullAddress: localizedTextSchema,
  description: localizedTextSchema,
  heroImage: mediaAssetSchema.nullable(),
  gallery: z.array(mediaAssetSchema),
  googleMapsEmbedUrl: optionalUrlSchema,
  googleMapsDirectionsUrl: optionalUrlSchema,
  arrivalGuidance: localizedTextSchema.nullable().optional(),
  parkingInfo: localizedTextSchema.nullable().optional(),
  accommodationInfo: localizedTextSchema.nullable().optional(),
  transportInfo: localizedTextSchema.nullable().optional(),
  assistanceContact: localizedTextSchema.nullable().optional(),
});

const weddingEventSchema = z.object({
  id: z.string().min(1),
  type: eventTypeSchema,
  enabled: z.boolean(),
  sequence: z.number().int().positive(),
  title: localizedTextSchema,
  summary: localizedTextSchema,
  startDateTimeIso: z
    .string()
    .nullable()
    .refine((value) => value === null || isValidIsoDateTime(value), "startDateTimeIso must be a valid ISO date-time string"),
  endDateTimeIso: z
    .string()
    .nullable()
    .refine((value) => value === null || isValidIsoDateTime(value), "endDateTimeIso must be a valid ISO date-time string"),
  timeZone: timeZoneSchema,
  venueId: z.string().min(1),
  image: mediaAssetSchema.nullable(),
  dressCode: localizedTextSchema.nullable().optional(),
  directionsUrl: optionalUrlSchema.optional(),
  visual: z.object({
    theme: eventThemeSchema,
    motif: eventMotifSchema,
    layout: eventLayoutSchema,
  }),
});

const invitationVideoSchema = z
  .object({
    provider: videoProviderSchema,
    shareUrl: z.string().url().nullable().optional(),
    src: z.string().url().nullable().optional(),
    poster: assetPathSchema.nullable().optional(),
  });

const weddingContentSchema = z
  .object({
    isDemoContent: z.boolean(),
    site: z.object({
      defaultLanguage: z.enum(["hi", "en"]),
      supportedLanguages: z.array(z.enum(["hi", "en"])).min(1),
      timezone: timeZoneSchema,
    }),
    couple: z.object({
      bride: z.object({
        name: localizedTextSchema,
      }),
      groom: z.object({
        name: localizedTextSchema,
      }),
      displayName: localizedTextSchema,
      monogram: z.string().min(1),
    }),
    wedding: z.object({
      dateTime: z.string().refine(isValidIsoDateTime, "wedding.dateTime must be a valid ISO date-time string"),
      dateDisplay: localizedTextSchema,
      location: localizedTextSchema,
    }),
    invitation: z.object({
      eyebrow: localizedTextSchema,
      message: localizedTextSchema,
      blessingsLine: localizedTextSchema,
    }),
    media: z.object({
      invitationVideo: invitationVideoSchema,
    }),
    navigation: z.object({
      home: localizedTextSchema,
      celebrations: localizedTextSchema,
      venue: localizedTextSchema,
      familyRegistration: localizedTextSchema,
      sangeet: localizedTextSchema,
      language: localizedTextSchema,
      menu: localizedTextSchema,
      closeMenu: localizedTextSchema,
    }),
    actions: z.object({
      exploreVenue: localizedTextSchema,
      openRegistration: localizedTextSchema,
      sangeetUnavailable: localizedTextSchema,
      viewCelebrations: localizedTextSchema,
      playInvitationVideo: localizedTextSchema,
    }),
    labels: z.object({
      date: localizedTextSchema,
      location: localizedTextSchema,
      countdownHeading: localizedTextSchema,
      invitationMessageHeading: localizedTextSchema,
      eventsHeading: localizedTextSchema,
      venueHeading: localizedTextSchema,
      byFamilies: localizedTextSchema,
      closingMessage: localizedTextSchema,
      footerBlessing: localizedTextSchema,
      countdownEnded: localizedTextSchema,
      countdownDays: localizedTextSchema,
      countdownHours: localizedTextSchema,
      countdownMinutes: localizedTextSchema,
      countdownSeconds: localizedTextSchema,
      videoFallbackTitle: localizedTextSchema,
      videoFallbackText: localizedTextSchema,
      videoPlay: localizedTextSchema,
      videoPause: localizedTextSchema,
      videoResume: localizedTextSchema,
      videoReplay: localizedTextSchema,
      videoUnavailable: localizedTextSchema,
      videoPrivacyNote: localizedTextSchema,
      demoIndicator: localizedTextSchema,
      venuePageHeading: localizedTextSchema,
      venuePageIntro: localizedTextSchema,
      scheduleHeading: localizedTextSchema,
      eventLabelPrefix: localizedTextSchema,
      startsAt: localizedTextSchema,
      endsAt: localizedTextSchema,
      eventDatePending: localizedTextSchema,
      venueAddress: localizedTextSchema,
      venueDescription: localizedTextSchema,
      venueMapHeading: localizedTextSchema,
      mapPlaceholderHeading: localizedTextSchema,
      mapPlaceholderBody: localizedTextSchema,
      directions: localizedTextSchema,
      eventVenue: localizedTextSchema,
      dressCode: localizedTextSchema,
      timezoneLabel: localizedTextSchema,
      guestInfoHeading: localizedTextSchema,
      arrivalGuidance: localizedTextSchema,
      parkingInfo: localizedTextSchema,
      accommodationInfo: localizedTextSchema,
      transportInfo: localizedTextSchema,
      assistanceContact: localizedTextSchema,
    }),
    venues: z.array(weddingVenueSchema).min(1),
    mainVenueId: z.string().min(1),
    events: z.array(weddingEventSchema),
    routes: z.object({
      home: z.string().min(1),
      venueEvents: z.string().min(1),
      familyRegistration: z.string().min(1),
      sangeetPerformance: z.string().min(1).nullable(),
      legacyVenueEvents: z.string().min(1).optional(),
    }),
  })
  .superRefine((value, context) => {
    const venueIds = new Set(value.venues.map((venue) => venue.id));

    if (!venueIds.has(value.mainVenueId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "mainVenueId must reference an existing venues[].id",
        path: ["mainVenueId"],
      });
    }

    const eventIdSet = new Set<string>();
    value.events.forEach((event, index) => {
      if (eventIdSet.has(event.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate event id detected: ${event.id}`,
          path: ["events", index, "id"],
        });
      }
      eventIdSet.add(event.id);

      if (!venueIds.has(event.venueId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Event ${event.id} references unknown venueId: ${event.venueId}`,
          path: ["events", index, "venueId"],
        });
      }

      if (event.enabled && !event.startDateTimeIso) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Enabled event ${event.id} must define startDateTimeIso`,
          path: ["events", index, "startDateTimeIso"],
        });
      }
    });
  });

const parsed = weddingContentSchema.safeParse(rawWeddingContent);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid wedding-content.json configuration:\n${issues}`);
}

export const weddingContent = {
  ...parsed.data,
  couple: {
    ...parsed.data.couple,
    names: parsed.data.couple.displayName,
  },
  wedding: {
    ...parsed.data.wedding,
    dateTimeIso: parsed.data.wedding.dateTime,
    timeZone: parsed.data.site.timezone,
  },
};

export function pickLocalizedText(content: LocalizedText, language: AppLanguage): string {
  return language === "hi" ? content.hi : content.en;
}

export function getVenueById(venueId: string): WeddingVenue | undefined {
  return weddingContent.venues.find((venue) => venue.id === venueId);
}

export function getMainVenue(): WeddingVenue {
  return getVenueById(weddingContent.mainVenueId) ?? weddingContent.venues[0];
}

export function getEnabledEvents(): WeddingEvent[] {
  return weddingContent.events.filter((event) => event.enabled);
}

export function extractGoogleDriveFileId(shareUrl: string): string | null {
  const normalized = shareUrl.trim();
  const match = normalized.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type WeddingMediaAsset = z.infer<typeof mediaAssetSchema>;
export type WeddingVenue = z.infer<typeof weddingVenueSchema>;
export type WeddingEvent = z.infer<typeof weddingEventSchema>;
export type EventTheme = z.infer<typeof eventThemeSchema>;
export type EventMotif = z.infer<typeof eventMotifSchema>;
export type EventLayout = z.infer<typeof eventLayoutSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
export type InvitationVideoProvider = z.infer<typeof videoProviderSchema>;
export type InvitationVideoConfig = z.infer<typeof invitationVideoSchema>;
export type WeddingContent = typeof weddingContent;
export type SupportedLanguage = "hi" | "en";
