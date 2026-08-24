import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import {
    C,
    Pill,
    KPI,
    Panel,
    thStyle,
    tdStyle,
} from "../assets/components/AppLayout";

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

const sevClr = (s) =>
    ({
        Critical: C.accent,
        High: C.amber,
        Medium: C.blue,
        Low: C.green,
        Informational: C.teal,
    }[s] || C.muted);

const catClr = (c) =>
    ({
        Critical: C.accent,
        High: C.amber,
        Medium: C.blue,
        Low: C.green,
    }[c] || C.muted);

function useApi(endpoint) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}${endpoint}`, {
            headers: authHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Status ${res.status}`);
                }

                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message));
    }, [endpoint]);

    return {
        data,
        error,
    };
}

export default function Dashboard() {
    const { user } = useAuth();
    const role = user?.role;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }}
        >
            <div>
                <div
                    style={{
                        color: C.txt,
                        fontWeight: 800,
                        fontSize: 20,
                    }}
                >
                    {role === "Administrator" &&
                        "Administrator Control Panel"}

                    {role === "Security Manager" &&
                        "Security Manager Overview"}

                    {role === "SOC Engineer" &&
                        "SOC Operations Dashboard"}

                    {role === "Security Analyst" &&
                        "Security Analyst Workspace"}
                </div>

                <div
                    style={{
                        color: C.dim,
                        fontSize: 12,
                        marginTop: 3,
                    }}
                >
                    Views tailored to authorization clearance:{" "}
                    <b style={{ color: C.txt }}>{role}</b>
                </div>
            </div>

            {role === "Administrator" && <AdminOverview />}

            {role === "Security Manager" && <ManagerOverview />}

            {role === "SOC Engineer" && <SOCOverview />}

            {role === "Security Analyst" && <AnalystOverview />}
        </div>
    );
}

/* ─────────────────────────────────────────
   SHARED WIDGETS
───────────────────────────────────────── */

