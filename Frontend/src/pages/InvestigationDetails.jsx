import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
    getInvestigationDetails,
    getInvestigationTimeline,
    getThreatEvidence,
    getDeviceAnalysis,
    getRiskHistory,
    getEventCorrelation,
    updateWorkflow,
    downloadInvestigationReport
} from "../services/investigationService";

import "../styles/dashboard.css";

function InvestigationDetails() {

    const { id } = useParams();

    const [investigation, setInvestigation] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [evidence, setEvidence] = useState(null);
    const [deviceAnalysis, setDeviceAnalysis] = useState(null);
    const [riskHistory, setRiskHistory] = useState(null);
    const [correlation, setCorrelation] = useState(null);
    const [workflow, setWorkflow] = useState({

                assigned_analyst: "",

                status: "",

                investigation_notes: "",

                recommendation: ""

            });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvestigation();
    }, []);

    const loadInvestigation = async () => {

        try {

            const details = await getInvestigationDetails(id);

            const timelineData =
            await getInvestigationTimeline(id);

           const evidenceData =
            await getThreatEvidence(id);

           const deviceData =
            await getDeviceAnalysis(id);

           const historyData =
            await getRiskHistory(id);

            setInvestigation(details);

            setWorkflow({

                assigned_analyst: details.assigned_analyst,

                status: details.status,

                investigation_notes: details.investigation_notes,

                recommendation: details.recommendation

            });

            setTimeline(timelineData.events);

            setEvidence(evidenceData);

            setDeviceAnalysis(deviceData);

            setRiskHistory(historyData);

            const correlationData =
            await getEventCorrelation(id);

            setCorrelation(correlationData);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };
    const saveWorkflow = async () => {

    try {
        await updateWorkflow(id, workflow);

        alert("Investigation Workflow Updated Successfully");

        loadInvestigation();

    } catch (error) {

        console.error(error);

        alert("Failed to update workflow");
    }
};

    if (loading) {

        return (

            <div className="text-center mt-5">

                <div className="spinner-border"></div>

            </div>

        );

    }

    const handleGenerateReport = async () => {

    try {

        const pdfBlob =
            await downloadInvestigationReport(id);

        const url = window.URL.createObjectURL(
            new Blob(
                [pdfBlob],
                {
                    type: "application/pdf"
                }
            )
        );

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `${investigation.employee_code}_Investigation_Report.pdf`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error(
            "Failed to generate investigation report:",
            error
        );

        alert(
            "Failed to generate investigation report."
        );
    }
};

    return (

        <div className="dashboard-container">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="dashboard-body">

                    <h2 className="fw-bold mb-4">

                        Investigation Details

                    </h2>

                    <div className="card shadow">

                        <div className="card-header bg-danger text-white">

                            Investigation Summary

                        </div>

                        <div className="card-body">

                            <table className="table table-borderless">

                                <tbody>

                                    <tr>

                                        <th>Incident</th>

                                        <td>

                                            #{investigation.id}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Employee</th>

                                        <td>

                                            {investigation.employee_code}

                                            {" - "}

                                            {investigation.full_name}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Department</th>

                                        <td>

                                            {investigation.department}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Role</th>

                                        <td>

                                            {investigation.role}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Threat Severity</th>

                                        <td>

                                            {investigation.threat_severity}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Status</th>

                                        <td>

                                            {investigation.status}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Assigned Analyst</th>

                                        <td>

                                            {investigation.assigned_analyst}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Recommendation</th>

                                        <td>

                                            {investigation.recommendation}

                                        </td>

                                    </tr>

                                    <tr>

                                        <th>Notes</th>

                                        <td>

                                            {investigation.investigation_notes}

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>
                    {/* ==========================================
        Activity Timeline
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-primary text-white">

        <h5 className="mb-0">

            <i className="bi bi-clock-history me-2"></i>

            Activity Timeline

        </h5>

    </div>

    <div className="card-body">

        {timeline.map((event, index) => (

            <div
                key={index}
                className="d-flex mb-4"
            >

                {/* Timeline Icon */}

                <div
                    className="me-3 text-center"
                    style={{ width: "70px" }}
                >

                    <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                        style={{
                            width: "45px",
                            height: "45px",
                            fontWeight: "bold"
                        }}
                    >

                        {index + 1}

                    </div>

                    {index !== timeline.length - 1 && (

                        <div
                            style={{
                                width: "2px",
                                height: "45px",
                                background: "#0d6efd",
                                margin: "0 auto"
                            }}
                        ></div>

                    )}

                </div>

                {/* Timeline Content */}

                <div className="flex-grow-1">

                    <div className="d-flex justify-content-between">

                        <h6 className="fw-bold">

                            {event.title}

                        </h6>

                        <small className="text-muted">

                            {event.time}

                        </small>

                    </div>

                    <p className="mb-2 text-muted">

                        {event.description}

                    </p>

                    <span
                        className={
                            event.severity === "Critical"

                                ? "badge bg-dark"

                                : event.severity === "High"

                                ? "badge bg-danger"

                                : event.severity === "Medium"

                                ? "badge bg-warning text-dark"

                                : "badge bg-success"
                        }
                    >

                        {event.severity}

                    </span>

                </div>

            </div>

        ))}

    </div>

