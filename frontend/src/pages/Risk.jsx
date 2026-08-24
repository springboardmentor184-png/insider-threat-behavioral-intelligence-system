import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
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

export default function Risk() {
    const { user } = useAuth();
    const role = user?.role;

    const [employeeId, setEmployeeId] = useState("");
    const [riskData, setRiskData] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [peerData, setPeerData] = useState(null);
    const [distribution, setDistribution] = useState([]);
    const [topRisk, setTopRisk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadDistribution();
        loadTopRisk();
    }, []);

    async function loadDistribution() {
        try {
            const res = await fetch(`${API_URL}/risk/`, {
                headers: authHeaders(),
            });

            setDistribution(await res.json());
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }

    async function loadTopRisk() {
        try {
            const res = await fetch(`${API_URL}/behavior/anomalies`, {
                headers: authHeaders(),
            });

            const data = await res.json();

            setTopRisk(data.slice(0, 10));
        } catch (err) {
            console.error(err);
        }
    }

    async function searchRisk() {
        if (!employeeId) return;

        setSearching(true);
        setRiskData(null);
        setTrendData(null);
        setPeerData(null);

        try {
            const res = await fetch(
                `${API_URL}/risk/${employeeId}`,
                {
                    headers: authHeaders(),
                }
            );

            if (!res.ok) {
                throw new Error("Employee not found");
            }

            setRiskData(await res.json());

            const [trendRes, peerRes] = await Promise.allSettled([
                fetch(
                    `${API_URL}/ueba/trend/${employeeId}`,
                    {
                        headers: authHeaders(),
                    }
                ),
                fetch(
                    `${API_URL}/ueba/peer-comparison/${employeeId}`,
                    {
                        headers: authHeaders(),
                    }
                ),
            ]);

            if (
                trendRes.status === "fulfilled" &&
                trendRes.value.ok
            ) {
                setTrendData(await trendRes.value.json());
            }

            if (
                peerRes.status === "fulfilled" &&
                peerRes.value.ok
            ) {
                setPeerData(await peerRes.value.json());
            }
        } catch (err) {
            alert("Employee not found");
        } finally {
            setSearching(false);
        }
    }

    async function recalculateAll() {
        try {
            const res = await fetch(
                `${API_URL}/risk/recalculate-all`,
                {
                    method: "POST",
                    headers: authHeaders(),
                }
            );

            const data = await res.json();

            alert(data.message);

            loadDistribution();
            loadTopRisk();
        } catch (err) {
            alert("Failed to recalculate");
        }
    }

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Risk Dashboard...
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        color: C.txt,
                        fontWeight: 800,
                        fontSize: 18,
                    }}
                >
                    Risk Analysis
                </div>

                {role === "Administrator" && (
                    <Btn
                        variant="primary"
                        onClick={recalculateAll}
                    >
                        Recalculate All Risk Scores
                    </Btn>
                )}
            </div>

            <Panel title="Search Employee Risk">
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                    }}
                >
                    <Input
                        placeholder="Enter Employee ID"
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(e.target.value)
                        }
                        onKeyDown={(e) =>
                            e.key === "Enter" && searchRisk()
                        }
                    />

                    <Btn
                        variant="primary"
                        onClick={searchRisk}
                    >
                        {searching ? "Searching..." : "Search"}
                    </Btn>
                </div>
            </Panel>

            {riskData && (
                <Panel title="Employee Risk Result">
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginBottom: 16,
                        }}
                    >
                        <tbody>
                            <tr>
                                <td style={tdStyle}>
                                    <b>Employee ID</b>
                                </td>
                                <td style={tdStyle}>
                                    {riskData.employee_id}
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>Risk Score</b>
                                </td>
                                <td style={tdStyle}>
                                    {riskData.risk_score.toFixed(2)}
                                </td>
                            </tr>

                            <tr>
                                <td style={tdStyle}>
                                    <b>Risk Category</b>
                                </td>
                                <td style={tdStyle}>
                                    <Pill
                                        label={riskData.risk_category}
                                        color={catColor(
                                            riskData.risk_category
                                        )}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                color: C.txt,
                                fontWeight: 700,
                                fontSize: 13,
                                marginBottom: 8,
                            }}
                        >
                            Activity Breakdown
                        </div>

                        <EmployeeBehaviorDetail
                            employeeId={riskData.employee_id}
                        />
                    </div>

                    {trendData && (
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    color: C.txt,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    marginBottom: 8,
                                }}
                            >
                                Risk Trend —{" "}
                                <Pill
                                    label={trendData.trend_direction}
                                    color={
                                        trendData.trend_direction ===
                                        "Increasing"
                                            ? C.accent
                                            : trendData.trend_direction ===
                                              "Decreasing"
                                            ? C.green
                                            : C.amber
                                    }
                                />
                            </div>

                            {trendData.history?.length > 0 ? (
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
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
                                        {trendData.history.map(
                                            (p, i) => (
                                                <tr key={i}>
                                                    <td style={tdStyle}>
                                                        {new Date(
                                                            p.recorded_at
                                                        ).toLocaleDateString()}
                                                    </td>

                                                    <td style={tdStyle}>
                                                        {p.risk_score}
                                                    </td>

                                                    <td style={tdStyle}>
                                                        <Pill
                                                            label={
                                                                p.risk_category
                                                            }
                                                            color={catColor(
                                                                p.risk_category
                                                            )}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ color: C.dim }}>
                                    No historical trend data yet for
                                    this employee.
                                </p>
                            )}
                        </div>
                    )}

                    {peerData && (
                        <div>
                            <div
                                style={{
                                    color: C.txt,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    marginBottom: 8,
                                }}
                            >
                                Peer Comparison —{" "}
                                {peerData.department}
                            </div>

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td style={tdStyle}>
                                            <b>
                                                Employee Risk Score
                                            </b>
                                        </td>
                                        <td style={tdStyle}>
                                            {
                                                peerData.employee_risk_score
                                            }
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={tdStyle}>
                                            <b>Department Avg</b>
                                        </td>
                                        <td style={tdStyle}>
                                            {
                                                peerData.department_avg_risk_score
                                            }
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={tdStyle}>
                                            <b>Peer Count</b>
                                        </td>
                                        <td style={tdStyle}>
                                            {peerData.peer_count}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={tdStyle}>
                                            <b>Deviation</b>
                                        </td>
                                        <td style={tdStyle}>
                                            <Pill
                                                label={`${
                                                    peerData.deviation_from_peers >
                                                    0
                                                        ? "+"
                                                        : ""
                                                }${
                                                    peerData.deviation_from_peers
                                                }`}
                                                color={
                                                    peerData.above_peer_average
                                                        ? C.accent
                                                        : C.green
                                                }
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            )}

            <Panel title="Top Priority — Highest Risk Employees">
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>Rank</th>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Risk</th>
                            <th style={thStyle}>Severity</th>
                            <th style={thStyle}>USB</th>
                            <th style={thStyle}>File Access</th>
                            <th style={thStyle}>Activity</th>
                        </tr>
                    </thead>

                    <tbody>
                        {topRisk.map((e, i) => (
                            <tr key={e.employee}>
                                <td style={tdStyle}>
                                    #{i + 1}
                                </td>

                                <td style={tdStyle}>
                                    {e.employee}
                                </td>

                                <td style={tdStyle}>
                                    {e.risk_score}
                                </td>

                                <td style={tdStyle}>
                                    <Pill
                                        label={e.severity}
                                        color={catColor(e.severity)}
                                    />
                                </td>

                                <td style={tdStyle}>
                                    {e.usb_count}
                                </td>

                                <td style={tdStyle}>
                                    {e.file_access_count}
                                </td>

                                <td style={tdStyle}>
                                    <EmployeeBehaviorDetail
                                        employeeId={e.employee}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>

            <Panel title="Risk Distribution">
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>
                                Employee Count
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {distribution.map((item, i) => (
                            <tr key={i}>
                                <td style={tdStyle}>
                                    <Pill
                                        label={item.category}
                                        color={catColor(
                                            item.category
                                        )}
                                    />
                                </td>

                                <td style={tdStyle}>
                                    {item.count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}