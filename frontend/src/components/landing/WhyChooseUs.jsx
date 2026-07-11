import React from 'react';
import { Target, ShieldCheck, Clock } from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <Target size={40} className="text-primary mb-6" />,
      title: "Accurate Detection",
      desc: "Minimize false positives with advanced behavioral baselining and contextual intelligence built specifically for enterprise scale."
    },
    {
      icon: <ShieldCheck size={40} className="text-accent mb-6" />,
      title: "Enterprise Security",
      desc: "Built for scale, privacy, and strict compliance with SOC2, ISO27001, and global data protection requirements."
    },
    {
      icon: <Clock size={40} className="text-success mb-6" />,
      title: "Real-time Monitoring",
      desc: "Instant alerts and dynamic risk scoring ensure your security operations center can respond to critical threats immediately."
    }
  ];

  return (
    <section id="about" className="py-32 bg-white border-y border-border-color">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {reasons.map((item, index) => (
            <div key={index} className="flex flex-col items-start group">
              <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100 mb-6 group-hover:bg-slate-100 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-heading text-2xl font-bold text-text-main mb-4">{item.title}</h3>
              <p className="text-subtext leading-relaxed text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;