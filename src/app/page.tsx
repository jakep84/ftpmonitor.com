"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Protocol = "ftp" | "ftps" | "sftp";

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

type SftpAuthMode = "password" | "key";

function defaultPort(p: Protocol) {
  if (p === "sftp") return 22;
  return 21;
}

function redact(input: any) {
  // Deep-ish clone with redaction for safe clipboard/debug display
  try {
    const s = JSON.stringify(input, (_k, v) => v, 2);
    // Extra safety: remove anything that looks like a private key block
    return s.replace(
      /-----BEGIN[\s\S]*?-----END[\s\S]*?-----/g,
      "[REDACTED_KEY]",
    );
  } catch {
    return "[unserializable]";
  }
}

export default function HomePage() {
  // Form state
  const [protocol, setProtocol] = useState<Protocol>("sftp");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(defaultPort("sftp"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [path, setPath] = useState("");

  const [sftpAuthMode, setSftpAuthMode] = useState<SftpAuthMode>("password");
  const [privateKey, setPrivateKey] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lead capture (Phase 2 waitlist)
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [emailMsg, setEmailMsg] = useState<string>("");

  // Don’t override user custom port once they touched it
  const userTouchedPort = useRef(false);

  // Waitlist UX refs (scroll + focus after success)
  const waitlistRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Health check UX refs (scroll + focus when user clicks hero button without filling form)
  const healthFormRef = useRef<HTMLElement | null>(null);
  const hostInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!userTouchedPort.current) setPort(defaultPort(protocol));
  }, [protocol]);

  useEffect(() => {
    // After a successful check, guide the user to the waitlist
    if (result?.ok) {
      waitlistRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => emailInputRef.current?.focus(), 250);
    }
  }, [result?.ok]);

  const styles = useMemo(() => {
    const bg = "#0b0b0c";
    const panel = "#111113";
    const panel2 = "#0f0f10";
    const border = "#2a2a2e";
    const text = "#f5f5f6";
    const muted = "rgba(245,245,246,0.72)";
    const muted2 = "rgba(245,245,246,0.55)";
    const danger = "#ff5a6a";
    const ok = "#4ade80";

    const radius = 14;

    return {
      bg,
      panel,
      panel2,
      border,
      text,
      muted,
      muted2,
      danger,
      ok,
      radius,
      input: {
        width: "100%",
        padding: 10,
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: "#0c0c0e",
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
          borderRadius: 10,
          border: `1px solid ${disabled ? border : "#fff"}`,
          background: disabled ? "#141416" : "#fff",
          color: disabled ? muted2 : "#111",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 700,
        }) as React.CSSProperties,
      btnGhost: (disabled?: boolean) =>
        ({
          padding: "12px 14px",
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: "#0c0c0e",
          color: disabled ? muted2 : text,
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 650,
        }) as React.CSSProperties,
      chip: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: "#0c0c0e",
        color: muted,
        fontSize: 12,
      } as React.CSSProperties,
    };
  }, []);

  async function runCheck() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body: any = {
        protocol,
        host: host.trim(),
        port,
        username: username.trim(),
        path: path.trim() || undefined,
      };

      if (protocol === "sftp") {
        if (sftpAuthMode === "key") {
          body.privateKey = privateKey;
        } else {
          body.password = password;
        }
      } else {
        body.password = password;
      }

      const r = await fetch("/api/health-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await r.json();
      setResult(json);
      if (!r.ok) setError("Health check failed. See details below.");
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
      // Never include credentials from UI state:
      note: "Credentials are not included in this debug output.",
    };
    await navigator.clipboard.writeText(redact(safe));
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

  const traffic = result ? (result.ok ? "🟢" : "🔴") : "⚪️";
  const canRun =
    !!host.trim() &&
    !!port &&
    (protocol !== "sftp"
      ? true
      : sftpAuthMode === "key"
        ? !!privateKey.trim()
        : true);

  function handleHeroRun() {
    // Instead of disabling the hero CTA, guide user to the form.
    if (!canRun) {
      healthFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => hostInputRef.current?.focus(), 200);
      return;
    }
    runCheck();
  }

  // Responsive: switch to 1 column when narrow (simple approach)
  const isNarrow =
    typeof window !== "undefined"
      ? window.matchMedia?.("(max-width: 860px)")?.matches
      : false;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: styles.bg,
        color: styles.text,
        padding: "32px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* HERO */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "1.2fr 0.8fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 44,
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: -0.6,
              }}
            >
              Know Immediately When Your FTP Fails.
            </h1>
            <p style={{ fontSize: 18, marginTop: 12, color: styles.muted }}>
              Test your FTP / FTPS / SFTP connection instantly — then turn it
              into continuous monitoring in one click.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 16,
              }}
            >
              <button
                onClick={handleHeroRun}
                disabled={loading}
                style={styles.btnPrimary(loading)}
                title={
                  canRun
                    ? "Run a health check"
                    : "Add a host (and credentials if needed) to run the check"
                }
              >
                {loading ? "Running…" : "Run Free Health Check"}
              </button>

              <button
                onClick={clearForm}
                disabled={loading}
                style={styles.btnGhost(loading)}
                title="Clear inputs + results"
              >
                Clear
              </button>

              <a
                href="#how"
                style={{
                  alignSelf: "center",
                  color: styles.text,
                  opacity: 0.9,
                  textDecoration: "none",
                }}
              >
                See how monitoring works →
              </a>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 14,
              }}
            >
              <span style={styles.chip}>✓ No credentials stored (Phase 1)</span>
              <span style={styles.chip}>✓ Under 60 seconds</span>
              <span style={styles.chip}>✓ Clear diagnostics</span>
            </div>
          </div>

          {/* MINI PREVIEW / STATUS */}
          <div
            style={{
              border: `1px solid ${styles.border}`,
              borderRadius: styles.radius,
              padding: 16,
              background: styles.panel,
            }}
          >
            <div
              style={{ fontSize: 12, color: styles.muted2, marginBottom: 8 }}
            >
              Example Result
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800 }}>Health Check</div>
              <div style={{ fontSize: 22 }}>{traffic}</div>
            </div>
            <div style={{ fontSize: 13, color: styles.muted, marginTop: 8 }}>
              DNS → TCP → Auth → List
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: styles.muted }}>
              Tip: Fiddler won’t show FTP traffic — this tool checks the
              connection directly.
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section
          style={{
            marginTop: 34,
            padding: 18,
            borderRadius: styles.radius,
            background: styles.panel2,
            border: `1px solid ${styles.border}`,
          }}
        >
          <h2 style={{ margin: 0, letterSpacing: -0.2 }}>
            When FTP breaks, nobody knows… until it’s too late.
          </h2>
          <ul
            style={{
              marginTop: 10,
              marginBottom: 0,
              lineHeight: 1.75,
              color: styles.muted,
            }}
          >
            <li>Nightly exports silently fail</li>
            <li>Vendor files never arrive</li>
            <li>Automations stop running</li>
            <li>Clients complain before you’re aware</li>
          </ul>
        </section>

        {/* HEALTH CHECK FORM */}
        <section
          ref={healthFormRef}
          style={{
            marginTop: 28,
            border: `1px solid ${styles.border}`,
            borderRadius: styles.radius,
            padding: 18,
            background: styles.panel,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 6 }}>
                Test Your FTP / SFTP Now
              </h2>
              <div style={{ color: styles.muted, fontSize: 13 }}>
                DNS → TCP → Auth → List • Clear answers in seconds
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr 1fr",
              gap: 12,
              marginTop: 14,
            }}
          >
            <label>
              <div style={styles.label}>Protocol</div>
              <select
                value={protocol}
                onChange={(e) => {
                  setProtocol(e.target.value as Protocol);
                  // Reset auth mode defaults when switching protocols
                  if ((e.target.value as Protocol) !== "sftp")
                    setSftpAuthMode("password");
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
                ref={hostInputRef}
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="example.com"
                style={styles.input}
              />
            </label>

            <label>
              <div style={styles.label}>Port</div>
              <input
                value={port}
                onChange={(e) => {
                  userTouchedPort.current = true;
                  setPort(Number(e.target.value));
                }}
                type="number"
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

            {/* Auth fields */}
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
                            onChange={(e) => setShowPassword(e.target.checked)}
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
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                        }}
                      />
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: styles.muted2,
                        }}
                      >
                        Tip: Paste your key. We don’t store it (Phase 1).
                      </div>
                    </div>
                  )}
                </div>

                <label>
                  <div style={styles.label}>Path (optional)</div>
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="e.g. .  or  /incoming"
                    style={styles.input}
                  />
                  <div
                    style={{ marginTop: 6, fontSize: 12, color: styles.muted2 }}
                  >
                    Examples: <code style={{ color: styles.muted }}>.</code> or{" "}
                    <code style={{ color: styles.muted }}>/incoming</code>
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
                    placeholder="e.g. /  or  /incoming"
                    style={styles.input}
                  />
                  <div
                    style={{ marginTop: 6, fontSize: 12, color: styles.muted2 }}
                  >
                    Examples: <code style={{ color: styles.muted }}>/</code> or{" "}
                    <code style={{ color: styles.muted }}>/incoming</code>
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
              We do not store credentials during testing.
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: styles.danger }}>{error}</div>
          )}

          {/* RESULTS */}
          {result && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <h3 style={{ marginBottom: 8, marginTop: 0 }}>
                  {result.ok ? "✅ Success" : "❌ Failed"}{" "}
                  <span style={{ fontSize: 13, color: styles.muted }}>
                    ({result.totalMs} ms)
                  </span>
                </h3>

                <button
                  onClick={copyDebug}
                  style={styles.btnGhost(false)}
                  title="Copy safe debug output (no credentials)"
                >
                  Copy Debug Output
                </button>
              </div>

              <div
                style={{
                  border: `1px solid ${styles.border}`,
                  borderRadius: 12,
                  padding: 12,
                  background: "#0c0c0e",
                }}
              >
                {result.steps.map((s, idx) => (
                  <div
                    key={s.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom:
                        idx === result.steps.length - 1
                          ? "none"
                          : `1px solid ${styles.border}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {s.ok ? "🟢" : "🔴"} {s.key.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, color: styles.muted }}>
                        {s.message}
                      </div>

                      {s.details && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 12,
                            color: styles.muted2,
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {redact(s.details)}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: styles.muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {typeof s.ms === "number" ? `${s.ms} ms` : ""}
                    </div>
                  </div>
                ))}
              </div>

              {result.tips?.length ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 800 }}>Troubleshooting tips</div>
                  <ul
                    style={{
                      marginTop: 8,
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

              {/* Phase 2 waitlist CTA */}
              <div
                ref={waitlistRef}
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${styles.border}`,
                  background: styles.panel2,
                }}
              >
                <div style={{ fontWeight: 900, letterSpacing: -0.2 }}>
                  Get early access to continuous monitoring
                </div>
                <div
                  style={{ fontSize: 13, color: styles.muted, marginTop: 6 }}
                >
                  Save monitors, run scheduled checks, and get alerts when
                  something breaks. No spam — 1–2 emails max until launch.
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                    flexWrap: "wrap",
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
          )}
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 10 }}>How it works</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <div
              style={{
                border: `1px solid ${styles.border}`,
                borderRadius: styles.radius,
                padding: 14,
                background: styles.panel,
              }}
            >
              <div style={{ fontWeight: 900 }}>1) Test</div>
              <div style={{ marginTop: 6, fontSize: 14, color: styles.muted }}>
                Run a health check (DNS → TCP → Auth → List).
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${styles.border}`,
                borderRadius: styles.radius,
                padding: 14,
                background: styles.panel,
              }}
            >
              <div style={{ fontWeight: 900 }}>2) Monitor</div>
              <div style={{ marginTop: 6, fontSize: 14, color: styles.muted }}>
                Save it and run scheduled checks (Phase 2).
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${styles.border}`,
                borderRadius: styles.radius,
                padding: 14,
                background: styles.panel,
              }}
            >
              <div style={{ fontWeight: 900 }}>3) Alert</div>
              <div style={{ marginTop: 6, fontSize: 14, color: styles.muted }}>
                Get notified when something breaks (Phase 3).
              </div>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 42,
            paddingTop: 18,
            borderTop: `1px solid ${styles.border}`,
            fontSize: 13,
            color: styles.muted2,
          }}
        >
          © {new Date().getFullYear()} FTPMonitor.com — Simple FTP & SFTP
          monitoring.
        </footer>
      </div>
    </main>
  );
}
