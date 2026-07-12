import React from "react";


function Reports() {
    return (
        <div className="reports-container">
            <h1>Security Reports</h1>

            <ul>
                <li>Behavior Analysis Report</li>
                <li>Threat Detection Report</li>
                <li>Risk Assessment Report</li>
                <li>Employee Activity Report</li>
            </ul>

            <button>Export PDF</button>
            <button>Export Excel</button>
        </div>
    );
}

export default Reports;