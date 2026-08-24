import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import EmployeeBehaviorDetail from "../assets/components/EmployeeBehaviorDetail";
import {
    C,
    Pill,
    Panel,
    Btn,
    Input,
    thStyle,
    tdStyle,
} from "../assets/components/AppLayout";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

const catColor = (c) =>
    ({
        Critical: C.accent,
        High: C.amber,
        Medium: C.blue,
        Low: C.green,
    }[c] || C.muted);

export default function UEBA() {
    const [summary, setSummary] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [highRiskUsers, setHighRiskUsers] = useState([]);
    const [recentAnomalies, setRecentAnomalies] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [peerComparison, setPeerComparison] = useState(null);
    const [trend, setTrend] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        const results = await Promise.allSettled([
            fetch(`${API_URL}/ueba/summary`, {
                headers: authHeaders(),
            }).then((r) => r.json()),

            fetch(`${API_URL}/ueba/risk-distribution`, {
                headers: authHeaders(),
            }).then((r) => r.json()),

            fetch(`${API_URL}/ueba/high-risk-users`, {
                headers: authHeaders(),
            }).then((r) => r.json()),

            fetch(`${API_URL}/ueba/recent-anomalies`, {
                headers: authHeaders(),
            }).then((r) => r.json()),
        ]);

        const [s, d, h, a] = results;

        if (s.status === "fulfilled") {
            setSummary(s.value);
        }

        if (d.status === "fulfilled") {
            setDistribution(d.value);
        }

        if (h.status === "fulfilled") {
            setHighRiskUsers(h.value);
        }

        if (a.status === "fulfilled") {
            setRecentAnomalies(a.value);
        }

        if (
            results.some(
                (r) => r.status === "rejected"
            )
        ) {
            setLoadError(
                "Some UEBA data failed to load."
            );
        }

        setLoading(false);
    }

    async function searchEmployee() {
        if (!employeeId) {
            return;
        }

        setSearching(true);
        setSearchError(null);
        setPeerComparison(null);
        setTrend(null);

        try {
            const [peerRes, trendRes] =
                await Promise.allSettled([
                    fetch(
                        `${API_URL}/ueba/peer-comparison/${employeeId}`,
                        {
                            headers: authHeaders(),
                        }
                    ),

                    fetch(
                        `${API_URL}/ueba/trend/${employeeId}`,
                        {
                            headers: authHeaders(),
                        }
                    ),
                ]);

            if (
                peerRes.status === "fulfilled" &&
                peerRes.value.ok
            ) {
                setPeerComparison(
                    await peerRes.value.json()
                );
            }

            if (
                trendRes.status === "fulfilled" &&
                trendRes.value.ok
            ) {
                setTrend(
                    await trendRes.value.json()
                );
            }

            if (
                peerRes.status === "fulfilled" &&
                !peerRes.value.ok &&
                trendRes.status === "fulfilled" &&
                !trendRes.value.ok
            ) {
                setSearchError(
                    "Employee not found or no data available."
                );
            }
        } catch (err) {
            setSearchError(
                "Failed to load employee data."
            );
        } finally {
            setSearching(false);
        }
    }

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading UEBA Dashboard...
            </p>
        );
    }

    const predictiveFlags = highRiskUsers.filter(
        (u) => u.risk_score >= 70
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }}
        >
            <div
                style={{
                    color: C.txt,
                    fontWeight: 800,
                    fontSize: 18,
                }}
            >
                UEBA Analytics
            </div>

            {loadError && (
                <p style={{ color: C.amber }}>
                    {loadError}
                </p>
            )}

            {summary && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(5, 1fr)",
                        gap: 12,
                    }}
                >
                    {[
                        [
                            "Total Employees",
                            summary.total_employees,
                            C.blue,
                        ],
                        [
                            "Average Risk Score",
                            summary.average_risk_score,
                            C.teal,
                        ],
                        [
                            "High Risk Users",
                            summary.high_risk_users,
                            C.amber,
                        ],
                        [
                            "Critical Users",
                            summary.critical_users,
                            C.accent,
                        ],
                        [
                            "Total Activity Logs",
                            summary.total_activity_logs,
                            C.violet,
                        ],
                    ].map(([label, val, color]) => (
                        <div
                            key={label}
                            style={{
                                background: C.card,
                                border: `1px solid ${C.border}`,
                                borderRadius: 10,
                                padding: "14px 16px",
                            }}
                        >
                            <div
                                style={{
                                    color: C.dim,
                                    fontSize: 10,
                                    textTransform:
                                        "uppercase",
                                    marginBottom: 5,
                                }}
                            >
                                {label}
                            </div>

                            <div
                                style={{
                                    color,
                                    fontSize: 22,
                                    fontWeight: 800,
                                }}
                            >
                                {val}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {distribution && (
                <Panel title="Risk Distribution">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, 1fr)",
                            gap: 10,
                        }}
                    >
                        {[
                            ["Low", C.green],
                            ["Medium", C.amber],
                            ["High", C.blue],
                            ["Critical", C.accent],
                        ].map(([k, color]) => (
                            <div
                                key={k}
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                <div
                                    style={{
                                        color,
                                        fontSize: 22,
                                        fontWeight: 800,
                                    }}
                                >
                                    {distribution[k]}
                                </div>

                                <div
                                    style={{
                                        color: C.dim,
                                        fontSize: 10,
                                        textTransform:
                                            "uppercase",
                                    }}
                                >
                                    {k}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            <Panel
                title="Early Warning — Trending High Risk"
                sub="Risk score 70+; search below to confirm trend direction"
            >
                {predictiveFlags.length === 0 ? (
                    <p style={{ color: C.dim }}>
                        No employees currently meet the
                        early-warning threshold.
                    </p>
                ) : (
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
                                    Department
                                </th>
                                <th style={thStyle}>
                                    Risk
                                </th>
                                <th style={thStyle}>
                                    Activity
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {predictiveFlags.map((u) => (
                                <tr key={u.employee_id}>
                                    <td style={tdStyle}>
                                        {u.employee_id}
                                    </td>

                                    <td style={tdStyle}>
                                        {u.department}
                                    </td>

                                    <td style={tdStyle}>
                                        <Pill
                                            label={u.risk_score}
                                            color={
                                                u.risk_score >=
                                                90
                                                    ? C.accent
                                                    : C.amber
                                            }
                                        />
                                    </td>

                                    <td style={tdStyle}>
                                        <EmployeeBehaviorDetail
                                            employeeId={
                                                u.employee_id
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Panel>

            <Panel title="Search Employee">
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                    }}
                >
                    <Input
                        placeholder="Employee ID"
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            searchEmployee()
                        }
                    />

                    <Btn
                        variant="primary"
                        onClick={searchEmployee}
                    >
                        {searching
                            ? "Searching..."
                            : "Search"}
                    </Btn>
                </div>

                {searchError && (
                    <p
                        style={{
                            color: C.accent,
                            marginTop: 8,
                        }}
                    >
                        {searchError}
                    </p>
                )}

                {employeeId &&
                    (peerComparison || trend) && (
                        <div style={{ marginTop: 14 }}>
                            <EmployeeBehaviorDetail
                                employeeId={employeeId}
                            />
                        </div>
                    )}
            </Panel>

            {peerComparison && (
                <Panel title="Peer Comparison">
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <tbody>
                            <tr>
                                <td style={tdStyle}>
                                    <b>Employee ID</b>
                                </td>

                                <td style={tdStyle}>
                                    {
                                        peerComparison.employee_id
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>Department</b>
                                </td>

                                <td style={tdStyle}>
                                    {
                                        peerComparison.department
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>
                                        Employee Risk
                                        Score
                                    </b>
                                </td>

                                <td style={tdStyle}>
                                    {
                                        peerComparison.employee_risk_score
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>
                                        Department
                                        Average
                                    </b>
                                </td>

                                <td style={tdStyle}>
                                    {
                                        peerComparison.department_avg_risk_score
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>Peer Count</b>
                                </td>

                                <td style={tdStyle}>
                                    {
                                        peerComparison.peer_count
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>
                                        Above Peer
                                        Average
                                    </b>
                                </td>

                                <td style={tdStyle}>
                                    {peerComparison.above_peer_average
                                        ? "Yes"
                                        : "No"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Panel>
            )}

            {trend && (
                <Panel title="Risk Trend">
                    <div
                        style={{
                            marginBottom: 12,
                        }}
                    >
                        <Pill
                            label={
                                trend.trend_direction
                            }
                            color={
                                trend.trend_direction ===
                                "Increasing"
                                    ? C.accent
                                    : trend.trend_direction ===
                                      "Decreasing"
                                    ? C.green
                                    : C.amber
                            }
                        />
                    </div>

                    {trend.history?.length > 0 ? (
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
                                        Date
                                    </th>

                                    <th style={thStyle}>
                                        Risk Score
                                    </th>

                                    <th style={thStyle}>
                                        Category
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {trend.history.map(
                                    (h, i) => (
                                        <tr key={i}>
                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                {new Date(
                                                    h.recorded_at
                                                ).toLocaleString()}
                                            </td>

                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                {
                                                    h.risk_score
                                                }
                                            </td>

                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                <Pill
                                                    label={
                                                        h.risk_category
                                                    }
                                                    color={catColor(
                                                        h.risk_category
                                                    )}
                                                />
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
                            No historical trend data
                            available.
                        </p>
                    )}
                </Panel>
            )}

            <Panel title="High Risk Users">
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
                                Department
                            </th>

                            <th style={thStyle}>
                                Designation
                            </th>

                            <th style={thStyle}>
                                Risk
                            </th>

                            <th style={thStyle}>
                                Activity
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {highRiskUsers.map((u) => (
                            <tr key={u.employee_id}>
                                <td style={tdStyle}>
                                    {u.employee_id}
                                </td>

                                <td style={tdStyle}>
                                    {u.department}
                                </td>

                                <td style={tdStyle}>
                                    {u.designation}
                                </td>

                                <td style={tdStyle}>
                                    {u.risk_score}
                                </td>

                                <td style={tdStyle}>
                                    <EmployeeBehaviorDetail
                                        employeeId={
                                            u.employee_id
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>

            <Panel title="Recent Anomalies">
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
                                Risk
                            </th>

                            <th style={thStyle}>
                                Category
                            </th>

                            <th style={thStyle}>
                                Recorded
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {recentAnomalies.map((a, i) => (
                            <tr key={i}>
                                <td style={tdStyle}>
                                    {a.employee_id}
                                </td>

                                <td style={tdStyle}>
                                    {a.risk_score}
                                </td>

                                <td style={tdStyle}>
                                    <Pill
                                        label={
                                            a.risk_category
                                        }
                                        color={catColor(
                                            a.risk_category
                                        )}
                                    />
                                </td>

                                <td style={tdStyle}>
                                    {new Date(
                                        a.recorded_at
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}