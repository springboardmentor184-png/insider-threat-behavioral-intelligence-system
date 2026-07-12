function StatCard({ title, value, icon, color, change }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">

        <div>
          <h6>{title}</h6>
          <h2>{value}</h2>
          <p>{change}</p>
        </div>

        <div className={`stat-icon ${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>

      </div>
    </div>
  );
}

export default StatCard;