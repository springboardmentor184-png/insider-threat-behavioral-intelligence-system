import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function ThreatNotifications() {

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {

        axios
            .get("http://127.0.0.1:5000/notifications")
            .then((response) => {

                setNotifications(response.data);

            })
            .catch((error) => {

                console.log(error);

            });

    }, []);

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Admin" />

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Administrator"
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold mb-6">
                        Threat Notifications
                    </h1>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-4 text-left">
                                        Employee
                                    </th>

                                    <th className="p-4 text-left">
                                        Risk Score
                                    </th>

                                    <th className="p-4 text-left">
                                        Risk Level
                                    </th>

                                    <th className="p-4 text-left">
                                        Message
                                    </th>

                                    <th className="p-4 text-left">
                                        Time
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {notifications.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="border-b"
                                    >

                                        <td className="p-4">
                                            {item.employee}
                                        </td>

                                        <td className="p-4">
                                            {item.risk_score}
                                        </td>

                                        <td className="p-4">

                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">

                                                {item.risk_level}

                                            </span>

                                        </td>

                                        <td className="p-4">
                                            {item.message}
                                        </td>

                                        <td className="p-4">
                                            {item.created_at}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ThreatNotifications;