import os

base = r'c:\Users\Dhanush\Desktop\insider-threat-behavioral-intelligence-system\frontend'
landing_dir = os.path.join(base, 'src/components/landing')
os.makedirs(landing_dir, exist_ok=True)

layout_dir = os.path.join(base, 'src/components/layout')
pages_dir = os.path.join(base, 'src/pages/Landing')

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
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-cards shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2 text-primary font-bold text-xl">
          <Shield size={28} className="text-primary" />
          <span className="font-heading text-text-main">ITBIS</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-subtext font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-text-main hover:text-primary transition-colors py-2 px-4 font-medium">Login</Link>
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-2 px-5 hover:opacity-90 transition-opacity font-medium shadow-sm">Get Started</Link>
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
    <footer className="bg-white border-t border-border-color pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Shield size={28} className="text-primary" />
              <span className="font-heading text-text-main">ITBIS</span>
            </div>
            <p className="text-subtext text-sm leading-relaxed">
              Enterprise-grade behavioral intelligence and insider threat detection platform for modern organizations.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#modules" className="hover:text-primary transition-colors">Modules</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Whitepapers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Sales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partnerships</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-subtext text-sm">
            &copy; {new Date().getFullYear()} Insider Threat Behavioral Intelligence System. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-subtext">
            <a href="#" className="hover:text-text-main transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-main transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;"""


files['src/components/landing/Hero.jsx'] = """import React from 'react';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 container mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-main leading-tight">
          Protect Your Organization from <span className="text-primary">Insider Threats</span> Before They Become Incidents.
        </h1>
        <p className="text-lg text-subtext leading-relaxed max-w-2xl">
          Enterprise-grade behavioral analytics, threat detection, and risk scoring to monitor activity and secure your workforce seamlessly.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-3 px-6 font-medium shadow-[0_4px_14px_0_rgba(15,118,110,0.39)] hover:shadow-[0_6px_20px_rgba(15,118,110,0.23)] hover:opacity-90 transition-all flex items-center gap-2">
            Request Demo <ArrowRight size={18} />
          </Link>
          <a href="#features" className="bg-white text-text-main border border-border-color rounded-[16px] py-3 px-6 font-medium shadow-sm hover:border-gray-300 transition-all">
            Explore Platform
          </a>
        </div>
      </div>
      
      <div className="flex-1 relative w-full">
        <div className="relative w-full max-w-lg mx-auto">
          {/* Abstract SVG Illustration reflecting enterprise dashboard/monitoring */}
          <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl">
            <rect width="500" height="400" rx="24" fill="#FFFFFF" />
            <rect x="30" y="30" width="440" height="50" rx="12" fill="#F8FAFC" />
            <circle cx="60" cy="55" r="8" fill="#E5E7EB" />
            <circle cx="90" cy="55" r="8" fill="#E5E7EB" />
            <rect x="30" y="110" width="280" height="200" rx="16" fill="#F8FAFC" />
            <rect x="330" y="110" width="140" height="90" rx="16" fill="#F8FAFC" />
            <rect x="330" y="220" width="140" height="90" rx="16" fill="#F8FAFC" />
            
            {/* Charts representation */}
            <path d="M60 260 L100 200 L140 230 L190 150 L230 180 L280 140" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="280" cy="140" r="6" fill="#0F766E" />
            <rect x="60" y="150" width="20" height="10" rx="4" fill="#E5E7EB" />
            <rect x="60" y="170" width="40" height="10" rx="4" fill="#E5E7EB" />
            
            {/* Right side stats */}
            <rect x="350" y="130" width="40" height="40" rx="10" fill="#DBEAFE" />
            <rect x="350" y="240" width="40" height="40" rx="10" fill="#FEE2E2" />
            <rect x="405" y="140" width="45" height="8" rx="4" fill="#64748B" />
            <rect x="405" y="155" width="30" height="6" rx="3" fill="#CBD5E1" />
            <rect x="405" y="250" width="45" height="8" rx="4" fill="#64748B" />
            <rect x="405" y="265" width="30" height="6" rx="3" fill="#CBD5E1" />
          </svg>
          
          {/* Floating UI Elements */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-[16px] shadow-lg border border-border-color flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-full">
              <ShieldCheck className="text-success" size={24} />
            </div>
            <div>
              <p className="text-xs text-subtext font-medium">System Status</p>
              <p className="font-bold text-text-main">Secure</p>
            </div>
          </div>
          
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-[16px] shadow-lg border border-border-color flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="text-accent" size={24} />
            </div>
            <div>
              <p className="text-xs text-subtext font-medium">Active Monitoring</p>
              <p className="font-bold text-text-main">1,248 Users</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;"""

