import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import API_URL from "../services/api";

const COLORS = {
    Low: "#22c55e",
    Medium: "#eab308",
    High: "#f97316",
    Critical: "#ef4444",
};

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

function RiskDistributionChart() {
    const [distribution, setDistribution] = useState([]);
    const [topEmployees, setTopEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/risk/`, {
                headers: authHeaders(),
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(
                        `Risk distribution: status ${res.status}`
                    );
                }

                return res.json();
            }),

            fetch(`${API_URL}/behavior/anomalies`, {
                headers: authHeaders(),
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(
                        `Anomalies: status ${res.status}`
                    );
                }

                return res.json();
            }),
        ])
            .then(([distData, anomalyData]) => {
                setDistribution(distData);

                // Take top 8 highest-risk employees
                setTopEmployees(anomalyData.slice(0, 8));
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load risk data: {error}
            </p>
        );
    }

    if (loading) {
        return <p>Loading risk distribution...</p>;
    }

    return (
        <div className="risk-charts-wrapper">

            {/* =====================================================
                PIE CHART
                Organization-wide risk category breakdown
            ====================================================== */}

            <div className="chart-block">

                <h4 className="chart-subtitle">
                    Risk Category Breakdown
                </h4>

                {distribution.length === 0 ? (
                    <p>No risk data available.</p>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height={280}
                    >
                        <PieChart>

                            <Pie
                                data={distribution}
                                dataKey="count"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ category, count }) =>
                                    `${category}: ${count}`
                                }
                            >
                                {distribution.map((entry, i) => (
                                    <Cell
                                        key={`cell-${i}`}
                                        fill={
                                            COLORS[entry.category] ||
                                            "#8884d8"
                                        }
                                    />
                                ))}
                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>
                    </ResponsiveContainer>
                )}

            </div>

            {/* =====================================================
                BAR CHART
                Top individual employees by risk score
            ====================================================== */}

            <div className="chart-block">

                <h4 className="chart-subtitle">
                    Top Employees by Risk Score
                </h4>

                {topEmployees.length === 0 ? (
                    <p>
                        No employee anomaly data available.
                    </p>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >
                        <BarChart
                            data={topEmployees}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 0,
                                bottom: 40,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="employee"
                                angle={-35}
                                textAnchor="end"
                                interval={0}
                                height={60}
                            />

                            <YAxis
                                domain={[0, 100]}
                            />

                            <Tooltip
                                formatter={(value, name) => [
                                    value,
                                    name,
                                ]}
                                labelFormatter={(label) =>
                                    `Employee: ${label}`
                                }
                            />

                            <Legend />

                            <Bar
                                dataKey="risk_score"
                                name="Risk Score"
                                radius={[4, 4, 0, 0]}
                            >
                                {topEmployees.map((entry, i) => (
                                    <Cell
                                        key={`bar-cell-${i}`}
                                        fill={
                                            COLORS[entry.severity] ||
                                            "#8884d8"
                                        }
                                    />
                                ))}
                            </Bar>

                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* =================================================
                    QUICK REFERENCE TABLE
                ================================================== */}

                <table
                    className="log-table"
                    style={{ marginTop: "16px" }}
                >
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Risk Score</th>
                            <th>Severity</th>
                            <th>USB Events</th>
                            <th>File Access</th>
                        </tr>
                    </thead>

                    <tbody>
                        {topEmployees.map((emp) => (
                            <tr key={emp.employee}>

                                <td>
                                    {emp.employee}
                                </td>

                                <td>
                                    {emp.risk_score}
                                </td>

                                <td>
                                    <span
                                        style={{
                                            color:
                                                COLORS[emp.severity] ||
                                                "#333",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {emp.severity}
                                    </span>
                                </td>

                                <td>
                                    {emp.usb_count}
                                </td>

                                <td>
                                    {emp.file_access_count}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default RiskDistributionChart;