import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    
    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role");
        const name = searchParams.get("name");

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("name", name);
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return <p>Signing you in...</p>;
}

export default OAuthSuccess;