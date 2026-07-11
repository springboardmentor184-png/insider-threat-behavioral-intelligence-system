import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "20px", flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}