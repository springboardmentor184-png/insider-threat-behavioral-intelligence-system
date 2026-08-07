import {
    Users,
    ShieldAlert,
    Bell,
    Activity,
    TrendingUp,
    Database
} from "lucide-react";

function StatCard({ title, value }) {

    const getIcon = () => {

        switch (title.toLowerCase()) {

            case "employees":
                return <Users size={26} className="text-indigo-400" />;

            case "departments":
                return <Database size={26} className="text-purple-400" />;

            case "devices":
                return <Activity size={26} className="text-blue-400" />;

            case "alerts":
                return <Bell size={26} className="text-red-400" />;

            case "anomalies":
                return <ShieldAlert size={26} className="text-orange-400" />;

            default:
                return <TrendingUp size={26} className="text-indigo-400" />;

        }

    };

    return (

        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold text-white mt-3">

                        {value}

                    </h2>

                </div>

                <div className="w-14 h-14 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-center">

                    {getIcon()}

                </div>

            </div>

            <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>

        </div>

    );

}

export default StatCard;