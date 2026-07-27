import React from "react";

function ReportPreviewModal({
  show,
  onClose,
  onDownload,
  employee,
  baseline,
  prediction,
}) {
  if (!show) return null;

  const isAnomaly = prediction?.prediction === "Anomaly";
  const isHighRisk = prediction?.risk === "High";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.55)",
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div
          className="modal-content shadow-lg border-0"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Header */}

          <div
            className="text-white p-4"
            style={{
              background: "linear-gradient(90deg,#0d6efd,#084298)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-1">
                  📄 AI Anomaly Report Preview
                </h3>

                <small className="opacity-75">
                  AI Insider Threat Behavioral Intelligence System
                </small>
              </div>

              <button
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
          </div>

          {/* Body */}

          <div className="modal-body p-4">

            {/* Report Details */}

            <div className="row mb-4 text-center">

              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <small className="text-muted">Report ID</small>
                    <h6 className="fw-bold mb-0">
                      RPT-{employee?.employee_id}
                    </h6>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <small className="text-muted">Generated On</small>
                    <h6 className="fw-bold mb-0">
                      {new Date().toLocaleString()}
                    </h6>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <small className="text-muted">
                      Classification
                    </small>

                    <h6 className="text-danger fw-bold mb-0">
                      Confidential
                    </h6>
                  </div>
                </div>
              </div>

            </div>

            {/* Employee + AI */}

            <div className="row">

              <div className="col-lg-6 mb-4">

                <div className="card shadow-sm h-100">

                  <div className="card-header bg-light fw-bold">
                    👤 Employee Information
                  </div>

                  <div className="card-body">

                    <p>
                      <strong>Employee ID :</strong>{" "}
                      {employee?.employee_id}
                    </p>

                    <p>
                      <strong>Name :</strong>{" "}
                      {employee?.full_name}
                    </p>

                    <p>
                      <strong>Department :</strong>{" "}
                      {employee?.department}
                    </p>

                    <p className="mb-0">
                      <strong>Role :</strong>{" "}
                      {employee?.role}
                    </p>

                  </div>

                </div>

              </div>

              <div className="col-lg-6 mb-4">

                <div className="card shadow-sm h-100">

                  <div className="card-header bg-light fw-bold">
                    🤖 AI Analysis
                  </div>

                  <div className="card-body">

                    <p>
                      <strong>Prediction :</strong>{" "}

                      <span
                        className={`badge ${
                          isAnomaly
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {prediction?.prediction}
                      </span>

                    </p>

                    <p>
                      <strong>Risk Level :</strong>{" "}

                      <span
                        className={`badge ${
                          isHighRisk
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {prediction?.risk}
                      </span>

                    </p>

                    <p className="mb-0">
                      <strong>Detection Model :</strong>{" "}
                      Hybrid AI (Isolation Forest + Business Rules)
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Behaviour Summary */}

            <div className="card shadow-sm mb-4">

              <div className="card-header bg-light fw-bold">
                📊 Behaviour Summary
              </div>

              <div className="card-body">

                <div className="row g-3">

                  <div className="col-md-4 col-lg">
                    <div className="card border-primary text-center h-100">
                      <div className="card-body">
                        <h6 className="text-muted">
                          Failed Logins
                        </h6>

                        <h2 className="fw-bold text-primary">
                          {baseline?.avg_failed_logins}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 col-lg">
                    <div className="card border-success text-center h-100">
                      <div className="card-body">
                        <h6 className="text-muted">
                          Files Downloaded
                        </h6>

                        <h2 className="fw-bold text-success">
                          {baseline?.avg_files_downloaded}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 col-lg">
                    <div className="card border-warning text-center h-100">
                      <div className="card-body">
                        <h6 className="text-muted">
                          Emails Sent
                        </h6>

                        <h2 className="fw-bold text-warning">
                          {baseline?.avg_emails_sent}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg">
                    <div className="card border-info text-center h-100">
                      <div className="card-body">
                        <h6 className="text-muted">
                          USB Usage
                        </h6>

                        <h2 className="fw-bold text-info">
                          {baseline?.usb_usage_rate}%
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg">
                    <div className="card border-danger text-center h-100">
                      <div className="card-body">
                        <h6 className="text-muted">
                          After Hours
                        </h6>

                        <h2 className="fw-bold text-danger">
                          {baseline?.after_hours_rate}%
                        </h2>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Risk Factors */}

            <div className="card shadow-sm mb-4">

              <div className="card-header bg-light fw-bold">
                ⚠ Risk Factors
              </div>

              <div className="card-body">

                <ul className="mb-0">

                  {baseline?.avg_failed_logins >= 8 && (
                    <li>Excessive failed login attempts detected.</li>
                  )}

                  {baseline?.avg_files_downloaded >= 400 && (
                    <li>Large number of files downloaded.</li>
                  )}

                  {baseline?.avg_emails_sent >= 80 && (
                    <li>High email activity detected.</li>
                  )}

                  {baseline?.usb_usage_rate >= 80 && (
                    <li>Heavy USB device usage observed.</li>
                  )}

                  {baseline?.after_hours_rate >= 80 && (
                    <li>Frequent after-hours system activity.</li>
                  )}

                  {!(
                    baseline?.avg_failed_logins >= 8 ||
                    baseline?.avg_files_downloaded >= 400 ||
                    baseline?.avg_emails_sent >= 80 ||
                    baseline?.usb_usage_rate >= 80 ||
                    baseline?.after_hours_rate >= 80
                  ) && (
                    <li className="text-success">
                      No significant risk factors detected.
                    </li>
                  )}

                </ul>

              </div>

            </div>

            {/* Recommendation */}

            <div
              className={`alert ${
                isHighRisk
                  ? "alert-danger"
                  : "alert-success"
              }`}
            >
              <h5 className="fw-bold">
                🛡 Recommendation
              </h5>

              {isHighRisk ? (
                <ul className="mb-0">
                  <li>Immediate investigation recommended.</li>
                  <li>Review login history and downloaded files.</li>
                  <li>Audit USB activity.</li>
                  <li>Notify the Security Operations Team.</li>
                </ul>
              ) : (
                <ul className="mb-0">
                  <li>No suspicious behaviour detected.</li>
                  <li>Continue routine monitoring.</li>
                  <li>No immediate action required.</li>
                </ul>
              )}

            </div>

          </div>

          {/* Footer */}

          <div className="modal-footer justify-content-between">

            <small className="text-muted">
              AI Insider Threat Behavioral Intelligence System
            </small>

            <div>

              <button
                className="btn btn-outline-secondary me-2"
                onClick={onClose}
              >
                Close
              </button>

              <button
                className="btn btn-primary"
                onClick={onDownload}
              >
                📄 Download PDF
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ReportPreviewModal;