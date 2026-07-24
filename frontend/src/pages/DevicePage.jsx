import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function DevicePage() {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    device_name: "",
    device_type: "",
    serial_number: "",
    operating_system: "",
    status: "",
  });

  const loadDevice = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/device");
      const d = res.data.device;
      setDevice(d);
      setFormData({
        device_name: d.device_name,
        device_type: d.device_type,
        serial_number: d.serial_number,
        operating_system: d.operating_system,
        status: d.status,
      });
    } catch {
      setDevice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevice();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (device) {
        await api.put("/device", formData);
      } else {
        await api.post("/device", formData);
      }
      await loadDevice();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your device?")) return;

    try {
      await api.delete("/device");
      setDevice(null);
      setFormData({
        device_name: "",
        device_type: "",
        serial_number: "",
        operating_system: "",
        status: "",
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete device");
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ maxWidth: "500px", marginLeft: "240px", marginTop: "20px" }}>
      <Sidebar />
      <h2>{device ? "My Device (Edit)" : "Register My Device"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          name="device_name"
          placeholder="Device Name"
          value={formData.device_name}
          onChange={handleChange}
          required
        />
        <input
          name="device_type"
          placeholder="Device Type (Laptop, Mobile, etc.)"
          value={formData.device_type}
          onChange={handleChange}
          required
        />
        <input
          name="serial_number"
          placeholder="Serial Number"
          value={formData.serial_number}
          onChange={handleChange}
          disabled={!!device}
          required
        />
        <input
          name="operating_system"
          placeholder="Operating System"
          value={formData.operating_system}
          onChange={handleChange}
          required
        />
        <input
          name="status"
          placeholder="Status (Active, Inactive, etc.)"
          value={formData.status}
          onChange={handleChange}
          required
        />

        <button type="submit">{device ? "Update Device" : "Register Device"}</button>

        {device && (
          <button type="button" onClick={handleDelete} style={{ color: "red" }}>
            Delete My Device
          </button>
        )}
      </form>
    </div>
  );
}

export default DevicePage;