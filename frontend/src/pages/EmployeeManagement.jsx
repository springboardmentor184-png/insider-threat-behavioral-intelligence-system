import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function EmployeeManagement() {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Admin" />

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Administrator"
                />

                <div className="p-8">

                    {/* Header */}

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                Employee Management
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Manage employee profiles, departments and roles.
                            </p>

                        </div>

                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                            + Add Employee
                        </button>

                    </div>

                    {/* Search */}

                    <div className="bg-white rounded-xl shadow p-5 mb-6">

                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* Employee Table */}

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-4 text-left">Employee ID</th>
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Department</th>
                                    <th className="p-4 text-left">Role</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-center">Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr className="border-b">

                                    <td className="p-4">EMP001</td>
                                    <td className="p-4">Rahul Sharma</td>
                                    <td className="p-4">IT</td>
                                    <td className="p-4">Security Analyst</td>

                                    <td className="p-4">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                            Active
                                        </span>
                                    </td>

                                    <td className="p-4 text-center space-x-2">

                                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                                            Edit
                                        </button>

                                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                            Delete
                                        </button>

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

export default EmployeeManagement;