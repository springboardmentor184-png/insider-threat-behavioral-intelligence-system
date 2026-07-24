import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Employees() {

  // ============================
  // State
  // ============================

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] = useState("All");

  const [anomalyFilter, setAnomalyFilter] = useState("All");

  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  // ============================
  // Load CSV
  // ============================

  useEffect(() => {

    Papa.parse("/risk_scores.csv", {

      download: true,

      header: true,

      skipEmptyLines: true,

      complete: (results) => {

        setEmployees(results.data);

        setLoading(false);

      },

      error: (err) => {

        console.log(err);

        setLoading(false);

      }

    });

  }, []);

  // ============================
  // Filtering
  // ============================

  const filteredEmployees = useMemo(() => {

    let data = [...employees];

    // Search User ID

    if (search !== "") {

      data = data.filter((emp) =>

        emp.user
          .toLowerCase()
          .includes(search.toLowerCase())

      );

    }

    // Risk Filter

    if (riskFilter !== "All") {

      data = data.filter(

        (emp) => emp.risk_level === riskFilter

      );

    }

    // Anomaly Filter

    if (anomalyFilter !== "All") {

      data = data.filter(

        (emp) => emp.anomaly === anomalyFilter

      );

    }

    // Sort

    data.sort((a, b) => {

      if (sortOrder === "asc") {

        return Number(a.risk_score) - Number(b.risk_score);

      }

      return Number(b.risk_score) - Number(a.risk_score);

    });

    return data;

  }, [
    employees,
    search,
    riskFilter,
    anomalyFilter,
    sortOrder,
  ]);

  // ============================
  // Pagination
  // ============================

  const totalPages = Math.ceil(

    filteredEmployees.length / rowsPerPage

  );

  const startIndex =
    (currentPage - 1) * rowsPerPage;

  const currentEmployees =
    filteredEmployees.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  // ============================
  // Badge Colors
  // ============================

  const badgeColor = (risk) => {

    switch (risk) {

      case "Critical":

        return "bg-purple-600";

      case "High":

        return "bg-red-500";

      case "Medium":

        return "bg-yellow-500";

      default:

        return "bg-green-500";

    }

  };
    return (
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold">
              Employees
            </h1>

            <p className="text-gray-500">
              Machine Learning Risk Assessment Dashboard
            </p>

          </div>

          {/* Search + Filters */}

          <div className="bg-white rounded-2xl shadow p-5 mb-6">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Search */}

              <input
                type="text"
                placeholder="Search User ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
              />

              {/* Risk */}

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
                <option>Medium</option>
                <option>Low</option>
              </select>

              {/* Anomaly */}

              <select
                value={anomalyFilter}
                onChange={(e) => {
                  setAnomalyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-lg px-4 py-2"
              >
                <option>All</option>
                <option>Anomaly</option>
                <option>Normal</option>
              </select>

              {/* Sort */}

              <button
                onClick={() =>
                  setSortOrder(
                    sortOrder === "desc"
                      ? "asc"
                      : "desc"
                  )
                }
                className="bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Sort Risk Score {sortOrder === "desc" ? "↓" : "↑"}
              </button>

            </div>

          </div>

          {/* Table */}

          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

            {loading ? (

              <div className="text-center py-10 text-lg">
                Loading Employees...
              </div>

            ) : (

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="pb-4">User</th>

                    <th>Risk Score</th>

                    <th>Risk</th>

                    <th>Anomaly</th>

                    <th>Reasons</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {currentEmployees.map((emp, index) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50 transition"
                    >

                      <td className="py-4 font-semibold text-cyan-700 hover:underline">

                        <Link
                          to={`/employees/${emp.user}`}
                          state={{ employee: emp }}
                        >
                          {emp.user}
                        </Link>

                      </td>

                      <td>

                        {emp.risk_score}

                      </td>

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

                        <span
                          className={
                            emp.anomaly === "Anomaly"
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          {emp.anomaly}
                        </span>

                      </td>

                      <td>

                        <ul className="list-disc ml-5">

                          {[
                            emp.reason_1,
                            emp.reason_2,
                            emp.reason_3,
                            emp.reason_4,
                            emp.reason_5,
                          ]
                            .filter(
                              (x) =>
                                x &&
                                x !== "" &&
                                x !== "nan"
                            )
                            .map((reason, i) => (
                              <li key={i}>
                                {reason}
                              </li>
                            ))}

                        </ul>

                      </td>

                      <td>

                        <Link
                          to={`/employee/${encodeURIComponent(emp.user)}`}
                          state={{ employee: emp }}
                          className="text-cyan-600 hover:underline"
                        >
                          View Details
                        </Link>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>
          {/* Pagination */}

          {!loading && (

            <div className="mt-6 flex justify-between items-center">

              <div className="text-gray-600">

                Showing{" "}
                <span className="font-semibold">
                  {startIndex + 1}
                </span>

                {" "}to{" "}

                <span className="font-semibold">
                  {Math.min(
                    startIndex + rowsPerPage,
                    filteredEmployees.length
                  )}
                </span>

                {" "}of{" "}

                <span className="font-semibold">
                  {filteredEmployees.length}
                </span>

                {" "}employees

              </div>

              <div className="flex gap-3">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(currentPage - 1)
                  }
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-cyan-600 text-white hover:bg-cyan-700"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center px-4 font-semibold">

                  Page {currentPage} of {totalPages}

                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(currentPage + 1)
                  }
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-cyan-600 text-white hover:bg-cyan-700"
                  }`}
                >
                  Next
                </button>

              </div>

            </div>

          )}

          <Footer />

        </div>

      </div>

    </div>

  );

}