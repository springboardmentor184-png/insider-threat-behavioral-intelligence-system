import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Profile() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2>Profile</h2>

          <p>
            User profile information will be displayed here after backend integration.
          </p>

          <div className="table-card">
            <h4>Profile Details</h4>

            <table className="activity-table">
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>Darshan Lohakare</td>
                </tr>

                <tr>
                  <th>Role</th>
                  <td>Administrator</td>
                </tr>

                <tr>
                  <th>Email</th>
                  <td>darshan@example.com</td>
                </tr>

                <tr>
                  <th>Status</th>
                  <td>
                    <span className="badge badge-low">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;