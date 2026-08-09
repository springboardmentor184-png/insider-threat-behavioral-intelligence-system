import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function OAuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role");
        const name = searchParams.get("name");

        if (token) {
            login({
                access_token: token,
                role: role,
                user: name,
            });

            navigate("/dashboard");
        } else {
            navigate("/login");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, navigate]);

    return <p>Signing you in...</p>;
}

export default OAuthSuccess;