import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div>
      <Navbar />

      <h1>Dashboard</h1>

      <Link to="/profile">
        <button>Profile</button>
      </Link>
    </div>
  );
}

export default Dashboard;