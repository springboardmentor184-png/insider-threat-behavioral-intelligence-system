import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Threats() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    fetch("/risk_scores.csv")
      .then((res) => res.text())
      .then((text) => {
        const rows = text.trim().split("\n");

        const headers = rows[0].split(",");

        const data = rows.slice(1).map((row) => {
          const values = row.split(",");

          const obj = {};

          headers.forEach((header, index) => {
            obj[header] = values[index];
          });

          return obj;
        });

        setEmployees(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let data = employees.filter((emp) => {
      const searchMatch = emp.user
        .toLowerCase()
        .includes(search.toLowerCase());

      const riskMatch =
        riskFilter === "All"
          ? emp.risk_level === "High" ||
            emp.risk_level === "Critical"
          : emp.risk_level === riskFilter;

      return searchMatch && riskMatch;
    });

    data.sort((a, b) =>
      sortOrder === "desc"
        ? Number(b.risk_score) - Number(a.risk_score)
        : Number(a.risk_score) - Number(b.risk_score)
    );

    return data;
  }, [employees, search, riskFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const currentEmployees = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const badgeColor = (risk) => {
    switch (risk) {
      case "Critical":
        return "bg-purple-600";

      case "High":
        return "bg-red-500";

      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">

          <div className="mb-8">

            <h1 className="text-3xl font-bold">
              Threat Detection
            </h1>

            <p className="text-gray-500">
              Employees requiring investigation
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-5 mb-6 flex gap-4 flex-wrap">

            <input
              placeholder="Search User..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg px-4 py-2 w-72"
            />

            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg px-4 py-2"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
            </select>

            <button
              onClick={() =>
                setSortOrder(
                  sortOrder === "desc" ? "asc" : "desc"
                )
              }
              className="bg-cyan-600 text-white px-5 rounded-lg"
            >
              Sort {sortOrder === "desc" ? "↓" : "↑"}
            </button>

          </div>

          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

            {loading ? (
              <p>Loading Threats...</p>
            ) : (

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th>User</th>
                    <th>Risk Score</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {currentEmployees.map((emp, index) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="py-4 font-semibold">
                        {emp.user}
                      </td>

                      <td>{emp.risk_score}</td>

                      <td>

                        <span
                          className={`text-white px-3 py-1 rounded-lg ${badgeColor(
                            emp.risk_level
                          )}`}
                        >
                          {emp.risk_level}
                        </span>

                      </td>

                      <td>

                        <span className="text-red-600 font-semibold">
                          Under Investigation
                        </span>

                      </td>

                      <td>

                        {/* <button
                          onClick={() =>
                            navigate(`/employee/${emp.user}`)
                          }
                          className="text-cyan-600 hover:underline"
                        >
                          Investigate
                        </button> */}
                        <button
  onClick={() =>
    alert("Detailed Threat Investigation module will be available in the next version.")
  }
  className="text-cyan-600 hover:underline"
>
  Investigate
</button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

          <div className="flex justify-between items-center mt-6">

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Next
            </button>

          </div>

          <Footer />

        </div>
      </div>
    </div>
  );
}