# Google OAuth + Neon PostgreSQL Setup

This project now uses a single Google OAuth 2.0 connection for both Drive and Sheets, with the refresh token encrypted and stored in Neon PostgreSQL.

## 1. Create a Google Cloud project

1. Open Google Cloud Console.
2. Create a new project or select the wedding project.
3. Enable these APIs:
   - Google Drive API
   - Google Sheets API
4. Open APIs & Services > OAuth consent screen.
5. Choose External if this uses a personal Gmail account that is not a Google Workspace admin-managed account.
6. Add the owner Gmail account as a test user during setup, or publish the app after verification if you want long-lived refresh tokens.

## 2. Configure the OAuth client

1. Go to APIs & Services > Credentials.
2. Create an OAuth 2.0 Client ID.
3. Set Application type to Web application.
4. Add the authorized redirect URIs below:
   - Local development: http://localhost:3000/api/google/callback
   - Production: https://YOUR_VERCEL_DOMAIN/api/google/callback
5. Add the required scopes:
   - openid
   - email
   - https://www.googleapis.com/auth/drive.file
6. Make sure the OAuth client is configured for offline access so Google can return a refresh token.

> Important: The exact redirect URI must match the value in GOOGLE_OAUTH_REDIRECT_URI exactly, including the domain and path.

## 3. Protect the owner connection

Set these environment variables in local development and in Vercel:

```
GOOGLE_OAUTH_CLIENT_ID="YOUR_CLIENT_ID"
GOOGLE_OAUTH_CLIENT_SECRET="YOUR_CLIENT_SECRET"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/api/google/callback"
GOOGLE_ALLOWED_ACCOUNT_EMAIL="your-email@gmail.com"
GOOGLE_CONNECT_SETUP_SECRET="LONG_RANDOM_SECRET"
GOOGLE_TOKEN_ENCRYPTION_KEY="BASE64_ENCODED_32_BYTE_KEY"
GOOGLE_HOTEL_STAFF_EMAIL="hotel.staff@gmail.com"
```

Keep all of these server-only values out of the frontend. Do not use NEXT_PUBLIC_ for them.

## 4. Generate the encryption and setup secrets

Use Node to generate the required values, then copy them into .env.local or the Vercel project settings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Use the first value for GOOGLE_TOKEN_ENCRYPTION_KEY.
- Use the second value for GOOGLE_CONNECT_SETUP_SECRET.

## 5. Create a Neon PostgreSQL database

1. Open the Neon dashboard.
2. Create a project and database.
3. Copy the pooled connection string.
4. Add it to the environment as DATABASE_URL.
5. In Vercel, install the Neon integration or add the variable manually in Project Settings > Environment Variables.

For Vercel:

- Use the Neon marketplace integration if available.
- Otherwise create the database in Neon and add DATABASE_URL to both Preview and Production environments.

## 6. Run database migrations

From the project root:

```bash
npm run db:generate
npm run db:migrate
```

If you need to reset a local database for a fresh dev environment, only do so intentionally and not in shared or production environments.

## 7. Initial Google connection

1. Start the app locally with the required environment variables set.
2. Open the connection page: http://localhost:3000/google/connect
3. Enter the GOOGLE_CONNECT_SETUP_SECRET.
4. Click Connect Google.
5. Select the owner Gmail account and grant consent for Drive file access.
6. On callback, the app validates the Google ID token and compares the verified email to GOOGLE_ALLOWED_ACCOUNT_EMAIL.

If the app does not accept the account, check:

- the email is exactly the configured allowed account
- the Google OAuth client matches the redirect URI
- the email is verified by Google
- the app is published or the account is added as a test user

## 8. Initialize Drive resources and Sheets

After a successful connection:

1. Visit the settings endpoint or route that triggers initialization.
2. Run the Google resource initialization flow.
3. The app creates or reuses the following:
   - Wedding Documents root folder
   - Groom folder
   - Bride folder
   - Sangeet Performances folder
   - Groom and Bride subfolders inside Sangeet
   - a single spreadsheet workbook with tabs: Groom, Bride, Summary, Sangeet
4. The app stores the Google folder IDs and spreadsheet ID in the Google integration record in Neon.

## 9. Hotel staff access

The app grants Viewer permission to the configured hotel staff Gmail account for:

- Groom folder
- Bride folder
- Sheets workbook

It does not share the root folder, and it avoids duplicate permissions on repeated initialization.

## 10. Reconnect and disconnect safely

Disconnect requires:

- the setup secret
- explicit confirmation

When disconnecting, the app attempts to revoke the Google refresh token and then removes the stored local record. If revocation fails, the app reports the failure clearly without hiding the issue.

A reconnect with a different Google sub requires explicit owner confirmation and the same setup secret.

## 11. Testing mode limitations

Google OAuth in testing mode can issue refresh tokens only for users added to the OAuth consent screen as test users. When the application is not published, refresh tokens usually expire after about seven days.

For long-lived access, publish the OAuth app after verification or ensure the account is properly authorized.

## 12. Verify the connection

The application exposes a minimal status endpoint at:

- /api/google/status

This returns:

- connection status
- Gmail address
- connected timestamp
- Drive initialization state
- spreadsheet initialization state

Do not expose tokens, encryption keys, or sensitive refresh-token contents in any browser-facing response.
