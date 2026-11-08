"use client";

import { useCallback, useState } from "react";
import { getEnabledEvents } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { ChronicleChapter } from "./ChronicleChapter";
import { StickyEventVisual } from "./StickyEventVisual";

type Props = {
  language: AppLanguage;
  header?: React.ReactNode;
};

export function WeddingChronicle({ language, header }: Props) {
  const events = getEnabledEvents()
    .slice()
    .sort((a, b) => a.sequence - b.sequence);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleEventActive = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="chronicle-section">
      {header}

      <div className="chronicle-layout">
        {/* Desktop sticky left visual panel */}
        <aside className="chronicle-sticky-aside">
          <div className="chronicle-sticky-inner">
            <StickyEventVisual events={events} activeIndex={activeIndex} language={language} />
          </div>
        </aside>

        {/* Event chapters — right side on desktop, single column on mobile */}
        <div className="chronicle-chapters">
          {events.map((event, index) => (
            <ChronicleChapter
              key={event.id}
              event={event}
              index={index}
              total={events.length}
              language={language}
              isActive={activeIndex === index}
              onActive={handleEventActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
