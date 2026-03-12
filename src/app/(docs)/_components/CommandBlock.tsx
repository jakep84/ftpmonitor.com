"use client";

import CopyButton from "./CopyButton";

export default function CommandBlock({ command }: { command: string }) {
  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: 12,
        background: "#080809",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        <span>terminal</span>
        <CopyButton text={command} />
      </div>

      <pre
        style={{
          margin: 0,
          padding: 14,
          overflowX: "auto",
        }}
      >
        <code>{command}</code>
      </pre>
    </div>
  );
}
