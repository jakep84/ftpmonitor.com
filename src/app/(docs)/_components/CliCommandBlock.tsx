// src/app/(docs)/_components/CliCommandBlock.tsx
import Link from "next/link";
import type { Doc, Protocol } from "@/content/docs";
import CommandBlock from "./CommandBlock";

function getPreferredProtocol(doc: Doc): Exclude<Protocol, "any"> {
  if (doc.protocol !== "any") return doc.protocol;
  return "sftp";
}

function getDefaultPort(protocol: Exclude<Protocol, "any">) {
  return protocol === "sftp" ? 22 : 21;
}

function getExampleHost(doc: Doc) {
  if (doc.protocol === "ftp") return "ftp.example.com";
  if (doc.protocol === "ftps") return "ftps.example.com";
  if (doc.protocol === "sftp") return "sftp.example.com";
  return "example.com";
}

function getCommand(doc: Doc) {
  const protocol = getPreferredProtocol(doc);
  const port = getDefaultPort(protocol);
  const host = getExampleHost(doc);

  const base = [
    "npx ftpmonitor check",
    `--protocol ${protocol}`,
    `--host ${host}`,
    `--port ${port}`,
  ];

  if (doc.step === "dns" || doc.step === "tcp" || doc.step === "any") {
    return base.join(" ");
  }

  if (doc.step === "auth") {
    return [...base, "--username user", "--password pass"].join(" ");
  }

  if (doc.step === "list") {
    if (protocol === "sftp") {
      return [
        ...base,
        "--username user",
        "--password pass",
        "--path /upload",
      ].join(" ");
    }

    return [
      ...base,
      "--username user",
      "--password pass",
      "--path /incoming",
    ].join(" ");
  }

  return base.join(" ");
}

function getWhyText(doc: Doc) {
  if (doc.step === "dns") {
    return "Check whether the hostname resolves before debugging credentials or firewall rules.";
  }

  if (doc.step === "tcp") {
    return "Test whether the network port is reachable before investigating authentication problems.";
  }

  if (doc.step === "auth") {
    return "Verify whether authentication is the actual failure point.";
  }

  if (doc.step === "list") {
    return "Test whether the server allows directory listing with valid credentials.";
  }

  return "Run the same diagnostic directly from your terminal.";
}

export default function CliCommandBlock({ doc }: { doc: Doc }) {
  const command = getCommand(doc);
  const shareCommand = `${command} --format slack --copy`;

  return (
    <section
      style={{
        marginTop: 22,
        padding: 16,
        borderRadius: 14,
        background: "#0c0c0e",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          opacity: 0.65,
          marginBottom: 8,
        }}
      >
        Diagnose this automatically
      </div>

      <p style={{ margin: "0 0 12px 0", lineHeight: 1.65, opacity: 0.92 }}>
        {getWhyText(doc)}
      </p>

      {/* Primary command */}
      <CommandBlock command={command} />

      {/* Secondary share command */}
      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          opacity: 0.65,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        Shareable output
      </div>

      <CommandBlock command={shareCommand} />

      <p style={{ margin: "12px 0 0 0", fontSize: 14, opacity: 0.8 }}>
        Prefer the browser?{" "}
        <Link
          href="/"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Run the same check on the homepage.
        </Link>
      </p>
    </section>
  );
}
