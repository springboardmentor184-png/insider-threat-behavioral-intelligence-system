import { Link } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="hover:text-gray-300">📊 Dashboard</Link>
        <Link to="/investigations" className="hover:text-gray-300">🔍 Investigations</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{localStorage.getItem('username')}</span>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;