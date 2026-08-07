import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

const COLORS = [
    "#22c55e", // Low
    "#facc15", // Medium
    "#f97316", // High
    "#ef4444"  // Critical
];

function RiskPieChart({ data }) {

    return (

        <div className="glass-card rounded-2xl p-6">

            <h2 className="text-xl font-bold text-white mb-6">

                Risk Distribution

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        innerRadius={55}
                        paddingAngle={4}
                    >

                        {data.map((entry, index) => (

                            <Cell
                                key={index}
                                fill={COLORS[index]}
                            />

                        ))}

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </div>

    );

}

export default RiskPieChart;