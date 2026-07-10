import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


function Login() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });



    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };



    const handleLogin = async (e) => {

        e.preventDefault();


        try {

            const response = await axios.post(
    "http://127.0.0.1:5000/login",
    {
        email: formData.email,
        password: formData.password
    },
    {
        headers: {
            "Content-Type": "application/json"
        }
    }
);


            alert(
                "Welcome " +
                response.data.name +
                "\nRole: " +
                response.data.role
            );


            // Navigate based on user role

switch (response.data.role) {

    case "Administrator":
        navigate("/admin");
        break;

    case "Security Manager":
        navigate("/manager");
        break;

    case "Security Analyst":
        navigate("/analyst");
        break;

    case "SOC Engineer":
        navigate("/soc");
        break;

    case "Employee":
        navigate("/employee");
        break;

    default:
        alert("Unknown user role.");
}



        } catch (error) {

    console.error(error);

    alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed"
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




                <h2 className="text-xl font-semibold text-white text-center mb-6">
                    Login
                </h2>





                <form 
                    onSubmit={handleLogin}
                    className="space-y-4"
                >



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
                        Login
                    </button>




                </form>





                <p className="text-center text-slate-400 mt-6">

                    Don't have an account?


                    <Link
                        to="/"
                        className="text-blue-400 ml-2 hover:underline"
                    >
                        Register
                    </Link>


                </p>




            </div>


        </div>

    );

}


export default Login;