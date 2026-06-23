type GlyphWallpaperProps = {
  variant?: "hero" | "surface";
  className?: string;
};

const HERO_GLYPHS = [
  { x: 8, y: 18, t: "hash", o: 0.48 },
  { x: 20, y: 11, t: "seal", o: 0.42 },
  { x: 34, y: 23, t: "bracket", o: 0.34 },
  { x: 47, y: 14, t: "square", o: 0.4 },
  { x: 62, y: 26, t: "hash", o: 0.38 },
  { x: 76, y: 16, t: "seal", o: 0.44 },
  { x: 88, y: 31, t: "bracket", o: 0.32 },
  { x: 13, y: 42, t: "square", o: 0.28 },
  { x: 29, y: 51, t: "hash", o: 0.34 },
  { x: 44, y: 44, t: "seal", o: 0.24 },
  { x: 58, y: 55, t: "bracket", o: 0.3 },
  { x: 73, y: 46, t: "square", o: 0.34 },
  { x: 91, y: 58, t: "hash", o: 0.36 },
  { x: 18, y: 73, t: "seal", o: 0.3 },
  { x: 39, y: 83, t: "square", o: 0.28 },
  { x: 66, y: 78, t: "hash", o: 0.32 },
  { x: 84, y: 86, t: "bracket", o: 0.28 },
] as const;

const SURFACE_GLYPHS = [
  { x: 10, y: 18, t: "square", o: 0.28 },
  { x: 24, y: 35, t: "hash", o: 0.22 },
  { x: 43, y: 16, t: "bracket", o: 0.2 },
  { x: 61, y: 40, t: "seal", o: 0.22 },
  { x: 78, y: 22, t: "square", o: 0.24 },
  { x: 91, y: 52, t: "hash", o: 0.2 },
  { x: 16, y: 72, t: "bracket", o: 0.18 },
  { x: 36, y: 88, t: "seal", o: 0.18 },
  { x: 70, y: 76, t: "square", o: 0.2 },
] as const;

function Glyph({ type }: { type: "hash" | "seal" | "bracket" | "square" }) {
  if (type === "hash") {
    return (
      <g>
        <path d="M4 2v12M10 2v12M1 5h12M1 11h12" />
      </g>
    );
  }

  if (type === "seal") {
    return (
      <g>
        <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
        <path d="m5 8 2 2 4-5" />
      </g>
    );
  }

  if (type === "bracket") {
    return (
      <g>
        <path d="M6 2H3v12h3M10 2h3v12h-3" />
        <path d="M7 8h2" />
      </g>
    );
  }

  return (
    <g>
      <rect x="3" y="3" width="10" height="10" rx="1" />
      <path d="M6 6h4v4H6z" />
    </g>
  );
}

export function GlyphWallpaper({
  variant = "surface",
  className = "",
}: GlyphWallpaperProps) {
  const glyphs = variant === "hero" ? HERO_GLYPHS : SURFACE_GLYPHS;
  const stroke = variant === "hero" ? "rgba(255,255,255,0.78)" : "var(--color-design-hudson-blue)";
  const grid = variant === "hero" ? "rgba(255,255,255,0.15)" : "rgba(0,129,192,0.12)";

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern id={`glyph-grid-${variant}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke={grid} strokeWidth="0.12" />
          <rect x="0.8" y="0.8" width="0.45" height="0.45" fill={grid} />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#glyph-grid-${variant})`} />
      {glyphs.map((glyph, index) => (
        <g
          key={`${glyph.t}-${index}`}
          transform={`translate(${glyph.x} ${glyph.y}) scale(${variant === "hero" ? 0.9 : 0.72})`}
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={variant === "hero" ? 0.55 : 0.5}
          opacity={glyph.o}
        >
          <Glyph type={glyph.t} />
        </g>
      ))}
    </svg>
  );
}
