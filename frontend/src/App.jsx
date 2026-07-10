import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";

import EmployeeManagement from "./pages/EmployeeManagement";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import SocDashboard from "./pages/SocDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/manager"
          element={<ManagerDashboard />}
        />

        <Route
          path="/analyst"
          element={<AnalystDashboard />}
        />

        <Route
          path="/soc"
          element={<SocDashboard />}
        />

        <Route
          path="/employee"
          element={<EmployeeDashboard />}
        />

        <Route
    path="/employees"
    element={<EmployeeManagement />}
/>

      </Routes>

    </BrowserRouter>

  );

}

export default App;