import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div>
        <Navbar />
      <h2>Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

export default Profile;