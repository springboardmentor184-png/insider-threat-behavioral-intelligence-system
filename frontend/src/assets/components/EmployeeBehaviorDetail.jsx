import React, { useState } from "react";
import API_URL from "../../services/api";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

function EmployeeBehaviorDetail({ employeeId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    async function loadDetail() {
        if (data) {
            setExpanded(!expanded);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${API_URL}/behavior/analyze/${employeeId}`,
                {
                    headers: authHeaders(),
                }
            );

            if (!res.ok) {
                throw new Error("No activity data found");
            }

            const result = await res.json();

            setData(result);
            setExpanded(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                onClick={loadDetail}
                style={{
                    fontSize: "13px",
                    padding: "6px 12px",
                }}
            >
                {loading
                    ? "Loading..."
                    : expanded
                    ? "Hide Activity"
                    : "View Activity"}
            </button>

            {error && (
                <p
                    style={{
                        color: "var(--danger)",
                        fontSize: "13px",
                        marginTop: "6px",
                    }}
                >
                    {error}
                </p>
            )}

            {expanded && data && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "14px",
                        background: "var(--bg-elevated)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                    }}
                >
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginBottom: "10px",
                        }}
                    >
                        Based on {data.total_logs} total logged activities
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "10px",
                        }}
                    >
                        <BehaviorStat
                            label="Unusual Logins"
                            value={data.unusual_login}
                            hint="Outside business hours"
                        />

                        <BehaviorStat
                            label="USB Activity"
                            value={data.usb_activity}
                            hint="Connect / Disconnect events"
                        />

                        <BehaviorStat
                            label="File Access"
                            value={data.file_access_count}
                            hint="File open/read events"
                        />

                        <BehaviorStat
                            label="Email Activity"
                            value={data.email_count}
                            hint="Emails received"
                        />

                        <BehaviorStat
                            label="Web Access"
                            value={data.web_access_count}
                            hint="Web/browsing events"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function BehaviorStat({ label, value, hint }) {
    return (
        <div
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                }}
            >
                {hint}
            </div>
        </div>
    );
}

export default EmployeeBehaviorDetail;