import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function ManagerDashboard() {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Security Manager" />

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Security Manager"
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Security Manager Dashboard
                    </h1>

                    <p className="text-slate-500 mb-8">
                        Monitor organizational security posture and manage insider threat risks.
                    </p>

                    {/* Statistics */}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                        <StatCard
                            title="Total Employees"
                            value="125"
                        />

                        <StatCard
                            title="High Risk Employees"
                            value="8"
                        />

                        <StatCard
                            title="Open Alerts"
                            value="14"
                        />

                        <StatCard
                            title="Departments"
                            value="9"
                        />

                    </div>

                    {/* Recent Alerts */}

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            Recent Alerts
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-3 text-left">Alert ID</th>
                                    <th className="p-3 text-left">Employee</th>
                                    <th className="p-3 text-left">Severity</th>
                                    <th className="p-3 text-left">Status</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">ALT001</td>
                                    <td className="p-3">Rahul</td>
                                    <td className="p-3 text-red-600 font-semibold">High</td>
                                    <td className="p-3">Open</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">ALT002</td>
                                    <td className="p-3">Priya</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Medium</td>
                                    <td className="p-3">Investigating</td>
                                </tr>

                                <tr>
                                    <td className="p-3">ALT003</td>
                                    <td className="p-3">Arjun</td>
                                    <td className="p-3 text-green-600 font-semibold">Low</td>
                                    <td className="p-3">Closed</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    {/* Department Risk */}

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            Department Risk Overview
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-3 text-left">
                                        Department
                                    </th>

                                    <th className="p-3 text-left">
                                        Risk Level
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">IT</td>
                                    <td className="p-3 text-red-600 font-semibold">High</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">HR</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Medium</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">Finance</td>
                                    <td className="p-3 text-green-600 font-semibold">Low</td>
                                </tr>

                                <tr>
                                    <td className="p-3">Operations</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Medium</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    {/* Quick Actions */}

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h2 className="text-xl font-bold mb-4">
                            Quick Actions
                        </h2>

                        <div className="flex gap-4 flex-wrap">

                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                                View Reports
                            </button>

                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
                                Manage Employees
                            </button>

                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
                                Generate Report
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ManagerDashboard;