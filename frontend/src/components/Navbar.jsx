import {
  Bell,
  Moon,
  Search,
} from "lucide-react";

export default function Navbar() {
  return (
    <div className="bg-white h-20 shadow-sm flex items-center justify-between px-8">

      {/* Left Side */}

      <div>

        <h2 className="text-2xl font-bold text-slate-800">
          Security Operations Center
        </h2>

        <p className="text-gray-500 text-sm">
          Monitor insider threats in real time
        </p>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 w-72">

          <Search size={18} className="text-gray-500"/>

          <input
            type="text"
            placeholder="Search employees..."
            className="bg-transparent outline-none ml-3 w-full"
          />

        </div>

        {/* Notification */}

        <button className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200">
          <Bell size={20}/>
        </button>

        {/* Dark Mode */}

        <button className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200">
          <Moon size={20}/>
        </button>

        {/* Profile */}

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
            A
          </div>

          <div>

            <h3 className="font-semibold">
              Admin
            </h3>

            <p className="text-gray-500 text-sm">
              Security Analyst
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}