import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API_URL from "../../services/api";

export const C = {
  bg: "#080C14",
  panel: "#0E1520",
  card: "#131C2B",
  border: "#1A2540",
  hover: "#1E2D47",
  accent: "#E84545",
  amber: "#F59E0B",
  teal: "#14B8A6",
  blue: "#3B82F6",
  violet: "#7C3AED",
  green: "#10B981",
  txt: "#DDE3F0",
  dim: "#7B8BAA",
  muted: "#3D4F6E",
};

export function Pill({ label, color }) {
  return (
    <span
      style={{
        background: color + "1A",
        color,
        border: `1px solid ${color}33`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

export function KPI({ label, value, sub, color, blink }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "16px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          background: `radial-gradient(circle at top right,${color},transparent 70%)`,
        }}
      />

      {blink && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 0 3px ${color}44`,
            animation: "blink 2s infinite",
          }}
        />
      )}

      <div
        style={{
          color: C.dim,
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color,
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            color: C.muted,
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Panel({ title, sub, children, style }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 18,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 14,
            color: C.txt,
          }}
        >
          {title}{" "}
          {sub && (
            <span
              style={{
                color: C.dim,
                fontWeight: 400,
                fontSize: 11,
              }}
            >
              {sub}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

/* =========================
   TABLE STYLES
========================= */

export const thStyle = {
  textAlign: "left",
  padding: "8px 12px",
  color: C.dim,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: `1px solid ${C.border}`,
};

export const tdStyle = {
  padding: "10px 12px",
  borderBottom: `1px solid ${C.border}`,
  color: C.txt,
  fontSize: 12.5,
};

/* =========================
   REUSABLE BUTTON
========================= */

export function Btn({
  children,
  onClick,
  variant = "default",
  type = "button",
  disabled,
}) {
  const styles = {
    default: {
      background: C.border,
      color: C.txt,
    },

    primary: {
      background: C.blue,
      color: "#fff",
    },

    danger: {
      background: C.accent,
      color: "#fff",
    },

    ghost: {
      background: "transparent",
      color: C.dim,
      border: `1px solid ${C.border}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px",
        borderRadius: 6,
        border: "none",
        fontSize: 11.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

/* =========================
   REUSABLE INPUT
========================= */

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "8px 12px",
        color: C.txt,
        fontSize: 12,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

/* =========================
   REUSABLE SELECT
========================= */

export function Select(props) {
  return (
    <select
      {...props}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "8px 12px",
        color: C.txt,
        fontSize: 12,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

/* =========================
   SIDEBAR PAGES
========================= */

const ALL_PAGES = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⬛",
    path: "/dashboard",
    roles: null,
  },
  {
    id: "employees",
    label: "Employees",
    icon: "👤",
    path: "/employees",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "activity",
    label: "Activity",
    icon: "📊",
    path: "/activity",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: "🔔",
    path: "/alerts",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "investigations",
    label: "Investigations",
    icon: "🔍",
    path: "/investigations",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "ueba",
    label: "UEBA",
    icon: "🧠",
    path: "/ueba",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "risk",
    label: "Risk",
    icon: "⚠",
    path: "/risk",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "📄",
    path: "/reports",
    roles: [
      "Administrator",
      "Security Manager",
      "SOC Engineer",
      "Security Analyst",
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: "🛠",
    path: "/users",
    roles: ["Administrator"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
    path: "/notifications",
    roles: null,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "👤",
    path: "/profile",
    roles: null,
  },
];

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* =========================
   APP LAYOUT
========================= */

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;
  const name = user?.name;

  const [liveTime, setLiveTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/notifications/summary/unread-count`, {
      headers: authHeaders(),
    })
      .then((r) =>
        r.ok ? r.json() : { unread_count: 0 }
      )
      .then((d) => setUnreadCount(d.unread_count || 0))
      .catch(() => {});
  }, [location.pathname]);

  const pages = ALL_PAGES.filter(
    (p) => !p.roles || p.roles.includes(role)
  );

  const currentId =
    ALL_PAGES.find((p) =>
      location.pathname.startsWith(p.path)
    )?.id || "dashboard";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: C.txt,
        fontSize: 13,
      }}
    >
      <style>{`
        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 2px;
        }
      `}</style>

      {/* SIDEBAR */}

      <div
        style={{
          width: 210,
          background: C.panel,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: `linear-gradient(135deg,${C.accent},${C.violet})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🛡
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.txt,
                  letterSpacing: "0.04em",
                }}
              >
                ITBIS
              </div>

              <div
                style={{
                  fontSize: 9,
                  color: C.muted,
                  letterSpacing: "0.08em",
                }}
              >
                INSIDER THREAT
              </div>
            </div>
          </div>
        </div>

        <nav
          style={{
            padding: "10px 8px",
            flex: 1,
          }}
        >
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 10px",
                borderRadius: 7,
                marginBottom: 2,
                background:
                  currentId === p.id
                    ? C.hover
                    : "transparent",
                border:
                  currentId === p.id
                    ? `1px solid ${C.border}`
                    : "1px solid transparent",
                color:
                  currentId === p.id
                    ? C.txt
                    : C.dim,
                fontWeight:
                  currentId === p.id ? 700 : 400,
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 14 }}>
                {p.icon}
              </span>

              {p.label}

              {p.id === "notifications" &&
                unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: C.amber,
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 6px",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}

              {currentId === p.id && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    background: C.accent,
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${C.blue},${C.violet})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {(name || "?")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.txt,
                }}
              >
                {name}
              </div>

              <div
                style={{
                  fontSize: 9,
                  color: C.muted,
                }}
              >
                {role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "7px",
              borderRadius: 6,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.dim,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            background: C.panel,
            borderBottom: `1px solid ${C.border}`,
            padding: "0 24px",
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              flex: 1,
              color: C.dim,
              fontSize: 12,
            }}
          >
            <span style={{ color: C.muted }}>
              insider-threat-system /
            </span>{" "}
            <span
              style={{
                color: C.txt,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {currentId}
            </span>
          </div>

          <div
            style={{
              color: C.muted,
              fontSize: 11,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              style={{
                color: C.green,
                marginRight: 6,
              }}
            >
              ● LIVE
            </span>

            {liveTime.toLocaleTimeString()}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "22px 26px",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}