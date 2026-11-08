"use client";

import { useSearchParams } from "next/navigation";

export default function ConnectErrorBanner() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get("error");

  if (!rawError) {
    return null;
  }

  let error = rawError;
  try {
    error = decodeURIComponent(rawError);
  } catch {
    // Keep raw value if it is not URI-encoded.
  }

  return (
    <div style={{ margin: "1rem 0", padding: "0.75rem 1rem", border: "1px solid #fca5a5", background: "#fff1f2", color: "#7f1d1d" }}>
      {error}
    </div>
  );
}
