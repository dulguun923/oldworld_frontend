import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./create-post.css";
import "./search-modal.css";

export default function SearchModal({ onClose }) {
    const [query, setQuery] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch posts to derive user list (Mock backend doesn't have /users)
        api.get("/posts")
            .then(res => {
                if (Array.isArray(res.data)) {
                    const uniqueUsers = {};
                    res.data.forEach(post => {
                        if (post.user_email && !uniqueUsers[post.user_email]) {
                            uniqueUsers[post.user_email] = {
                                email: post.user_email,
                                name: post.user || post.user_email.split('@')[0],
                                avatar: post.user_avatar
                            };
                        }
                    });
                    setAllUsers(Object.values(uniqueUsers));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load users for search", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = allUsers.filter(u =>
            u.name.toLowerCase().includes(lowerQuery) ||
            u.email.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered);
    }, [query, allUsers]);

    const handleUserClick = (email) => {
        navigate(`/profile/${email}`);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Find People</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <input
                        type="text"
                        className="modal-textarea"
                        style={{ height: "auto", minHeight: "auto", padding: "12px", marginBottom: "0" }}
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />

                    <div className="search-results">
                        {loading && <div className="no-results">Loading users...</div>}

                        {!loading && query && results.length === 0 && (
                            <div className="no-results">No users found.</div>
                        )}

                        {!loading && !query && (
                            <div className="no-results" style={{ opacity: 0.5 }}>Type to find friends...</div>
                        )}

                        {results.map(user => (
                            <div
                                key={user.email}
                                className="search-result-item"
                                onClick={() => handleUserClick(user.email)}
                            >
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                                    alt={user.name}
                                    className="search-avatar"
                                />
                                <div className="search-info">
                                    <div className="search-username">{user.name}</div>
                                    <div className="search-email">{user.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
