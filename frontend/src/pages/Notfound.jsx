import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>404</h1>
            <h2>Page Not Found</h2>

            <Link to="/login">
                <button>Go to Login</button>
            </Link>
        </div>
    );
}


export default NotFound;