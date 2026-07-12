import API_URL from "./api";

export async function getAlerts() {
    const response = await fetch(`${API_URL}/alerts`);
    return response.json();
}