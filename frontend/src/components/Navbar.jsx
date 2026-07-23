import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;