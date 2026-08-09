import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import "../styles/Dashboard.css";

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

function Reports() {
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
        ]).then(([reportRes, anomalyRes]) => {
            if (reportRes.status === "fulfilled") {
                setReport(reportRes.value);
            } else {
                setError(
                    reportRes.reason?.message ||
                        "Failed to load report summary"
                );
            }

            if (anomalyRes.status === "fulfilled") {
                setAnomalyReport(anomalyRes.value);
            }

            setLoading(false);
        });
    }, []);

    async function downloadRiskExcel() {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/reports/export/risk-assessment/excel`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "risk_assessment.xlsx";

        a.click();

        window.URL.revokeObjectURL(url);
    }

    async function downloadInvestigationExcel() {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/reports/export/investigations/excel`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "investigation_report.xlsx";

        a.click();

        window.URL.revokeObjectURL(url);
    }

    async function downloadSummaryPDF() {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/reports/export/summary/pdf`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "insider_threat_summary_report.pdf";

        a.click();

        window.URL.revokeObjectURL(url);
    }

    if (loading) {
        return <h2>Loading Reports...</h2>;
    }

    if (error) {
        return (
            <h2 style={{ color: "red" }}>
                Failed to load reports: {error}
            </h2>
        );
    }

    return (
        <div className="dashboard-container">
            <h1>Security Reports</h1>

            <div className="overview-cards">
                <div className="card">
                    <span>Total Users</span>
                    <h2>{report.total_users}</h2>
                </div>

                <div className="card">
                    <span>Active Users</span>
                    <h2 className="green">
                        {report.active_users}
                    </h2>
                </div>

                <div className="card">
                    <span>High Risk Users</span>
                    <h2 className="red">
                        {report.high_risk_users}
                    </h2>
                </div>

                {anomalyReport && (
                    <div className="card">
                        <span>Total Flagged (Behavioral)</span>
                        <h2 className="red">
                            {anomalyReport.total_flagged}
                        </h2>
                    </div>
                )}
            </div>

            <br />

            {/* Behavioral analytics report */}
            {anomalyReport && (
                <div className="card">
                    <h3>Behavioral Anomaly Summary</h3>

                    <table
                        className="log-table"
                        style={{ marginTop: "12px" }}
                    >
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Count</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Object.entries(
                                anomalyReport.severity_breakdown
                            ).map(([category, count]) => (
                                <tr key={category}>
                                    <td>{category}</td>
                                    <td>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h4 style={{ marginTop: "20px" }}>
                        Top 5 Highest Risk Employees
                    </h4>

                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Risk Score</th>
                                <th>Severity</th>
                            </tr>
                        </thead>

                        <tbody>
                            {anomalyReport.top_5_highest_risk?.map(
                                (employee) => (
                                    <tr key={employee.employee}>
                                        <td>{employee.employee}</td>
                                        <td>{employee.risk_score}</td>
                                        <td>{employee.severity}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <br />

            <div className="card">
                <h3>Generated By</h3>
                <p>{report.generated_by}</p>
            </div>

            <br />

            {ANALYST_ROLES.includes(role) && (
                <>
                    <h3>Export Reports</h3>

                    <div
                        style={{
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                            marginTop: "20px",
                        }}
                    >
                        <button onClick={downloadRiskExcel}>
                            Download Risk Assessment Excel
                        </button>

                        <button
                            onClick={
                                downloadInvestigationExcel
                            }
                        >
                            Download Investigation Excel
                        </button>

                        <button onClick={downloadSummaryPDF}>
                            Download Summary PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Reports;