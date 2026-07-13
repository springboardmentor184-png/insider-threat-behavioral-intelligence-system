import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function EmployeeDashboard() {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Employee" />

            <div className="flex-1">

                <Navbar
                    name="Rahul"
                    role="Employee"
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Employee Dashboard
                    </h1>

                    <p className="text-slate-500 mb-8">
                        View your profile, activity history and security status.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                        <StatCard
                            title="My Department"
                            value="IT"
                        />

                        <StatCard
                            title="Assigned Device"
                            value="Laptop-22"
                        />

                        <StatCard
                            title="Security Score"
                            value="92%"
                        />

                        <StatCard
                            title="Recent Activities"
                            value="15"
                        />

                    </div>

                    {/* Profile */}

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            My Profile
                        </h2>

                        <table className="w-full">

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3 font-semibold">Employee</td>
                                    <td className="p-3">Rahul</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3 font-semibold">Department</td>
                                    <td className="p-3">IT</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3 font-semibold">Designation</td>
                                    <td className="p-3">Security Analyst</td>
                                </tr>

                                <tr>
                                    <td className="p-3 font-semibold">Manager</td>
                                    <td className="p-3">John Smith</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    {/* Activity */}

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            Recent Activity
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Activity</th>
                                    <th className="p-3 text-left">Status</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">09:15</td>
                                    <td className="p-3">Logged In</td>
                                    <td className="p-3 text-green-600 font-semibold">Success</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">10:05</td>
                                    <td className="p-3">Opened Company Portal</td>
                                    <td className="p-3">Completed</td>
                                </tr>

                                <tr>
                                    <td className="p-3">11:30</td>
                                    <td className="p-3">Password Changed</td>
                                    <td className="p-3 text-blue-600 font-semibold">Completed</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    {/* Security Tips */}

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h2 className="text-xl font-bold mb-4">
                            Security Tips
                        </h2>

                        <ul className="list-disc pl-6 space-y-2 text-slate-700">

                            <li>Use strong and unique passwords.</li>
                            <li>Do not connect unauthorized USB devices.</li>
                            <li>Lock your computer before leaving your desk.</li>
                            <li>Report suspicious emails immediately.</li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default EmployeeDashboard;