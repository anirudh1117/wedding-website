import { notFound } from "next/navigation";
import { PetalPreviewClient } from "./PetalPreviewClient";

export default function PetalPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="royal-page-shell flex min-h-full w-full flex-1 justify-center overflow-x-hidden px-3 py-5 sm:px-5 sm:py-10">
      <PetalPreviewClient />
    </main>
  );
}
