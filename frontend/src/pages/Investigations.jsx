import { useEffect, useState } from "react";
import axios from "axios";

function Investigations() {

    const [investigations, setInvestigations] = useState([]);

    useEffect(() => {

        fetchInvestigations();

    }, []);

    const fetchInvestigations = async () => {

        try {

            const response = await axios.get(
                "http://127.0.0.1:5000/investigations"
            );

            setInvestigations(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="bg-white rounded-xl shadow-lg p-6">

            <h1 className="text-3xl font-bold mb-2">
                Threat Investigation Queue
            </h1>

            <p className="text-gray-500 mb-8">
                Automatically generated investigation cases from the Insider Risk Scoring Engine.
            </p>

            <table className="w-full border">

                <thead className="bg-gray-100">

                    <tr>

                        <th className="p-3">Employee</th>

                        <th>Risk Score</th>

                        <th>Priority</th>

                        <th>Status</th>

                        <th>Assigned To</th>

                        <th>Created</th>

                    </tr>

                </thead>

                <tbody>

                    {investigations.map((item) => (

                        <tr
                            key={item.id}
                            className="border-t text-center"
                        >

                            <td className="p-3">
                                {item.employee}
                            </td>

                            <td>
                                {item.risk_score}/100
                            </td>

                            <td>

                                <span
                                    className={`px-3 py-1 rounded-full text-white text-sm

                                    ${item.priority === "Critical"
                                        ? "bg-red-600"
                                        : "bg-orange-500"}

                                    `}
                                >

                                    {item.priority}

                                </span>

                            </td>

                            <td>

                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                                    {item.status}

                                </span>

                            </td>

                            <td>

                                {item.assigned_to}

                            </td>

                            <td>

                                {item.created_at}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default Investigations;