import API_URL from "./api";

export async function loginUser({ email, password }) {
    const formBody = new URLSearchParams();

    formBody.append("username", email);
    formBody.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
    });

    const data = await response.json();

    if (!response.ok) {
        return {
            detail: data.detail || "Login failed",
        };
    }

    localStorage.setItem("token", data.access_token);

    const meResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
        },
    });

    const me = await meResponse.json();

    if (!meResponse.ok) {
        return {
            detail: me.detail || "Failed to fetch user profile",
        };
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", me.role);
    localStorage.setItem("name", me.full_name);
    localStorage.setItem("email", me.email);

    return {
        access_token: data.access_token,
        role: me.role,
        user: me.full_name,
        email: me.email,
    };
}


export async function registerUser(data) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return await response.json();
}


export function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
}