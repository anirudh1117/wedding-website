import type { ReactNode } from "react";
import { Navigation } from "lucide-react";

type GetDirectionsButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function GetDirectionsButton({ href, children, className = "", compact = false }: GetDirectionsButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`get-directions-btn focus-ring ${compact ? "get-directions-btn--compact" : ""} ${className}`.trim()}
    >
      <span className="get-directions-btn__text">{children}</span>
      <span className="get-directions-btn__icon-wrap" aria-hidden="true">
        <Navigation className="get-directions-btn__icon" size={compact ? 16 : 18} strokeWidth={2} />
      </span>
    </a>
  );
}
