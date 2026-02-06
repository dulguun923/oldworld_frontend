import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./create-post.css";

export default function CreatePostModal({ onClose, onPostSuccess }) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result); // This is the Base64 string
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setLoading(true);

        // Rails expects data wrapped in a "post:" object for strong parameters
        const avatar = localStorage.getItem("userAvatar") || "";
        const username = localStorage.getItem("userName") || user?.email?.split('@')[0] || "User";
        const postData = {
            post: {
                body: content,
                image: image,
                user_email: user?.email,
                user_avatar: avatar,
                user: username
            }
        };

        console.log("Submitting post data:", postData);

        api.post("/posts", postData)
            .then((res) => {
                console.log("Post created successfully:", res.data);
                // Pass the new post data to parent for instant display
                const newPost = {
                    id: res.data.id || Date.now(),
                    user: res.data.user || username,
                    content: content,
                    image: res.data.image || image,
                    user_email: res.data.user_email || user?.email || "You",
                    created_at: new Date().toISOString(),
                    user_avatar: res.data.user_avatar || avatar
                };

                if (onPostSuccess) onPostSuccess(newPost);
                onClose();
            })
            .catch((err) => {
                console.error("Failed to post - Full error:", err);
                console.error("Error response:", err.response);
                console.error("Error data:", err.response?.data);
                console.error("Error status:", err.response?.status);
                console.error("Error message:", err.message);

                // Show the full error details in alert for debugging
                const errorMessage = err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.response?.data?.errors ||
                    "Failed to post. Please try again.";

                alert(`Post failed (${err.response?.status}):\n${typeof errorMessage === 'object' ? JSON.stringify(errorMessage, null, 2) : errorMessage}\n\nFull details in console.`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create Post</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <textarea
                        className="modal-textarea"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoFocus
                    />

                    {imagePreview && (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                            <button className="remove-image-btn" onClick={removeImage}>✕</button>
                        </div>
                    )}

                    <div className="modal-footer">
                        <span className="add-to-post">Add to your post</span>
                        <label className="icon-label" title="Photo/Video">
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </label>
                    </div>

                    <button
                        className="post-submit-btn"
                        onClick={submit}
                        disabled={(!content.trim() && !image) || loading}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}
