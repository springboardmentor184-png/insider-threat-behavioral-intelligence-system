import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

import RiskPieChart from "../components/charts/RiskPieChart";
import DepartmentBarChart from "../components/charts/DepartmentBarChart";

function RiskAnalytics() {

    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {

        const fetchAnalytics = async () => {

            try {

                const response = await axios.get(
                    "http://127.0.0.1:5000/analytics"
                );

                setAnalytics(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        fetchAnalytics();

    }, []);

    if (!analytics) {

        return (

            <div className="text-white text-2xl p-10">

                Loading Analytics...

            </div>

        );

    }

    return (

        <div className="flex">

            <Sidebar role="Admin" />

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Administrator"
                />

                <div className="p-8">

                    <div className="grid grid-cols-5 gap-6 mb-8">

                        <StatCard
                            title="Employees"
                            value={analytics.summary.employees}
                        />

                        <StatCard
                            title="Reports"
                            value={analytics.summary.reports}
                        />

                        <StatCard
                            title="Investigations"
                            value={analytics.summary.investigations}
                        />

                        <StatCard
                            title="Highest Risk"
                            value={analytics.summary.highestScore}
                        />

                        <StatCard
                            title="Employee"
                            value={analytics.summary.highestEmployee}
                        />

                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">

                        <RiskPieChart
                            data={analytics.riskDistribution}
                        />

                        <DepartmentBarChart
                            data={analytics.departmentRisk}
                        />

                    </div>

                </div>

            </div>

        </div>

    );

}

export default RiskAnalytics;