import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import ActivityLogs from "./pages/ActivityLogs";
import Threats from "./pages/Threats";
import Settings from "./pages/Settings";
import EmployeeDetails from "./pages/EmployeeDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/activitylogs" element={<ActivityLogs />} />
        <Route path="/threats" element={<Threats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/employee/:user" element={<EmployeeDetails />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;