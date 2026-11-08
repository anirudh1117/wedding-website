import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { OrnamentalDivider } from "@/components/design-system/OrnamentalDivider";
import { RoyalFrame } from "@/components/design-system/RoyalFrame";
import { SectionHeading } from "@/components/design-system/SectionHeading";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="royal-page-shell px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <RoyalFrame className="p-6 sm:p-8">
          <p className="eyebrow">Design System Preview</p>
          <h1 className="mt-3 text-4xl text-[var(--primary)] sm:text-6xl">Heritage editorial wedding system</h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">
            Premium light stationery-inspired surfaces with deep wine accents, natural typography, and mobile-first readability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </RoyalFrame>

        <section className="grid gap-6 lg:grid-cols-2">
          <RoyalFrame>
            <SectionHeading
              eyebrow="Typography"
              title="The invitation voice"
              subtitle="A bilingual, elegant hierarchy for English and Hindi ceremonial content."
            />
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-strong)]">Display Heading</p>
                <h2 className="mt-2 text-5xl text-[var(--primary)]">Aashirwad</h2>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-strong)]">Hindi Display</p>
                <h3 className="mt-2 text-3xl text-[var(--foreground)]" style={{ fontFamily: "var(--font-hindi-display)" }}>
                  सत्‌श्री अकाल
                </h3>
              </div>
            </div>
          </RoyalFrame>

          <RoyalFrame>
            <SectionHeading
              eyebrow="Palette"
              title="Royal composition"
              subtitle="A restrained palette of warm ivory, deep wine, and antique brass."
            />
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                ["#F7F2E9", "Warm Ivory"],
                ["#FFFCF7", "Paper White"],
                ["#E9DFD2", "Warm Sand"],
                ["#302725", "Deep Ink"],
                ["#713D46", "Deep Wine"],
                ["#A58A61", "Antique Brass"],
              ].map(([hex, label]) => (
                <div key={hex} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="h-12 rounded-lg" style={{ background: hex }} />
                  <p className="mt-2 font-medium text-[var(--foreground)]">{label}</p>
                  <p className="text-[var(--muted)]">{hex}</p>
                </div>
              ))}
            </div>
          </RoyalFrame>
        </section>

        <section className="space-y-4">
          <SectionHeading eyebrow="Components" title="Buttons and inputs" />
          <RoyalFrame>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="input-label">Guest name</label>
                <input className="field" placeholder="Enter full name" defaultValue="Srishti Sharma" />
              </div>
              <div className="space-y-2">
                <label className="input-label">Contact number</label>
                <input className="field" placeholder="+91 9XXXXXXXXX" defaultValue="+91 9876543210" />
              </div>
            </div>
          </RoyalFrame>
        </section>

        <section className="space-y-4">
          <SectionHeading eyebrow="Ornament" title="Decorative rhythm" subtitle="Subtle, heritage-inspired framing without overwhelming the content." />
          <RoyalFrame>
            <OrnamentalDivider className="my-3" />
            <p className="text-center text-base text-[var(--muted)]">
              The ornament system is used as a quiet editorial cue, not a decorative distraction.
            </p>
            <OrnamentalDivider className="my-3" />
          </RoyalFrame>
        </section>
      </div>
    </main>
  );
}
