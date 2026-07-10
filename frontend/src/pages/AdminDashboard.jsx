import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function AdminDashboard() {

    const [stats, setStats] = useState({
        totalEmployees: 0,
        departments: 0,
        devices: 0,
        alerts: 0
    });

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response = await axios.get(
                    "http://127.0.0.1:5000/dashboard/admin"
                );

                setStats(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        loadDashboard();

    }, []);

    return (

        <div className="flex min-h-screen bg-slate-100">

            {/* Sidebar */}

            <Sidebar role="Admin" />

            {/* Main Content */}

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Administrator"
                />

                <div className="p-8">

                    {/* Statistics */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        <StatCard
                            title="Total Employees"
                            value={stats.totalEmployees}
                        />

                        <StatCard
                            title="Departments"
                            value={stats.departments}
                        />

                        <StatCard
                            title="Registered Devices"
                            value={stats.devices}
                        />

                        <StatCard
                            title="Open Alerts"
                            value={stats.alerts}
                        />

                    </div>

                    {/* Recent Activity */}

                    <div className="bg-white rounded-xl shadow-lg mt-8 p-6">

                        <h2 className="text-2xl font-bold mb-4">

                            Recent Activity

                        </h2>

                        <table className="w-full">

                            <thead>

                                <tr className="border-b">

                                    <th className="text-left p-3">
                                        Employee
                                    </th>

                                    <th className="text-left p-3">
                                        Action
                                    </th>

                                    <th className="text-left p-3">
                                        Time
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">

                                    <td className="p-3">
                                        Rahul
                                    </td>

                                    <td className="p-3">
                                        Logged In
                                    </td>

                                    <td className="p-3">
                                        09:15 AM
                                    </td>

                                </tr>

                                <tr className="border-b">

                                    <td className="p-3">
                                        Priya
                                    </td>

                                    <td className="p-3">
                                        Updated Profile
                                    </td>

                                    <td className="p-3">
                                        10:02 AM
                                    </td>

                                </tr>

                                <tr>

                                    <td className="p-3">
                                        Kiran
                                    </td>

                                    <td className="p-3">
                                        Device Assigned
                                    </td>

                                    <td className="p-3">
                                        11:40 AM
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AdminDashboard;