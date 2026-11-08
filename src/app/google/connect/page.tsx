import { Suspense } from "react";

import ConnectErrorBanner from "./ConnectErrorBanner";

export default function GoogleConnectPage() {

  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>Google Drive & Sheets Connection</h1>
      <p>Connect the wedding website to the owner’s Google account and authorize Drive + Sheets access.</p>

      <Suspense fallback={null}>
        <ConnectErrorBanner />
      </Suspense>

      <form action="/api/google/connect" method="post" style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <label htmlFor="setupSecret" style={{ display: "grid", gap: "0.5rem" }}>
          Setup secret
          <input
            id="setupSecret"
            name="setupSecret"
            type="password"
            autoComplete="off"
            placeholder="Enter the configured GOOGLE_CONNECT_SETUP_SECRET"
            style={{ padding: "0.75rem 1rem", fontSize: "1rem" }}
            required
          />
        </label>

        <button type="submit" style={{ padding: "0.875rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}>
          Connect Google
        </button>
      </form>
    </main>
  );
}
