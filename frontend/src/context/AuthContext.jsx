import  React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");

        if (token && role) {
            setUser({
                token,
                role,
                name,
                email,
            });
        }

        setLoading(false);
    }, []);

    const login = (userData) => {
        // userData shape:
        // { access_token, role, user, email }

        localStorage.setItem(
            "token",
            userData.access_token
        );

        localStorage.setItem(
            "role",
            userData.role
        );

        localStorage.setItem(
            "name",
            userData.user
        );

        if (userData.email) {
            localStorage.setItem(
                "email",
                userData.email
            );
        }

        setUser({
            token: userData.access_token,
            role: userData.role,
            name: userData.user,
            email: userData.email,
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;