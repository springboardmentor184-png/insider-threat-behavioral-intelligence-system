import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiFetch, getRole } from "../utils/api";

export default function EmployeesPage() {
  const router = useRouter();
  const [directory, setDirectory] = useState({ employees: [], departments: [] });
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getRole() !== "administrator") { router.replace("/dashboard"); return; }
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (department) params.set("department", department);
    setLoading(true);
    apiFetch(`/analytics/admin/employees${params.toString() ? `?${params}` : ""}`)
      .then(setDirectory)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, search, department]);

  return <Layout title="Employees" subtitle="Synthetic/demo profile context for CERT activity users">
    <div className="card p-4 mb-4"><p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Department, designation, manager, device, and access fields are synthetic demo data. CERT does not provide HR profile data.</p></div>
    <div className="flex flex-wrap gap-3 mb-4"><input aria-label="Search employees" className="input-field flex-1 min-w-56" placeholder="Search employee, department, designation, or manager" value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="Filter by department" className="input-field w-auto" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">All departments</option>{directory.departments.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    {error ? <p className="text-sm" style={{ color: "var(--sev-high)" }}>{error}</p> : loading ? <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading employees…</p> : <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>{["Employee ID", "Department", "Designation", "Manager", "Device information", "Access privileges"].map((label) => <th key={label} className="p-3 font-medium whitespace-nowrap">{label}</th>)}</tr></thead><tbody>{directory.employees.map((employee) => <tr key={employee.employee_id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}><td className="p-3 font-medium whitespace-nowrap">{employee.employee_id}</td><td className="p-3">{employee.department}</td><td className="p-3">{employee.designation}</td><td className="p-3 whitespace-nowrap">{employee.manager}</td><td className="p-3 whitespace-nowrap">{employee.device_information}</td><td className="p-3 min-w-64">{employee.access_privileges}</td></tr>)}</tbody></table>{!directory.employees.length && <p className="p-5 text-sm" style={{ color: "var(--color-text-muted)" }}>No employees match the current filters.</p>}</div>}
  </Layout>;
}
