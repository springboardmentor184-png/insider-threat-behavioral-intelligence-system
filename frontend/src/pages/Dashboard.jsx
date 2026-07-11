import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    total_activities: 0,
    admins: 0,
    employees: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/dashboard/");
        setStats(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "#2563eb",
            color: "white",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <h3>Total Employees</h3>
          <h2>{stats.total_employees}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#16a34a",
            color: "white",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <h3>Total Activities</h3>
          <h2>{stats.total_activities}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#ea580c",
            color: "white",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <h3>Admins</h3>
          <h2>{stats.admins}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#7c3aed",
            color: "white",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <h3>Employees</h3>
          <h2>{stats.employees}</h2>
        </div>
      </div>
    </div>
  );
}