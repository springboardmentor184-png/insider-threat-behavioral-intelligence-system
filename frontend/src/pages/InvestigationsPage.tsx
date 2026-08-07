import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InvestigationItem {
  investigation_id: string;
  employee_id: string;
  employee_name?: string;
  department?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  created_at: string;
  evidence?: { id: string; type: string; ref: string; desc: string }[];
  timeline?: { time: string; event: string; system: string; severity: string }[];
}

const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [notesList, setNotesList] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: '1', author: 'Alice Smith', text: 'Initiated log trace on IP 10.8.0.12. User connected via VPN from non-standard region.', time: '10 mins ago' },
    { id: '2', author: 'Bob Johnson', text: 'Confirmed 4.8MB PDF file download matched restricted SharePoint repository.', time: '35 mins ago' }
  ]);

  const [formData, setFormData] = useState({
    employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb',
    title: 'Off-Hours Data Exfiltration Investigation',
    description: 'Suspicious late night VPN session accompanied by large PDF downloads and USB insertion.',
    priority: 'Critical',
    assigned_to: 'Alice Smith'
  });

  const token = localStorage.getItem('token');

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/investigations/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.investigations && res.data.investigations.length > 0) {
        setInvestigations(res.data.investigations);
        setSelectedInv(res.data.investigations[0]);
      } else {
        throw new Error('No data');
      }
    } catch (e) {
      const mockList: InvestigationItem[] = [
        {
          investigation_id: 'INV-2026-001',
          employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb',
          employee_name: 'John Doe',
          department: 'Cybersecurity',
          title: 'Off-Hours Exfiltration & Privilege Change Investigation',
          description: 'Investigating 02:14 AM remote VPN connection from 10.8.0.12, followed by Active Directory privilege escalation and unapproved USB insertion.',
          status: 'In Progress',
          priority: 'Critical',
          assigned_to: 'Alice Smith (Senior Analyst)',
          created_at: new Date().toISOString(),
          evidence: [
            { id: 'EV-01', type: 'IP Trace Log', ref: '10.8.0.12', desc: 'Remote VPN session initiated outside standard shift' },
            { id: 'EV-02', type: 'Endpoint Telemetry', ref: 'USB_AGENT_45', desc: 'SanDisk Flash Drive 64GB mounted without Security approval' },
            { id: 'EV-03', type: 'Active Directory Log', ref: 'AD_EVENT_4728', desc: 'Member added to Domain Administrators security group' }
          ],
          timeline: [
            { time: '02:14 AM', event: 'VPN_REMOTE_ACCESS', system: 'VPN_GATEWAY', severity: 'CRITICAL' },
            { time: '02:18 AM', event: 'PRIVILEGE_CHANGE', system: 'ACTIVE_DIRECTORY', severity: 'CRITICAL' },
            { time: '02:25 AM', event: 'FILE_DOWNLOAD', system: 'SHAREPOINT', severity: 'WARNING' },
            { time: '02:30 AM', event: 'USB_INSERTION', system: 'ENDPOINT_AGENT', severity: 'WARNING' }
          ]
        },
        {
          investigation_id: 'INV-2026-002',
          employee_id: '44801353-84ca-11f1-9e39-e4fd457b80cc',
          employee_name: 'Alice Smith',
          department: 'SOC Operations',
          title: 'Excessive Sharepoint Document Download Investigation',
          description: 'User downloaded over 40 PDF spec files within 10 minutes exceeding historical daily baseline.',
          status: 'Open',
          priority: 'High',
          assigned_to: 'Bob Johnson (Lead SOC)',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          evidence: [
            { id: 'EV-10', type: 'SharePoint Access Log', ref: 'SP_FILE_102', desc: 'Mass download of project specification archives' }
          ],
          timeline: [
            { time: '11:00 AM', event: 'FILE_DOWNLOAD', system: 'SHAREPOINT', severity: 'WARNING' }
          ]
        }
      ];
      setInvestigations(mockList);
      setSelectedInv(mockList[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotesList([
      { id: Date.now().toString(), author: 'Current Analyst', text: newNote, time: 'Just now' },
      ...notesList
    ]);
    setNewNote('');
  };

  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/investigations/', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      alert('Investigation ticket created!');
      setCreateModalOpen(false);
      fetchInvestigations();
    } catch (e) {
      alert('Investigation ticket created locally.');
      const created: InvestigationItem = {
        investigation_id: `INV-${Date.now()}`,
        employee_id: formData.employee_id,
        employee_name: 'Selected User',
        department: 'Security',
        title: formData.title,
        description: formData.description,
        status: 'Open',
        priority: formData.priority,
        assigned_to: formData.assigned_to,
        created_at: new Date().toISOString(),
        evidence: [{ id: 'EV-NEW', type: 'Log Dump', ref: 'REF-001', desc: 'Ingested anomaly logs' }],
        timeline: [{ time: 'Just now', event: 'INVESTIGATION_OPENED', system: 'SECURITY_CONSOLE', severity: 'INFO' }]
      };
      setInvestigations([created, ...investigations]);
      setSelectedInv(created);
      setCreateModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">🔍 Threat Investigation & Incident Workflows</h1>
            <p className="text-gray-400 text-sm">Threat timelines, event correlation, evidence collection & analyst notes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 font-semibold text-sm transition"
            >
              + Create New Ticket
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Selector List */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
            <h3 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2">Active Incident Tickets</h3>
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading tickets...</div>
            ) : (
              investigations.map((inv) => (
                <div
                  key={inv.investigation_id}
                  onClick={() => setSelectedInv(inv)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedInv?.investigation_id === inv.investigation_id
                      ? 'bg-blue-950 border-blue-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs text-blue-400 font-bold">{inv.investigation_id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      inv.priority === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-yellow-950 text-yellow-400'
                    }`}>
                      {inv.priority}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-white line-clamp-1">{inv.title}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <span>👤 {inv.employee_name || inv.employee_id.slice(0, 8)}</span>
                    <span className="text-blue-300 bg-gray-800 px-2 py-0.5 rounded">{inv.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detailed Workspace */}
          {selectedInv ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Details Box */}
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-700 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-400 font-bold">{selectedInv.investigation_id}</span>
                      <h2 className="text-lg font-bold text-white">{selectedInv.title}</h2>
                    </div>
                    <p className="text-xs text-gray-400">Target: {selectedInv.employee_name} ({selectedInv.department}) | Assigned: {selectedInv.assigned_to}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedInv.status}
                      onChange={(e) => setSelectedInv({...selectedInv, status: e.target.value})}
                      className="bg-gray-900 text-xs text-white border border-gray-700 rounded px-2 py-1"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedInv.description}</p>
              </div>

              {/* Threat Timeline & Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Threat Timeline */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                  <h3 className="text-sm font-bold text-gray-200 border-b border-gray-700 pb-2">⏰ Threat Activity Timeline</h3>
                  <div className="space-y-2">
                    {(selectedInv.timeline || [
                      { time: '02:14 AM', event: 'VPN_REMOTE_ACCESS', system: 'VPN_GATEWAY', severity: 'CRITICAL' },
                      { time: '02:18 AM', event: 'PRIVILEGE_CHANGE', system: 'ACTIVE_DIRECTORY', severity: 'CRITICAL' }
                    ]).map((t, idx) => (
                      <div key={idx} className="bg-gray-900 p-2.5 rounded border border-gray-750 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-blue-400 font-bold">{t.time}</span> – <span className="font-semibold text-white">{t.event}</span>
                          <p className="text-[10px] text-gray-400">System: {t.system}</p>
                        </div>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-400">{t.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Collection */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                  <h3 className="text-sm font-bold text-gray-200 border-b border-gray-700 pb-2">📁 Evidence Collection</h3>
                  <div className="space-y-2">
                    {(selectedInv.evidence || [
                      { id: 'EV-01', type: 'IP Trace Log', ref: '10.8.0.12', desc: 'Remote VPN session outside shift' }
                    ]).map((ev) => (
                      <div key={ev.id} className="bg-gray-900 p-2.5 rounded border border-gray-750 text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-purple-400">{ev.type}</span>
                          <span className="font-mono text-gray-400">{ev.ref}</span>
                        </div>
                        <p className="text-[11px] text-gray-300">{ev.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyst Notes */}
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-sm font-bold text-gray-200 border-b border-gray-700 pb-2">📝 Analyst Notes & Audit Trail</h3>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add investigator note or log reference..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-sm font-semibold rounded hover:bg-blue-700">
                    Add Note
                  </button>
                </form>
                <div className="space-y-3">
                  {notesList.map((n) => (
                    <div key={n.id} className="bg-gray-900 p-3 rounded text-xs space-y-1 border border-gray-750">
                      <div className="flex justify-between text-gray-400">
                        <span className="font-semibold text-blue-400">👤 {n.author}</span>
                        <span>{n.time}</span>
                      </div>
                      <p className="text-gray-200">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Create Threat Investigation Ticket</h3>
            <form onSubmit={handleCreateInvestigation} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Employee ID</label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Investigation Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white h-20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Assigned Analyst</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm font-semibold"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationsPage;