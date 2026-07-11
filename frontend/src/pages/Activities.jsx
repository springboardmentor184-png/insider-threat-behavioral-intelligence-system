import { useEffect, useState } from "react";
import api from "../services/api";

export default function Activities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await api.get("/activities/");
        setActivities(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadActivities();
  }, []);

  return (
    <div>
      <h1>Activity Logs</h1>

      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Activity</th>
            <th>Device</th>
            <th>IP Address</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>{activity.id}</td>
              <td>{activity.employee_id}</td>
              <td>{activity.activity_type}</td>
              <td>{activity.device}</td>
              <td>{activity.ip_address}</td>
              <td>{activity.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}