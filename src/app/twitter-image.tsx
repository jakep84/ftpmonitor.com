// src/app/twitter-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 675 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background:
          "linear-gradient(135deg, #0b0b0c 0%, #111113 55%, #0b0b0c 100%)",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            border: "2px solid rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          F
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
          FTPMonitor
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Diagnose FTP failures
          <br />
          immediately.
        </div>

        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.35,
          }}
        >
          DNS → TCP → Auth → List
          <br />
          Instant troubleshooting output.
        </div>
      </div>

      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }}>
        ftpmonitor.com
      </div>
    </div>,
    size,
  );
}
