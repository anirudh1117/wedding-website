import type { CSSProperties } from "react";
import type { SparklePoint } from "./event-identity-registry";

type EventSparkleLayerProps = {
  sparkles: SparklePoint[];
  palette: string[];
  debugMode?: boolean;
  disableAnimation?: boolean;
  pauseAnimation?: boolean;
};

export function EventSparkleLayer({
  sparkles,
  palette,
  debugMode = false,
  disableAnimation = false,
  pauseAnimation = false,
}: EventSparkleLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparkles.map((sparkle, index) => {
        const color = palette[index % palette.length];
        const extraClass = [
          debugMode ? "event-sparkle--debug" : "",
          disableAnimation ? "event-sparkle--static" : "",
          pauseAnimation ? "event-sparkle--paused" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <span
            key={`${sparkle.x}-${sparkle.y}-${index}`}
            className={`event-sparkle absolute ${extraClass}`}
            style={
              {
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                color,
                animationDelay: `${sparkle.delayMs}ms`,
                animationDuration: `${sparkle.durationMs}ms`,
                /* translate back by half-size so position is centered on the point */
                transform: `translate(-50%, -50%) scale(0.7)`,
              } satisfies CSSProperties
            }
          >
            {/* 4-point star glint — same shape, two rotated squares overlaid */}
            <svg viewBox="0 0 20 20" className="h-full w-full" fill="currentColor" aria-hidden="true">
              <path d="M10 1 L11.8 8.2 L19 10 L11.8 11.8 L10 19 L8.2 11.8 L1 10 L8.2 8.2Z" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
