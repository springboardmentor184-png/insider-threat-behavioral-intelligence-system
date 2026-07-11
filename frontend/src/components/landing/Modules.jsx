import React from 'react';
import { Lock, Users, Activity, Brain, LineChart, FileSpreadsheet, ArrowRight } from 'lucide-react';

const Modules = () => {
  const modules = [
    { 
      icon: <Lock size={20} />, 
      title: "Authentication", 
      color: "text-accent",
      desc: "Secure identity verification and access control policies."
    },
    { 
      icon: <Users size={20} />, 
      title: "Employee Management", 
      color: "text-primary",
      desc: "Centralized directory for workforce identity governance."
    },
    { 
      icon: <Activity size={20} />, 
      title: "Activity Logs", 
      color: "text-subtext",
      desc: "Immutable audit trails for compliance and forensics."
    },
    { 
      icon: <Brain size={20} />, 
      title: "Behavior Analytics", 
      color: "text-warning",
      desc: "Machine learning models predicting insider anomalies."
    },
    { 
      icon: <LineChart size={20} />, 
      title: "Risk Dashboard", 
      color: "text-danger",
      desc: "Real-time visibility into organizational risk posture."
    },
    { 
      icon: <FileSpreadsheet size={20} />, 
      title: "Reporting", 
      color: "text-success",
      desc: "Automated executive summaries and compliance reports."
    }
  ];

  return (
    <section id="modules" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-6">Platform Modules</h2>
          <p className="text-lg text-subtext">A unified suite of enterprise tools designed for complete visibility and proactive control.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, index) => (
            <div key={index} className="bg-white p-8 rounded-[16px] shadow-sm border border-border-color flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors ${mod.color}`}>
                  {mod.icon}
                </div>
                <span className="font-heading font-semibold text-text-main text-lg">{mod.title}</span>
              </div>
              <p className="text-subtext text-sm leading-relaxed mb-6 flex-1">{mod.desc}</p>
              <div className="flex items-center text-primary text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                Learn More <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modules;