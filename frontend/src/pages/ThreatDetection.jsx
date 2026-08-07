import { useState, useEffect } from "react";
import axios from "axios";

function ThreatDetection() {

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {

        const fetchEmployees = async () => {

            try {

                const response = await axios.get(
                    "http://127.0.0.1:5000/employees"
                );

                setEmployees(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        fetchEmployees();

    }, []);

    const analyzeBehavior = async () => {

        if (!selectedEmployee) {

            alert("Please select an employee.");

            return;

        }

        try {

            const response = await axios.post(
                "http://127.0.0.1:5000/detect-anomaly",
                {
                    employee_name: selectedEmployee
                }
            );

            setResult(response.data);

        } catch (error) {

            console.log(error);

            alert("Prediction failed.");

        }

    };

    return (

        <div className="bg-white rounded-xl shadow-lg p-8">

            <h2 className="text-3xl font-bold mb-2">
                AI Insider Threat Detection
            </h2>

            <p className="text-gray-600 mb-6">
                Select an employee to analyse their recent behavioural baseline
                using the trained Isolation Forest model.
            </p>

            <select
                className="border rounded-lg p-3 w-full"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
            >

                <option value="">
                    Select Employee
                </option>

                {employees.map((employee) => (

                    <option
    key={employee.employee_id}
    value={employee.dataset_user}
>
    {employee.dataset_user}
</option>

                ))}

            </select>

            <button
                onClick={analyzeBehavior}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
                Analyze Behaviour
            </button>

            {result && (

                <div className="mt-10 space-y-6">

                    {/* Overall Result */}

                    <div
                        className={`rounded-xl shadow-lg p-6 text-center ${
                            result.prediction === "Normal"
                                ? "bg-green-100"
                                : "bg-red-100"
                        }`}
                    >

                        <h2 className="text-3xl font-bold">

                            {result.prediction === "Normal"
                                ? "🟢 NORMAL BEHAVIOUR DETECTED"
                                : "🔴 ANOMALOUS BEHAVIOUR DETECTED"}

                        </h2>

                        <p className="mt-4 text-lg">

                            Employee:
                            <strong> {result.employee}</strong>

                        </p>

                        <p>

                            Emails Analysed:
                            <strong> {result.emails_analysed}</strong>

                        </p>

                        <p>

                            Report Generated:
                            <strong> {result.generated_at}</strong>

                        </p>

                    </div>

                    {/* Risk Assessment */}

                    <div className="bg-gray-50 rounded-xl shadow-lg p-6">

                        <h3 className="text-2xl font-bold mb-4">

                            Risk Assessment

                        </h3>

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-5xl font-bold text-blue-600">

                                    {result.risk_score}/100

                                </p>

                                <p className="text-lg mt-2">

                                    Risk Level:
                                    <strong> {result.risk_level}</strong>

                                </p>

                            </div>

                            <div className="w-64">

                                <div className="w-full bg-gray-300 rounded-full h-4">

                                    <div

                                        className={`h-4 rounded-full ${
                                            result.risk_score < 40
                                                ? "bg-green-500"
                                                : result.risk_score < 60
                                                ? "bg-yellow-500"
                                                : result.risk_score < 80
                                                ? "bg-orange-500"
                                                : "bg-red-600"
                                        }`}

                                        style={{
                                            width: `${result.risk_score}%`
                                        }}

                                    ></div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Behaviour Summary */}

{/* Behaviour Comparison */}

<div className="bg-white rounded-xl shadow-lg p-6">

    <h3 className="text-2xl font-bold mb-5">
        Behaviour Comparison
    </h3>

    <p className="text-gray-500 mb-5">
        Comparison between the employee's historical behavioural baseline
        and the latest observed activity.
    </p>

    <div className="overflow-x-auto">

        <table className="w-full text-center border rounded-lg overflow-hidden">

            <thead className="bg-slate-100">

                <tr>

                    <th className="p-4 border">
                        Metric
                    </th>

                    <th className="p-4 border">
                        Behavioural Baseline
                    </th>

                    <th className="p-4 border">
                        Current Activity
                    </th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td className="border p-4 font-semibold">
                        📧 Email Size
                    </td>

                    <td className="border p-4">
                        {Math.round(result.baseline?.email_size)} Bytes
                    </td>

                    <td className="border p-4">
                        {result.current?.email_size} Bytes
                    </td>

                </tr>

                <tr>

                    <td className="border p-4 font-semibold">
                        📎 Attachments
                    </td>

                    <td className="border p-4">
                        {result.baseline?.attachment_count}
                    </td>

                    <td className="border p-4">
                        {result.current?.attachment_count}
                    </td>

                </tr>

                <tr>

                    <td className="border p-4 font-semibold">
                        📝 Content Length
                    </td>

                    <td className="border p-4">
                        {Math.round(result.baseline?.content_length)}
                    </td>

                    <td className="border p-4">
                        {result.current?.content_length}
                    </td>

                </tr>

                <tr>

                    <td className="border p-4 font-semibold">
                        🕒 Working Hour
                    </td>

                    <td className="border p-4">
                        {Math.round(result.baseline?.hour)}:00
                    </td>

                    <td className="border p-4">
                        {result.current?.hour}:00
                    </td>

                </tr>

            </tbody>

        </table>

    </div>

</div>

                    {/* AI Analysis */}

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h3 className="text-2xl font-bold mb-4">

                            AI Behaviour Analysis

                        </h3>

                        <p className="leading-8 text-gray-700">

                            {result.analysis}

                        </p>

                    </div>

                    {/* Justification */}

                    <div className="bg-white rounded-xl shadow-lg p-6">

                        <h3 className="text-2xl font-bold mb-4">

                            Risk Justification

                        </h3>

                        <ul className="list-disc ml-6 space-y-3">

                            {result.justification.map((item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            ))}

                        </ul>

                    </div>

                    {/* Recommendation */}

                    <div className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-8 border-blue-600">

                        <h3 className="text-2xl font-bold mb-4">

                            Security Recommendation

                        </h3>

                        <p className="text-lg leading-8">

                            {result.recommendation}

                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}

export default ThreatDetection;