</div>

{/* ==========================================
        Threat Evidence Collection
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-danger text-white">

        <h5 className="mb-0">

            <i className="bi bi-shield-exclamation me-2"></i>

            Threat Evidence Collection

        </h5>

    </div>

    <div className="card-body">

        <div className="row">

            <div className="col-md-6">

                <p>
                    <strong>Failed Logins:</strong>{" "}
                    {evidence.failed_logins}
                </p>

                <p>
                    <strong>Files Downloaded:</strong>{" "}
                    {evidence.files_downloaded}
                </p>

                <p>
                    <strong>Emails Sent:</strong>{" "}
                    {evidence.emails_sent}
                </p>

            </div>

            <div className="col-md-6">

                <p>
                    <strong>USB Used:</strong>{" "}
                    {evidence.usb_used ? "Yes" : "No"}
                </p>

                <p>
                    <strong>After Hours Login:</strong>{" "}
                    {evidence.after_hours_login ? "Yes" : "No"}
                </p>

                <p>
                    <strong>Detection Method:</strong>{" "}
                    {evidence.detection_method}
                </p>

                <span className="badge bg-danger fs-6">

                    {evidence.risk_level}

                </span>

            </div>

        </div>

    </div>

</div>

{/* ==========================================
        Device Analysis
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-dark text-white">

        <h5 className="mb-0">

            <i className="bi bi-pc-display me-2"></i>

            Device Analysis

        </h5>

    </div>

    <div className="card-body">

        <div className="row">

            {/* Left Column */}

            <div className="col-md-6">

                <table className="table table-borderless">

                    <tbody>

                        <tr>

                            <th>Login Hour</th>

                            <td>

                                {deviceAnalysis.login_hour}:00

                            </td>

                        </tr>

                        <tr>

                            <th>USB Device Used</th>

                            <td>

                                {deviceAnalysis.usb_used ?

                                    <span className="badge bg-danger">
                                        Yes
                                    </span>

                                    :

                                    <span className="badge bg-success">
                                        No
                                    </span>

                                }

                            </td>

                        </tr>

                        <tr>

                            <th>After Hours Login</th>

                            <td>

                                {deviceAnalysis.after_hours_login ?

                                    <span className="badge bg-warning text-dark">
                                        Yes
                                    </span>

                                    :

                                    <span className="badge bg-success">
                                        No
                                    </span>

                                }

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

            {/* Right Column */}

            <div className="col-md-6">

                <table className="table table-borderless">

                    <tbody>

                        <tr>

                            <th>Files Downloaded</th>

                            <td>

                                {deviceAnalysis.files_downloaded}

                            </td>

                        </tr>

                        <tr>

                            <th>Emails Sent</th>

                            <td>

                                {deviceAnalysis.emails_sent}

                            </td>

                        </tr>

                        <tr>

                            <th>Device Risk</th>

                            <td>

                                <span
                                    className={
                                        deviceAnalysis.device_risk === "High"

                                            ? "badge bg-danger fs-6"

                                            : deviceAnalysis.device_risk === "Medium"

                                            ? "badge bg-warning text-dark fs-6"

                                            : "badge bg-success fs-6"
                                    }
                                >

                                    {deviceAnalysis.device_risk}

                                </span>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>

