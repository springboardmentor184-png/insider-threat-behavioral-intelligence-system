import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markNotificationAsRead
} from "../services/notificationService";


function NotificationBell() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);


  // ==========================================
  // Load Notifications
  // ==========================================

  const loadNotifications = async () => {

    try {

      const data = await getNotifications();

      setNotifications(data || []);

    } catch (error) {

      console.error(
        "Error loading notifications:",
        error
      );

    }

  };


  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {

    loadNotifications();


    const interval = setInterval(() => {

      loadNotifications();

    }, 30000);


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ==========================================
  // Unread Count
  // ==========================================

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read
  ).length;


  // ==========================================
  // Notification Redirect
  // ==========================================

  const handleNotificationClick = async (
    notification
  ) => {

    try {

      // Mark notification as read

      if (!notification.is_read) {

        await markNotificationAsRead(
          notification.id
        );

      }


      // Close dropdown

      setShowNotifications(false);


      // --------------------------------------
      // Threat Alert
      // --------------------------------------

      if (
        notification.notification_type ===
          "Threat Alert" ||
        notification.notification_type ===
          "ThreatAlert" ||
        notification.notification_type ===
          "Alert"
      ) {

        navigate("/threatalerts");

        return;

      }


      // --------------------------------------
      // Investigation
      // --------------------------------------

      if (
        notification.notification_type ===
          "Investigation" ||
        notification.notification_type ===
          "Threat Investigation"
      ) {

        navigate("/investigation");

        return;

      }


      // --------------------------------------
      // AI Prediction
      // --------------------------------------

      if (
        notification.notification_type ===
          "AI Prediction" ||
        notification.notification_type ===
          "Prediction"
      ) {

        navigate("/prediction");

        return;

      }


      // --------------------------------------
      // Employee Notification
      // --------------------------------------

      if (
        notification.notification_type ===
          "Employee"
      ) {

        navigate("/employees");

        return;

      }


      // --------------------------------------
      // Default
      // --------------------------------------

      navigate("/dashboard");

    } catch (error) {

      console.error(
        "Error opening notification:",
        error
      );

    }

  };


  // ==========================================
  // Toggle Notification Panel
  // ==========================================

  const toggleNotifications = () => {

    setShowNotifications(
      (previous) => !previous
    );

  };


  return (

    <div
      className="notification-wrapper"
      style={{
        position: "relative"
      }}
    >


      {/* ======================================
          Notification Bell
      ====================================== */}

      <button
        type="button"
        className="notification-button"
        onClick={toggleNotifications}
        title="Notifications"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          position: "relative"
        }}
      >

        <i className="bi bi-bell-fill"></i>


        {/* Unread Count */}

        {unreadCount > 0 && (

          <span
            className="notification-count"
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "#dc3545",
              color: "#fff",
              borderRadius: "50%",
              minWidth: "18px",
              height: "18px",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >

            {unreadCount > 99
              ? "99+"
              : unreadCount}

          </span>

        )}

      </button>


      {/* ======================================
          Notification Dropdown
      ====================================== */}

      {showNotifications && (

        <div
          className="notification-dropdown"
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            width: "360px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.15)",
            zIndex: 9999
          }}
        >


          {/* Header */}

          <div
            className="notification-header"
            style={{
              padding: "12px 15px",
              borderBottom:
                "1px solid #eee",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center"
            }}
          >

            <strong>
              Notifications
            </strong>


            <span
              className="text-muted"
              style={{
                fontSize: "12px"
              }}
            >

              {unreadCount} unread

            </span>

          </div>


          {/* Notification List */}

          {notifications.length === 0 ? (

            <div
              className="text-center text-muted"
              style={{
                padding: "25px"
              }}
            >

              No notifications

            </div>

          ) : (

            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto"
              }}
            >

              {notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    style={{
                      padding: "14px 15px",
                      borderBottom:
                        "1px solid #eee",
                      cursor: "pointer",
                      backgroundColor:
                        notification.is_read
                          ? "#fff"
                          : "#f5f8ff"
                    }}
                  >


                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center"
                      }}
                    >

                      <strong
                        style={{
                          fontSize: "14px"
                        }}
                      >

                        {notification.title}

                      </strong>


                      <span
                        className={
                          notification.severity ===
                          "Critical"
                            ? "badge bg-dark"
                            : notification.severity ===
                              "High"
                            ? "badge bg-danger"
                            : notification.severity ===
                              "Medium"
                            ? "badge bg-warning text-dark"
                            : "badge bg-secondary"
                        }
                      >

                        {notification.severity}

                      </span>

                    </div>


                    <p
                      className="mb-1 mt-2"
                      style={{
                        fontSize: "13px",
                        color: "#555"
                      }}
                    >

                      {notification.message}

                    </p>


                    {notification.employee_id && (

                      <small
                        className="text-primary"
                      >

                        Employee ID:{" "}
                        {notification.employee_id}

                        {" • Click to view"}

                      </small>

                    )}


                    <div>

                      <small
                        className="text-muted"
                      >

                        {notification.created_at
                          ? new Date(
                              notification.created_at
                            ).toLocaleString()
                          : ""}

                      </small>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default NotificationBell;