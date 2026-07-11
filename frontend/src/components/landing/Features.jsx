import React from 'react';
import { Users, Activity, ShieldAlert, FileWarning, Search, FileText } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Users className="text-primary" size={24} />,
      title: "Employee Monitoring",
      description: "Seamlessly monitor activity across your enterprise network without compromising system performance."
    },
    {
      icon: <Activity className="text-accent" size={24} />,
      title: "Behavior Analytics",
      description: "Establish baselines and identify anomalous behavior patterns indicating potential insider threats."
    },
    {
      icon: <ShieldAlert className="text-danger" size={24} />,
      title: "Threat Intelligence",
      description: "Leverage advanced heuristics to categorize and score threats based on severity and potential impact."
    },
    {
      icon: <FileWarning className="text-warning" size={24} />,
      title: "Risk Assessment",
      description: "Continuously evaluate organizational risk posture with real-time scoring and dynamic updates."
    },
    {
      icon: <Search className="text-primary" size={24} />,
      title: "Incident Investigation",
      description: "Deep-dive into security events with comprehensive logs, timelines, and contextual evidence."
    },
    {
      icon: <FileText className="text-accent" size={24} />,
      title: "Security Reports",
      description: "Generate compliance-ready reports and executive summaries with actionable security insights."
    }
  ];

  return (
    <section id="features" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-6">Comprehensive Threat Defense</h2>
          <p className="text-lg text-subtext">Everything you need to detect, investigate, and mitigate insider risks before data is compromised.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-10 rounded-[16px] shadow-sm border border-border-color hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8">
                {feature.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-main mb-4">{feature.title}</h3>
              <p className="text-subtext leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;