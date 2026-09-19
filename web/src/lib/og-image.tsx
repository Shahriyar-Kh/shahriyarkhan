/**
 * Shared layout for every opengraph-image.tsx route. Satori (next/og's
 * renderer) cannot parse oklch() and needs plain CSS - these are sRGB hex
 * mirrors of the app's OKLCH tokens (see globals.css), held separately
 * because the two color systems can't be unified across a build-time
 * (Satori) vs. runtime (browser) boundary. No next/font references
 * either - Satori needs real font buffers, not font objects, so this
 * deliberately falls back to Satori's built-in system font rather than
 * loading and embedding a font file just for share-card text.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const COLOR = {
  background: "#0a0e15",
  foreground: "#f2f5f7",
  tertiary: "#9aa7b4",
  primary: "#4ea8de",
  accent: "#34c9a6",
} as const;

export interface OgImageLayoutProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function OgImageLayout({ eyebrow, title, subtitle }: OgImageLayoutProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: COLOR.background,
        padding: 72,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 10, height: 10, border: `1px solid ${COLOR.accent}`, background: COLOR.accent, display: "flex" }} />
        <span style={{ fontSize: 24, color: COLOR.tertiary, letterSpacing: 4, textTransform: "uppercase", display: "flex" }}>
          {eyebrow}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        <span style={{ fontSize: 68, fontWeight: 700, color: COLOR.foreground, lineHeight: 1.1, display: "flex" }}>{title}</span>
        {subtitle && (
          <span style={{ marginTop: 20, fontSize: 30, color: COLOR.tertiary, display: "flex" }}>{subtitle}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 1, background: COLOR.primary, display: "flex" }} />
        <span style={{ fontSize: 22, color: COLOR.tertiary, display: "flex" }}>shahriyarkhan.vercel.app</span>
      </div>
    </div>
  );
}
