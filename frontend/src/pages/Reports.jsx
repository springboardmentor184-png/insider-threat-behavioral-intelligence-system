
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Footer from "../components/Footer";

const barData = [
  { month: "Jan", threats: 12 },
  { month: "Feb", threats: 18 },
  { month: "Mar", threats: 10 },
  { month: "Apr", threats: 22 },
  { month: "May", threats: 15 },
  { month: "Jun", threats: 28 },
];

const pieData = [
  { name: "Low", value: 55 },
  { name: "Medium", value: 30 },
  { name: "High", value: 15 },
];

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export default function Reports() {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">

          <div className="flex justify-between items-center mb-6">

            <div>
              <h1 className="text-3xl font-bold">
                Reports
              </h1>

              <p className="text-gray-500">
                Analytics & Threat Summary
              </p>
            </div>

            <div className="space-x-3">
              <button className="bg-cyan-500 text-white px-5 py-2 rounded-xl hover:bg-cyan-600">
                Export CSV
              </button>

              <button className="bg-green-500 text-white px-5 py-2 rounded-xl hover:bg-green-600">
                Download PDF
              </button>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-4">
                Monthly Threats
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <Bar dataKey="threats" fill="#06b6d4" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>

            </div>

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-4">
                Threat Categories
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry,index)=>(
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                </PieChart>
              </ResponsiveContainer>

            </div>

          </div>

<Footer />
        </div>

      </div>
    </div>
  );
}