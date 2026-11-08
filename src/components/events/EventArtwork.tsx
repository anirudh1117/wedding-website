import Image from "next/image";

export type ArtworkStyle = "botanical" | "ritual" | "music" | "rings" | "ceremony" | "evening" | "generic";

type EventArtworkProps = {
  style: ArtworkStyle;
  tint: string;
  artworkBg: string;
  imageSrc?: string | null;
  imageAlt?: string;
  /** "stage" renders full-height for the sticky desktop panel; "chapter" for inline mobile */
  size?: "stage" | "chapter";
};

const MANDALA_OUTER = [0, 45, 90, 135, 180, 225, 270, 315];
const MANDALA_INNER = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const MARIGOLD_OUTER = Array.from({ length: 12 }, (_, i) => i * 30);
const MARIGOLD_INNER = Array.from({ length: 8 }, (_, i) => i * 45 + 15);

export function EventArtwork({ style, tint, artworkBg, imageSrc, imageAlt, size = "chapter" }: EventArtworkProps) {
  const heightClass = size === "stage" ? "h-full min-h-[260px]" : "h-[230px] sm:h-[280px]";

  if (imageSrc) {
    return (
      <div className={`relative w-full overflow-hidden ${heightClass}`} style={{ background: artworkBg }}>
        <Image
          src={imageSrc}
          alt={imageAlt ?? "Wedding event photograph"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${heightClass}`} style={{ background: artworkBg, color: tint }}>
      <div className="absolute inset-0 opacity-[0.45]" aria-hidden="true">
        {style === "botanical" && <BotanicalArtwork />}
        {style === "ritual" && <RitualArtwork />}
        {style === "music" && <MusicArtwork />}
        {style === "rings" && <RingsArtwork />}
        {style === "ceremony" && <CeremonyArtwork />}
        {style === "evening" && <EveningArtwork />}
        {style === "generic" && <GenericArtwork />}
      </div>
    </div>
  );
}

function BotanicalArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Soft radial background wash */}
      <circle cx="250" cy="170" r="210" fill="currentColor" fillOpacity="0.06" />
      <circle cx="250" cy="170" r="150" fill="currentColor" fillOpacity="0.05" />

      {/* Central henna mandala */}
      <g transform="translate(250, 170)">
        {/* Outer 8 petals */}
        {MANDALA_OUTER.map((deg) => (
          <ellipse
            key={`mo-${deg}`}
            cx="0" cy="-78" rx="17" ry="42"
            fill="currentColor" fillOpacity="0.14"
            stroke="currentColor" strokeWidth="1.3"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* Inner 8 petals */}
        {MANDALA_INNER.map((deg) => (
          <ellipse
            key={`mi-${deg}`}
            cx="0" cy="-48" rx="11" ry="25"
            fill="currentColor" fillOpacity="0.28"
            stroke="currentColor" strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* Center circles */}
        <circle r="24" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8" />
        <circle r="12" fill="currentColor" fillOpacity="0.35" />
        <circle r="5" fill="currentColor" fillOpacity="0.7" />
        {/* Cardinal direction ornamental dots */}
        {[0, 90, 180, 270].map((deg) => (
          <g key={`cd-${deg}`} transform={`rotate(${deg})`}>
            <circle cx="0" cy="-118" r="4" fill="currentColor" fillOpacity="0.6" />
            <circle cx="0" cy="-108" r="2.5" fill="currentColor" fillOpacity="0.4" />
          </g>
        ))}
      </g>

      {/* Outer dashed decorative ring */}
      <circle cx="250" cy="170" r="128" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 5" fillOpacity="0" fill="none" opacity="0.32" />
      <circle cx="250" cy="170" r="148" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 8" fill="none" opacity="0.18" />

      {/* Left botanical vine */}
      <path d="M28 38 C42 82 28 122 40 162 C52 202 36 244 48 286" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="78" rx="16" ry="7" fill="currentColor" fillOpacity="0.22" transform="rotate(-38 50 78)" />
      <ellipse cx="38" cy="134" rx="14" ry="6" fill="currentColor" fillOpacity="0.24" transform="rotate(24 38 134)" />
      <ellipse cx="50" cy="198" rx="16" ry="7" fill="currentColor" fillOpacity="0.2" transform="rotate(-28 50 198)" />
      <ellipse cx="42" cy="248" rx="12" ry="5" fill="currentColor" fillOpacity="0.18" transform="rotate(18 42 248)" />

      {/* Right botanical vine */}
      <path d="M472 38 C458 82 472 122 460 162 C448 202 464 244 452 286" stroke="currentColor" strokeWidth="2" opacity="0.5" strokeLinecap="round" fill="none" />
      <ellipse cx="450" cy="78" rx="16" ry="7" fill="currentColor" fillOpacity="0.22" transform="rotate(38 450 78)" />
      <ellipse cx="462" cy="134" rx="14" ry="6" fill="currentColor" fillOpacity="0.24" transform="rotate(-24 462 134)" />
      <ellipse cx="450" cy="198" rx="16" ry="7" fill="currentColor" fillOpacity="0.2" transform="rotate(28 450 198)" />
      <ellipse cx="458" cy="248" rx="12" ry="5" fill="currentColor" fillOpacity="0.18" transform="rotate(-18 458 248)" />

      {/* Corner bracket ornaments */}
      <path d="M10 10 L34 10 L34 34" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M490 10 L466 10 L466 34" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10 330 L34 330 L34 306" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M490 330 L466 330 L466 306" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function RitualArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Warm radial background */}
      <circle cx="250" cy="155" r="200" fill="currentColor" fillOpacity="0.06" />

      {/* Central marigold flower */}
      <g transform="translate(250, 148)">
        {/* Outer 12 petals */}
        {MARIGOLD_OUTER.map((deg) => (
          <ellipse
            key={`mo-${deg}`}
            cx="0" cy="-88" rx="22" ry="50"
            fill="currentColor" fillOpacity="0.14"
            stroke="currentColor" strokeWidth="1.2"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* Inner 8 petals at offset angles */}
        {MARIGOLD_INNER.map((deg) => (
          <ellipse
            key={`mi-${deg}`}
            cx="0" cy="-56" rx="15" ry="32"
            fill="currentColor" fillOpacity="0.3"
            stroke="currentColor" strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* Center */}
        <circle r="22" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.5" />
        <circle r="10" fill="currentColor" fillOpacity="0.7" />
        <circle r="4" fill="currentColor" fillOpacity="0.9" />
      </g>

      {/* Scattered fallen petals */}
      <ellipse cx="96" cy="58" rx="12" ry="5" fill="currentColor" fillOpacity="0.24" transform="rotate(-42 96 58)" />
      <ellipse cx="392" cy="74" rx="11" ry="4" fill="currentColor" fillOpacity="0.22" transform="rotate(30 392 74)" />
      <ellipse cx="148" cy="292" rx="13" ry="5" fill="currentColor" fillOpacity="0.2" transform="rotate(16 148 292)" />
      <ellipse cx="364" cy="284" rx="11" ry="5" fill="currentColor" fillOpacity="0.22" transform="rotate(-28 364 284)" />
      <ellipse cx="78" cy="202" rx="9" ry="4" fill="currentColor" fillOpacity="0.2" transform="rotate(58 78 202)" />
      <ellipse cx="418" cy="192" rx="10" ry="4" fill="currentColor" fillOpacity="0.2" transform="rotate(-52 418 192)" />
      <ellipse cx="168" cy="56" rx="9" ry="4" fill="currentColor" fillOpacity="0.18" transform="rotate(22 168 56)" />
      <ellipse cx="328" cy="60" rx="10" ry="4" fill="currentColor" fillOpacity="0.18" transform="rotate(-18 328 60)" />

      {/* Brass katori vessel at base */}
      <path d="M195 312 Q250 298 305 312 Q315 328 250 334 Q185 328 195 312Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.3" />
      <path d="M205 312 Q250 307 295 312" stroke="currentColor" strokeWidth="1" opacity="0.32" />
      <ellipse cx="250" cy="314" rx="50" ry="4" fill="currentColor" fillOpacity="0.1" />

      {/* Corner leaf ornaments */}
      <path d="M22 22 C32 10 54 20 44 36 C34 52 12 40 22 22Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <path d="M478 22 C468 10 446 20 456 36 C466 52 488 40 478 22Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <path d="M22 318 C32 330 54 320 44 304 C34 288 12 300 22 318Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1" />
      <path d="M478 318 C468 330 446 320 456 304 C466 288 488 300 478 318Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MusicArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Stage light rays from top-center */}
      <path d="M250 -8 L172 298 L226 298Z" fill="currentColor" fillOpacity="0.07" />
      <path d="M250 -8 L274 298 L328 298Z" fill="currentColor" fillOpacity="0.07" />
      <path d="M250 -8 L118 315 L172 315Z" fill="currentColor" fillOpacity="0.04" />
      <path d="M250 -8 L328 315 L382 315Z" fill="currentColor" fillOpacity="0.04" />

      {/* Stage floor line */}
      <path d="M58 294 L442 294" stroke="currentColor" strokeWidth="2.2" opacity="0.2" strokeLinecap="round" />

      {/* Sitar neck */}
      <rect x="244" y="26" width="12" height="188" rx="6" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.4" />

      {/* Sitar top tuning head */}
      <ellipse cx="250" cy="20" rx="22" ry="24" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="250" cy="20" r="6" fill="currentColor" fillOpacity="0.45" />

      {/* Sitar strings */}
      <line x1="246" y1="26" x2="246" y2="214" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <line x1="250" y1="26" x2="250" y2="214" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <line x1="254" y1="26" x2="254" y2="214" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />

      {/* Fret markers */}
      {[78, 108, 138, 168, 198].map((y) => (
        <line key={y} x1="244" y1={y} x2="256" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.35" />
      ))}

      {/* Sitar resonator body */}
      <path d="M250 214 C216 214 192 236 192 266 C192 298 218 320 250 320 C282 320 308 298 308 266 C308 236 284 214 250 214Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="250" cy="280" rx="34" ry="18" stroke="currentColor" strokeWidth="0.8" opacity="0.3" fill="none" />

      {/* Left-side decorative musical motifs */}
      <ellipse cx="90" cy="126" rx="14" ry="9" fill="currentColor" fillOpacity="0.22" transform="rotate(-18 90 126)" />
      <line x1="104" y1="123" x2="104" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.24" />
      <path d="M104 80 L116 86 L104 92Z" fill="currentColor" fillOpacity="0.22" />

      <ellipse cx="72" cy="168" rx="12" ry="8" fill="currentColor" fillOpacity="0.18" transform="rotate(-22 72 168)" />
      <line x1="84" y1="165" x2="84" y2="128" stroke="currentColor" strokeWidth="1.8" opacity="0.2" />

      {/* Right-side decorative musical motifs */}
      <ellipse cx="410" cy="108" rx="14" ry="9" fill="currentColor" fillOpacity="0.22" transform="rotate(15 410 108)" />
      <line x1="396" y1="105" x2="396" y2="62" stroke="currentColor" strokeWidth="2" opacity="0.24" />
      <path d="M396 62 L384 68 L396 74Z" fill="currentColor" fillOpacity="0.22" />

      <ellipse cx="428" cy="152" rx="12" ry="8" fill="currentColor" fillOpacity="0.18" transform="rotate(20 428 152)" />
      <line x1="416" y1="149" x2="416" y2="112" stroke="currentColor" strokeWidth="1.8" opacity="0.2" />

      {/* Sound wave arcs */}
      <path d="M54 252 Q68 240 82 252 Q96 264 110 252" stroke="currentColor" strokeWidth="1.4" opacity="0.22" strokeLinecap="round" />
      <path d="M390 252 Q404 240 418 252 Q432 264 446 252" stroke="currentColor" strokeWidth="1.4" opacity="0.22" strokeLinecap="round" />
    </svg>
  );
}

function RingsArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Background wash */}
      <circle cx="250" cy="170" r="180" fill="currentColor" fillOpacity="0.05" />

      {/* Ring band textures */}
      <circle cx="188" cy="168" r="72" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
      <circle cx="188" cy="168" r="58" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="312" cy="168" r="72" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
      <circle cx="312" cy="168" r="58" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />

      {/* Ring highlight arcs */}
      <path d="M152 130 A52 52 0 0 1 200 110" stroke="currentColor" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
      <path d="M276 130 A52 52 0 0 1 324 110" stroke="currentColor" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />

      {/* Diamond solitaire on left ring */}
      <path d="M188 88 L200 104 L188 116 L176 104Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M188 88 L200 104 L188 96Z" fill="currentColor" fillOpacity="0.2" />

      {/* Pavé diamonds on right ring */}
      {[-10, 0, 10].map((x) => (
        <circle key={x} cx={312 + x} cy="92" r="4" fill="currentColor" fillOpacity="0.45" />
      ))}

      {/* Elegant floral accent */}
      <circle cx="250" cy="168" r="14" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1" />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const cx = 250 + Math.round(Math.cos(rad) * 28);
        const cy = 168 + Math.round(Math.sin(rad) * 28);
        return <circle key={deg} cx={cx} cy={cy} r="7" fill="currentColor" fillOpacity="0.2" />;
      })}

      {/* Ground shadow */}
      <ellipse cx="250" cy="258" rx="110" ry="10" fill="currentColor" fillOpacity="0.08" />

      {/* Scattered small florals */}
      {[80, 420].map((x) => (
        <g key={x}>
          <circle cx={x} cy={160} r="16" fill="currentColor" fillOpacity="0.1" />
          {[0, 90, 180, 270].map((d) => {
            const r = (d * Math.PI) / 180;
            return (
              <ellipse key={d} cx={x + Math.round(Math.cos(r) * 16)} cy={160 + Math.round(Math.sin(r) * 16)}
                rx="8" ry="4" fill="currentColor" fillOpacity="0.12"
                transform={`rotate(${d} ${x + Math.round(Math.cos(r) * 16)} ${160 + Math.round(Math.sin(r) * 16)})`} />
            );
          })}
        </g>
      ))}

      {/* Corner flourishes */}
      <path d="M14 14 Q36 14 36 36" stroke="currentColor" strokeWidth="1.5" opacity="0.28" fill="none" />
      <path d="M486 14 Q464 14 464 36" stroke="currentColor" strokeWidth="1.5" opacity="0.28" fill="none" />
      <path d="M14 326 Q36 326 36 304" stroke="currentColor" strokeWidth="1.5" opacity="0.28" fill="none" />
      <path d="M486 326 Q464 326 464 304" stroke="currentColor" strokeWidth="1.5" opacity="0.28" fill="none" />
    </svg>
  );
}

function CeremonyArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Warm radial background */}
      <circle cx="250" cy="160" r="230" fill="currentColor" fillOpacity="0.05" />
      <circle cx="250" cy="100" r="140" fill="currentColor" fillOpacity="0.04" />

      {/* Platform/floor */}
      <rect x="96" y="298" width="308" height="14" rx="7" fill="currentColor" fillOpacity="0.18" />
      <rect x="108" y="295" width="284" height="6" rx="3" fill="currentColor" fillOpacity="0.12" />

      {/* Left pillar */}
      <rect x="116" y="172" width="24" height="130" rx="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="108" y="163" width="40" height="14" rx="4" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1" />
      {[196, 228, 260, 278].map((y) => (
        <rect key={y} x="116" y={y} width="24" height="3.5" fill="currentColor" fillOpacity="0.32" />
      ))}

      {/* Right pillar */}
      <rect x="360" y="172" width="24" height="130" rx="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="352" y="163" width="40" height="14" rx="4" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1" />
      {[196, 228, 260, 278].map((y) => (
        <rect key={y} x="360" y={y} width="24" height="3.5" fill="currentColor" fillOpacity="0.32" />
      ))}

      {/* Mandap arch */}
      <path d="M128 170 Q128 52 250 36 Q372 52 372 170" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.78" />
      {/* Inner arch line */}
      <path d="M140 173 Q140 68 250 52 Q360 68 360 173" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" strokeDasharray="6 4" />

      {/* Torana top banner */}
      <rect x="108" y="55" width="284" height="18" rx="5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.1" />
      {/* Torana hanging elements */}
      {[138, 166, 194, 222, 250, 278, 306, 334, 362].map((x) => (
        <g key={x}>
          <line x1={x} y1="73" x2={x} y2="92" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx={x} cy="95" r="4.5" fill="currentColor" fillOpacity="0.32" />
        </g>
      ))}

      {/* Floral garland draped below arch */}
      <path d="M136 180 Q175 198 212 190 Q235 185 250 194 Q265 185 288 190 Q325 198 364 180"
        stroke="currentColor" strokeWidth="2.4" fill="none" opacity="0.68" strokeLinecap="round" />
      {/* Garland bloom accents */}
      {[{ x: 155, y: 192 }, { x: 210, y: 192 }, { x: 250, y: 196 }, { x: 290, y: 192 }, { x: 345, y: 192 }].map(({ x, y }, i) => (
        <circle key={x} cx={x} cy={y} r={i === 2 ? 7 : 5} fill="currentColor" fillOpacity={i === 2 ? 0.5 : 0.34} />
      ))}

      {/* Sacred flame at center */}
      <path d="M250 298 Q242 272 250 256 Q258 245 256 235 Q264 250 260 266 Q268 282 264 298Z" fill="currentColor" fillOpacity="0.5" />
      <path d="M250 298 Q245 278 250 265 Q255 254 252 247 Q258 260 255 274 Q260 284 258 298Z" fill="currentColor" fillOpacity="0.3" />
      <ellipse cx="250" cy="298" rx="8" ry="4" fill="currentColor" fillOpacity="0.28" />

      {/* Left floral cluster */}
      <circle cx="112" cy="138" r="10" fill="currentColor" fillOpacity="0.22" />
      <circle cx="126" cy="124" r="7" fill="currentColor" fillOpacity="0.18" />
      <circle cx="96" cy="128" r="6" fill="currentColor" fillOpacity="0.16" />
      <circle cx="116" cy="154" r="5" fill="currentColor" fillOpacity="0.14" />

      {/* Right floral cluster */}
      <circle cx="388" cy="138" r="10" fill="currentColor" fillOpacity="0.22" />
      <circle cx="374" cy="124" r="7" fill="currentColor" fillOpacity="0.18" />
      <circle cx="404" cy="128" r="6" fill="currentColor" fillOpacity="0.16" />
      <circle cx="384" cy="154" r="5" fill="currentColor" fillOpacity="0.14" />

      {/* Scattered petals */}
      <ellipse cx="182" cy="270" rx="9" ry="4" fill="currentColor" fillOpacity="0.18" transform="rotate(-18 182 270)" />
      <ellipse cx="316" cy="278" rx="8" ry="3" fill="currentColor" fillOpacity="0.2" transform="rotate(24 316 278)" />
      <ellipse cx="222" cy="258" rx="7" ry="3" fill="currentColor" fillOpacity="0.16" transform="rotate(10 222 258)" />
      <ellipse cx="292" cy="262" rx="7" ry="3" fill="currentColor" fillOpacity="0.16" transform="rotate(-12 292 262)" />
    </svg>
  );
}

function EveningArtwork() {
  const crystalDropOffsets = [-102, -78, -54, -28, 0, 28, 54, 78, 102];
  const middleTierOffsets = [-82, -58, -34, -10, 10, 34, 58, 82];
  const topTierOffsets = [-58, -34, -10, 10, 34, 58];

  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Radiating light rays */}
      {Array.from({ length: 14 }, (_, i) => {
        const angle = ((i * 360) / 14 - 90) * (Math.PI / 180);
        const x2 = Math.round(250 + Math.cos(angle) * 260);
        const y2 = Math.round(128 + Math.sin(angle) * 260);
        return (
          <line key={i} x1="250" y1="128" x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="1" opacity="0.07" />
        );
      })}

      {/* Ceiling mount */}
      <rect x="236" y="8" width="28" height="34" rx="6" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1" />

      {/* Main stem */}
      <line x1="250" y1="42" x2="250" y2="72" stroke="currentColor" strokeWidth="4" opacity="0.38" strokeLinecap="round" />

      {/* Top tier */}
      <ellipse cx="250" cy="76" rx="62" ry="11" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" />
      {topTierOffsets.map((x) => (
        <g key={x} transform={`translate(${250 + x}, 84)`}>
          <line x1="0" y1="0" x2="0" y2="18" stroke="currentColor" strokeWidth="0.9" opacity="0.32" />
          <path d="M-4 18 L0 28 L4 18Z" fill="currentColor" fillOpacity="0.32" />
        </g>
      ))}

      {/* Middle stem */}
      <line x1="250" y1="82" x2="250" y2="108" stroke="currentColor" strokeWidth="3" opacity="0.34" strokeLinecap="round" />

      {/* Middle tier */}
      <ellipse cx="250" cy="114" rx="88" ry="13" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
      {middleTierOffsets.map((x) => (
        <g key={x} transform={`translate(${250 + x}, 123)`}>
          <line x1="0" y1="0" x2="0" y2="24" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
          <path d="M-5 24 L0 36 L5 24Z" fill="currentColor" fillOpacity="0.28" />
        </g>
      ))}

      {/* Lower stem */}
      <line x1="250" y1="122" x2="250" y2="148" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />

      {/* Bottom tier — widest */}
      <ellipse cx="250" cy="154" rx="112" ry="14" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
      {crystalDropOffsets.map((x) => (
        <g key={x} transform={`translate(${250 + x}, 164)`}>
          <line x1="0" y1="0" x2="0" y2="32" stroke="currentColor" strokeWidth="0.9" opacity="0.24" />
          <path d="M-5 32 L0 46 L5 32Z" fill="currentColor" fillOpacity="0.24" />
        </g>
      ))}

      {/* Candle flame accents on arm ends */}
      {[-108, 0, 108].map((dx) => (
        <g key={dx} transform={`translate(${250 + dx}, 154)`}>
          <path d="M0 -8 Q-3 -18 0 -24 Q3 -18 0 -8Z" fill="currentColor" fillOpacity="0.55" />
        </g>
      ))}

      {/* Floral arrangement at base */}
      {[{ x: 180, r: 7 }, { x: 208, r: 10 }, { x: 234, r: 12 }, { x: 250, r: 14 }, { x: 266, r: 12 }, { x: 292, r: 10 }, { x: 320, r: 7 }].map(({ x, r }, i) => (
        <circle key={x} cx={x} cy={310} r={r} fill="currentColor" fillOpacity={0.14 + i * 0.02} />
      ))}
      <path d="M162 314 C176 296 218 298 226 314" fill="currentColor" fillOpacity="0.12" />
      <path d="M274 314 C282 298 324 296 338 314" fill="currentColor" fillOpacity="0.12" />

      {/* Floor reflection */}
      <ellipse cx="250" cy="320" rx="90" ry="8" fill="currentColor" fillOpacity="0.07" />
    </svg>
  );
}

function GenericArtwork() {
  return (
    <svg viewBox="0 0 500 340" className="h-full w-full" fill="none" aria-hidden="true">
      <circle cx="250" cy="170" r="190" fill="currentColor" fillOpacity="0.05" />
      <circle cx="250" cy="170" r="130" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
      <circle cx="250" cy="170" r="80" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="250" cy="170" r="40" fill="currentColor" fillOpacity="0.2" />
      <circle cx="250" cy="170" r="14" fill="currentColor" fillOpacity="0.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line key={deg} x1="250" y1="170" x2={Math.round(250 + Math.cos(r) * 130)} y2={Math.round(170 + Math.sin(r) * 130)}
            stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
        );
      })}
    </svg>
  );
}
