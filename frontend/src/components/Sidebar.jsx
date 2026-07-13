import { Link } from "react-router-dom";

function Sidebar({ role }) {

    const menus = {

    Admin: [
        { name: "Dashboard", path: "/admin" },
        { name: "Employee Management", path: "/employees" },
        { name: "Departments", path: "#" },
        { name: "Devices", path: "#" },
        { name: "Access Privileges", path: "#" },
        { name: "Reports", path: "#" },
        { name: "Settings", path: "#" }
    ],

    "Security Manager": [
        { name: "Dashboard", path: "/manager" },
        { name: "Alerts", path: "#" },
        { name: "Employees", path: "/employees" },
        { name: "Departments", path: "#" },
        { name: "Reports", path: "#" }
    ],

    "Security Analyst": [
        { name: "Dashboard", path: "/analyst" },
        { name: "Alert Queue", path: "#" },
        { name: "Investigations", path: "#" },
        { name: "Activity Logs", path: "#" }
    ],

    "SOC Engineer": [
        { name: "Dashboard", path: "/soc" },
        { name: "Devices", path: "#" },
        { name: "System Events", path: "#" },
        { name: "Network Activity", path: "#" }
    ],

    Employee: [
        { name: "Dashboard", path: "/employee" },
        { name: "My Profile", path: "#" },
        { name: "My Activity", path: "#" },
        { name: "My Devices", path: "#" }
    ]

};

    return (

        <div className="w-72 bg-slate-900 text-white min-h-screen p-6">

            <h1 className="text-2xl font-bold mb-10">
                🛡️ Insider Threat
            </h1>

            <ul className="space-y-3">

                {menus[role]?.map((item) => (

                    <li key={item.name}>

                        <Link
                            to={item.path}
                            className="block p-3 rounded-lg hover:bg-slate-700 transition"
                        >
                            {item.name}
                        </Link>

                    </li>

                ))}

            </ul>

            <div className="mt-12">

                <Link
                    to="/login"
                    className="text-red-400 hover:text-red-300"
                >
                    Logout
                </Link>

            </div>

        </div>

    );

}

export default Sidebar;