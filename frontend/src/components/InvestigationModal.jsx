export default function InvestigationModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[650px] p-6">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-cyan-700">
            Threat Investigation
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-gray-500">Employee</p>
            <h3 className="font-bold text-lg">{employee.user}</h3>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-gray-500">Risk Score</p>
            <h3 className="font-bold text-lg">{employee.risk_score}</h3>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-gray-500">Risk Level</p>
            <h3 className="font-bold text-red-600">
              {employee.risk_level}
            </h3>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-gray-500">Incident Status</p>
            <h3 className="font-bold text-orange-600">
              Open Investigation
            </h3>
          </div>

        </div>

        <h3 className="font-bold text-lg mb-3">
          Activity Timeline
        </h3>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">

          <p>09:15 - Login from unusual location</p>

          <p>09:19 - Multiple failed login attempts</p>

          <p>09:24 - Large file download detected</p>

          <p>09:28 - USB device connected</p>

          <p>09:35 - Privilege escalation attempt</p>

        </div>

        <h3 className="font-bold text-lg mb-3">
          Evidence Collected
        </h3>

        <ul className="list-disc ml-6 mb-6">

          <li>Login activity logs</li>

          <li>File access records</li>

          <li>USB device logs</li>

          <li>Network activity logs</li>

          <li>Application usage history</li>

        </ul>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">

          <h3 className="font-bold text-red-700 mb-2">
            Recommended Action
          </h3>

          <p>
            Immediate manual investigation by the Security Analyst.
            Verify employee activity, review access privileges,
            and temporarily monitor file transfer activity.
          </p>

        </div>

      </div>
    </div>
  );
}