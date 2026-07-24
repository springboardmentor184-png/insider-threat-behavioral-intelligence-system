
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Settings() {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold mb-2">
            Settings
          </h1>

          <p className="text-gray-500 mb-8">
            Manage your account and application preferences
          </p>

          <div className="grid grid-cols-2 gap-6">

            {/* Profile */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-5">
                Profile
              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Name"
                  defaultValue="Security Manager"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="email"
                  placeholder="Email"
                  defaultValue="manager@company.com"
                  className="w-full border rounded-lg p-3"
                />

                <button className="bg-cyan-500 text-white px-5 py-2 rounded-lg hover:bg-cyan-600">
                  Save Changes
                </button>

              </div>

            </div>

            {/* Preferences */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-5">
                Preferences
              </h2>

              <div className="space-y-5">

                <label className="flex justify-between items-center">
                  <span>Email Notifications</span>
                  <input type="checkbox" defaultChecked />
                </label>

                <label className="flex justify-between items-center">
                  <span>Dark Mode</span>
                  <input type="checkbox" />
                </label>

                <label className="flex justify-between items-center">
                  <span>Auto Report Generation</span>
                  <input type="checkbox" defaultChecked />
                </label>

              </div>

            </div>

            {/* Security */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-5">
                Security
              </h2>

              <button className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600">
                Change Password
              </button>

            </div>

            {/* Logout */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="text-xl font-bold mb-5">
                Account
              </h2>

              <button className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-700">
                Logout
              </button>

            </div>

          </div>

<Footer />
        </div>
      </div>
    </div>
  );
}