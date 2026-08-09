import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import "../styles/Dashboard.css";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

function Profile() {
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
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h2>Loading Profile...</h2>;
    }

    if (error) {
        return (
            <h2 style={{ color: "red" }}>
                Failed to load profile: {error}
            </h2>
        );
    }

    return (
        <div className="dashboard-container">
            <h1>Employee Profile</h1>

            <table className="log-table">
                <tbody>
                    <tr>
                        <td>
                            <b>User ID</b>
                        </td>
                        <td>{profile.id}</td>
                    </tr>

                    <tr>
                        <td>
                            <b>Full Name</b>
                        </td>
                        <td>{profile.full_name}</td>
                    </tr>

                    <tr>
                        <td>
                            <b>Email</b>
                        </td>
                        <td>{profile.email}</td>
                    </tr>

                    <tr>
                        <td>
                            <b>Role</b>
                        </td>
                        <td>{profile.role}</td>
                    </tr>

                    <tr>
                        <td>
                            <b>Department</b>
                        </td>
                        <td>
                            {profile.department || "Not Available"}
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <b>Account Status</b>
                        </td>
                        <td>
                            <span
                                className={`badge ${
                                    profile.is_active
                                        ? "success"
                                        : "danger"
                                }`}
                            >
                                {profile.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <b>Member Since</b>
                        </td>
                        <td>
                            {profile.created_at
                                ? new Date(
                                      profile.created_at
                                  ).toLocaleDateString()
                                : "Not Available"}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Profile;