{/* ==========================================
        User Risk History
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-info text-white">

        <h5 className="mb-0">

            <i className="bi bi-person-lines-fill me-2"></i>

            User Risk History

        </h5>

    </div>

    <div className="card-body">

        <div className="row">

            <div className="col-md-6">

                <table className="table table-borderless">

                    <tbody>

                        <tr>

                            <th>Employee</th>

                            <td>{riskHistory.employee_name}</td>

                        </tr>

                        <tr>

                            <th>Current Risk</th>

                            <td>

                                <span
                                    className={
                                        riskHistory.current_risk === "Critical"

                                            ? "badge bg-dark"

                                            : riskHistory.current_risk === "High"

                                            ? "badge bg-danger"

                                            : riskHistory.current_risk === "Medium"

                                            ? "badge bg-warning text-dark"

                                            : "badge bg-success"
                                    }
                                >

                                    {riskHistory.current_risk}

                                </span>

                            </td>

                        </tr>

                        <tr>

                            <th>Previous Risk</th>

                            <td>

                                {riskHistory.previous_risk}

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

            <div className="col-md-6">

                <table className="table table-borderless">

                    <tbody>

                        <tr>

                            <th>Total Incidents</th>

                            <td>

                                {riskHistory.total_incidents}

                            </td>

                        </tr>

                        <tr>

                            <th>Average Risk Score</th>

                            <td>

                                {riskHistory.average_risk_score}

                            </td>

                        </tr>

                        <tr>

                            <th>Behaviour Trend</th>

                            <td>

                                <span
                                    className={
                                        riskHistory.behaviour_trend === "Increasing"

                                            ? "badge bg-danger"

                                            : riskHistory.behaviour_trend === "Elevated"

                                            ? "badge bg-warning text-dark"

                                            : "badge bg-success"
                                    }
                                >

                                    {riskHistory.behaviour_trend}

                                </span>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>

{/* ==========================================
        Event Correlation
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-danger text-white">

        <h5 className="mb-0">

            <i className="bi bi-diagram-3-fill me-2"></i>

            Event Correlation

        </h5>

    </div>

    <div className="card-body">

        <div className="row mb-4">

            <div className="col-md-4">

                <strong>Employee</strong>

                <p>{correlation.employee_name}</p>

            </div>

            <div className="col-md-4">

                <strong>Total Events</strong>

                <p>{correlation.total_events}</p>

            </div>

            <div className="col-md-4">

                <strong>Correlation Score</strong>

                <span className="badge bg-danger fs-6">

                    {correlation.correlation_score}%

                </span>

            </div>

        </div>

        <table className="table table-hover">

            <thead>

                <tr>

                    <th>Security Event</th>

                    <th>Severity</th>

                    <th>Correlated</th>

                </tr>

            </thead>

            <tbody>

                {correlation.events.map((event, index) => (

                    <tr key={index}>

                        <td>{event.event}</td>

                        <td>

                            <span className="badge bg-warning text-dark">

                                {event.severity}

                            </span>

                        </td>

                        <td>

                            <span className="badge bg-success">

                                Yes

                            </span>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    </div>

</div>

{/* ==========================================
        Investigation Workflow
========================================== */}

<div className="card shadow mt-4">

    <div className="card-header bg-success text-white">

        <h5 className="mb-0">

            <i className="bi bi-clipboard-check-fill me-2"></i>

            Investigation Workflow

        </h5>

    </div>

    <div className="card-body">

        <div className="row">

            {/* Assigned Analyst */}

            <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">

                    Assigned Analyst

                </label>

                <select
                    className="form-select"
                    value={workflow.assigned_analyst}
                    onChange={(e) =>
                        setWorkflow({
                            ...workflow,
                            assigned_analyst: e.target.value
                        })
                    }
                >

                    <option>Unassigned</option>

                    <option>Darshan Lohakare</option>

                    <option>Security Analyst</option>

                    <option>SOC Team</option>

                    <option>Incident Response Team</option>

                </select>

            </div>

            {/* Status */}

            <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">

                    Investigation Status

                </label>

                <select
                    className="form-select"
                    value={workflow.status}
                    onChange={(e) =>
                        setWorkflow({
                            ...workflow,
                            status: e.target.value
                        })
                    }
                >

                    <option>Open</option>

                    <option>Assigned</option>

                    <option>Investigating</option>

                    <option>Resolved</option>

                    <option>Closed</option>

                </select>

            </div>

        </div>

        {/* Investigation Notes */}

        <div className="mb-3">

            <label className="form-label fw-bold">

                Investigation Notes

            </label>

            <textarea
                rows="5"
                className="form-control"
                value={workflow.investigation_notes}
                onChange={(e) =>
                    setWorkflow({
                        ...workflow,
                        investigation_notes: e.target.value
                    })
                }
            />

        </div>

        {/* Recommendation */}

        <div className="mb-3">

            <label className="form-label fw-bold">

                Recommendation

            </label>

            <textarea
                rows="4"
                className="form-control"
                value={workflow.recommendation}
                onChange={(e) =>
                    setWorkflow({
                        ...workflow,
                        recommendation: e.target.value
                    })
                }
            />

        </div>

        <div className="text-end">

            <button
                className="btn btn-success"
                onClick={saveWorkflow}
            >

                <i className="bi bi-check-circle-fill me-2"></i>

                Save Workflow

            </button>

        </div>

        <div className="text-end mt-3">

    <button
        className="btn btn-danger"
        onClick={handleGenerateReport}
    >

        <i className="bi bi-file-earmark-pdf-fill me-2"></i>

        Generate Investigation Report

    </button>

</div>

    </div>

</div>

                </div>

            </div>

        </div>

    );

}

export default InvestigationDetails;