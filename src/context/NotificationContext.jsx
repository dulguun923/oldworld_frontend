import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications for the current user
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const loadNotifications = () => {
            const key = `notifications_${user.email}`;
            const stored = JSON.parse(localStorage.getItem(key) || "[]");

            // Sort by newest first
            stored.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setNotifications(stored);
            setUnreadCount(stored.filter(n => !n.read).length);
        };

        loadNotifications();

        // Poll for new notifications (since we don't have real websockets)
        const interval = setInterval(loadNotifications, 2000);
        return () => clearInterval(interval);

    }, [user]);

    const markAllAsRead = () => {
        if (!user) return;
        const key = `notifications_${user.email}`;

        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);

        localStorage.setItem(key, JSON.stringify(updated));
    };

    const triggerNotification = (recipientEmail, type, contentObj) => {
        if (!recipientEmail || recipientEmail === user?.email) return; // Don't notify self

        const key = `notifications_${recipientEmail}`;
        const currentRecipNotifications = JSON.parse(localStorage.getItem(key) || "[]");

        const newNotification = {
            id: Date.now(),
            type, // 'like', 'comment', 'follow'
            actor: user.email,
            actorName: localStorage.getItem("userName") || user.email.split('@')[0],
            actorAvatar: localStorage.getItem("userAvatar"),
            content: contentObj, // e.g. "liked your post"
            read: false,
            timestamp: new Date().toISOString()
        };

        currentRecipNotifications.push(newNotification);

        // Limit to last 50 notifications to prevent overflow
        if (currentRecipNotifications.length > 50) {
            currentRecipNotifications.shift();
        }

        localStorage.setItem(key, JSON.stringify(currentRecipNotifications));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, triggerNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}
