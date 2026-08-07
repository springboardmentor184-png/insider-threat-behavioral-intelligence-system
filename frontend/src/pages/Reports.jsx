import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Reports() {

    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    const [reports, setReports] = useState([]);

    useEffect(() => {

        const fetchReports = async () => {

            try {

                const response = await axios.get(
                    "http://127.0.0.1:5000/reports"
                );

                setReports(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        fetchReports();

    }, []);

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role={role} />

            <div className="flex-1">

                <Navbar
                    name={name}
                    role={role}
                />

                <div className="p-8">

                    <h1 className="text-3xl font-bold mb-6">
                        Threat Analysis Reports
                    </h1>

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b">

                                    <th className="text-left p-3">Employee</th>
                                    <th className="text-left p-3">Prediction</th>
                                    <th className="text-left p-3">Risk Level</th>
                                    <th className="text-left p-3">Generated On</th>

                                </tr>

                            </thead>

                            <tbody>

                                {reports.map((report) => (

                                    <tr
                                        key={report.report_id}
                                        className="border-b"
                                    >

                                        <td className="p-3">
                                            {report.employee_name}
                                        </td>

                                        <td className="p-3">
                                            {report.prediction}
                                        </td>

                                        <td
                                            className={`p-3 font-semibold ${
                                                report.risk_level === "High"
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {report.risk_level}
                                        </td>

                                        <td className="p-3">
                                            {report.created_at}
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

export default Reports;