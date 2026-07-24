import { Link } from 'react-router-dom';

const Navbar = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Only show navbar if user is logged in
  if (!token) return null;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="hover:text-gray-300">📊 Dashboard</Link>
        <Link to="/" className="hover:text-gray-300">🏠 Home</Link>
        {role === 'Admin' && (
          <Link to="/admin" className="hover:text-gray-300">⚙️ Admin Panel</Link>
        )}
      </div>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = '/';
        }}
        className="px-4 py-1 bg-red-500 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;