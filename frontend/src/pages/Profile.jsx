import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import { C, Panel, tdStyle } from "../assets/components/AppLayout";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/users/me`, {
            headers: authHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Status ${res.status}`);
                }

                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Profile...
            </p>
        );
    }

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load profile: {error}
            </p>
        );
    }

    const rows = [
        ["User ID", profile.id],
        ["Full Name", profile.full_name],
        ["Email", profile.email],
        ["Role", profile.role],
        [
            "Department",
            profile.department || "Not Available",
        ],
        [
            "Account Status",
            profile.is_active ? "Active" : "Inactive",
        ],
        [
            "Member Since",
            profile.created_at
                ? new Date(
                      profile.created_at
                  ).toLocaleDateString()
                : "Not Available",
        ],
    ];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div
                style={{
                    color: C.txt,
                    fontWeight: 800,
                    fontSize: 18,
                }}
            >
                Employee Profile
            </div>

            <Panel>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <tbody>
                        {rows.map(([label, val]) => (
                            <tr key={label}>
                                <td
                                    style={{
                                        ...tdStyle,
                                        width: 220,
                                        color: C.dim,
                                    }}
                                >
                                    <b>{label}</b>
                                </td>

                                <td style={tdStyle}>
                                    {val}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}