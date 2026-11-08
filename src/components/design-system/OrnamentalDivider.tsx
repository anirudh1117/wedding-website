type OrnamentalDividerProps = {
  className?: string;
};

export function OrnamentalDivider({ className = "" }: OrnamentalDividerProps) {
  return (
    <div aria-hidden="true" className={`royal-divider ${className}`.trim()}>
      <svg viewBox="0 0 80 20" className="h-5 w-[72px] shrink-0 text-[var(--primary)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 10C20.5 6.5 25 5 30 5C35 5 39.5 6.5 43 10C39.5 13.5 35 15 30 15C25 15 20.5 13.5 17 10Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M43 10C46.5 6.5 51 5 56 5C61 5 65.5 6.5 69 10C65.5 13.5 61 15 56 15C51 15 46.5 13.5 43 10Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M29 9.5H31M30 8.5V10.5M49 9.5H51M50 8.5V10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
