import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import EmployeeBehaviorDetail from "../assets/components/EmployeeBehaviorDetail";
import { C, Panel, Btn, thStyle, tdStyle } from "../assets/components/AppLayout";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

const ANALYST_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst",
];

export default function Reports() {
    const { user } = useAuth();
    const role = user?.role;

    const [report, setReport] = useState(null);
    const [anomalyReport, setAnomalyReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.allSettled([
            fetch(`${API_URL}/reports/`, {
                headers: authHeaders(),
            }).then((r) => {
                if (!r.ok) {
                    throw new Error(`Status ${r.status}`);
                }

                return r.json();
            }),

            fetch(`${API_URL}/behavior/anomaly_report`, {
                headers: authHeaders(),
            }).then((r) => {
                if (!r.ok) {
                    throw new Error(`Status ${r.status}`);
                }

                return r.json();
            }),
        ]).then(([r1, r2]) => {
            if (r1.status === "fulfilled") {
                setReport(r1.value);
            } else {
                setError(
                    r1.reason?.message || "Failed to load report"
                );
            }

            if (r2.status === "fulfilled") {
                setAnomalyReport(r2.value);
            }

            setLoading(false);
        });
    }, []);

    async function download(path, filename) {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}${path}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();

        window.URL.revokeObjectURL(url);
    }

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Reports...
            </p>
        );
    }

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load reports: {error}
            </p>
        );
    }

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
                Security Reports
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                }}
            >
                {[
                    [
                        "Total Users",
                        report.total_users,
                        C.blue,
                    ],
                    [
                        "Active Users",
                        report.active_users,
                        C.green,
                    ],
                    [
                        "High Risk Users",
                        report.high_risk_users,
                        C.accent,
                    ],
                    [
                        "Total Flagged",
                        anomalyReport?.total_flagged ?? "—",
                        C.amber,
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
                                textTransform: "uppercase",
                                marginBottom: 5,
                            }}
                        >
                            {label}
                        </div>

                        <div
                            style={{
                                color,
                                fontSize: 24,
                                fontWeight: 800,
                            }}
                        >
                            {val}
                        </div>
                    </div>
                ))}
            </div>

            {anomalyReport && (
                <Panel title="Behavioral Anomaly Summary">
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginBottom: 16,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>
                                    Category
                                </th>

                                <th style={thStyle}>
                                    Count
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {Object.entries(
                                anomalyReport.severity_breakdown
                            ).map(([cat, count]) => (
                                <tr key={cat}>
                                    <td style={tdStyle}>
                                        {cat}
                                    </td>

                                    <td style={tdStyle}>
                                        {count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div
                        style={{
                            color: C.txt,
                            fontWeight: 700,
                            fontSize: 13,
                            marginBottom: 8,
                        }}
                    >
                        Top 5 Highest Risk Employees
                    </div>

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
                                    Severity
                                </th>

                                <th style={thStyle}>
                                    Activity
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {anomalyReport.top_5_highest_risk?.map(
                                (e) => (
                                    <tr key={e.employee}>
                                        <td style={tdStyle}>
                                            {e.employee}
                                        </td>

                                        <td style={tdStyle}>
                                            {e.risk_score}
                                        </td>

                                        <td style={tdStyle}>
                                            {e.severity}
                                        </td>

                                        <td style={tdStyle}>
                                            <EmployeeBehaviorDetail
                                                employeeId={e.employee}
                                            />
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </Panel>
            )}

            <Panel title="Generated By">
                <p style={{ color: C.dim }}>
                    {report.generated_by}
                </p>
            </Panel>

            {ANALYST_ROLES.includes(role) && (
                <Panel title="Export Reports">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <Btn
                            variant="primary"
                            onClick={() =>
                                download(
                                    "/reports/export/risk-assessment/excel",
                                    "risk_assessment.xlsx"
                                )
                            }
                        >
                            Download Risk Assessment Excel
                        </Btn>

                        <Btn
                            variant="primary"
                            onClick={() =>
                                download(
                                    "/reports/export/investigations/excel",
                                    "investigation_report.xlsx"
                                )
                            }
                        >
                            Download Investigation Excel
                        </Btn>

                        <Btn
                            variant="primary"
                            onClick={() =>
                                download(
                                    "/reports/export/summary/pdf",
                                    "insider_threat_summary_report.pdf"
                                )
                            }
                        >
                            Download Summary PDF
                        </Btn>
                    </div>
                </Panel>
            )}
        </div>
    );
}