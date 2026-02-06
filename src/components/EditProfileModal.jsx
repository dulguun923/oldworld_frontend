import { useState, useRef } from "react";
import "./create-post.css";

export default function EditProfileModal({ onClose, currentUsername, currentAvatar, onUpdate }) {
    const [username, setUsername] = useState(currentUsername);
    const [avatar, setAvatar] = useState(currentAvatar || "");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image must be less than 2MB");
                return;
            }
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatar("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);

        // Save to localStorage for persistence
        localStorage.setItem("userAvatar", avatar);
        localStorage.setItem("userName", username);

        setTimeout(() => {
            onUpdate(username, avatar);
            setLoading(false);
            onClose();
        }, 300);
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${username}&background=0ea5a4&color=fff&size=120`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Profile</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Avatar Upload Section */}
                        <div className="avatar-upload-section">
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" }}>
                                Profile Picture
                            </label>
                            <div className="avatar-upload-wrapper">
                                <div
                                    className="avatar-upload-preview"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <img
                                        src={avatar || defaultAvatar}
                                        alt="Avatar preview"
                                        className="avatar-preview-img"
                                    />
                                    <div className="avatar-upload-overlay">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        <span>Change</span>
                                    </div>
                                </div>
                                {avatar && (
                                    <button
                                        type="button"
                                        className="remove-avatar-btn"
                                        onClick={handleRemoveAvatar}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                        </div>

                        {/* Username Input */}
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a", marginTop: "20px" }}>
                            Username
                        </label>
                        <input
                            type="text"
                            className="modal-textarea"
                            style={{ height: "auto", minHeight: "auto", padding: "12px", marginBottom: "20px" }}
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />

                        <button
                            className="post-submit-btn"
                            type="submit"
                            disabled={!username.trim() || loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
