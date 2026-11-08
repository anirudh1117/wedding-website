"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
import { pickLocalizedText, weddingContent, type WeddingVenue } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { GetDirectionsButton } from "@/components/ui/GetDirectionsButton";

type VenueLocationShareProps = {
  venue: WeddingVenue;
  language: AppLanguage;
};

export function VenueLocationShare({ venue, language }: VenueLocationShareProps) {
  const directionsUrl = venue.googleMapsDirectionsUrl;
  const [copied, setCopied] = useState(false);

  const shareMessage = useMemo(() => {
    if (language === "hi") {
      return `${pickLocalizedText(venue.name, language)} का स्थान`;
    }
    return `${pickLocalizedText(venue.name, language)} location`;
  }, [language, venue]);

  if (!directionsUrl) {
    return null;
  }

  const encodedMessage = encodeURIComponent(`${shareMessage} ${directionsUrl}`);
  const whatsappHref = `https://wa.me/?text=${encodedMessage}`;
  const smsHref = `sms:?&body=${encodedMessage}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(directionsUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-3 pt-1">
      <GetDirectionsButton href={directionsUrl} className="w-full justify-center sm:w-auto">
        {pickLocalizedText(weddingContent.labels.directions, language)}
      </GetDirectionsButton>

      <p className="eyebrow">{language === "hi" ? "स्थान साझा करें" : "Share Venue Location"}</p>

      <div className="venue-share-actions">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="venue-share-btn focus-ring">
          <MessageCircle size={16} aria-hidden="true" />
          <span>{language === "hi" ? "WhatsApp" : "WhatsApp"}</span>
        </a>

        <a href={smsHref} className="venue-share-btn focus-ring">
          <Send size={16} aria-hidden="true" />
          <span>{language === "hi" ? "Message" : "Text Message"}</span>
        </a>

        <button type="button" onClick={handleCopy} className="venue-share-btn focus-ring">
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? (language === "hi" ? "लिंक कॉपी हुआ" : "Copied") : language === "hi" ? "लिंक कॉपी करें" : "Copy Link"}</span>
        </button>
      </div>
    </section>
  );
}
