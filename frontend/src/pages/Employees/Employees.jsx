import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, RefreshCcw, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { getEmployees, getEmployeeById } from '../../services/employeeService';

const PAGE_SIZE = 10;

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadEmployees = React.useCallback(async (nextPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployees({
        page: nextPage,
        limit: PAGE_SIZE,
        search,
        department,
        role: '',
        status,
      });

      const fetchedEmployees = response?.data || [];
      const enrichedEmployees = await Promise.all(
        fetchedEmployees.map(async (employee) => {
          try {
            const detail = await getEmployeeById(employee.id);
            return { ...employee, risk_score: detail?.risk_score ?? null };
          } catch {
            return employee;
          }
        })
      );

      setEmployees(enrichedEmployees);
      setTotal(response?.total || 0);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status]);

  useEffect(() => {
    loadEmployees(1);
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch = !term || [employee.first_name, employee.last_name, employee.email, employee.employee_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

      const matchesDepartment = !department || (employee.department?.department_name || '').toLowerCase().includes(department.toLowerCase());
      const resolvedRisk = employee.risk_score >= 80 ? 'Critical' : employee.risk_score >= 60 ? 'High' : employee.risk_score >= 40 ? 'Medium' : 'Low';
      const matchesRisk = !riskLevel || resolvedRisk === riskLevel;
      const matchesStatus = !status || (employee.status || 'Active') === status;

      return matchesSearch && matchesDepartment && matchesRisk && matchesStatus;
    });
  }, [employees, search, department, riskLevel, status]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFilters = () => {
    loadEmployees(1);
  };

  const resetFilters = () => {
    setSearch('');
    setDepartment('');
    setRiskLevel('');
    setStatus('');
    setTimeout(() => loadEmployees(1), 0);
  };

  const getRiskBadge = (riskLevelValue) => {
    if (riskLevelValue === 'Critical') return 'bg-danger/10 text-danger border-danger/20';
    if (riskLevelValue === 'High') return 'bg-warning/10 text-warning border-warning/20';
    if (riskLevelValue === 'Medium') return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-success/10 text-success border-success/20';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-4 w-72 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <Card className="p-6">
          <div className="h-10 w-full rounded bg-slate-100 animate-pulse" />
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 rounded bg-slate-50 animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-border-color bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Users size={20} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load employees</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={() => loadEmployees(1)}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-main">Employees</h1>
          <p className="text-sm text-subtext mt-1">Monitor workforce activity, roles, and risk posture.</p>
        </div>
        <div className="text-sm text-subtext">Showing {filteredEmployees.length} of {total} employees</div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-text-main">Search</label>
            <div className="flex items-center rounded-[12px] border border-border-color bg-slate-50 px-3 py-2">
              <Search size={16} className="text-subtext" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, employee ID, or email"
                className="ml-2 w-full border-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Department</label>
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Risk Level</label>
              <select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={applyFilters}>
            <span className="flex items-center gap-2">
              <Filter size={16} /> Apply
            </span>
          </Button>
          <button onClick={resetFilters} className="rounded-[12px] border border-border-color bg-white px-4 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
            Reset
          </button>
        </div>
      </Card>

      {!filteredEmployees.length ? (
        <EmptyState />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Risk Score', 'Risk Level', 'Status', 'Actions'].map((column) => (
                    <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-subtext">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-white">
                {filteredEmployees.map((employee) => {
                  const riskLevelValue = employee.risk_score >= 80 ? 'Critical' : employee.risk_score >= 60 ? 'High' : employee.risk_score >= 40 ? 'Medium' : 'Low';
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-medium text-text-main">{employee.employee_id}</td>
                      <td className="px-4 py-4 text-sm font-medium text-text-main">{employee.first_name} {employee.last_name}</td>
                      <td className="px-4 py-4 text-sm text-subtext">{employee.email}</td>
                      <td className="px-4 py-4 text-sm text-subtext">{employee.department?.department_name || '—'}</td>
                      <td className="px-4 py-4 text-sm text-subtext">{employee.role?.role_name || '—'}</td>
                      <td className="px-4 py-4 text-sm text-text-main">{employee.risk_score ?? '—'}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskBadge(riskLevelValue)}`}>
                          {riskLevelValue}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-subtext">{employee.status || 'Active'}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => navigate(`/employees/${employee.id}`)} className="inline-flex items-center gap-2 rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-color bg-slate-50 px-4 py-3">
            <div className="text-sm text-subtext">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadEmployees(page - 1)} disabled={page === 1} className="rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main disabled:cursor-not-allowed disabled:opacity-50">
                Previous
              </button>
              <button onClick={() => loadEmployees(page + 1)} disabled={page >= totalPages} className="rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main disabled:cursor-not-allowed disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Employees;
