import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <div style={{ position: "relative", width: 100, height: 100, display: "flex" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 40, height: 4, background: "#4ea8de" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 40, background: "#4ea8de" }} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              border: "4px solid #34c9a6",
              background: "#34c9a6",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
