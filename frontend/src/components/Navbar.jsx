import {
    Search,
    Bell,
    Moon,
    UserCircle
} from "lucide-react";

function Navbar({ name, role }) {

    return (

        <header className="flex items-center justify-between px-8 py-5 bg-[#111827] border-b border-slate-700">

            {/* Left */}

            <div>

                <h2 className="text-3xl font-bold text-white">

                    Dashboard

                </h2>

                <p className="text-slate-400 mt-1">

                    Welcome back, {name}

                </p>

            </div>

            {/* Center */}

            <div className="hidden lg:flex items-center w-[420px] bg-[#1E293B] rounded-xl px-4 py-3 border border-slate-700">

                <Search
                    size={18}
                    className="text-slate-400"
                />

                <input
                    type="text"
                    placeholder="Search employees..."
                    className="ml-3 bg-transparent outline-none text-white w-full placeholder:text-slate-500"
                />

            </div>

            {/* Right */}

            <div className="flex items-center gap-4">

                <button className="w-11 h-11 rounded-xl bg-[#1E293B] hover:bg-[#2A3A55] transition flex items-center justify-center">

                    <Moon
                        size={20}
                        className="text-slate-300"
                    />

                </button>

                <button className="relative w-11 h-11 rounded-xl bg-[#1E293B] hover:bg-[#2A3A55] transition flex items-center justify-center">

                    <Bell
                        size={20}
                        className="text-slate-300"
                    />

                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>

                </button>

                <div className="flex items-center gap-3 bg-[#1E293B] px-4 py-2 rounded-xl border border-slate-700">

                    <UserCircle
                        size={34}
                        className="text-[#7C6BFF]"
                    />

                    <div>

                        <p className="text-white font-semibold">

                            {name}

                        </p>

                        <p className="text-sm text-slate-400">

                            {role}

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Navbar;