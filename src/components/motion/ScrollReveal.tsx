"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealDirection = "left" | "right" | "center";

type ScrollRevealProps = {
  children: ReactNode;
  direction: RevealDirection;
  delayMs?: number;
  className?: string;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollReveal({ children, direction, delayMs = 0, className = "" }: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isEnhanced] = useState(() => !prefersReducedMotion());
  const [isRevealed, setIsRevealed] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (!isEnhanced) {
      return;
    }

    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.22) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0, 0.22, 0.4],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isEnhanced]);

  const stateClassName = isEnhanced && !isRevealed ? "scroll-reveal--hidden" : "scroll-reveal--visible";

  return (
    <div
      ref={rootRef}
      className={`scroll-reveal scroll-reveal--${direction} ${stateClassName} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
