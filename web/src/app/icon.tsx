import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Closes a confirmed gap: the legacy app has no favicon anywhere. Uses
// the same Node + Run corner-mark motif as the rest of the site, drawn
// with plain divs (Satori-safe - no oklch(), no external assets).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e15",
        }}
      >
        <div style={{ position: "relative", width: 20, height: 20, display: "flex" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 1, background: "#4ea8de" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 8, background: "#4ea8de" }} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 6,
              height: 6,
              border: "1px solid #34c9a6",
              background: "#34c9a6",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
