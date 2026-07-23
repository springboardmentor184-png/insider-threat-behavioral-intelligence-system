import React from 'react';
import { ShieldCheck, BellRing, Lock, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-main">Settings</h1>
        <p className="mt-1 text-sm text-subtext">Manage your account preferences and monitor the alerting experience.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Account Overview</h2>
              <p className="text-sm text-subtext">Your current profile and access details.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[14px] border border-border-color bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Name</div>
              <div className="mt-1 text-base font-semibold text-text-main">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Guest User'}</div>
            </div>
            <div className="rounded-[14px] border border-border-color bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Email</div>
              <div className="mt-1 text-base font-semibold text-text-main">{user?.email || 'Not available'}</div>
            </div>
            <div className="rounded-[14px] border border-border-color bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Role</div>
              <div className="mt-1 text-base font-semibold text-text-main">{user?.role?.role_name || user?.role || 'Visitor'}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Alert Preferences</h2>
              <p className="text-sm text-subtext">The monitoring experience is configured to surface priority events.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[14px] border border-border-color bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-primary" />
                <span className="text-sm font-medium text-text-main">Session protection is enabled.</span>
              </div>
            </div>
            <div className="rounded-[14px] border border-border-color bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-warning" />
                <span className="text-sm font-medium text-text-main">Behavior analytics and threat summaries stay synchronized.</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
