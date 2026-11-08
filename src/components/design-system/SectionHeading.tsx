type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="text-3xl text-[var(--primary)] sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
