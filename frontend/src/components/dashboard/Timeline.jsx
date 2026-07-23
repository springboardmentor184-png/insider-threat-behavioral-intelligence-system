import React from 'react';
import { Clock, LogIn, FileText, HardDrive, Download, AlertTriangle } from 'lucide-react';

const Timeline = ({ events = [] }) => {
  const defaultEvents = [
    { id: '1', time: '10:42 AM', title: 'Policy Violation', desc: 'Attempted access to restricted HR directory.', icon: <AlertTriangle size={14} />, color: 'bg-danger', text: 'text-danger' },
    { id: '2', time: '09:15 AM', title: 'Sensitive File Download', desc: 'Project_Titan_Financials.xlsx downloaded.', icon: <Download size={14} />, color: 'bg-warning', text: 'text-warning' },
    { id: '3', time: '08:50 AM', title: 'USB Device Connected', desc: 'Unauthorized Kingston drive detected.', icon: <HardDrive size={14} />, color: 'bg-warning', text: 'text-warning' },
    { id: '4', time: '08:30 AM', title: 'File Access', desc: 'Accessed quarterly projections.', icon: <FileText size={14} />, color: 'bg-primary', text: 'text-primary' },
    { id: '5', time: '08:05 AM', title: 'User Login', desc: 'Successful login from recognized IP.', icon: <LogIn size={14} />, color: 'bg-success', text: 'text-success' },
  ];

  const timelineEvents = events.length ? events : defaultEvents;

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-border-color p-6">
      <h3 className="font-heading font-semibold text-text-main flex items-center gap-2 mb-6">
        <Clock size={18} className="text-subtext" />
        Recent Activity Timeline
      </h3>
      <div className="relative border-l border-slate-200 ml-3 space-y-8">
        {timelineEvents.map((ev) => (
          <div key={ev.id} className="relative pl-6">
            <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white ${ev.color} text-white shadow-sm`}>
              {ev.icon}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h4 className={`text-sm font-semibold ${ev.text}`}>{ev.title}</h4>
              <span className="text-xs font-medium text-slate-400">{ev.time}</span>
            </div>
            <p className="text-sm text-subtext mt-1">{ev.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
