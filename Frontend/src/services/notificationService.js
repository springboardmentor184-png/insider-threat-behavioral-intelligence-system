import api from "./api";


// ==========================================
// Get Auth Header
// ==========================================

const getAuthHeader = () => {

    const token =
        localStorage.getItem("access_token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};


// ==========================================
// Get Notifications
// ==========================================

export const getNotifications = async () => {

    const response = await api.get(
        "/notifications",
        getAuthHeader()
    );

    return response.data;
};


// ==========================================
// Get Unread Count
// ==========================================

export const getUnreadNotificationCount = async () => {

    const response = await api.get(
        "/notifications/unread-count",
        getAuthHeader()
    );

    return response.data;
};


// ==========================================
// Mark Notification as Read
// ==========================================

export const markNotificationAsRead = async (
    notificationId
) => {

    const response = await api.put(
        `/notifications/${notificationId}/read`,
        {},
        getAuthHeader()
    );

    return response.data;
};


// ==========================================
// Mark All as Read
// ==========================================

export const markAllNotificationsAsRead = async () => {

    const response = await api.put(
        "/notifications/read-all",
        {},
        getAuthHeader()
    );

    return response.data;
};