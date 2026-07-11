import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">Insider Threat AI</h2>
        <div className="nav-links">
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/register" className="nav-btn">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Protect Your Organization from Insider Risks</h1>
        <p>
          Our AI-driven platform continuously monitors user activity, detects unusual
          behavior, and helps you stop insider threats before they cause damage.
        </p>
      </header>

      {/* Carousel Section */}
      <section className="carousel">
        <h2>Platform Highlights</h2>
        <div className="carousel-track">
          <div className="carousel-card">
            <h3>🔐 Secure Access</h3>
            <p>Advanced authentication with role-based controls.</p>
          </div>
          <div className="carousel-card">
            <h3>📊 Smart Analytics</h3>
            <p>Behavioral baselines and anomaly detection powered by AI.</p>
          </div>
          <div className="carousel-card">
            <h3>⚠️ Real-Time Alerts</h3>
            <p>Instant notifications for suspicious activity and misuse.</p>
          </div>
          <div className="carousel-card">
            <h3>📈 Risk Insights</h3>
            <p>Dynamic scoring to prioritize high-risk users and events.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>What You Get</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🚨 Incident Response</h3>
            <p>Automated workflows to investigate and resolve threats quickly.</p>
          </div>
          <div className="feature-card">
            <h3>📑 Executive Dashboards</h3>
            <p>Clear visibility into organizational risk and compliance metrics.</p>
          </div>
          <div className="feature-card">
            <h3>🔎 Deep Investigations</h3>
            <p>Correlate events, analyze user history, and collect evidence.</p>
          </div>
          <div className="feature-card">
            <h3>🌐 Seamless Integrations</h3>
            <p>Connect with SIEM, SOAR, and cloud platforms like AWS & Azure.</p>
          </div>
        </div>
      </section>

      {/* Testimonials / Insights */}
      <section className="testimonials">
        <h2>Trusted by Security Teams</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>“The system helps us detect anomalies faster and reduce false positives.”</p>
            <h4>- Security Analyst</h4>
          </div>
          <div className="testimonial-card">
            <p>“Investigation workflows are streamlined, saving hours of manual effort.”</p>
            <h4>- SOC Engineer</h4>
          </div>
          <div className="testimonial-card">
            <p>“Risk scoring gives us clarity on which threats to prioritize.”</p>
            <h4>- Security Manager</h4>
          </div>
          <div className="testimonial-card">
            <p>“Managing users, roles, and system policies is simple and efficient.”</p>
            <h4>- Administrator</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Insider Threat AI | Enterprise Security Powered by FastAPI & React</p>
      </footer>
    </div>
  );
};

export default LandingPage;
