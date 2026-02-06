import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import "./notifications.css";

export default function Notifications() {
    const { notifications, markAllAsRead } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <div className="notif-icon-type type-like">❤️</div>;
            case 'comment': return <div className="notif-icon-type type-comment">💬</div>;
            case 'follow': return <div className="notif-icon-type type-follow">➕</div>;
            default: return null;
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Notifications</h2>
                {notifications.some(n => !n.read) && (
                    <button className="mark-read-btn" onClick={markAllAsRead}>
                        Mark all read
                    </button>
                )}
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifs">
                        <h3>No notifications yet</h3>
                        <p>When people interact with you, they'll show up here.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={notif.actorAvatar || `https://ui-avatars.com/api/?name=${notif.actorName}`}
                                    alt={notif.actorName}
                                    className="notif-avatar"
                                />
                                {getIcon(notif.type)}
                            </div>

                            <div className="notif-content">
                                <div className="notif-text">
                                    <Link to={`/profile/${notif.actor}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                                        {notif.actorName}
                                    </Link>
                                    {' '}
                                    {notif.type === 'like' && 'liked your post.'}
                                    {notif.type === 'comment' && 'commented on your post.'}
                                    {notif.type === 'follow' && 'started following you.'}
                                </div>
                                <span className="notif-time">{formatTime(notif.timestamp)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
