import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setUser(response.data.user);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <h2 style={{ marginLeft: "240px", marginTop: "20px" }}>Loading...</h2>;

  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "240px", marginTop: "20px" }}>
        <h2>Profile</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </div>
  );
}

export default Profile;