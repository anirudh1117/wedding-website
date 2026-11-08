import type { ReactNode } from "react";

type RoyalFrameProps = {
  children: ReactNode;
  className?: string;
};

export function RoyalFrame({ children, className = "" }: RoyalFrameProps) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 ${className}`.trim()}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(198,165,104,0.12), rgba(198,165,104,0.02) 10%, transparent 25%, transparent), linear-gradient(to bottom, rgba(198,165,104,0.08), transparent 20%, transparent)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
