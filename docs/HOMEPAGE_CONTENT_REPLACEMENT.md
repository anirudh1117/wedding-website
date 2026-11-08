# Homepage Content Replacement Guide

All public wedding details are centralized in `src/content/wedding-content.json`.

## Replace demo content before production

- Set `isDemoContent` to `false`.
- Replace names in `couple.bride.name`, `couple.groom.name`, and `couple.displayName`.
- Replace wedding date/time in `wedding.dateTime` and `wedding.dateDisplay`.
- Update timezone in `site.timezone` if needed.
- Replace location strings in `wedding.location` and venue fields.
- Replace invitation copy in `invitation.message` and `invitation.blessingsLine`.
- Update route values in `routes` only when pages exist.

## Venue and events content (Module 08)

All venue and itinerary content also comes from `src/content/wedding-content.json`.

- `mainVenueId`: selects the primary venue shown in the venue page hero sections.
- `venues[]`: contains venue names, addresses, descriptions, gallery/media, map URLs, and optional guest guidance blocks.
- `events[]`: contains the full event itinerary with timezone-aware ISO date-time fields:
	- `startDateTimeIso`
	- `endDateTimeIso` (optional)
	- `timeZone`
	- `venueId`
	- optional event media/directions/dress code
	- `enabled` (false hides event from public pages)
	- `visual` theme/motif/layout selection

Use real verified values only for:

- `googleMapsEmbedUrl`
- `googleMapsDirectionsUrl`
- event-level `directionsUrl`

Keep these fields `null` until verified links are available.

## Invitation video setup

In `media.invitationVideo`:

- Use provider `google-drive` with `shareUrl` for Drive-hosted invitation videos.
- Use provider `direct-mp4` with `src` for browser-playable public MP4 files.
- Set `poster` to `/images/invitation/wedding-invitation-poster.webp` (or updated path).

Google Drive flow:

- Upload only the invitation video file (never Aadhaar/private docs).
- Set sharing on that file so invited guests can view it.
- Copy the `https://drive.google.com/file/d/.../view` link into `shareUrl`.
- The website automatically converts it to the Drive preview player URL.

Direct MP4 flow:

- Use a public HTTPS MP4 URL or local `/media/...` path.
- Keep it browser-compatible and mobile-friendly.

Until the configured provider URL is valid, the homepage intentionally renders a graceful invitation fallback.

## Venue media and directions

- Set `venues[].heroImage` and `venues[].gallery[]` only with real verified assets.
- Set directions/map URLs only with final verified links.
- Keep media and map fields as `null` when unavailable.

## Language copy

All homepage labels and messages are bilingual in the same content file.
Update both `hi` and `en` values for any changed text.
