import { useEffect, useState } from "react";

import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/notificationService";


function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);


    const loadNotifications = async () => {

        try {

            const data =
                await getNotifications();

            setNotifications(data);

            const count =
                await getUnreadNotificationCount();

            setUnreadCount(
                count.unread_count
            );

        } catch (error) {

            console.error(
                "Error loading notifications:",
                error
            );

        }

    };


    useEffect(() => {

        loadNotifications();

        const interval =
            setInterval(
                loadNotifications,
                30000
            );

        return () =>
            clearInterval(interval);

    }, []);


    const handleRead = async (
        notificationId
    ) => {

        try {

            await markNotificationAsRead(
                notificationId
            );

            await loadNotifications();

        } catch (error) {

            console.error(
                "Error marking notification:",
                error
            );

        }

    };


    const handleReadAll = async () => {

        try {

            await markAllNotificationsAsRead();

            await loadNotifications();

        } catch (error) {

            console.error(
                "Error marking notifications:",
                error
            );

        }

    };


    return (

        <div
            className="position-relative"
        >

            <button
                className="btn btn-light position-relative"
                onClick={() =>
                    setOpen(!open)
                }
            >

                <i className="bi bi-bell-fill fs-5"></i>

                {unreadCount > 0 && (

                    <span
                        className="
                            position-absolute
                            top-0
                            start-100
                            translate-middle
                            badge
                            rounded-pill
                            bg-danger
                        "
                    >

                        {unreadCount}

                    </span>

                )}

            </button>


            {open && (

                <div
                    className="
                        card
                        shadow
                        position-absolute
                        end-0
                        mt-2
                    "
                    style={{
                        width: "380px",
                        zIndex: 1050
                    }}
                >

                    <div
                        className="
                            card-header
                            d-flex
                            justify-content-between
                            align-items-center
                        "
                    >

                        <strong>
                            Notifications
                        </strong>

                        {unreadCount > 0 && (

                            <button
                                className="
                                    btn
                                    btn-sm
                                    btn-link
                                "
                                onClick={
                                    handleReadAll
                                }
                            >
                                Mark all as read
                            </button>

                        )}

                    </div>


                    <div
                        className="card-body p-0"
                        style={{
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}
                    >

                        {notifications.length === 0 ? (

                            <div
                                className="
                                    text-center
                                    text-muted
                                    py-4
                                "
                            >

                                <i
                                    className="
                                        bi
                                        bi-bell-slash
                                        fs-3
                                    "
                                ></i>

                                <p className="mb-0 mt-2">
                                    No notifications
                                </p>

                            </div>

                        ) : (

                            notifications.map(
                                (notification) => (

                                    <div
                                        key={
                                            notification.id
                                        }
                                        className={`
                                            p-3
                                            border-bottom
                                            ${
                                                !notification.is_read
                                                    ? "bg-light"
                                                    : ""
                                            }
                                        `}
                                        onClick={() =>
                                            handleRead(
                                                notification.id
                                            )
                                        }
                                        style={{
                                            cursor:
                                                "pointer"
                                        }}
                                    >

                                        <div
                                            className="
                                                d-flex
                                                justify-content-between
                                            "
                                        >

                                            <strong>
                                                {
                                                    notification.title
                                                }
                                            </strong>

                                            <span
                                                className={`
                                                    badge
                                                    ${
                                                        notification.severity ===
                                                        "Critical"
                                                            ? "bg-dark"
                                                            : notification.severity ===
                                                              "High"
                                                            ? "bg-danger"
                                                            : "bg-warning text-dark"
                                                    }
                                                `}
                                            >

                                                {
                                                    notification.severity
                                                }

                                            </span>

                                        </div>

                                        <p
                                            className="
                                                mb-1
                                                small
                                                text-muted
                                            "
                                        >
                                            {
                                                notification.message
                                            }
                                        </p>

                                        <small
                                            className="
                                                text-secondary
                                            "
                                        >
                                            {
                                                new Date(
                                                    notification.created_at
                                                ).toLocaleString()
                                            }
                                        </small>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default NotificationBell;