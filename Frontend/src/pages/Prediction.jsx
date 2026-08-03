import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import ReportPreviewModal from "../components/ReportPreviewModal";
import { getEmployees } from "../services/employeeService";
import { getBaseline } from "../services/baselineService";
import {
  predictRisk,
  downloadReport,
} from "../services/aiService";

import "../styles/dashboard.css";

function Prediction() {

  // ==========================
  // States
  // ==========================

  const [employees, setEmployees] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [employeeInfo, setEmployeeInfo] = useState(null);

  const [formData, setFormData] = useState({
    avg_failed_logins: 0,
    avg_files_downloaded: 0,
    avg_emails_sent: 0,
    avg_login_hour: 9,
    usb_usage_rate: 0,
    after_hours_rate: 0,
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  // ==========================
  // Load Employees
  // ==========================

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();

      setEmployees(data);

    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // Employee Selection
  // ==========================

  const handleEmployeeChange = async (e) => {

    const id = Number(e.target.value);

    setSelectedEmployee(id);

    setResult(null);

    const emp = employees.find((item) => item.id === id);

    setEmployeeInfo(emp);

    try {

      const baseline = await getBaseline(id);

      setFormData({
        avg_failed_logins: baseline.avg_failed_logins,
        avg_files_downloaded: baseline.avg_files_downloaded,
        avg_emails_sent: baseline.avg_emails_sent,
        avg_login_hour: baseline.avg_login_hour,
        usb_usage_rate: baseline.usb_usage_rate,
        after_hours_rate: baseline.after_hours_rate,
      });

    } catch (error) {

      console.error(error);

      alert("Baseline not found for selected employee.");

    }

  };

  // ==========================
  // AI Prediction
  // ==========================

  const handlePredict = async (e) => {

    e.preventDefault();

    if (!selectedEmployee) {

      alert("Please select an employee.");

      return;

    }

    try {

      setLoading(true);

      const response = await predictRisk(formData);

      setResult(response);

    } catch (error) {

      console.error(error);

      alert("Prediction failed.");

    } finally {

      setLoading(false);

    }

  };

const handleDownloadReport = async () => {

    try {

        const pdfBlob = await downloadReport(selectedEmployee);

        const url = window.URL.createObjectURL(
            new Blob([pdfBlob], {
                type: "application/pdf"
            })
        );

        const link = document.createElement("a");

        link.href = url;

        link.download =
            `${employeeInfo.employee_id}_Anomaly_Report.pdf`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        // Close Preview
        setShowPreview(false);

    } catch (error) {

        console.error(error);

        alert("Failed to download report.");

    }

};

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="dashboard-body">

          <div className="dashboard-header mb-4">

            <h2>AI Threat Prediction</h2>

            <p>
              Predict insider threats using employee behaviour baseline and
              Isolation Forest Machine Learning model.
            </p>

          </div>

          <div className="row">

            <div className="col-lg-7 d-flex">

              <div className="card shadow-sm flex-fill">

                <div className="card-body">

                  <h4 className="mb-4">
                    Select Employee
                  </h4>

                  <div className="mb-4">

                    <label className="form-label">

                      Employee

                    </label>

                    <select
                      className="form-select"
                      value={selectedEmployee}
                      onChange={handleEmployeeChange}
                    >

                      <option value="">
                        Select Employee
                      </option>

                      {employees.map((emp) => (

                        <option
                          key={emp.id}
                          value={emp.id}
                        >
                          {emp.employee_id} - {emp.full_name}
                        </option>

                      ))}

                    </select>

                  </div>

                  {
                    employeeInfo && (

                      <div className="alert alert-primary">

                        <h5 className="mb-3">

                          Employee Information

                        </h5>

                        <div className="row">

                          <div className="col-md-6">

                            <p>

                              <strong>ID :</strong>

                              {" "}

                              {employeeInfo.employee_id}

                            </p>

                            <p>

                              <strong>Name :</strong>

                              {" "}

                              {employeeInfo.full_name}

                            </p>

                            <p>

                              <strong>Department :</strong>

                              {" "}

                              {employeeInfo.department}

                            </p>

                          </div>

                          <div className="col-md-6">

                            <p>

                              <strong>Role :</strong>

                              {" "}

                              {employeeInfo.role}

                            </p>

                            <p>

                              <strong>Risk Score :</strong>

                              {" "}

                              {employeeInfo.risk_score}

                            </p>

                          </div>

                        </div>

                      </div>

                    )
                  }

                  <form onSubmit={handlePredict}>

                    <h5 className="mb-3">

                      Behaviour Baseline

                    </h5>

                    <div className="row">

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Average Failed Logins

                        </label>

                        <input
                          className="form-control"
                          value={formData.avg_failed_logins}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Average Files Downloaded

                        </label>

                        <input
                          className="form-control"
                          value={formData.avg_files_downloaded}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Average Emails Sent

                        </label>

                        <input
                          className="form-control"
                          value={formData.avg_emails_sent}
                          readOnly
                        />

                      </div>
                                            <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Average Login Hour

                        </label>

                        <input
                          className="form-control"
                          value={formData.avg_login_hour}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          USB Usage Rate (%)

                        </label>

                        <input
                          className="form-control"
                          value={formData.usb_usage_rate}
                          readOnly
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          After Hours Rate (%)

                        </label>

                        <input
                          className="form-control"
                          value={formData.after_hours_rate}
                          readOnly
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary mt-3"
                      disabled={loading}
                    >

                      {loading
                        ? "Running Prediction..."
                        : "Run AI Prediction"}

                    </button>

                  </form>

                </div>

              </div>

            </div>

            {/* Prediction Result */}

            <div className="col-lg-5 d-flex">

              <div className="card shadow-sm flex-fill">

                <div className="card-body">

                  <h4 className="mb-4">

                    Prediction Result

                  </h4>

                  {result ? (

                    <>

                      <div className="text-center mb-4">

                        <h5>

                          Prediction

                        </h5>

                        <span
                          className={
                            result.prediction === "Anomaly"
                              ? "badge bg-danger p-3 fs-6"
                              : "badge bg-success p-3 fs-6"
                          }
                        >

                          {result.prediction}

                        </span>

                      </div>

                      <div className="text-center mb-4">

                        <div className="text-center mb-3">
                        <h5>Risk Score</h5>

                        <h2 className="fw-bold text-primary">
                            {result.risk_score}/100
                        </h2>
                    </div>

                <div className="mb-4">

                    <div className="progress" style={{ height: "25px" }}>

                        <div
                            className={`progress-bar ${
                                result.risk_level === "High"
                                    ? "bg-danger"
                                    : result.risk_level === "Medium"
                                    ? "bg-warning"
                                    : "bg-success"
                            }`}
                            role="progressbar"
                            style={{
                                width: `${result.risk_score}%`
                            }}
                        >
                            {result.risk_score}%
                        </div>

                    </div>

                </div>

                <div className="text-center mb-3">

                    <h5>Risk Level</h5>

                    <span
                        className={
                            result.risk_level === "High"
                                ? "badge bg-danger p-3 fs-6"
                                : result.risk_level === "Medium"
                                ? "badge bg-warning text-dark p-3 fs-6"
                                : "badge bg-success p-3 fs-6"
                        }
                    >
                        {result.risk_level}
                    </span>

                </div>
                <div className="text-center mb-4">

                          <h5>Detection Method</h5>

                          <span className="badge bg-info text-dark p-2">

                              {result.detection_method}

                          </span>

                      </div>
                      {result.triggered_rules.length > 0 && (

                          <div className="card border-danger mb-3">

                              <div className="card-header bg-danger text-white">

                                  Triggered Rules

                              </div>

                              <div className="card-body">

                                  <ul>

                                      {result.triggered_rules.map((rule,index)=>(

                                      <li key={index}>{rule}</li>

                                      ))}

                                  </ul>

                              </div>

                          </div>

                          )}
                      </div>
                      {/* Risk Analysis */}

                      <div className="card border-primary mb-3">

                          <div className="card-header bg-primary text-white">

                              Risk Analysis

                          </div>

                          <div className="card-body">

                              <div className="mb-3">

                                  <strong>Threat Severity :</strong>

                                  {" "}

                                  {result.threat_severity}

                              </div>

                              <div className="mb-3">

                                  <strong>Risk Trend :</strong>

                                  {" "}

                                  {result.risk_trend}

                              </div>

                              <div className="mb-3">

                                  <strong>Recommendation :</strong>

                                  {" "}

                                  {result.recommendation}

                              </div>

                              <hr />

                              <strong>Risk Summary</strong>

                              <p className="mt-3 mb-0">

                                  {result.risk_summary}

                              </p>

                          </div>

                      </div>
                      <hr />

                        <div className="d-grid my-4">
                            <button
                                    className="btn btn-primary"
                                    disabled={!result}
                                    onClick={() => setShowPreview(true)}
                            >
                                    📄 Generate Report
                            </button>
                        </div>

                        {result.risk_level === "Critical" ? (

                    <div className="alert alert-dark mt-3">

                        <h5>🚨 Critical Insider Threat</h5>

                        <p className="mb-0">

                            Employee behaviour has been classified as <strong>CRITICAL</strong>.

                            Immediate investigation and security response are required.

                        </p>

                    </div>

                    ) : result.risk_level === "High" ? (

                    <div className="alert alert-danger mt-3">

                        <h5>⚠ High Risk Behaviour</h5>

                        <p className="mb-0">

                            Employee behaviour has been classified as high risk.

                            Immediate investigation is recommended.

                        </p>

                    </div>

                    ) : result.risk_level === "Medium" ? (

                    <div className="alert alert-warning mt-3">

                        <h5>⚠ Suspicious Behaviour</h5>

                        <p className="mb-0">

                            Continue monitoring this employee.

                        </p>

                    </div>

                    ) : (

                    <div className="alert alert-success mt-3">

                        <h5>✔ Normal Behaviour</h5>

                        <p className="mb-0">

                            No suspicious activity detected.

                        </p>

                    </div>

                    )}
                    </>

                  ) : (

                    <div className="text-center mt-5">

                      <i
                        className="bi bi-cpu-fill"
                        style={{
                          fontSize: "70px",
                          color: "#0d6efd",
                        }}
                      ></i>

                      <h5 className="mt-4">

                        AI Prediction

                      </h5>

                      <p className="text-muted">

                        Select an employee from the dropdown.

                      </p>

                      <p className="text-muted">

                        The system automatically loads the employee's
                        behaviour baseline.

                      </p>

                      <p className="text-muted">

                        Click

                        <strong>

                          {" "}Run AI Prediction{" "}

                        </strong>

                        to detect insider threats using the
                        Isolation Forest Machine Learning model.

                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

<ReportPreviewModal
    show={showPreview}
    onClose={() => setShowPreview(false)}
    onDownload={handleDownloadReport}
    employee={employeeInfo}
    baseline={formData}
    prediction={result}
/>

</div>

  );

}

export default Prediction;