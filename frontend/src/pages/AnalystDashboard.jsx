import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function AnalystDashboard() {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Security Analyst" />

            <div className="flex-1">

                <Navbar
                    name="Rahul"
                    role="Security Analyst"
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Security Analyst Dashboard
                    </h1>

                    <p className="text-slate-500 mb-8">
                        Investigate alerts and monitor suspicious employee activities.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                        <StatCard
                            title="Assigned Alerts"
                            value="12"
                        />

                        <StatCard
                            title="Resolved Today"
                            value="7"
                        />

                        <StatCard
                            title="Suspicious Activities"
                            value="5"
                        />

                        <StatCard
                            title="Investigations"
                            value="3"
                        />

                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            Alert Queue
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>
                                    <th className="p-3 text-left">Alert ID</th>
                                    <th className="p-3 text-left">Employee</th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Priority</th>
                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">ALT101</td>
                                    <td className="p-3">Rahul</td>
                                    <td className="p-3">Multiple Failed Logins</td>
                                    <td className="p-3 text-red-600 font-semibold">High</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">ALT102</td>
                                    <td className="p-3">Priya</td>
                                    <td className="p-3">USB Device Connected</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Medium</td>
                                </tr>

                                <tr>
                                    <td className="p-3">ALT103</td>
                                    <td className="p-3">Arjun</td>
                                    <td className="p-3">Privilege Escalation</td>
                                    <td className="p-3 text-red-600 font-semibold">High</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h2 className="text-xl font-bold mb-4">
                            Investigation Status
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>
                                    <th className="p-3 text-left">Case ID</th>
                                    <th className="p-3 text-left">Employee</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">CASE001</td>
                                    <td className="p-3">Rahul</td>
                                    <td className="p-3 text-yellow-600 font-semibold">In Progress</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">CASE002</td>
                                    <td className="p-3">Priya</td>
                                    <td className="p-3 text-green-600 font-semibold">Closed</td>
                                </tr>

                                <tr>
                                    <td className="p-3">CASE003</td>
                                    <td className="p-3">Arjun</td>
                                    <td className="p-3 text-blue-600 font-semibold">Assigned</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AnalystDashboard;