files['src/components/landing/TrustIndicators.jsx'] = """import React from 'react';
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

export default TrustIndicators;"""

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
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-4">Comprehensive Threat Defense</h2>
          <p className="text-subtext">Everything you need to detect, investigate, and mitigate insider risks before data is compromised.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-[16px] shadow-sm border border-border-color hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-main mb-3">{feature.title}</h3>
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
import { Database, Brain, Calculator, ShieldAlert, Bell } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { icon: <Database size={24} />, label: "Collect Employee Activities" },
    { icon: <Brain size={24} />, label: "Analyze Behavior" },
    { icon: <Calculator size={24} />, label: "Calculate Risk Score" },
    { icon: <ShieldAlert size={24} />, label: "Detect Suspicious Activity" },
    { icon: <Bell size={24} />, label: "Notify Security Team" }
  ];

  return (
    <section className="py-24 bg-white border-y border-border-color">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-4">How It Works</h2>
          <p className="text-subtext">A streamlined, automated workflow that turns raw data into actionable security intelligence.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center relative">
          <div className="hidden md:block absolute top-[20%] left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center mb-8 md:mb-0 relative bg-white px-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary shadow-sm mb-4 z-10">
                {step.icon}
              </div>
              <div className="text-center max-w-[140px]">
                <span className="block text-xs font-bold text-primary mb-1">STEP {index + 1}</span>
                <span className="font-medium text-text-main text-sm">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;"""


files['src/components/landing/Modules.jsx'] = """import React from 'react';
import { Lock, Users, Activity, Brain, LineChart, FileSpreadsheet } from 'lucide-react';

const Modules = () => {
  const modules = [
    { icon: <Lock />, title: "Authentication", color: "text-accent" },
    { icon: <Users />, title: "Employee Management", color: "text-primary" },
    { icon: <Activity />, title: "Activity Logs", color: "text-subtext" },
    { icon: <Brain />, title: "Behavior Analytics", color: "text-warning" },
    { icon: <LineChart />, title: "Risk Dashboard", color: "text-danger" },
    { icon: <FileSpreadsheet />, title: "Reporting", color: "text-success" }
  ];

  return (
    <section id="modules" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-4">Platform Modules</h2>
          <p className="text-subtext">A unified suite of tools designed for complete visibility and control.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {modules.map((mod, index) => (
            <div key={index} className="bg-white p-6 rounded-[16px] shadow-sm border border-border-color flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer">
              <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors ${mod.color}`}>
                {mod.icon}
              </div>
              <span className="font-heading font-semibold text-text-main">{mod.title}</span>
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
      icon: <Target size={32} className="text-primary mb-4" />,
      title: "Accurate Detection",
      desc: "Minimize false positives with advanced behavioral baselining and contextual intelligence."
    },
    {
      icon: <ShieldCheck size={32} className="text-accent mb-4" />,
      title: "Enterprise Security",
      desc: "Built for scale, privacy, and compliance with SOC2 and GDPR requirements."
    },
    {
      icon: <Clock size={32} className="text-success mb-4" />,
      title: "Real-time Monitoring",
      desc: "Instant alerts and dynamic risk scoring ensure you respond to threats immediately."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white border-y border-border-color">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reasons.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center">{item.icon}</div>
              <h3 className="font-heading text-xl font-bold text-text-main mb-3">{item.title}</h3>
              <p className="text-subtext leading-relaxed">{item.desc}</p>
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
import { ArrowRight, Phone } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-secondary rounded-[24px] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to secure your organization?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Deploy our behavioral intelligence system today and stop insider threats before data leaves your network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-4 px-8 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Start Monitoring <ArrowRight size={20} />
              </Link>
              <a href="#contact" className="bg-white/10 text-white border border-white/20 rounded-[16px] py-4 px-8 font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Phone size={20} /> Contact Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;"""


files['src/pages/Landing/Landing.jsx'] = """import React from 'react';
import Hero from '../../components/landing/Hero';
import TrustIndicators from '../../components/landing/TrustIndicators';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Modules from '../../components/landing/Modules';
import WhyChooseUs from '../../components/landing/WhyChooseUs';
import CTA from '../../components/landing/CTA';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <TrustIndicators />
      <Features />
      <HowItWorks />
      <Modules />
      <WhyChooseUs />
      <CTA />
    </div>
  );
};

export default Landing;"""


for path, content in files.items():
    full_path = os.path.join(base, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
