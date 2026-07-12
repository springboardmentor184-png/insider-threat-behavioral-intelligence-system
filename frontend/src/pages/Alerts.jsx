import React from "react";

function Alerts() {
    return (
        <div className="alerts-container">
            <h1>Threat Alerts</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Alert ID</th>
                        <th>User</th>
                        <th>Severity</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>ALT001</td>
                        <td>John Doe</td>
                        <td>High</td>
                        <td>Open</td>
                    </tr>

                    <tr>
                        <td>ALT002</td>
                        <td>Alice</td>
                        <td>Medium</td>
                        <td>Investigating</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


export default Alerts;