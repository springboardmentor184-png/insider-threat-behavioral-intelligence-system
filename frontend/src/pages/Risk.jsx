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

function Risk() {
    const role = localStorage.getItem("role");

    const [employeeId, setEmployeeId] = useState("");
    const [riskData, setRiskData] = useState(null);
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDistribution();
    }, []);

    async function loadDistribution() {
        try {
            const res = await fetch(`${API_URL}/risk/`, {
                headers: authHeaders(),
            });

            const data = await res.json();
            setDistribution(data);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }

    async function searchRisk() {
        if (!employeeId) return;

        try {
            const res = await fetch(
                `${API_URL}/risk/${employeeId}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();
            setRiskData(data);
        } catch (err) {
            console.error(err);
            alert("Employee not found");
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

        } catch (err) {
            console.error(err);
            alert("Failed to recalculate");
        }
    }

    if (loading) return <h2>Loading Risk Dashboard...</h2>;

    return (
        <div className="dashboard-container">

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h1>Risk Analysis</h1>

                {role === "Administrator" && (
                    <button onClick={recalculateAll}>
                        Recalculate All Risk Scores
                    </button>
                )}
            </div>

            <div className="card">

                <h2>Search Employee Risk</h2>

                <input
                    type="text"
                    placeholder="Enter Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                />

                <button
                    onClick={searchRisk}
                    style={{ marginLeft: "10px" }}
                >
                    Search
                </button>

            </div>

            <br />

            {riskData && (
                <div className="card">

                    <h2>Employee Risk Result</h2>

                    <table className="log-table">

                        <tbody>

                            <tr>
                                <td><b>Employee ID</b></td>
                                <td>{riskData.employee_id}</td>
                            </tr>

                            <tr>
                                <td><b>Risk Score</b></td>
                                <td>{riskData.risk_score.toFixed(2)}</td>
                            </tr>

                            <tr>
                                <td><b>Risk Category</b></td>
                                <td>
                                    <span
                                        className={`badge ${
                                            riskData.risk_category === "Critical"
                                                ? "danger"
                                                : riskData.risk_category === "High"
                                                ? "danger"
                                                : riskData.risk_category === "Medium"
                                                ? "warning"
                                                : "success"
                                        }`}
                                    >
                                        {riskData.risk_category}
                                    </span>
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>
            )}

            <br />

            <div className="card">

                <h2>Risk Distribution</h2>

                <table className="log-table">

                    <thead>

                        <tr>

                            <th>Category</th>

                            <th>Employee Count</th>

                        </tr>

                    </thead>

                    <tbody>

                        {distribution.map((item, index) => (

                            <tr key={index}>

                                <td>
                                    <span
                                        className={`badge ${
                                            item.category === "Critical"
                                                ? "danger"
                                                : item.category === "High"
                                                ? "danger"
                                                : item.category === "Medium"
                                                ? "warning"
                                                : "success"
                                        }`}
                                    >
                                        {item.category}
                                    </span>
                                </td>

                                <td>{item.count}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Risk;