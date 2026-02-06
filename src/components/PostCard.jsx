import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import "./post-card.css";
import "./post-card-link.css";

export default function PostCard({ post }) {
    const { user } = useAuth();
    const { triggerNotification } = useNotifications();
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);

    // Determine avatar logic:
    // 1. Post's saved avatar (new posts)
    // 2. If it's MY post, use my local current avatar (fixes old posts)
    // 3. Fallback to Post's old avatar field
    // 4. Fallback to UI Avatars
    let avatar = post.user_avatar || post.avatar;

    // Retroactive fix: If this post belongs to the current user, use their latest info
    // This ensures even old posts show the correct new photo and name
    let displayName = post.user || post.user_email?.split('@')[0] || "User";
    if (user && post.user_email === user.email) {
        const localAvatar = localStorage.getItem("userAvatar");
        if (localAvatar) avatar = localAvatar;

        const localName = localStorage.getItem("userName");
        if (localName) displayName = localName;
    }

    if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${displayName}&background=0ea5a4&color=fff`;
    }

    // Unique keys for localStorage
    const STORAGE_KEY_LIKES = `post_likes_${post.id || post.created_at}`;
    const STORAGE_KEY_COMMENTS = `post_comments_${post.id || post.created_at}`;

    // Load persisted data
    useEffect(() => {
        const savedLikes = localStorage.getItem(STORAGE_KEY_LIKES);
        if (savedLikes) {
            const parsed = JSON.parse(savedLikes);
            setLikes(parsed.count);
            setIsLiked(parsed.isLiked);
        }

        const savedComments = localStorage.getItem(STORAGE_KEY_COMMENTS);
        if (savedComments) {
            try {
                setComments(JSON.parse(savedComments));
            } catch (e) {
                console.error("Failed to parse comments", e);
            }
        }
    }, [STORAGE_KEY_LIKES, STORAGE_KEY_COMMENTS]);

    const getRelativeTime = (dateString) => {
        if (!dateString) return "Just now";
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const handleLike = () => {
        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : likes - 1;

        setIsLiked(newIsLiked);
        setLikes(newLikes);

        localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify({
            count: newLikes,
            isLiked: newIsLiked
        }));

        if (newIsLiked) {
            triggerNotification(post.user_email, 'like', 'liked your post');
        }
    };

    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: `Post by ${displayName}`,
            text: `${displayName} posted: ${post.content}`,
            url: window.location.href // Currently shares current page, ideally would be post permalink
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment = {
            id: Date.now(),
            user: "You", // In a real app, use auth context
            avatar: `https://ui-avatars.com/api/?name=You&background=0ea5a4&color=fff`,
            text: comment
        };

        const updatedComments = [...comments, newComment];
        setComments(updatedComments);
        setComment("");

        setComments(updatedComments);
        setComment("");

        localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(updatedComments));

        triggerNotification(post.user_email, 'comment', 'commented on your post');
    };

    return (
        <div className="post-card">

            {/* LEFT: Avatar + Thread Line */}
            <div className="post-left">
                <Link to={`/profile/${post.user_email}`} className="avatar-link">
                    <img
                        src={avatar}
                        alt={displayName}
                        className="post-avatar"
                    />
                </Link>
                <div className="thread-line"></div>
            </div>

            {/* RIGHT: Content */}
            <div className="post-right">
                <div className="post-header">
                    <Link to={`/profile/${post.user_email}`} className="post-user-link">
                        <span className="post-user">{displayName}</span>
                    </Link>
                    <span className="post-time">{getRelativeTime(post.created_at)}</span>
                </div>

                <div className="post-content">
                    {post.content || post.body}
                    {post.image && (
                        <img className="post-image" src={post.image} alt="Post content" />
                    )}
                </div>

                {/* Actions */}
                <div className="post-actions">
                    <button
                        className={`post-action-btn ${isLiked ? "liked" : ""}`}
                        onClick={handleLike}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {likes > 0 && <span className="like-count">{likes}</span>}
                    </button>
                    <button
                        className={`post-action-btn ${showComments ? "active" : ""}`}
                        onClick={() => setShowComments(!showComments)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        {comments.length > 0 && <span className="like-count">{comments.length}</span>}
                    </button>
                    <button
                        className="post-action-btn"
                        onClick={handleShare}
                        title={isCopied ? "Copied!" : "Share"}
                    >
                        {isCopied ? (
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-color)' }}>Copied!</span>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Comment Section */}
                {showComments && (
                    <div className="comment-section">
                        <form onSubmit={handleCommentSubmit} className="comment-input-wrapper">
                            <input
                                type="text"
                                className="comment-input"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="comment-submit-btn"
                                disabled={!comment.trim()}
                            >
                                Post
                            </button>
                        </form>

                        {comments.length > 0 && (
                            <div className="comments-list">
                                {comments.map((c) => (
                                    <div key={c.id} className="comment-item">
                                        <img src={c.avatar} alt="User" className="comment-avatar" />
                                        <div className="comment-content">
                                            <div className="comment-author">{c.user}</div>
                                            <div className="comment-text">{c.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
