function ActivityTable() {
  const activities = [
    {
      id: 1,
      employee: "John Smith",
      department: "Finance",
      activity: "File Download",
      risk: "High",
      time: "09:45 AM",
      status: "⚠"
    },
    {
      id: 2,
      employee: "Emma Johnson",
      department: "HR",
      activity: "Login",
      risk: "Low",
      time: "10:20 AM",
      status: "✔"
    },
    {
      id: 3,
      employee: "Alex Brown",
      department: "IT",
      activity: "USB Access",
      risk: "Medium",
      time: "11:15 AM",
      status: "●"
    },
    {
      id: 4,
      employee: "Sophia Davis",
      department: "Sales",
      activity: "Email Sent",
      risk: "Low",
      time: "12:05 PM",
      status: "✔"
    }
  ];

  return (
    <div className="table-card">

      <h4>Recent Activity</h4>

      <table className="activity-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Activity</th>
            <th>Risk</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {activities.map((item) => (

                <tr key={item.id}>
                <td>{item.employee}</td>

                <td>{item.department}</td>

                <td>{item.activity}</td>

                <td>
                    <span className={`badge badge-${item.risk.toLowerCase()}`}>
                    {item.risk}
                    </span>
                </td>

                <td>{item.time}</td>

                <td>{item.status}</td>
                </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ActivityTable;