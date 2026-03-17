// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { resolveHelpLink } from "@/lib/docs/resolveHelpLink";

type Protocol = "ftp" | "ftps" | "sftp";
type SftpAuthMode = "password" | "key";

type Step = {
  key: "dns" | "tcp" | "auth" | "list";
  ok: boolean;
  ms?: number;
  message: string;
  details?: Record<string, any>;
};

type Result = {
  ok: boolean;
  protocol: Protocol;
  host: string;
  port: number;
  testedPath?: string;
  totalMs: number;
  steps: Step[];
  tips: string[];
};

function defaultPort(p: Protocol) {
  return p === "sftp" ? 22 : 21;
}

function redact(input: unknown) {
  try {
    const s = JSON.stringify(input, (_k, v) => v, 2);
    return s.replace(
      /-----BEGIN[\s\S]*?-----END[\s\S]*?-----/g,
      "[REDACTED_KEY]",
    );
  } catch {
    return "[unserializable]";
  }
}

export default function HomePage() {
  const [protocol, setProtocol] = useState<Protocol>("sftp");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(defaultPort("sftp"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [path, setPath] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [sftpAuthMode, setSftpAuthMode] = useState<SftpAuthMode>("password");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedCli, setCopiedCli] = useState(false);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [emailMsg, setEmailMsg] = useState("");

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [saveMsg, setSaveMsg] = useState("");

  const userTouchedPort = useRef(false);
  const hostInputRef = useRef<HTMLInputElement | null>(null);
  const waitlistRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const saveEmailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!userTouchedPort.current) {
      setPort(defaultPort(protocol));
    }
  }, [protocol]);

  useEffect(() => {
    if (result?.ok) {
      waitlistRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => emailInputRef.current?.focus(), 250);
    }
  }, [result?.ok]);

  useEffect(() => {
    if (saveOpen) {
      setSaveStatus("idle");
      setSaveMsg("");
      setTimeout(() => saveEmailRef.current?.focus(), 50);
    }
  }, [saveOpen]);

  const styles = useMemo(() => {
    const bg = "#0b0b0c";
    const panel = "#111113";
    const panel2 = "#0f0f10";
    const panel3 = "#09090a";
    const border = "rgba(255,255,255,0.10)";
    const borderStrong = "rgba(255,255,255,0.18)";
    const text = "#f5f5f6";
    const muted = "rgba(245,245,246,0.72)";
    const muted2 = "rgba(245,245,246,0.56)";
    const ok = "#4ade80";
    const danger = "#ff5a6a";
    const radius = 18;

    return {
      bg,
      panel,
      panel2,
      panel3,
      border,
      borderStrong,
      text,
      muted,
      muted2,
      ok,
      danger,
      radius,
      shell: {
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 30%), #0b0b0c",
        color: text,
        padding: "32px 16px 56px",
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      } as React.CSSProperties,
      mono: {
        fontFamily:
          "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
      } as React.CSSProperties,
      input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${border}`,
        background: panel3,
        color: text,
        outline: "none",
      } as React.CSSProperties,
      label: {
        fontSize: 12,
        color: muted2,
        marginBottom: 6,
      } as React.CSSProperties,
      btnPrimary: (disabled?: boolean) =>
        ({
          padding: "12px 16px",
          borderRadius: 12,
          border: `1px solid ${disabled ? border : "#fff"}`,
          background: disabled ? "#161618" : "#fff",
          color: disabled ? muted2 : "#111",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 800,
        }) as React.CSSProperties,
      btnGhost: (disabled?: boolean) =>
        ({
          padding: "12px 16px",
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: panel3,
          color: disabled ? muted2 : text,
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 700,
        }) as React.CSSProperties,
      badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: panel3,
        color: muted,
        fontSize: 12,
      } as React.CSSProperties,
      card: {
        border: `1px solid ${border}`,
        borderRadius: radius,
        background: panel,
      } as React.CSSProperties,
      code: {
        margin: 0,
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: panel3,
        overflowX: "auto",
        fontSize: 14,
        lineHeight: 1.65,
      } as React.CSSProperties,
      modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      } as React.CSSProperties,
      modalCard: {
        width: "100%",
        maxWidth: 520,
        borderRadius: 18,
        border: `1px solid ${borderStrong}`,
        background: panel3,
        color: text,
        padding: 18,
      } as React.CSSProperties,
    };
  }, []);

  const isClient = typeof window !== "undefined";
  const isNarrow = isClient
    ? window.matchMedia?.("(max-width: 920px)")?.matches
    : false;

  const canRun =
    !!host.trim() &&
    !!port &&
    (protocol !== "sftp" || sftpAuthMode === "password" || !!privateKey.trim());

  const exampleCliCommand =
    "npx ftpmonitor check --protocol sftp --host example.com";
  const heroCommand = host.trim()
    ? `npx ftpmonitor check --protocol ${protocol} --host ${host.trim()}`
    : exampleCliCommand;

  async function runCheck() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        protocol,
        host: host.trim(),
        port,
        username: username.trim(),
        path: path.trim() || undefined,
      };

      if (protocol === "sftp") {
        if (sftpAuthMode === "key") body.privateKey = privateKey;
        else body.password = password;
      } else {
        body.password = password;
      }

      const r = await fetch("/api/health-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await r.json()) as Result;
      setResult(json);

      if (!r.ok) {
        setError("Health check failed. See details below.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyDebug() {
    if (!result) return;
    const safe = {
      ok: result.ok,
      protocol: result.protocol,
      host: result.host,
      port: result.port,
      testedPath: result.testedPath,
      totalMs: result.totalMs,
      steps: result.steps?.map((s) => ({
        key: s.key,
        ok: s.ok,
        ms: s.ms,
        message: s.message,
        details: s.details,
      })),
      tips: result.tips,
      note: "Credentials are not included in this debug output.",
    };
    await navigator.clipboard.writeText(redact(safe));
  }

  async function copyCliCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 1800);
    } catch {
      setCopiedCli(false);
    }
  }

  function clearForm() {
    setHost("");
    setUsername("");
    setPassword("");
    setPath("");
    setPrivateKey("");
    setResult(null);
    setError(null);
    setEmailStatus("idle");
    setEmailMsg("");
    userTouchedPort.current = false;
    setPort(defaultPort(protocol));
  }

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function joinWaitlist() {
    setEmailStatus("idle");
    setEmailMsg("");

    if (!validateEmail(email)) {
      setEmailStatus("error");
      setEmailMsg("Please enter a valid email.");
      return;
    }

    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "homepage_waitlist",
          protocol,
          host: host.trim() || undefined,
        }),
      });

      const json = await r.json();

      if (!r.ok || !json?.ok) {
        setEmailStatus("error");
        setEmailMsg(json?.error ?? "Couldn’t save your email. Try again.");
        return;
      }

      setEmailStatus("saved");
      setEmailMsg(
        json.added === false
          ? "You’re already on the list."
          : "You’re on the list.",
      );
    } catch {
      setEmailStatus("error");
      setEmailMsg("Couldn’t save your email. Try again.");
    }
  }

  async function submitSaveMonitor() {
    setSaveStatus("idle");
    setSaveMsg("");

    if (!validateEmail(saveEmail)) {
      setSaveStatus("error");
      setSaveMsg("Please enter a valid email.");
      return;
    }

    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: saveEmail.trim(),
          source: "save_monitor_modal",
          protocol,
          host: host.trim() || undefined,
        }),
      });

      const json = await r.json();

      if (!r.ok || !json?.ok) {
        setSaveStatus("error");
        setSaveMsg(json?.error ?? "Couldn’t save your email. Try again.");
        return;
      }

      setSaveStatus("saved");
      setSaveMsg(
        json.added === false
          ? "You’re already on the list. We’ll notify you at launch."
          : "Saved. We’ll notify you when monitoring launches.",
      );
    } catch {
      setSaveStatus("error");
      setSaveMsg("Couldn’t save your email. Try again.");
    }
  }

  const sampleOutput = `FTPMonitor Check
Host: example.com
Protocol: SFTP  Port: 22  Path: .

DNS   ✅ 9ms      DNS resolved to 104.18.27.120
TCP   ✅ 14ms     TCP connection succeeded
AUTH  ✅ 83ms     Authenticated successfully
LIST  ❌ 41ms     Permission denied

Tips:
- Verify the remote path
- Confirm the account has list/read permissions

Troubleshooting: https://ftpmonitor.com/guides/sftp-directory-listing-failed`;

  return (
    <>
      <main style={styles.shell}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 30,
            }}
          >
            <Link href="/" style={{ fontWeight: 900, letterSpacing: -0.4 }}>
              FTPMonitor
            </Link>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/guides" style={{ color: styles.muted }}>
                Guides
              </Link>
              <Link href="/errors" style={{ color: styles.muted }}>
                Errors
              </Link>
            </div>
          </header>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "1.12fr 0.88fr",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                ...styles.card,
                padding: isNarrow ? 20 : 28,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span style={styles.badge}>FTP</span>
                <span style={styles.badge}>FTPS</span>
                <span style={styles.badge}>SFTP</span>
                <span style={styles.badge}>DNS → TCP → Auth → List</span>
              </div>

              <h1
                style={{
                  margin: "18px 0 10px",
                  fontSize: isNarrow ? 40 : 56,
                  lineHeight: 1.02,
                  letterSpacing: -1.5,
                }}
              >
                Debug FTP, SFTP, and FTPS in seconds
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: styles.muted,
                  maxWidth: 720,
                }}
              >
                Instantly test your connection, pinpoint the exact failure
                point, and get the next troubleshooting step without digging
                through logs.
              </p>

              <div
                style={{
                  marginTop: 22,
                  padding: 16,
                  borderRadius: 16,
                  background: styles.panel3,
                  border: `1px solid ${styles.borderStrong}`,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isNarrow
                      ? "1fr"
                      : "minmax(0,1fr) auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <input
                    ref={hostInputRef}
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="example.com"
                    style={{
                      ...styles.input,
                      fontSize: 16,
                      padding: "14px 16px",
                    }}
                  />

                  <button
                    onClick={runCheck}
                    disabled={loading || !host.trim()}
                    style={{
                      ...styles.btnPrimary(loading || !host.trim()),
                      minWidth: 140,
                    }}
                    title="Run a health check"
                  >
                    {loading ? "Testing…" : "Test Now"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  <span style={styles.badge}>✔ DNS</span>
                  <span style={styles.badge}>✔ TCP</span>
                  <span style={styles.badge}>✔ Auth</span>
                  <span style={styles.badge}>✔ TLS / List</span>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: styles.muted2,
                  }}
                >
                  Full diagnosis in a few seconds. No install required for the
                  web check.
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: isNarrow ? "1fr" : "minmax(0,1fr) auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <pre style={{ ...styles.code, ...styles.mono }}>
                  <code>{heroCommand}</code>
                </pre>

                <button
                  onClick={() => copyCliCommand(heroCommand)}
                  style={styles.btnGhost(false)}
                >
                  {copiedCli ? "Copied" : "Copy CLI"}
                </button>
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: styles.muted2,
                }}
              >
                Used by developers debugging real production file-transfer
                issues.
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                padding: 20,
                background: "linear-gradient(180deg, #121214, #0d0d0f)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: styles.muted2,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  marginBottom: 8,
                }}
              >
                Example output
              </div>

              <pre style={{ ...styles.code, ...styles.mono, height: "100%" }}>
                <code>{sampleOutput}</code>
              </pre>
            </div>
          </section>

          <section
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {[
              {
                title: "Stop guessing",
                body: "See whether the problem is DNS, port reachability, login, TLS, or directory access.",
              },
              {
                title: "Troubleshoot faster",
                body: "Each failed step points to the most relevant guide so you know what to fix next.",
              },
              {
                title: "Share the result",
                body: "Copy clean debug output for Slack, tickets, or incident notes without exposing credentials.",
              },
            ].map((item) => (
              <div key={item.title} style={{ ...styles.card, padding: 18 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ color: styles.muted, lineHeight: 1.65 }}>
                  {item.body}
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              marginTop: 28,
              ...styles.card,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "end",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    letterSpacing: -0.4,
                    fontSize: 30,
                  }}
                >
                  Run a full health check
                </h2>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: styles.muted,
                    lineHeight: 1.6,
                  }}
                >
                  Use the quick host box above for speed, or fill in credentials
                  here for a complete connection test.
                </p>
              </div>

              <button onClick={clearForm} style={styles.btnGhost(false)}>
                Clear
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr 1fr",
                gap: 12,
                marginTop: 18,
              }}
            >
              <label>
                <div style={styles.label}>Protocol</div>
                <select
                  value={protocol}
                  onChange={(e) => {
                    const next = e.target.value as Protocol;
                    setProtocol(next);
                    if (next !== "sftp") setSftpAuthMode("password");
                  }}
                  style={styles.input}
                >
                  <option value="sftp">SFTP</option>
                  <option value="ftp">FTP</option>
                  <option value="ftps">FTPS</option>
                </select>
              </label>

              <label>
                <div style={styles.label}>Host</div>
                <input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com"
                  style={styles.input}
                />
              </label>

              <label>
                <div style={styles.label}>Port</div>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => {
                    userTouchedPort.current = true;
                    setPort(Number(e.target.value));
                  }}
                  style={styles.input}
                />
              </label>

              <label>
                <div style={styles.label}>Username</div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user"
                  style={styles.input}
                />
              </label>

              {protocol === "sftp" ? (
                <>
                  <div style={{ gridColumn: isNarrow ? "auto" : "span 2" }}>
                    <div style={styles.label}>Authentication</div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setSftpAuthMode("password")}
                        style={{
                          ...styles.btnGhost(false),
                          border:
                            sftpAuthMode === "password"
                              ? "1px solid #fff"
                              : `1px solid ${styles.border}`,
                        }}
                      >
                        Password
                      </button>

                      <button
                        type="button"
                        onClick={() => setSftpAuthMode("key")}
                        style={{
                          ...styles.btnGhost(false),
                          border:
                            sftpAuthMode === "key"
                              ? "1px solid #fff"
                              : `1px solid ${styles.border}`,
                        }}
                      >
                        Private Key
                      </button>
                    </div>

                    {sftpAuthMode === "password" ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={styles.label}>Password</div>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            style={{ ...styles.input, flex: 1 }}
                          />
                          <label
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              color: styles.muted,
                              fontSize: 13,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={showPassword}
                              onChange={(e) =>
                                setShowPassword(e.target.checked)
                              }
                            />
                            Show
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 10 }}>
                        <div style={styles.label}>Private Key PEM</div>
                        <textarea
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          rows={6}
                          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                          style={{
                            ...styles.input,
                            ...styles.mono,
                          }}
                        />
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 12,
                            color: styles.muted2,
                          }}
                        >
                          Paste the private key only for this test. It is not
                          stored.
                        </div>
                      </div>
                    )}
                  </div>

                  <label>
                    <div style={styles.label}>Path (optional)</div>
                    <input
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder=". or /incoming"
                      style={styles.input}
                    />
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: styles.muted2,
                      }}
                    >
                      Example: <code>.</code> or <code>/incoming</code>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    <div style={styles.label}>Password</div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        style={{ ...styles.input, flex: 1 }}
                      />
                      <label
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          color: styles.muted,
                          fontSize: 13,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        Show
                      </label>
                    </div>
                  </label>

                  <label>
                    <div style={styles.label}>Path (optional)</div>
                    <input
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="/ or /incoming"
                      style={styles.input}
                    />
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: styles.muted2,
                      }}
                    >
                      Example: <code>/</code> or <code>/incoming</code>
                    </div>
                  </label>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={runCheck}
                disabled={loading || !canRun}
                style={styles.btnPrimary(loading || !canRun)}
              >
                {loading ? "Running…" : "Run Health Check"}
              </button>

              <div style={{ fontSize: 13, color: styles.muted }}>
                Credentials are used only for the current request and are not
                stored.
              </div>
            </div>

            {error ? (
              <div style={{ marginTop: 12, color: styles.danger }}>{error}</div>
            ) : null}

            {result ? (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {result.ok ? "✅ Success" : "❌ Failed"}{" "}
                    <span style={{ fontSize: 13, color: styles.muted }}>
                      ({result.totalMs} ms)
                    </span>
                  </h3>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={copyDebug} style={styles.btnGhost(false)}>
                      Copy Debug Output
                    </button>

                    {result.ok ? (
                      <button
                        onClick={() => {
                          setSaveEmail(email || "");
                          setSaveOpen(true);
                        }}
                        style={styles.btnPrimary(false)}
                      >
                        Save This Monitor
                      </button>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    border: `1px solid ${styles.border}`,
                    borderRadius: 14,
                    padding: 12,
                    background: styles.panel3,
                  }}
                >
                  {result.steps.map((s, idx) => {
                    const help = !s.ok
                      ? resolveHelpLink({
                          protocol: result.protocol,
                          step: s.key,
                          message: s.message,
                        })
                      : null;

                    return (
                      <div
                        key={`${s.key}-${idx}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom:
                            idx === result.steps.length - 1
                              ? "none"
                              : `1px solid ${styles.border}`,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 900 }}>
                            {s.ok ? "🟢" : "🔴"} {s.key.toUpperCase()}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 14,
                              color: styles.muted,
                            }}
                          >
                            {s.message}
                          </div>

                          {help ? (
                            <div style={{ marginTop: 8, fontSize: 13 }}>
                              <Link
                                href={help}
                                style={{
                                  color: styles.text,
                                  textDecoration: "underline",
                                }}
                              >
                                Read the troubleshooting guide →
                              </Link>
                            </div>
                          ) : null}

                          {s.details ? (
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: styles.muted2,
                                ...styles.mono,
                              }}
                            >
                              {redact(s.details)}
                            </div>
                          ) : null}
                        </div>

                        <div
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: 13,
                            color: styles.muted,
                          }}
                        >
                          {typeof s.ms === "number" ? `${s.ms} ms` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {result.tips?.length ? (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontWeight: 900 }}>Troubleshooting tips</div>
                    <ul
                      style={{
                        marginTop: 8,
                        paddingLeft: 18,
                        lineHeight: 1.7,
                        color: styles.muted,
                      }}
                    >
                      {result.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div
                  ref={waitlistRef}
                  style={{
                    marginTop: 16,
                    padding: 16,
                    borderRadius: 14,
                    border: `1px solid ${styles.border}`,
                    background: styles.panel2,
                  }}
                >
                  <div style={{ fontWeight: 900, letterSpacing: -0.2 }}>
                    Get early access to continuous monitoring
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: styles.muted,
                      marginTop: 6,
                      lineHeight: 1.6,
                    }}
                  >
                    Save endpoints, run scheduled checks, and get alerts when
                    something breaks.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 10,
                    }}
                  >
                    <input
                      ref={emailInputRef}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailStatus("idle");
                        setEmailMsg("");
                      }}
                      placeholder="you@company.com"
                      style={{ ...styles.input, flex: 1, minWidth: 220 }}
                    />
                    <button
                      onClick={joinWaitlist}
                      style={styles.btnPrimary(false)}
                    >
                      Notify me
                    </button>
                  </div>

                  {emailMsg ? (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color:
                          emailStatus === "error" ? styles.danger : styles.ok,
                      }}
                    >
                      {emailMsg}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <section
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {[
              {
                title: "1) Test",
                body: "Run a fast check against DNS, TCP, authentication, and directory listing.",
              },
              {
                title: "2) Diagnose",
                body: "See the exact step that failed and jump straight into the matching guide.",
              },
              {
                title: "3) Monitor",
                body: "Join the waitlist for scheduled checks and alerting as monitoring launches.",
              },
            ].map((item) => (
              <div key={item.title} style={{ ...styles.card, padding: 18 }}>
                <div style={{ fontWeight: 900 }}>{item.title}</div>
                <div
                  style={{
                    marginTop: 8,
                    color: styles.muted,
                    lineHeight: 1.65,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              marginTop: 28,
              ...styles.card,
              padding: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
              Common issues
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                color: styles.muted,
                lineHeight: 1.6,
              }}
            >
              Your guides are already covering strong intent queries. Make the
              homepage bridge directly into them.
            </p>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                ["/guides/ftp-connection-refused", "FTP connection refused"],
                ["/guides/sftp-permission-denied", "SFTP permission denied"],
                [
                  "/guides/ftp-passive-mode-not-working",
                  "FTP passive mode not working",
                ],
                ["/guides/ftps-certificate-error", "FTPS certificate error"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: `1px solid ${styles.border}`,
                    background: styles.panel3,
                    display: "block",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{label}</div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: styles.muted2,
                    }}
                  >
                    Read guide →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <footer
            style={{
              marginTop: 38,
              paddingTop: 18,
              borderTop: `1px solid ${styles.border}`,
              fontSize: 13,
              color: styles.muted2,
            }}
          >
            © {new Date().getFullYear()} FTPMonitor.com — diagnose FTP, FTPS,
            and SFTP issues faster.
          </footer>
        </div>
      </main>

      {saveOpen ? (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSaveOpen(false);
          }}
        >
          <div style={styles.modalCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.2 }}
                >
                  Activate monitoring for this endpoint
                </div>
                <div
                  style={{ marginTop: 6, color: styles.muted, fontSize: 13 }}
                >
                  Monitoring launches soon. Enter your email to save this
                  endpoint for launch access.
                </div>
              </div>

              <button
                onClick={() => setSaveOpen(false)}
                style={styles.btnGhost(false)}
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                border: `1px solid ${styles.border}`,
                borderRadius: 12,
                padding: 12,
                background: "rgba(255,255,255,0.02)",
                fontSize: 13,
                color: styles.muted,
              }}
            >
              <div>
                <strong style={{ color: styles.text }}>Protocol:</strong>{" "}
                {protocol.toUpperCase()}
              </div>
              <div style={{ marginTop: 4 }}>
                <strong style={{ color: styles.text }}>Host:</strong>{" "}
                {host.trim() || "(not set)"}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={styles.label}>Email</div>
              <input
                ref={saveEmailRef}
                value={saveEmail}
                onChange={(e) => {
                  setSaveEmail(e.target.value);
                  setSaveStatus("idle");
                  setSaveMsg("");
                }}
                placeholder="you@company.com"
                style={styles.input}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={submitSaveMonitor}
                style={styles.btnPrimary(false)}
              >
                Activate Monitoring
              </button>

              <button
                onClick={() => setSaveOpen(false)}
                style={styles.btnGhost(false)}
              >
                Not now
              </button>
            </div>

            {saveMsg ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: saveStatus === "error" ? styles.danger : styles.ok,
                }}
              >
                {saveMsg}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
