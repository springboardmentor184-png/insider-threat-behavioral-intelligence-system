import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar
} from "recharts";

function DepartmentBarChart({ data }) {

    return (

        <div className="glass-card rounded-2xl p-6">

            <h2 className="text-xl font-bold text-white mb-6">

                Department Risk

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart data={data}>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                    />

                    <XAxis
                        dataKey="department"
                        tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    />

                    <YAxis
                        tick={{ fill: "#cbd5e1" }}
                    />

                    <Tooltip />

                    <Bar
                        dataKey="risk"
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default DepartmentBarChart;