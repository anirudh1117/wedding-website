async function fetchStatus() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  const response = await fetch("/api/google/status", { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default async function GoogleSettingsPage() {
  const status = await fetchStatus();

  return (
    <main style={{ maxWidth: 800, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>Google integration</h1>
      <p>Status: {status?.status ?? "DISCONNECTED"}</p>
      <p>Connected email: {status?.email ?? "Not connected"}</p>
      <p>Connected at: {status?.connectedAt ? new Date(status.connectedAt).toLocaleString() : "—"}</p>
      <p>Drive initialized: {status?.driveInitialized ? "Yes" : "No"}</p>
      <p>Spreadsheet initialized: {status?.spreadsheetInitialized ? "Yes" : "No"}</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <a href="/api/google/connect" style={{ padding: "0.75rem 1rem", border: "1px solid #ddd" }}>Connect Google</a>
        <form action="/api/google/initialize" method="post">
          <input type="hidden" name="setupSecret" value="" />
          <button type="submit">Initialize Google resources</button>
        </form>
        <form action="/api/google/disconnect" method="post">
          <input type="hidden" name="confirm" value="true" />
          <input type="hidden" name="setupSecret" value="" />
          <button type="submit">Disconnect Google</button>
        </form>
      </div>
    </main>
  );
}
