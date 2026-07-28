import React from "react";
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import API_URL from '../services/api';

const COLORS = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#ef4444' };

function RiskDistributionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/behavior/risk_summary`)
    .then((res) => res.json())
    .then((data) => setData(data));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="category" outerRadius={100} label>
          {data.map((entry, i) => <Cell key={i} fill={COLORS[entry.category]} />)}
        </Pie>
        <Tooltip /><Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default RiskDistributionChart;