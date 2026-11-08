import "server-only";

export function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error("Server-only module imported into a client context.");
  }
}
