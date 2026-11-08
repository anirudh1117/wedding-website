import Image from "next/image";
import { pickLocalizedText, type WeddingVenue } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type VenueGalleryProps = {
  venue: WeddingVenue;
  language: AppLanguage;
};

export function VenueGallery({ venue, language }: VenueGalleryProps) {
  if (!venue.gallery.length) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {venue.gallery.map((asset) => (
        <div key={asset.src} className="overflow-hidden rounded-[0.95rem] border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src={asset.src}
            alt={pickLocalizedText(asset.alt, language)}
            width={1200}
            height={800}
            className="h-[220px] w-full object-cover"
            sizes="(max-width: 768px) 100vw, 48vw"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
