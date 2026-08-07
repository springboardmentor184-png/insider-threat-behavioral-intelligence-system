import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface EmployeeRecord {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
}

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: 'SOC Operations',
    designation: 'Security Specialist'
  });

  const token = localStorage.getItem('token');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/employees/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && Array.isArray(res.data)) {
        setEmployees(res.data);
      }
    } catch (e) {
      console.log('Using seeded employees fallback');
      setEmployees([
        { employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb', first_name: 'John', last_name: 'Doe', email: 'john@insiderthreat.io', department: 'Cybersecurity', designation: 'Chief Information Security Officer', status: 'active' },
        { employee_id: '44801353-84ca-11f1-9e39-e4fd457b80cc', first_name: 'Alice', last_name: 'Smith', email: 'alice@insiderthreat.io', department: 'SOC Operations', designation: 'Senior Security Analyst', status: 'active' },
        { employee_id: '55701353-84ca-11f1-9e39-e4fd457b80cd', first_name: 'Bob', last_name: 'Johnson', email: 'bob@insiderthreat.io', department: 'Infrastructure', designation: 'Lead SOC Engineer', status: 'active' },
        { employee_id: '66601353-84ca-11f1-9e39-e4fd457b80ce', first_name: 'Carol', last_name: 'Williams', email: 'carol@insiderthreat.io', department: 'Executive', designation: 'Security Operations Manager', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/employees/', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      alert('Employee onboarded successfully!');
      setModalOpen(false);
      fetchEmployees();
    } catch (e) {
      alert('Employee created locally.');
      const newEmp: EmployeeRecord = {
        employee_id: `emp-${Date.now()}`,
        ...formData,
        status: 'active'
      };
      setEmployees([...employees, newEmp]);
      setModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">👥 Employee Identity & Profile Management</h1>
            <p className="text-gray-400 text-sm">Department mapping, role assignment & asset association</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 font-semibold text-sm transition"
            >
              + Onboard New Employee
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 p-8 text-center text-gray-400">Loading directory...</div>
          ) : (
            employees.map((emp) => (
              <div key={emp.employee_id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-3 relative group hover:border-blue-500 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white">{emp.first_name} {emp.last_name}</h3>
                    <p className="text-xs text-blue-400 font-semibold">{emp.designation}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded bg-green-900 text-green-300 font-bold uppercase">{emp.status}</span>
                </div>
                <div className="text-xs space-y-1 text-gray-300 border-t border-gray-700 pt-3">
                  <p><span className="text-gray-400">Dept:</span> {emp.department}</p>
                  <p><span className="text-gray-400">Email:</span> {emp.email}</p>
                  <p><span className="text-gray-400">Asset:</span> Macbook Pro (ID: DEV-{emp.employee_id.slice(0, 4)})</p>
                  <p><span className="text-gray-400">Privileges:</span> Standard + VPN Remote</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('employee_id', emp.employee_id);
                      window.location.href = '/dashboard';
                    }}
                    className="w-full py-1.5 bg-gray-700 text-xs text-blue-300 rounded hover:bg-blue-600 hover:text-white font-semibold transition"
                  >
                    View Risk Baseline →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Onboard New Employee</h3>
            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                >
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="SOC Operations">SOC Operations</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Engineering & IT">Engineering & IT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm font-semibold"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;