function RiskDistributionPie({ distribution }) {
    const pieColors = {
        Low: C.green,
        Medium: C.amber,
        High: C.blue,
        Critical: C.accent,
    };

    const pieData = (distribution || []).map((d) => ({
        name: d.category,
        value: d.count,
        color: pieColors[d.category],
    }));

    return (
        <Panel
            title="Risk Distribution"
            sub="(risk.py)"
        >
            {pieData.length > 0 ? (
                <>
                    <ResponsiveContainer
                        width="100%"
                        height={150}
                    >
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={44}
                                outerRadius={64}
                                dataKey="value"
                                paddingAngle={3}
                            >
                                {pieData.map((d, i) => (
                                    <Cell
                                        key={i}
                                        fill={d.color}
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                contentStyle={{
                                    background: C.panel,
                                    border: `1px solid ${C.border}`,
                                    fontSize: 11,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                            marginTop: 6,
                        }}
                    >
                        {pieData.map((d) => (
                            <div
                                key={d.name}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 2,
                                        background: d.color,
                                    }}
                                />

                                <div
                                    style={{
                                        color: C.dim,
                                        fontSize: 10,
                                        flex: 1,
                                    }}
                                >
                                    {d.name}
                                </div>

                                <div
                                    style={{
                                        color: d.color,
                                        fontSize: 10,
                                        fontWeight: 700,
                                    }}
                                >
                                    {d.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p style={{ color: C.dim }}>
                    Loading...
                </p>
            )}
        </Panel>
    );
}

function TopRiskChart({ employees }) {
    return (
        <Panel
            title="Top Risk Employees — Behavior Breakdown"
            sub="(behavior.py)"
        >
            {employees?.length > 0 ? (
                <ResponsiveContainer
                    width="100%"
                    height={220}
                >
                    <BarChart
                        data={employees}
                        barSize={14}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.border}
                        />

                        <XAxis
                            dataKey="employee"
                            tick={{
                                fill: C.dim,
                                fontSize: 9,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{
                                fill: C.dim,
                                fontSize: 10,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            contentStyle={{
                                background: C.panel,
                                border: `1px solid ${C.border}`,
                                fontSize: 11,
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: 11,
                            }}
                        />

                        <Bar
                            dataKey="usb_count"
                            fill={C.amber}
                            radius={[3, 3, 0, 0]}
                            name="USB Events"
                        />

                        <Bar
                            dataKey="file_access_count"
                            fill={C.accent}
                            radius={[3, 3, 0, 0]}
                            name="File Access"
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p style={{ color: C.dim }}>
                    Loading...
                </p>
            )}
        </Panel>
    );
}

function RiskTrendArea({ employees }) {
    return (
        <Panel
            title="Risk Score — Top Flagged Employees"
            sub="(behavior.py)"
        >
            {employees?.length > 0 ? (
                <ResponsiveContainer
                    width="100%"
                    height={180}
                >
                    <AreaChart data={employees}>
                        <defs>
                            <linearGradient
                                id="gDash"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={C.accent}
                                    stopOpacity={0.3}
                                />

                                <stop
                                    offset="95%"
                                    stopColor={C.accent}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.border}
                        />

                        <XAxis
                            dataKey="employee"
                            tick={{
                                fill: C.dim,
                                fontSize: 9,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[0, 100]}
                            tick={{
                                fill: C.dim,
                                fontSize: 10,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            contentStyle={{
                                background: C.panel,
                                border: `1px solid ${C.border}`,
                                fontSize: 11,
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="risk_score"
                            stroke={C.accent}
                            fill="url(#gDash)"
                            strokeWidth={2}
                            name="Risk Score"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <p style={{ color: C.dim }}>
                    Loading...
                </p>
            )}
        </Panel>
    );
}

function RecentAlertsPanel({ alerts, navigate }) {
    return (
        <Panel
            title="Recent Alerts"
            sub="(alerts.py)"
        >
            {alerts?.length ? (
                alerts.slice(0, 5).map((a) => (
                    <div
                        key={a.id}
                        onClick={() => navigate("/alerts")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "9px 12px",
                            borderRadius: 7,
                            marginBottom: 7,
                            background: C.panel,
                            border: `1px solid ${C.border}`,
                            borderLeft: `3px solid ${sevClr(
                                a.severity
                            )}`,
                            cursor: "pointer",
                        }}
                    >
                        <Pill
                            label={a.severity}
                            color={sevClr(a.severity)}
                        />

                        <div
                            style={{
                                flex: 1,
                                color: C.txt,
                                fontWeight: 600,
                                fontSize: 12,
                            }}
                        >
                            {a.employee}
                        </div>

                        <Pill
                            label={a.status}
                            color={C.dim}
                        />
                    </div>
                ))
            ) : (
                <p style={{ color: C.dim }}>
                    No recent alerts.
                </p>
            )}
        </Panel>
    );
}

function TopRiskTable({ employees, navigate }) {
    return (
        <Panel title="Top High Risk Employees">
            {employees?.length ? (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>
                                Employee
                            </th>

                            <th style={thStyle}>
                                Risk Score
                            </th>

                            <th style={thStyle}>
                                Severity
                            </th>

                            <th style={thStyle}>
                                USB
                            </th>

                            <th style={thStyle}>
                                File Access
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {employees.slice(0, 6).map((e) => (
                            <tr
                                key={e.employee}
                                onClick={() =>
                                    navigate("/risk")
                                }
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                <td style={tdStyle}>
                                    {e.employee}
                                </td>

                                <td
                                    style={{
                                        ...tdStyle,
                                        color: catClr(
                                            e.severity
                                        ),
                                        fontWeight: 700,
                                    }}
                                >
                                    {e.risk_score}
                                </td>

                                <td style={tdStyle}>
                                    <Pill
                                        label={e.severity}
                                        color={catClr(
                                            e.severity
                                        )}
                                    />
                                </td>

                                <td style={tdStyle}>
                                    {e.usb_count}
                                </td>

                                <td style={tdStyle}>
                                    {e.file_access_count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ color: C.dim }}>
                    No high-risk employees currently.
                </p>
            )}
        </Panel>
    );
}

/* ─────────────────────────────────────────
   ROLE VIEWS
───────────────────────────────────────── */

function AdminOverview() {
    const {
        data: stats,
        error,
    } = useApi("/dashboard/admin-summary");

    const {
        data: distribution,
    } = useApi("/risk/");

    const {
        data: topRisk,
    } = useApi("/behavior/anomalies");

    const navigate = useNavigate();

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load dashboard data: {error}
            </p>
        );
    }

    if (!stats) {
        return (
            <p style={{ color: C.dim }}>
                Loading dashboard...
            </p>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,1fr)",
                    gap: 12,
                }}
            >
                <KPI
                    label="Total Users"
                    value={
                        stats.user_management
                            .total_users
                    }
                    color={C.blue}
                />

                <KPI
                    label="Active Users"
                    value={
                        stats.user_management
                            .active_users
                    }
                    color={C.green}
                />

                <KPI
                    label="Employee Profiles"
                    value={
                        stats.platform_analytics
                            .total_employee_profiles
                    }
                    color={C.teal}
                />

                <KPI
                    label="System Status"
                    value={
                        stats.system_monitoring
                            .api_status
                    }
                    color={C.green}
                    sub="API health"
                />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1.6fr 1fr",
                    gap: 12,
                    marginTop: 18,
                }}
            >
                <TopRiskTable
                    employees={topRisk}
                    navigate={navigate}
                />

                <RiskDistributionPie
                    distribution={distribution}
                />
            </div>

            <div style={{ marginTop: 18 }}>
                <TopRiskChart
                    employees={topRisk?.slice(0, 8)}
                />
            </div>

            <div style={{ marginTop: 18 }}>
                <RecentAlertsPanel
                    alerts={stats.recent_alerts}
                    navigate={navigate}
                />
            </div>
        </>
    );
}

function ManagerOverview() {
    const {
        data: stats,
        error,
    } = useApi("/dashboard/manager-summary");

    const {
        data: distribution,
    } = useApi("/risk/");

    const {
        data: topRisk,
    } = useApi("/behavior/anomalies");

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load manager data: {error}
            </p>
        );
    }

    if (!stats) {
        return (
            <p style={{ color: C.dim }}>
                Loading manager data...
            </p>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,1fr)",
                    gap: 12,
                }}
            >
                <KPI
                    label="Organizational Avg Risk"
                    value={
                        stats.organizational_avg_risk_score
                    }
                    color={C.amber}
                />

                <KPI
                    label="Open Incidents"
                    value={
                        stats.compliance_metrics
                            .open_incidents
                    }
                    color={C.blue}
                />

                <KPI
                    label="Resolution Rate"
                    value={`${stats.compliance_metrics.resolution_rate_percent}%`}
                    color={C.green}
                />

                <KPI
                    label="Total Employees"
                    value={stats.total_employees}
                    color={C.teal}
                />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1.6fr 1fr",
                    gap: 12,
                    marginTop: 18,
                }}
            >
                <Panel title="Department Risk Breakdown">
                    {stats.department_risk_breakdown
                        ?.length ? (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse:
                                    "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={thStyle}>
                                        Department
                                    </th>

                                    <th style={thStyle}>
                                        Avg Risk
                                    </th>

                                    <th style={thStyle}>
                                        Employees
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {stats.department_risk_breakdown.map(
                                    (d) => (
                                        <tr
                                            key={
                                                d.department
                                            }
                                        >
                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                {
                                                    d.department
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    color: C.amber,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {
                                                    d.avg_risk_score
                                                }
                                            </td>

                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                {
                                                    d.employee_count
                                                }
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <p
                            style={{
                                color: C.dim,
                            }}
                        >
                            No department data
                            available.
                        </p>
                    )}
                </Panel>

                <RiskDistributionPie
                    distribution={distribution}
                />
            </div>

            <div style={{ marginTop: 18 }}>
                <TopRiskChart
                    employees={topRisk?.slice(0, 8)}
                />
            </div>
        </>
    );
}

function SOCOverview() {
    const {
        data: stats,
        error,
    } = useApi("/dashboard/soc-summary");

    const {
        data: topRisk,
    } = useApi("/behavior/anomalies");

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load SOC data: {error}
            </p>
        );
    }

    if (!stats) {
        return (
            <p style={{ color: C.dim }}>
                Loading SOC data...
            </p>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,1fr)",
                    gap: 12,
                }}
            >
                <KPI
                    label="Total Security Events"
                    value={
                        stats.total_security_events
                    }
                    color={C.blue}
                />

                <KPI
                    label="Behavioral Anomalies"
                    value={
                        stats.behavioral_anomalies_flagged
                    }
                    color={C.accent}
                    blink
                />

                <KPI
                    label="Active Investigations"
                    value={
                        stats.active_investigations
                            .count
                    }
                    color={C.amber}
                />

                <KPI
                    label="Threat Intel Feed"
                    value="Updated"
                    color={C.green}
                />
            </div>

            <div style={{ marginTop: 18 }}>
                <RiskTrendArea
                    employees={topRisk?.slice(0, 7)}
                />
            </div>

            <div style={{ marginTop: 18 }}>
                <Panel title="Active Investigations">
                    {stats.active_investigations
                        .items?.length ? (
                        stats.active_investigations.items.map(
                            (i) => (
                                <div
                                    key={i.id}
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 12,
                                        padding:
                                            "9px 12px",
                                        borderRadius: 7,
                                        marginBottom: 7,
                                        background:
                                            C.panel,
                                        border: `1px solid ${C.border}`,
                                    }}
                                >
                                    <Pill
                                        label={
                                            i.risk_category
                                        }
                                        color={catClr(
                                            i.risk_category
                                        )}
                                    />

                                    <div
                                        style={{
                                            flex: 1,
                                            color: C.txt,
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    >
                                        {
                                            i.employee_id
                                        }
                                    </div>

                                    <div
                                        style={{
                                            color: C.dim,
                                            fontSize: 11,
                                        }}
                                    >
                                        {i.status}
                                    </div>
                                </div>
                            )
                        )
                    ) : (
                        <p
                            style={{
                                color: C.dim,
                            }}
                        >
                            No active investigations.
                        </p>
                    )}
                </Panel>
            </div>
        </>
    );
}

function AnalystOverview() {
    const {
        data: stats,
        error,
    } = useApi("/dashboard/analyst-summary");

    const {
        data: topRisk,
    } = useApi("/behavior/anomalies");

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load analyst data: {error}
            </p>
        );
    }

    if (!stats) {
        return (
            <p style={{ color: C.dim }}>
                Loading analyst data...
            </p>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,1fr)",
                    gap: 12,
                }}
            >
                <KPI
                    label="Open Incidents"
                    value={
                        stats.investigation_queue
                            .open_incidents
                    }
                    color={C.blue}
                />

                <KPI
                    label="Total Alerts"
                    value={stats.total_alerts}
                    color={C.amber}
                    blink
                />

                <KPI
                    label="High Risk Employees"
                    value={
                        stats.risk_distribution
                            .High +
                        stats.risk_distribution
                            .Critical
                    }
                    color={C.accent}
                />

                <KPI
                    label="Total Employees Monitored"
                    value={
                        stats.total_employees_monitored
                    }
                    color={C.teal}
                />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1.6fr 1fr",
                    gap: 12,
                    marginTop: 18,
                }}
            >
                <TopRiskChart
                    employees={topRisk?.slice(0, 8)}
                />

                <RiskDistributionPie
                    distribution={[
                        {
                            category: "Low",
                            count:
                                stats.risk_distribution
                                    .Low,
                        },
                        {
                            category: "Medium",
                            count:
                                stats.risk_distribution
                                    .Medium,
                        },
                        {
                            category: "High",
                            count:
                                stats.risk_distribution
                                    .High,
                        },
                        {
                            category: "Critical",
                            count:
                                stats.risk_distribution
                                    .Critical,
                        },
                    ]}
                />
            </div>

            {stats.top_risk_employees?.length > 0 && (
                <div style={{ marginTop: 18 }}>
                    <Panel title="Top Risk Employees">
                        {stats.top_risk_employees.map(
                            (e) => (
                                <div
                                    key={e.employee_id}
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 12,
                                        padding:
                                            "9px 12px",
                                        borderRadius: 7,
                                        marginBottom: 7,
                                        background:
                                            C.panel,
                                        border: `1px solid ${C.border}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            color: C.txt,
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    >
                                        {
                                            e.employee_id
                                        }
                                    </div>

                                    <div
                                        style={{
                                            color: C.dim,
                                            fontSize: 11,
                                        }}
                                    >
                                        {e.department}
                                    </div>

                                    <div
                                        style={{
                                            color: C.accent,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {e.risk_score}
                                    </div>
                                </div>
                            )
                        )}
                    </Panel>
                </div>
            )}
        </>
    );
}