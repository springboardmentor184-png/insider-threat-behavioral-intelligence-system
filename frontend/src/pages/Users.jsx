import React from "react";


function Users() {
    return (
        <div className="users-container">
            <h1>User Management</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>1</td>
                        <td>John Doe</td>
                        <td>Security Analyst</td>
                        <td>Active</td>
                    </tr>

                    <tr>
                        <td>2</td>
                        <td>Alice</td>
                        <td>Administrator</td>
                        <td>Active</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Users;