import os

base = r'c:\Users\Dhanush\Desktop\insider-threat-behavioral-intelligence-system\frontend'

files = {}

files['src/components/layout/Navbar.jsx'] = """import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-cards shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to={ROUTES.LANDING} className="flex items-center gap-3">
          <Shield size={28} className="text-primary" />
          <div className="flex flex-col">
            <span className="font-heading text-text-main font-bold text-xl leading-tight">InsiderShield</span>
            <span className="text-[10px] text-subtext font-medium leading-tight">Enterprise Insider Threat Intelligence</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-subtext font-medium text-sm">
          <a href="#platform" className="hover:text-primary transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#documentation" className="hover:text-primary transition-colors">Documentation</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-text-main hover:text-primary transition-colors py-2 px-4 font-medium text-sm">Login</Link>
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-2 px-5 hover:opacity-90 hover:-translate-y-[1px] transition-all duration-200 font-medium text-sm shadow-sm">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;"""

files['src/components/layout/Footer.jsx'] = """import React from 'react';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border-color pt-20 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={28} className="text-primary" />
              <div className="flex flex-col">
                <span className="font-heading text-text-main font-bold text-xl leading-tight">InsiderShield</span>
                <span className="text-[10px] text-subtext font-medium leading-tight">Enterprise Insider Threat Intelligence</span>
              </div>
            </div>
            <p className="text-subtext text-sm leading-relaxed">
              Enterprise-grade behavioral intelligence and insider threat detection platform for modern organizations.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Solutions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-subtext text-sm">
            &copy; {new Date().getFullYear()} InsiderShield Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-subtext">
            <a href="#" className="hover:text-text-main transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-main transition-colors">Terms</a>
            <a href="#" className="hover:text-text-main transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;"""

files['src/components/landing/Hero.jsx'] = """import React from 'react';
import { ArrowRight, Monitor, Activity, Brain, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Metrics from './Metrics';

const Hero = () => {
  return (
    <>
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 container mx-auto flex flex-col lg:flex-row items-center gap-16">
      <div className="flex-1 space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-main leading-[1.15]">
          Protect Your Organization from <span className="text-primary">Insider Threats</span> Before They Become Incidents.
        </h1>
        <p className="text-lg text-subtext leading-relaxed max-w-2xl">
          Enterprise-grade behavioral analytics, threat detection, and risk scoring to monitor activity and secure your workforce seamlessly.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-3 px-8 font-medium hover:bg-opacity-90 hover:-translate-y-[1px] transition-all duration-200 flex items-center gap-2 shadow-sm">
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#dashboard" className="bg-white text-text-main border border-border-color rounded-[16px] py-3 px-8 font-medium shadow-sm hover:bg-gray-50 hover:-translate-y-[1px] transition-all duration-200">
            View Dashboard
          </a>
        </div>
      </div>
      
      <div className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-[600px] p-6 bg-white border border-border-color rounded-[24px] shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-border-color pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
            <div className="text-xs text-subtext font-medium uppercase tracking-wider">InsiderShield Pipeline</div>
          </div>
          
          <div className="space-y-4">
            {/* Flow Step 1 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Monitor className="text-subtext" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">Employee Devices</h4>
                <p className="text-xs text-subtext">Continuous telemetry collection</p>
              </div>
              <div className="text-success text-xs font-semibold bg-green-50 px-2 py-1 rounded-md">Active</div>
            </div>

            {/* Flow Step 2 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 ml-6 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Activity className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">Behavior Monitoring</h4>
                <p className="text-xs text-subtext">Pattern baseline establishment</p>
              </div>
              <div className="text-xs text-subtext font-medium border border-border-color px-2 py-1 rounded-md bg-white">Real-time</div>
            </div>

            {/* Flow Step 3 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 ml-12 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Brain className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">AI Risk Analysis</h4>
                <p className="text-xs text-subtext">Anomaly detection & scoring</p>
              </div>
              <div className="text-warning text-xs font-semibold bg-orange-50 px-2 py-1 rounded-md">99.8% Acc</div>
            </div>

            {/* Flow Step 4 */}
            <div className="flex items-center p-4 bg-primary text-white rounded-[16px] shadow-md ml-16 hover:-translate-y-1 transition-transform">
              <div className="bg-white/10 p-3 rounded-[12px] mr-4">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-white text-sm">Threat Alert Dashboard</h4>
                <p className="text-xs text-white/80">Security team notification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Metrics />
    </>
  );
};

export default Hero;"""

files['src/components/landing/Metrics.jsx'] = """import React from 'react';

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

export default Metrics;"""


files['src/components/landing/Features.jsx'] = """import React from 'react';
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

export default Features;"""


files['src/components/landing/HowItWorks.jsx'] = """import React from 'react';
import { Database, Brain, Calculator, ShieldAlert, Bell, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { icon: <Database size={20} />, label: "Collect Employee Activity" },
    { icon: <Brain size={20} />, label: "Behavior Analysis" },
    { icon: <Calculator size={20} />, label: "Risk Score Engine" },
    { icon: <ShieldAlert size={20} />, label: "Threat Detection" },
    { icon: <Bell size={20} />, label: "Security Alert" }
  ];

  return (
    <section className="py-32 bg-white border-y border-border-color">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-24">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-6">Automated Intelligence Pipeline</h2>
          <p className="text-lg text-subtext">A streamlined, automated workflow that turns raw data into actionable security intelligence instantly.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 relative max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center bg-white z-10 w-40 hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-[16px] bg-slate-50 border border-border-color flex items-center justify-center text-primary shadow-sm mb-6">
                  {step.icon}
                </div>
                <div className="text-center">
                  <span className="font-heading font-semibold text-text-main text-sm block leading-snug">{step.label}</span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex flex-1 items-center justify-center mx-2">
                  <div className="h-px bg-border-color w-full relative flex items-center justify-end">
                    <ArrowRight size={14} className="text-border-color absolute -right-1" />
                  </div>
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="lg:hidden py-4 text-border-color">
                  <ArrowRight size={24} className="rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;"""


files['src/components/landing/Modules.jsx'] = """import React from 'react';
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

export default Modules;"""


files['src/components/landing/WhyChooseUs.jsx'] = """import React from 'react';
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

export default WhyChooseUs;"""


files['src/components/landing/CTA.jsx'] = """import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const CTA = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-secondary rounded-[24px] p-16 md:p-24 text-center overflow-hidden shadow-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-8 leading-tight">
              Ready to secure your organization?
            </h2>
            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Deploy our behavioral intelligence system today and stop insider threats before data leaves your network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-4 px-10 font-semibold hover:bg-opacity-90 hover:-translate-y-1 transition-all duration-200 shadow-sm">
                Get Started
              </Link>
              <a href="#contact" className="bg-white/5 text-white border border-white/10 rounded-[16px] py-4 px-10 font-semibold hover:bg-white/10 hover:-translate-y-1 transition-all duration-200">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;"""

for path, content in files.items():
    full_path = os.path.join(base, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
