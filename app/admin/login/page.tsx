"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Add these to your globals.css (or layout.tsx via next/font):
//   @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Activity,
  Cpu,
  Globe,
  Key,
} from "lucide-react";

// ─── GraphQL ─────────────────────────────────────────────────────────────────
const LOGIN_MUTATION = `
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      fullName
      role
    }
  }
}
`;

// ─── Static data ─────────────────────────────────────────────────────────────
const SECURITY_FEATURES = [
  { Icon: ShieldCheck, label: "End-to-end encrypted session" },
  { Icon: Activity, label: "Real-time audit & threat logging" },
  { Icon: Cpu, label: "Anomaly detection engine active" },
  { Icon: Globe, label: "Global rate-limit enforcement" },
  { Icon: Key, label: "Role-based access control (RBAC)" },
];

// ─── Inline styles & keyframes injected once ────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse2   { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @keyframes scanline { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }

  .anim-fadeUp  { animation: fadeUp  .6s cubic-bezier(.22,1,.36,1) both; }
  .anim-fadeIn  { animation: fadeIn  .5s ease both; }
  .anim-slideIn { animation: slideIn .5s cubic-bezier(.22,1,.36,1) both; }

  .input-field {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 44px 14px 44px;
    font-size: 14px;
    font-family: 'IBM Plex Mono', monospace;
    color: #e8eaf2;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
    letter-spacing: .02em;
  }
  .input-field::placeholder { color: rgba(255,255,255,0.18); }
  .input-field:focus {
    border-color: rgba(79,110,247,.55);
    background: rgba(79,110,247,.05);
    box-shadow: 0 0 0 3px rgba(79,110,247,.12);
  }
  .input-field.error {
    border-color: rgba(239,68,68,.5);
    box-shadow: 0 0 0 3px rgba(239,68,68,.1);
  }
  .submit-btn {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: none;
    font-family: 'Geist', sans-serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity .2s, box-shadow .2s, transform .15s;
    background: linear-gradient(135deg, #4f6ef7 0%, #3b54e0 100%);
    color: #fff;
    box-shadow: 0 0 28px rgba(79,110,247,.35);
  }
  .submit-btn:hover:not(:disabled) {
    box-shadow: 0 0 40px rgba(79,110,247,.55);
    transform: translateY(-1px);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

  .checkbox-box {
    width: 16px; height: 16px; border-radius: 5px;
    border: 1.5px solid rgba(255,255,255,.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: all .2s;
  }
  .checkbox-box.checked {
    background: #4f6ef7; border-color: #4f6ef7;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState({ email: false, password: false });
  const [capsLock, setCapsLock] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount animation + restore remembered email
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Caps-lock detection
  const onKey = useCallback((e: KeyboardEvent) => {
  if (e.key === "CapsLock") {
    setCapsLock(e.getModifierState("CapsLock"));
  }
}, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const fe = { email: !email.trim(), password: !password.trim() };
    setFieldErr(fe);
    if (fe.email || fe.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const data: any = await graphqlRequest({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      const { token, user } = data.login;

      if (user.role !== "ADMIN") {
        setError("Access denied — this portal is for administrators only.");
        setLoading(false);
        return;
      }

      rememberMe
        ? localStorage.setItem("admin_email", email)
        : localStorage.removeItem("admin_email");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      <div
        style={{
          minHeight: "100vh",
          background: "#060810",
          color: "#e8eaf2",
          fontFamily: "'Geist', sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Ambient background glows ───────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: `
            radial-gradient(ellipse 60% 50% at 15% 55%, rgba(79,110,247,.1) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 20%, rgba(16,217,160,.06) 0%, transparent 60%)
          `,
          }}
        />

        {/* ── Grid texture ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            opacity: 0.025,
            pointerEvents: "none",
            backgroundImage: `
            linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)
          `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* ── Scanline ───────────────────────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(79,110,247,.12), transparent)",
              animation: "scanline 8s linear infinite",
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,.05)",
            backdropFilter: "blur(24px)",
            background: "rgba(6,8,16,.7)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #4f6ef7, #10d9a0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(79,110,247,.4)",
                }}
              >
                <ShieldCheck size={17} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-.02em",
                }}
              >
                EventAdmin
              </span>
            </div>

            {/* Status pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(16,217,160,.08)",
                border: "1px solid rgba(16,217,160,.2)",
                borderRadius: 99,
                padding: "5px 12px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10d9a0",
                  animation: "pulse2 2s ease infinite",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#10d9a0",
                }}
              >
                Systems Online
              </span>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN
        ═══════════════════════════════════════════════════════════════════ */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 16px 32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className={mounted ? "anim-fadeUp" : ""}
            style={{
              width: "100%",
              maxWidth: 980,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow:
                "0 40px 120px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06)",
            }}
          >
            {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
            <div
              style={{
                background: "linear-gradient(160deg, #0f1629 0%, #080c1a 100%)",
                borderRight: "1px solid rgba(255,255,255,.05)",
                padding: "52px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                // Hide on mobile via inline media isn't possible; handle via responsive wrapper below
              }}
              className="left-panel"
            >
              {/* Top branding */}
              <div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #4f6ef7, #10d9a0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 28,
                    boxShadow: "0 0 32px rgba(79,110,247,.3)",
                  }}
                >
                  <ShieldCheck size={26} color="#fff" />
                </div>

                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 30,
                    lineHeight: 1.2,
                    letterSpacing: "-.03em",
                    marginBottom: 12,
                    margin: "0 0 12px",
                  }}
                >
                  Secure Admin
                  <br />
                  Command Center
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,.4)",
                    lineHeight: 1.7,
                    marginBottom: 36,
                    margin: "12px 0 36px",
                  }}
                >
                  Enterprise event management with real-time controls, audit
                  logging, and multi-layer access enforcement.
                </p>

                {/* Feature list */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {SECURITY_FEATURES.map(({ Icon, label }, i) => (
                    <div
                      key={i}
                      className={mounted ? "anim-slideIn" : ""}
                      style={{
                        animationDelay: `${i * 80}ms`,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "rgba(79,110,247,.1)",
                          border: "1px solid rgba(79,110,247,.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} color="#7a92f8" />
                      </div>
                      <span
                        style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom status bar */}
              <div
                style={{
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Activity size={15} color="#10d9a0" />
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.3)",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: 2,
                      }}
                    >
                      Security Status
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#10d9a0",
                        fontWeight: 600,
                      }}
                    >
                      All systems operational
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL (Form) ─────────────────────────────────────── */}
            <div
              style={{
                background: "#0d1117",
                padding: "52px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Heading */}
              <div style={{ marginBottom: 32 }}>
                <h1
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 26,
                    letterSpacing: "-.03em",
                    margin: "0 0 8px",
                  }}
                >
                  Administrator Login
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.35)",
                    margin: 0,
                  }}
                >
                  Authorized personnel only. All activity is monitored and
                  logged.
                </p>
              </div>

              {/* ── Error banner ─────────────────────────────────────────── */}
              {error && (
                <div
                  className="anim-fadeIn"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    background: "rgba(239,68,68,.08)",
                    border: "1px solid rgba(239,68,68,.25)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 24,
                  }}
                >
                  <AlertCircle
                    size={16}
                    color="#f87171"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "#fca5a5",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* ── Form ─────────────────────────────────────────────────── */}
              <form onSubmit={handleLogin} noValidate>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {/* Email field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.4)",
                        marginBottom: 8,
                      }}
                    >
                      Admin Email
                    </label>
                    <div style={{ position: "relative" }}>
                      <AtSign
                        size={15}
                        color="rgba(255,255,255,.28)"
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        className={`input-field${fieldErr.email ? " error" : ""}`}
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        autoComplete="email"
                        required
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                          setFieldErr((f) => ({ ...f, email: false }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.4)",
                        marginBottom: 8,
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={15}
                        color="rgba(255,255,255,.28)"
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        className={`input-field${fieldErr.password ? " error" : ""}`}
                        style={{ paddingRight: 44 }}
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        autoComplete="current-password"
                        required
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                          setFieldErr((f) => ({ ...f, password: false }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(255,255,255,.3)",
                          padding: 0,
                          display: "flex",
                          transition: "color .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,.65)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "rgba(255,255,255,.3)")
                        }
                        aria-label={
                          showPass ? "Hide password" : "Show password"
                        }
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Caps-lock warning */}
                    {capsLock && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "#fbbf24",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span>⚠</span> Caps Lock is on
                      </div>
                    )}
                  </div>

                  {/* Remember me + Forgot password */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className={`checkbox-box${rememberMe ? " checked" : ""}`}
                        onClick={() => setRememberMe((r) => !r)}
                        role="checkbox"
                        aria-checked={rememberMe}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === " " && setRememberMe((r) => !r)
                        }
                      >
                        {rememberMe && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,.45)",
                          userSelect: "none",
                        }}
                      >
                        Remember email
                      </span>
                    </label>

                    <a
                      href="#"
                      style={{
                        fontSize: 13,
                        color: "#7a92f8",
                        textDecoration: "none",
                        transition: "color .15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#a5b4fc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#7a92f8")
                      }
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                    style={{ marginTop: 4 }}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Authorize &amp; Enter
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security footnote */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <ShieldCheck size={13} color="rgba(255,255,255,.18)" />
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.2)",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  TLS 1.3 encrypted · Session monitored · Unauthorized access
                  prosecuted
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
        <footer
          style={{
            position: "relative",
            zIndex: 1,
            borderTop: "1px solid rgba(255,255,255,.04)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.18)",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              © {new Date().getFullYear()} EventPlatform · Secure Admin Portal
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy Policy", "Terms of Service", "Security Audit"].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.2)",
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,.5)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,.2)")
                    }
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.18)" }}>
              Authorized Personnel Only
            </span>
          </div>
        </footer>

        {/* ── Spin keyframe for loader ───────────────────────────────────── */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes spin { to { transform: rotate(360deg); } }

          /* Responsive: stack panels on small screens */
          @media (max-width: 767px) {
            .left-panel { display: none !important; }
            [style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `,
          }}
        />
      </div>
    </>
  );
}
