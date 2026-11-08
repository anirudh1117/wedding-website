import type { ReactNode } from "react";

type RoyalInvitationFrameProps = {
  children: ReactNode;
};

function CornerOrnament({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <g fill="none" stroke="rgba(196,145,58,0.72)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 27C3 16 8 8 20 3" />
        <path d="M8 26c1-7 5-12 12-16" opacity="0.7" />
        <path d="M15 8c2-2 3-3 5-4" opacity="0.7" />
        <circle cx="20" cy="3" r="1.15" fill="rgba(196,145,58,0.65)" stroke="none" />
      </g>
    </svg>
  );
}

function HeaderCrest() {
  return (
    <svg className="royal-invitation-frame__crest" viewBox="0 0 48 30" aria-hidden="true" focusable="false">
      <g fill="none" stroke="rgba(196,145,58,0.78)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16h9" strokeWidth="1" opacity="0.6" />
        <path d="M37 16h9" strokeWidth="1" opacity="0.6" />
        <path d="M11 16c4-1 7-4 9-9c2 5 4 8 4 8" strokeWidth="1.05" />
        <path d="M37 16c-4-1-7-4-9-9c-2 5-4 8-4 8" strokeWidth="1.05" />
        <path d="M24 8c5 0 9 3 9 7c0 5-4 8-9 8s-9-3-9-8c0-4 4-7 9-7z" strokeWidth="1.1" />
        <circle cx="24" cy="15" r="1.5" fill="rgba(196,145,58,0.7)" stroke="none" />
      </g>
    </svg>
  );
}

function TopArch() {
  return (
    <svg className="royal-invitation-frame__arch" viewBox="0 0 160 36" aria-hidden="true" focusable="false">
      <g fill="none" stroke="rgba(196,145,58,0.52)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 35h154" strokeWidth="1" opacity="0.48" />
        <path d="M14 35c21-1 28-9 35-20c5-8 11-12 18-12c6 0 11 3 15 10c4 7 9 10 16 10c7 0 12-3 16-10c4-7 9-10 15-10c7 0 13 4 18 12c7 11 14 19 35 20" strokeWidth="1.15" />
      </g>
    </svg>
  );
}

export function RoyalInvitationFrame({ children }: RoyalInvitationFrameProps) {
  return (
    <section className="royal-invitation-frame w-[calc(100%-24px)] max-w-3xl">
      <div className="royal-invitation-frame__arch-wrap" aria-hidden="true">
        <TopArch />
        <HeaderCrest />
      </div>

      <div className="royal-invitation-frame__inner-line" aria-hidden="true" />

      <div className="royal-invitation-frame__corners" aria-hidden="true">
        <CornerOrnament className="royal-invitation-frame__corner royal-invitation-frame__corner--tl" />
        <CornerOrnament className="royal-invitation-frame__corner royal-invitation-frame__corner--tr" />
        <CornerOrnament className="royal-invitation-frame__corner royal-invitation-frame__corner--bl" />
        <CornerOrnament className="royal-invitation-frame__corner royal-invitation-frame__corner--br" />
      </div>

      <div className="royal-invitation-frame__content">{children}</div>
    </section>
  );
}