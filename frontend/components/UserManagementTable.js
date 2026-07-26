const roleLabels = {
  security_analyst: "Security Analyst",
  soc_engineer: "SOC Engineer",
  security_manager: "Security Manager",
  administrator: "Administrator",
};

export default function UserManagementTable({ users }) {
  if (!users || users.length === 0) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No users found.</p>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: "var(--color-surface-muted)" }}>
              <th className="text-left font-medium px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Name</th>
              <th className="text-left font-medium px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Email</th>
              <th className="text-left font-medium px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Role</th>
              <th className="text-left font-medium px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{u.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-soft)", color: "var(--color-primary-dark)" }}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}