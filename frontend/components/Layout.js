import { useState, useEffect } from "react";
import { ShieldCheck, LayoutDashboard, LogOut } from "lucide-react";
import { getRole, logout } from "../utils/api";

const roleLabels = {
  security_analyst: "Security Analyst",
  soc_engineer: "SOC Engineer",
  security_manager: "Security Manager",
  administrator: "Administrator",
};

function initials(role) {
  const label = roleLabels[role] || "U";
  return label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Layout({ children, title, subtitle }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(getRole());
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      <aside className="hidden md:flex md:flex-col w-64 shrink-0" style={{ background: "var(--sidebar-bg)" }}>
        <div className="px-5 py-6 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--sidebar-accent), var(--color-primary))" }}
          >
            <ShieldCheck size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">Aegis</span>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          <div className="nav-item nav-item-active">
            <LayoutDashboard size={16} strokeWidth={2} />
            Dashboard
          </div>
        </nav>

        <div className="px-4 py-4 border-t flex items-center gap-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: "var(--sidebar-bg-hover)", color: "#fff" }}
          >
            {initials(role)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{roleLabels[role] || "User"}</p>
            <button onClick={logout} className="text-xs flex items-center gap-1 hover:text-white transition-colors" style={{ color: "var(--sidebar-text)" }}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <span className="font-bold text-white">Aegis</span>
          <button onClick={logout} className="text-xs text-white/70">Sign out</button>
        </header>

        <main className="p-6 md:p-8 max-w-6xl mx-auto fade-in">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-faint)" }}>
              {roleLabels[role]}
            </p>
            <h1 className="text-[26px] font-bold mt-1 tracking-tight" style={{ color: "var(--color-text)" }}>{title}</h1>
            {subtitle && <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}