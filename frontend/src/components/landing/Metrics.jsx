import React from 'react';

const Metrics = () => {
  const metrics = [
    { value: "99.8%", label: "Detection Accuracy" },
    { value: "2M+", label: "Events Processed Daily" },
    { value: "<5 sec", label: "Threat Detection Time" },
    { value: "24/7", label: "Continuous Monitoring" }
  ];

  return (
    <section className="py-12 border-y border-border-color bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border-color">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-2">{metric.value}</span>
              <span className="text-sm font-medium text-subtext uppercase tracking-wider">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;