import { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setResult(null); setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/password-reset/request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not create reset link");
      setResult(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const resetLink = result?.reset_link || (result?.reset_token ? `/reset-password?token=${encodeURIComponent(result.reset_token)}` : null);
  return <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-bg)" }}><form onSubmit={submit} className="card w-full max-w-md p-7"><div className="flex items-center gap-2 mb-6"><ShieldCheck size={22} style={{ color: "var(--color-primary)" }} /><div><h1 className="text-xl font-bold">Reset your password</h1><p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Request a secure password reset link.</p></div></div>{error && <p className="text-sm p-3 rounded mb-4" style={{ background: "var(--sev-critical-bg)", color: "var(--sev-critical)" }}>{error}</p>}{!result ? <><label className="block text-xs font-medium mb-1.5">Account email</label><div className="relative mb-5"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} /><input className="input-field pl-9" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></div><button className="btn-primary w-full py-2.5 text-sm" disabled={loading}>{loading ? "Sending…" : "Email reset link"}</button></> : result.email_sent ? <div className="rounded-md p-4 text-sm" style={{ background: "var(--color-primary-soft)" }}><p className="font-semibold">Check your email.</p><p className="mt-2" style={{ color: "var(--color-text-muted)" }}>{result.message}</p></div> : <div className="rounded-md p-4 text-sm" style={{ background: "var(--sev-medium-bg)" }}><p className="font-semibold" style={{ color: "var(--sev-medium)" }}>Email delivery failed — local fallback only.</p><p className="mt-2" style={{ color: "var(--color-text-muted)" }}>{result.delivery_error || result.message} Use this one-time link within {result.expires_in_minutes} minutes:</p>{resetLink && <Link href={resetLink} className="block mt-2 break-all font-medium" style={{ color: "var(--color-primary)" }}>{resetLink}</Link>}</div>}<p className="text-xs text-center mt-5"><Link href="/login" style={{ color: "var(--color-primary)" }}>Back to sign in</Link></p></form></main>;
}
