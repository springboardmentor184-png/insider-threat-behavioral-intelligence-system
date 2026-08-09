import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import "../styles/Dashboard.css";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function badgeClass(category) {
    if (category === "Critical" || category === "High") {
        return "danger";
    }

    if (category === "Medium") {
        return "warning";
    }

    return "success";
}

function UEBA() {
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

        const [
            summaryRes,
            distRes,
            highRiskRes,
            anomalyRes,
        ] = results;

        if (summaryRes.status === "fulfilled") {
            setSummary(summaryRes.value);
        }

        if (distRes.status === "fulfilled") {
            setDistribution(distRes.value);
        }

        if (highRiskRes.status === "fulfilled") {
            setHighRiskUsers(highRiskRes.value);
        }

        if (anomalyRes.status === "fulfilled") {
            setRecentAnomalies(anomalyRes.value);
        }

        if (results.some((r) => r.status === "rejected")) {
            setLoadError(
                "Some UEBA data failed to load. Showing partial results."
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
            const [peerRes, trendRes] = await Promise.allSettled([
                fetch(
                    `${API_URL}/ueba/peer-comparison/${employeeId}`,
                    {
                        headers: authHeaders(),
                    }
                ),

                fetch(`${API_URL}/ueba/trend/${employeeId}`, {
                    headers: authHeaders(),
                }),
            ]);

            if (
                peerRes.status === "fulfilled" &&
                peerRes.value.ok
            ) {
                setPeerComparison(await peerRes.value.json());
            }

            if (
                trendRes.status === "fulfilled" &&
                trendRes.value.ok
            ) {
                setTrend(await trendRes.value.json());
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
            console.error(err);
            setSearchError("Failed to load employee data.");
        } finally {
            setSearching(false);
        }
    }

    if (loading) {
        return <h2>Loading UEBA Dashboard...</h2>;
    }

    // Early-warning heuristic:
    // employees with a risk score of 70 or higher.
    const predictiveFlags = highRiskUsers.filter(
        (u) => u.risk_score >= 70
    );

    return (
        <div className="dashboard-container">
            <h1>UEBA Analytics</h1>

            {loadError && (
                <p style={{ color: "orange" }}>
                    {loadError}
                </p>
            )}

            {/* Summary Cards */}
            {summary && (
                <div className="overview-cards">
                    <div className="card">
                        <span>Total Employees</span>
                        <h2>{summary.total_employees}</h2>
                    </div>

                    <div className="card">
                        <span>Average Risk Score</span>
                        <h2>{summary.average_risk_score}</h2>
                    </div>

                    <div className="card">
                        <span>High Risk Users</span>
                        <h2 className="red">
                            {summary.high_risk_users}
                        </h2>
                    </div>

                    <div className="card">
                        <span>Critical Users</span>
                        <h2 className="red">
                            {summary.critical_users}
                        </h2>
                    </div>

                    <div className="card">
                        <span>Total Activity Logs</span>
                        <h2>{summary.total_activity_logs}</h2>
                    </div>
                </div>
            )}

            <br />

            {/* Risk Distribution */}
            {distribution && (
                <>
                    <h2>Risk Distribution</h2>

                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Low</th>
                                <th>Medium</th>
                                <th>High</th>
                                <th>Critical</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>{distribution.Low}</td>
                                <td>{distribution.Medium}</td>
                                <td>{distribution.High}</td>
                                <td>{distribution.Critical}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}

            <br />

            {/* Early Warning */}
            <div className="card">
                <h2>Early Warning — Trending High Risk</h2>

                <p
                    style={{
                        fontSize: "0.9rem",
                        color: "#666",
                    }}
                >
                    Employees with a risk score of 70+ who may
                    warrant proactive review. Search an employee
                    below to confirm their trend direction.
                </p>

                {predictiveFlags.length === 0 ? (
                    <p>
                        No employees currently meet the
                        early-warning threshold.
                    </p>
                ) : (
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Risk Score</th>
                            </tr>
                        </thead>

                        <tbody>
                            {predictiveFlags.map((u) => (
                                <tr key={u.employee_id}>
                                    <td>{u.employee_id}</td>

                                    <td>{u.department}</td>

                                    <td>
                                        <span
                                            className={`badge ${
                                                badgeClass(
                                                    u.risk_score >= 90
                                                        ? "Critical"
                                                        : "High"
                                                )
                                            }`}
                                        >
                                            {u.risk_score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <br />

            {/* Search Employee */}
            <div className="card">
                <h2>Search Employee</h2>

                <input
                    type="text"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) =>
                        setEmployeeId(e.target.value)
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" && searchEmployee()
                    }
                />

                <button
                    onClick={searchEmployee}
                    style={{ marginLeft: "10px" }}
                >
                    {searching ? "Searching..." : "Search"}
                </button>

                {searchError && (
                    <p style={{ color: "red" }}>
                        {searchError}
                    </p>
                )}
            </div>

            <br />

            {/* Peer Comparison */}
            {peerComparison && (
                <>
                    <h2>Peer Comparison</h2>

                    <table className="log-table">
                        <tbody>
                            <tr>
                                <td>
                                    <b>Employee ID</b>
                                </td>
                                <td>
                                    {peerComparison.employee_id}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Department</b>
                                </td>
                                <td>
                                    {peerComparison.department}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Employee Risk Score</b>
                                </td>
                                <td>
                                    {
                                        peerComparison.employee_risk_score
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Department Average</b>
                                </td>
                                <td>
                                    {
                                        peerComparison.department_avg_risk_score
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Peer Count</b>
                                </td>
                                <td>
                                    {peerComparison.peer_count}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Deviation</b>
                                </td>
                                <td>
                                    {
                                        peerComparison.deviation_from_peers
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Above Peer Average</b>
                                </td>
                                <td>
                                    {
                                        peerComparison.above_peer_average
                                            ? "Yes"
                                            : "No"
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}

            <br />

            {/* Risk Trend */}
            {trend && (
                <>
                    <h2>Risk Trend</h2>

                    <h3>
                        Trend Direction:
                        <span
                            style={{
                                marginLeft: "10px",
                                color:
                                    trend.trend_direction ===
                                    "Increasing"
                                        ? "red"
                                        : trend.trend_direction ===
                                          "Decreasing"
                                        ? "green"
                                        : "orange",
                            }}
                        >
                            {trend.trend_direction}
                        </span>

                        {trend.trend_direction === "Increasing" && (
                            <span
                                className="badge danger"
                                style={{
                                    marginLeft: "10px",
                                }}
                            >
                                ⚠ Early Warning
                            </span>
                        )}
                    </h3>

                    {trend.history?.length > 0 ? (
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Risk Score</th>
                                    <th>Category</th>
                                </tr>
                            </thead>

                            <tbody>
                                {trend.history.map(
                                    (item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {new Date(
                                                    item.recorded_at
                                                ).toLocaleString()}
                                            </td>

                                            <td>
                                                {item.risk_score}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${badgeClass(
                                                        item.risk_category
                                                    )}`}
                                                >
                                                    {
                                                        item.risk_category
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <p>
                            No historical trend data available.
                        </p>
                    )}
                </>
            )}

            <br />

            {/* High Risk Users */}
            <h2>High Risk Users</h2>

            <table className="log-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Risk Score</th>
                    </tr>
                </thead>

                <tbody>
                    {highRiskUsers.map((user) => (
                        <tr key={user.employee_id}>
                            <td>{user.employee_id}</td>
                            <td>{user.department}</td>
                            <td>{user.designation}</td>
                            <td>{user.risk_score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <br />

            {/* Recent Anomalies */}
            <h2>Recent Anomalies</h2>

            <table className="log-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Risk Score</th>
                        <th>Category</th>
                        <th>Recorded At</th>
                    </tr>
                </thead>

                <tbody>
                    {recentAnomalies.map((item, index) => (
                        <tr key={index}>
                            <td>{item.employee_id}</td>

                            <td>{item.risk_score}</td>

                            <td>
                                <span
                                    className={`badge ${badgeClass(
                                        item.risk_category
                                    )}`}
                                >
                                    {item.risk_category}
                                </span>
                            </td>

                            <td>
                                {new Date(
                                    item.recorded_at
                                ).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UEBA;