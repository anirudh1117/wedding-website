import { useCallback, useEffect, useRef, useState } from "react";
import { PetalCelebration } from "@/components/animations/PetalCelebration";
import { createPetalSpecs, type PetalCelebrationType } from "@/lib/animations/petal-presets";

type CelebrationEntry = {
  id: string;
  type: PetalCelebrationType;
  petals: ReturnType<typeof createPetalSpecs>;
  variant: "fullscreen" | "local";
};

const MAX_ACTIVE_CELEBRATIONS = 3;

export function usePetalCelebration(reducedMotion: boolean) {
  const [celebrations, setCelebrations] = useState<CelebrationEntry[]>([]);
  const timeoutIdsByCelebration = useRef<Map<string, number>>(new Map());

  const removeCelebration = useCallback((id: string) => {
    const timeoutId = timeoutIdsByCelebration.current.get(id);
    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId);
      timeoutIdsByCelebration.current.delete(id);
    }

    setCelebrations((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutIdsByCelebration.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutIdsByCelebration.current.clear();
  }, []);

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const triggerPetalCelebration = useCallback(
    (type: PetalCelebrationType) => {
      if (reducedMotion) {
        return;
      }

      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const petals = createPetalSpecs(type);
      const totalDuration = Math.max(...petals.map((petal) => petal.duration + petal.delay), 0) + 0.8;
      const variant: CelebrationEntry["variant"] =
        type === "registration-success" || type === "add-guest" || type === "upload-success"
          ? "fullscreen"
          : "local";

      setCelebrations((previous) => {
        const next = [...previous, { id, type, petals, variant }];

        while (next.length > MAX_ACTIVE_CELEBRATIONS) {
          const dropped = next.shift();
          if (dropped) {
            const droppedTimeout = timeoutIdsByCelebration.current.get(dropped.id);
            if (typeof droppedTimeout === "number") {
              window.clearTimeout(droppedTimeout);
              timeoutIdsByCelebration.current.delete(dropped.id);
            }
          }
        }

        return next;
      });

      const timeoutId = window.setTimeout(() => {
        removeCelebration(id);
      }, totalDuration * 1000);

      timeoutIdsByCelebration.current.set(id, timeoutId);
    },
    [reducedMotion, removeCelebration],
  );

  const overlay = (
    <>
      {celebrations.map((celebration) => (
        <PetalCelebration key={celebration.id} petals={celebration.petals} variant={celebration.variant} />
      ))}
    </>
  );

  return {
    triggerPetalCelebration,
    overlay,
  };
}
