"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        cursor: "pointer",
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "#111",
        color: "#fff",
      }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
