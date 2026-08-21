import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getEmployees } from "../services/employeeService";

import "../styles/dashboard.css";


function Reports() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // Load Employees
  // =====================================================

  useEffect(() => {
    loadEmployees();
  }, []);


  const loadEmployees = async () => {

    try {

      setLoading(true);

      const data = await getEmployees();

      setEmployees(data || []);

    } catch (error) {

      console.error(
        "Error loading employees:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // Risk Level Classification
  // =====================================================
  //
  // 0 - 39   = Low
  // 40 - 69  = Medium
  // 70 - 89  = High
  // 90 - 100 = Critical
  //
  // =====================================================

  const getRiskLevel = (score) => {

    const riskScore = Number(score || 0);

    if (riskScore < 40) {
      return "Low";
    }

    if (riskScore < 70) {
      return "Medium";
    }

    if (riskScore < 90) {
      return "High";
    }

    return "Critical";

  };


  // =====================================================
  // Export Risk Assessment Excel
  // =====================================================

  const handleExportExcel = () => {

    if (employees.length === 0) {

      alert(
        "No employee data available for export."
      );

      return;

    }


    // -----------------------------------------------------
    // Prepare Employee Risk Data
    // -----------------------------------------------------

    const reportData = employees.map(
      (employee) => ({

        "Employee ID":
          employee.employee_id,

        "Employee Name":
          employee.full_name,

        "Email":
          employee.email,

        "Department":
          employee.department,

        "Designation / Role":
          employee.role,

        "Risk Score":
          Number(employee.risk_score || 0),

        "Risk Level":
          getRiskLevel(
            employee.risk_score
          ),

      })
    );


    // -----------------------------------------------------
    // Create Worksheet
    // -----------------------------------------------------

    const worksheet =
      XLSX.utils.json_to_sheet(
        reportData
      );


    // -----------------------------------------------------
    // Set Column Widths
    // -----------------------------------------------------

    worksheet["!cols"] = [

      { wch: 15 },
      { wch: 25 },
      { wch: 32 },
      { wch: 20 },
      { wch: 28 },
      { wch: 15 },
      { wch: 15 },

    ];


    // -----------------------------------------------------
    // Create Workbook
    // -----------------------------------------------------

    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Risk Assessment"
    );


    // -----------------------------------------------------
    // Download Excel File
    // -----------------------------------------------------

    const today =
      new Date()
        .toISOString()
        .split("T")[0];


    XLSX.writeFile(
      workbook,
      `Employee_Risk_Assessment_${today}.xlsx`
    );

  };


  // =====================================================
  // Risk Statistics
  // =====================================================

  const totalEmployees =
    employees.length;


  const criticalEmployees =
    employees.filter(
      (employee) =>
        getRiskLevel(
          employee.risk_score
        ) === "Critical"
    ).length;


  const highEmployees =
    employees.filter(
      (employee) =>
        getRiskLevel(
          employee.risk_score
        ) === "High"
    ).length;


  const mediumEmployees =
    employees.filter(
      (employee) =>
        getRiskLevel(
          employee.risk_score
        ) === "Medium"
    ).length;


  const lowEmployees =
    employees.filter(
      (employee) =>
        getRiskLevel(
          employee.risk_score
        ) === "Low"
    ).length;


  // =====================================================
  // Render
  // =====================================================

  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="main-content">

        <Navbar />


        <div className="dashboard-body">


          {/* =================================================
              Page Header
          ================================================= */}

          <div className="dashboard-header mb-4">

            <div>

              <h2>
                Reports & Export
              </h2>

              <p>
                Generate security reports and
                export employee risk information.
              </p>

            </div>

          </div>


          {/* =================================================
              Report Overview
          ================================================= */}

          <div className="row mb-4">


            {/* Total Employees */}

            <div className="col-md-3 mb-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Total Employees
                  </h6>

                  <h3>
                    {totalEmployees}
                  </h3>

                  <small className="text-muted">
                    Active Workforce
                  </small>

                </div>

              </div>

            </div>


            {/* Critical Risk */}

            <div className="col-md-3 mb-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Critical Risk
                  </h6>

                  <h3 className="text-dark">
                    {criticalEmployees}
                  </h3>

                  <small className="text-muted">
                    Risk Score ≥ 90
                  </small>

                </div>

              </div>

            </div>


            {/* High Risk */}

            <div className="col-md-3 mb-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    High Risk
                  </h6>

                  <h3 className="text-danger">
                    {highEmployees}
                  </h3>

                  <small className="text-muted">
                    Risk Score 70–89
                  </small>

                </div>

              </div>

            </div>


            {/* Medium / Low */}

            <div className="col-md-3 mb-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Medium / Low
                  </h6>

                  <h3 className="text-primary">
                    {mediumEmployees + lowEmployees}
                  </h3>

                  <small className="text-muted">
                    Risk Score below 70
                  </small>

                </div>

              </div>

            </div>

          </div>


{/* =================================================
    Available Security Reports
================================================= */}

<div className="card shadow-sm">

  <div className="card-body">

    <h4 className="mb-4">
      Available Security Reports
    </h4>


    {/* =================================================
        Risk Assessment Report
    ================================================= */}

    <div className="border rounded p-3 mb-3">

      <h5>
        📊 Risk Assessment Report
      </h5>

      <p className="text-muted mb-3">

        Employee risk scores, risk levels,
        departments and role information.

      </p>

      <button
        className="btn btn-success btn-sm"
        onClick={handleExportExcel}
        disabled={
          loading ||
          employees.length === 0
        }
      >

        <i className="bi bi-file-earmark-excel me-1"></i>

        Export Excel

      </button>

    </div>


    {/* =================================================
        AI Risk / Anomaly Report
    ================================================= */}

    <div className="border rounded p-3 mb-3">

      <h5>
        📄 AI Risk / Anomaly Report
      </h5>

      <p className="text-muted mb-3">

        Detailed AI prediction, anomaly
        detection and employee risk analysis.

      </p>

      <button
        className="btn btn-primary btn-sm"
        onClick={() =>
          window.location.href = "/prediction"
        }
      >

        <i className="bi bi-cpu me-1"></i>

        Open AI Prediction

      </button>

    </div>


    {/* =================================================
        Investigation Report
    ================================================= */}

    <div className="border rounded p-3">

      <h5>
        🔍 Investigation Report
      </h5>

      <p className="text-muted mb-3">

        Investigation status, incidents,
        evidence, timeline, risk history
        and investigation findings.

      </p>

      <button
        className="btn btn-danger btn-sm"
        onClick={() =>
          window.location.href = "/investigation"
        }
      >

        <i className="bi bi-search me-1"></i>

        View Investigations

      </button>

    </div>


  </div>

</div>


        </div>

      </div>

    </div>

  );

}


export default Reports;