import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const PredictionCard = () => {
  const data = [
    { name: 'Risk', value: 82 },
    { name: 'Safe', value: 18 }
  ];
  const COLORS = ['#EF4444', '#F1F5F9'];

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-border-color p-6 h-full flex flex-col">
      <h3 className="font-heading font-semibold text-text-main flex items-center gap-2 mb-4">
        <BrainCircuit size={18} className="text-accent" />
        AI Risk Prediction
      </h3>
      
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-heading text-danger">82%</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-subtext mb-1">Current Status</div>
            <div className="text-sm font-medium text-danger">High Predictive Risk</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-subtext mb-1">AI Recommendation</div>
            <div className="text-sm font-medium text-text-main bg-slate-50 p-3 rounded-[8px] border border-slate-200">
              Increase monitoring for Finance Department. Correlated anomalies detected in off-hours access patterns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;