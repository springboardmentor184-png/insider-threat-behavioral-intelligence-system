import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-[420px]">

        <div className="flex justify-center mb-5">
          <div className="bg-cyan-500 p-4 rounded-full">
            <ShieldCheck size={45} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-800">
          InsiderShield
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Insider Threat Behavioral Intelligence System
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full border rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Login
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 InsiderShield
        </p>

      </div>

    </div>
  );
}