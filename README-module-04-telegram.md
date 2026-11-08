# Module 04: Secure Telegram Notifications

This module sends registration notifications to two host chat IDs using one Telegram bot.

## Implemented behavior

- Server-only Telegram configuration and API client.
- One bot sends notifications to:
  - TELEGRAM_GROOM_CHAT_ID
  - TELEGRAM_BRIDE_CHAT_ID
- Message includes:
  - Registered side (English + Hindi)
  - Family name
  - Guest names for that registration
  - Guest count for that family
  - Groom/ Bride family and guest totals
  - Overall family and guest totals
- No Aadhaar documents, numbers, Drive links, or spreadsheet IDs are included.
- Dynamic values are escaped for Telegram HTML formatting safety.
- Per-chat idempotent delivery tracking in operation record.
- Retries for transient Telegram failures.

## Required environment variables

- TELEGRAM_BOT_TOKEN
- TELEGRAM_GROOM_CHAT_ID
- TELEGRAM_BRIDE_CHAT_ID

Do not use NEXT_PUBLIC_ prefixes for these values.

## Security notes

- Bot token is never returned in API responses.
- Full bot-token URLs are never logged.
- Notification payload excludes private folder links and Aadhaar document data.

## Delivery and consistency notes

- Notifications are sent after successful registration completion steps.
- Each chat ID is sent separately.
- Already-delivered chats are skipped on retries using operation-state tracking.
- Partial notification failure surfaces a non-success integration status and remains retryable.

## Tests

Run:

```bash
npm run test
```

Telegram tests include:
- formatter content/escaping
- config validation
- idempotent skip behavior when already delivered
