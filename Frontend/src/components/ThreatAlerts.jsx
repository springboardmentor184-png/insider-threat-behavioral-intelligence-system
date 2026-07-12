function ThreatAlerts() {
  const alerts = [
    {
      id: 1,
      level: "High",
      title: "USB Device Detected",
      employee: "John Smith",
      time: "2 min ago",
    },
    {
      id: 2,
      level: "Medium",
      title: "Multiple Failed Logins",
      employee: "Emma Johnson",
      time: "10 min ago",
    },
    {
      id: 3,
      level: "Low",
      title: "Late Night Login",
      employee: "Alex Brown",
      time: "25 min ago",
    },
  ];

  return (
    <div className="alerts-card">
      <h4>🚨 Recent Threat Alerts</h4>

      {alerts.map((alert) => (
        <div className="alert-item" key={alert.id}>
          <div className={`alert-level alert-${alert.level.toLowerCase()}`}>
            {alert.level}
          </div>

          <div className="alert-content">
            <h5>{alert.title}</h5>

            <p>
              <strong>Employee:</strong> {alert.employee}
            </p>

            <small>{alert.time}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThreatAlerts;