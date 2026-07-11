import React from 'react';
import { Activity, Search, AlertTriangle, BarChart3 } from 'lucide-react';

const TrustIndicators = () => {
  const indicators = [
    { icon: <Activity size={24} />, title: "Behavior Analytics" },
    { icon: <Search size={24} />, title: "Activity Monitoring" },
    { icon: <AlertTriangle size={24} />, title: "Threat Detection" },
    { icon: <BarChart3 size={24} />, title: "Risk Scoring" }
  ];

  return (
    <section className="py-12 border-y border-border-color bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {indicators.map((item, index) => (
            <div key={index} className="flex items-center justify-center gap-3 text-subtext hover:text-primary transition-colors">
              {item.icon}
              <span className="font-medium font-heading">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;