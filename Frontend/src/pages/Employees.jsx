import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Employees() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2>Employees</h2>

          <p>
            This page will display all employees, their departments,
            roles, and current status after backend integration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Employees;