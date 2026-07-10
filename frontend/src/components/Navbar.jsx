function Navbar({ name, role }) {

    return (

        <div className="bg-white shadow-md px-8 py-5 flex justify-between items-center">

            <div>

                <h2 className="text-2xl font-bold text-slate-800">
                    Dashboard
                </h2>

                <p className="text-slate-500">
                    Welcome back, {name}
                </p>

            </div>

            <div className="bg-blue-600 text-white px-4 py-2 rounded-full">

                {role}

            </div>

        </div>

    );

}

export default Navbar;