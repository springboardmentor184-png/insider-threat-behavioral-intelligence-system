import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Employee"
    });


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/register",
                formData
            );

            alert(response.data.message);

        } catch (error) {
            alert(
                error.response?.data?.error ||
                "Registration failed"
            );
        }
    };


    return (

        <div className="min-h-screen bg-slate-950 flex items-center justify-center">

            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl p-8">


                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-white mb-2">
                        🛡️ Insider Threat
                    </h1>

                    <p className="text-slate-400">
                        Behavioral Intelligence System
                    </p>

                </div>



                <h2 className="text-xl font-semibold text-white mb-6 text-center">
                    Create Account
                </h2>



                <form 
                    onSubmit={handleRegister}
                    className="space-y-4"
                >


                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="
                        w-full 
                        p-3 
                        rounded-lg 
                        bg-slate-800 
                        text-white 
                        border 
                        border-slate-700
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        "
                    />



                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="
                        w-full 
                        p-3 
                        rounded-lg 
                        bg-slate-800 
                        text-white 
                        border 
                        border-slate-700
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        "
                    />



                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="
                        w-full 
                        p-3 
                        rounded-lg 
                        bg-slate-800 
                        text-white 
                        border 
                        border-slate-700
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        "
                    />



                    <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    className="
    w-full
    p-3
    rounded-lg
    bg-slate-800
    text-white
    border
    border-slate-700
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    "
>

    <option value="Employee">
        Employee
    </option>

    <option value="Security Analyst">
        Security Analyst
    </option>

    <option value="SOC Engineer">
        SOC Engineer
    </option>

    <option value="Security Manager">
        Security Manager
    </option>

    <option value="Administrator">
        Administrator
    </option>

</select>



                    <button
                        type="submit"
                        className="
                        w-full
                        p-3
                        rounded-lg
                        bg-blue-600
                        text-white
                        font-semibold
                        hover:bg-blue-700
                        transition
                        "
                    >
                        Register
                    </button>


                </form>



                <p className="text-center text-slate-400 mt-6">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-400 ml-2 hover:underline"
                    >
                        Login
                    </Link>

                </p>


            </div>


        </div>

    );
}

export default Register;