import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function SocDashboard() {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="SOC Engineer" />

            <div className="flex-1">

                <Navbar
                    name="Alex"
                    role="SOC Engineer"
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        SOC Engineer Dashboard
                    </h1>

                    <p className="text-slate-500 mb-8">
                        Monitor devices, system events and security infrastructure.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                        <StatCard
                            title="Online Devices"
                            value="248"
                        />

                        <StatCard
                            title="Failed Logins"
                            value="19"
                        />

                        <StatCard
                            title="Critical Events"
                            value="6"
                        />

                        <StatCard
                            title="Active Sessions"
                            value="142"
                        />

                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

                        <h2 className="text-xl font-bold mb-4">
                            Live Security Events
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Event</th>
                                    <th className="p-3 text-left">Device</th>
                                    <th className="p-3 text-left">Severity</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">09:30</td>
                                    <td className="p-3">Firewall Alert</td>
                                    <td className="p-3">Server-01</td>
                                    <td className="p-3 text-red-600 font-semibold">Critical</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">10:05</td>
                                    <td className="p-3">VPN Login</td>
                                    <td className="p-3">Laptop-22</td>
                                    <td className="p-3 text-green-600 font-semibold">Normal</td>
                                </tr>

                                <tr>
                                    <td className="p-3">10:40</td>
                                    <td className="p-3">USB Connected</td>
                                    <td className="p-3">Desktop-15</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Medium</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h2 className="text-xl font-bold mb-4">
                            Device Health
                        </h2>

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-3 text-left">Device</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Last Check</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">
                                    <td className="p-3">Server-01</td>
                                    <td className="p-3 text-green-600 font-semibold">Healthy</td>
                                    <td className="p-3">2 min ago</td>
                                </tr>

                                <tr className="border-b">
                                    <td className="p-3">Desktop-15</td>
                                    <td className="p-3 text-yellow-600 font-semibold">Warning</td>
                                    <td className="p-3">5 min ago</td>
                                </tr>

                                <tr>
                                    <td className="p-3">Laptop-22</td>
                                    <td className="p-3 text-green-600 font-semibold">Healthy</td>
                                    <td className="p-3">1 min ago</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default SocDashboard;