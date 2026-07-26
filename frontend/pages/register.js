import { useState } from "react";
import { useRouter } from "next/router";
import { ShieldCheck, User, Mail, Lock } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "security_analyst" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const formatError = (detail) => {
    if (!detail) return "Registration failed";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
    return JSON.stringify(detail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(formatError(data.detail));
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: "var(--color-bg)" }}>
      <div
        className="hidden md:flex flex-col justify-between p-12"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--sidebar-accent), var(--color-primary))" }}
          >
            <ShieldCheck size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-lg text-white">Aegis</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight max-w-sm">
            One console, every role covered.
          </h2>
          <p className="text-sm mt-3 max-w-sm" style={{ color: "var(--sidebar-text)" }}>
            Analysts investigate, SOC engineers monitor live, managers track org-wide risk, admins oversee the platform — all from Aegis.
          </p>
        </div>

        <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>© 2026 Aegis Insider Threat Platform</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
              <ShieldCheck size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--color-text)" }}>Aegis</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Create your account</h1>
          <p className="text-sm mb-7" style={{ color: "var(--color-text-muted)" }}>Get access to the insider threat console</p>

          {error && (
            <div className="text-sm px-3 py-2 rounded-md mb-4" style={{ background: "var(--sev-critical-bg)", color: "var(--sev-critical)" }}>
              {error}
            </div>
          )}

          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Full name</label>
          <div className="relative mb-4">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field pl-9" />
          </div>

          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Email</label>
          <div className="relative mb-4">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field pl-9" />
          </div>

          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Password</label>
          <div className="relative mb-4">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field pl-9" />
          </div>

          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="input-field mb-6">
            <option value="security_analyst">Security Analyst</option>
            <option value="soc_engineer">SOC Engineer</option>
            <option value="security_manager">Security Manager</option>
            <option value="administrator">Administrator</option>
          </select>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-xs text-center mt-5" style={{ color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <a href="/login" className="font-medium" style={{ color: "var(--color-primary)" }}>Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}