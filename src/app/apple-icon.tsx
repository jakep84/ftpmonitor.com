// src/app/apple-icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b0c",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          border: "4px solid #ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: -2,
        }}
      >
        F
      </div>
    </div>,
    size,
  );
}
