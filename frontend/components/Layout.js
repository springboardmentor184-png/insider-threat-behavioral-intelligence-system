import { useState, useEffect } from "react";
import { ShieldCheck, LayoutDashboard, Activity, Bell, FileText, Users, LogOut, Moon, Sun, CheckCheck } from "lucide-react";
import { apiFetch, getRole, logout } from "../utils/api";
import Link from "next/link";
import { useRouter } from "next/router";

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
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRole(getRole());
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
    const loadNotifications = () => apiFetch("/analytics/notifications")
      .then((data) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next); localStorage.setItem("theme", next); document.documentElement.dataset.theme = next;
  };
  const unreadCount = notifications.filter((item) => !item.read).length;
  const openNotification = async (item) => {
    if (!item.read) {
      try { await apiFetch(`/analytics/notifications/${encodeURIComponent(item.key)}/read`, { method: "PATCH" }); } catch (_) { /* navigation still works */ }
      setNotifications((items) => items.map((entry) => entry.key === item.key ? { ...entry, read: true } : entry));
    }
    setNotificationOpen(false);
    router.push(item.href || "/alerts");
  };
  const links = [
    ["/dashboard", "Dashboard", LayoutDashboard], ["/activity", "Activity", Activity],
    ["/alerts", "Alerts", Bell], ["/reports", "Reports", FileText],
  ];
  if (role === "administrator") links.push(["/employees", "Employees", Users]);

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
          {links.map(([href, label, Icon]) => <Link key={href} href={href} className={`nav-item ${router.pathname.startsWith(href) ? "nav-item-active" : ""}`}>
            <Icon size={16} strokeWidth={2} />{label}
          </Link>)}
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
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-faint)" }}>
              {roleLabels[role]}
            </p>
            <h1 className="text-[26px] font-bold mt-1 tracking-tight" style={{ color: "var(--color-text)" }}>{title}</h1>
            {subtitle && <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button onClick={() => setNotificationOpen((open) => !open)} aria-label="Open notifications" aria-expanded={notificationOpen} className="theme-toggle">
                  <Bell size={17} />
                  {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notificationOpen && <div className="notification-menu card" role="menu">
                  <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{unreadCount} unread</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? <p className="p-4 text-sm" style={{ color: "var(--color-text-muted)" }}>No recent alert or investigation events.</p> : notifications.map((item) => <button key={item.key} onClick={() => openNotification(item)} className={`notification-item ${item.read ? "" : "notification-unread"}`} role="menuitem">
                      <span className={`severity-dot severity-${item.severity}`} />
                      <span className="min-w-0 flex-1 text-left"><span className="block text-sm font-medium truncate">{item.title}</span><span className="block text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>{item.message}</span></span>
                      {!item.read && <CheckCheck size={14} style={{ color: "var(--color-primary)" }} />}
                    </button>)}
                  </div>
                </div>}
              </div>
              <button onClick={toggleTheme} aria-label="Toggle color theme" className="theme-toggle">{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
