import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Activities from "./pages/Activities";

import Layout from "./layouts/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <Layout>
              <Employees />
            </Layout>
          }
        />

        {/* Activities */}
        <Route
          path="/activities"
          element={
            <Layout>
              <Activities />
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;