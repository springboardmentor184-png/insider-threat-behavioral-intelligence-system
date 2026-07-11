import React from "react";
import "../App.css";

const Dashboard = () => {
  const role = localStorage.getItem("role");

  switch (role) {
    case "Security Analyst":
      return <div className="dashboard"><h2>Security Analyst Dashboard</h2><p>Threat alerts & risk scores</p></div>;
    case "SOC Engineer":
      return <div className="dashboard"><h2>SOC Dashboard</h2><p>Security events & investigations</p></div>;
    case "Security Manager":
      return <div className="dashboard"><h2>Manager Dashboard</h2><p>Risk trends & compliance metrics</p></div>;
    case "Administrator":
      return <div className="dashboard"><h2>Admin Dashboard</h2><p>User management & system monitoring</p></div>;
    default:
      return <div className="dashboard"><h2>Access Denied</h2></div>;
  }
};

export default Dashboard;
