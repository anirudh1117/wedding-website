# Module 03: Google Sheets Registry

This module adds a server-only Google Sheets family registry with tabs:
- Groom
- Bride
- Summary

## Implemented functionality

- Server-only Google Sheets client and env validation.
- Controlled sheet initialization:
  - verifies spreadsheet access
  - creates missing tabs only
  - writes/validates required headers
  - applies basic header formatting and column widths
- Family row upsert by stable registration ID (idempotent logical row behavior).
- Destination tab mapping enforced server-side:
  - groom -> Groom
  - bride -> Bride
- Folder hyperlink formula uses verified server-side family-folder ID from Module 02.
- Summary recomputation from actual registry rows excluding duplicate registration IDs.
- Formula-injection protection for family/contact text.

## Required environment variable

Add server-side variable:

- GOOGLE_SHEETS_SPREADSHEET_ID

Credentials are reused from Module 02 service-account variables.

## Registry columns (Groom/Bride)

1. Registration ID
2. Family Name
3. Contact Number
4. Total Guests
5. Registration Timestamp
6. Aadhaar Folder

Aadhaar Folder cell uses a hyperlink label: `Open Family Folder`.

## Summary metrics

Summary tab stores:
- Groom family count
- Groom total guest count
- Bride family count
- Bride total guest count
- Overall family count
- Overall guest count

Metrics are recomputed from Groom/Bride tab rows after each registry write.

## Security notes

- No client-side spreadsheet ID exposure.
- No public spreadsheet endpoint.
- No guest names, Aadhaar numbers, or document content stored in Sheets.
- User strings are sanitized to prevent spreadsheet formula execution.

## Consistency notes

- Row idempotency is keyed by registration ID (update existing row if found).
- Summary recomputation is deterministic and repairable via reconciliation.
- Full cross-service transactionality (Drive + Sheets) is not guaranteed; partial failures are surfaced as non-success.
- Production reliability requires durable operation state and reconciliation tooling.

## Tests

Run:

```bash
npm run test
```

Included tests cover:
- tab initialization
- idempotent row upsert
- summary recomputation
- formula-injection protection
