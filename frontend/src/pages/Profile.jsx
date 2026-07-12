import React from "react";


function Profile() {
    return (
        <div className="profile-container">
            <h1>Employee Profile</h1>

            <table border="1" cellPadding="10">
                <tbody>
                    <tr>
                        <td>Employee ID</td>
                        <td>EMP001</td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>John Doe</td>
                    </tr>
                    <tr>
                        <td>Department</td>
                        <td>IT Security</td>
                    </tr>
                    <tr>
                        <td>Role</td>
                        <td>Security Analyst</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>john@example.com</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Profile;