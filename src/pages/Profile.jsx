import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import api from "../api";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import "./profile.css";

export default function Profile() {
    const { user } = useAuth();
    const { triggerNotification } = useNotifications();
    const { email } = useParams(); // Get email from URL if visiting another profile
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Determine target user (Visiting vs Self)
    const isOwner = !email || email === user?.email;
    const profileEmail = isOwner ? user?.email : email;

    // Local state for profile info (derived from posts if not owner)
    const [profileUsername, setProfileUsername] = useState(() => {
        if (isOwner) {
            return localStorage.getItem("userName") || user?.email?.split('@')[0] || "User";
        }
        return "User";
    });
    const [profileAvatar, setProfileAvatar] = useState("");

    // Follow System State
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Initial Loading of Data
    useEffect(() => {
        if (!profileEmail) return;

        // 1. Fetch Posts to get user data and content
        api.get("/posts")
            .then(res => {
                if (Array.isArray(res.data)) {
                    // Filter posts for this specific profile
                    const userPosts = res.data.filter(p => p.user_email === profileEmail);
                    setPosts(userPosts);

                    // Attempt to extract metadata from latest post
                    if (isOwner) {
                        // Priority: localStorage for owner
                        setProfileUsername(localStorage.getItem("userName") || user?.email?.split('@')[0]);
                        setProfileAvatar(localStorage.getItem("userAvatar"));
                    } else if (userPosts.length > 0) {
                        // For others: extract from their latest post
                        const latest = userPosts[0];
                        setProfileUsername(latest.user || "User");
                        setProfileAvatar(latest.user_avatar || latest.avatar || "");
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // 2. Load Follow Data
        loadFollowStats();
        if (!isOwner) checkIsFollowing();

    }, [profileEmail, isOwner, user]);

    const loadFollowStats = () => {
        const followers = JSON.parse(localStorage.getItem(`followers_${profileEmail}`) || "[]");
        const following = JSON.parse(localStorage.getItem(`following_${profileEmail}`) || "[]");
        setFollowersCount(followers.length);
        setFollowingCount(following.length);
    };

    const checkIsFollowing = () => {
        const myFollowing = JSON.parse(localStorage.getItem(`following_${user?.email}`) || "[]");
        setIsFollowing(myFollowing.includes(profileEmail));
    };

    const handleFollowToggle = () => {
        if (!user) return;

        const myFollowingKey = `following_${user.email}`;
        const theirFollowersKey = `followers_${profileEmail}`;

        let myFollowing = JSON.parse(localStorage.getItem(myFollowingKey) || "[]");
        let theirFollowers = JSON.parse(localStorage.getItem(theirFollowersKey) || "[]");

        if (isFollowing) {
            // Unfollow
            myFollowing = myFollowing.filter(e => e !== profileEmail);
            theirFollowers = theirFollowers.filter(e => e !== user.email);
        } else {
            // Follow
            myFollowing.push(profileEmail);
            theirFollowers.push(user.email);
            triggerNotification(profileEmail, 'follow', 'started following you');
        }

        localStorage.setItem(myFollowingKey, JSON.stringify(myFollowing));
        localStorage.setItem(theirFollowersKey, JSON.stringify(theirFollowers));

        setIsFollowing(!isFollowing);
        setFollowersCount(theirFollowers.length); // Update displayed count
    };

    // Handle Profile Update (Only for Owner)
    const handleProfileUpdate = (newUsername, newAvatar) => {
        setProfileUsername(newUsername);
        setProfileAvatar(newAvatar || "");
        // Refresh posts to trigger re-render if needed
        api.get("/posts").then(res => {
            const userPosts = res.data.filter(p => p.user_email === profileEmail);
            setPosts(userPosts);
        });
    };

    if (loading) return <div className="feed-loading">Loading profile...</div>;

    const finalAvatar = profileAvatar || `https://ui-avatars.com/api/?name=${profileUsername}&background=0ea5a4&color=fff&size=120`;

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                {/* User Info Card */}
                <div className="profile-header">
                    <img
                        src={finalAvatar}
                        alt={profileUsername}
                        className="profile-avatar"
                    />
                    <h1 className="profile-username">{profileUsername}</h1>
                    <p className="profile-email">{profileEmail}</p>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{posts.length}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{followersCount}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{followingCount}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>

                    {isOwner ? (
                        <button
                            className="edit-profile-btn"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="profile-actions">
                            <button
                                className={`follow-btn ${isFollowing ? "following" : ""}`}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                            <button
                                className="message-btn"
                                onClick={() => navigate('/messages', { state: { startChatWith: profileEmail } })}
                            >
                                Message
                            </button>
                        </div>
                    )}
                </div>

                {/* Posts Section */}
                <h2 className="profile-posts-header">{isOwner ? "Your Posts" : `${profileUsername}'s Posts`}</h2>
                <div className="profile-posts">
                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No posts yet.</p>
                        </div>
                    ) : (
                        posts.map(p => (
                            <PostCard
                                key={p.id}
                                post={{
                                    ...p, // Pass all post data
                                    user: profileUsername, // Ensure consistency
                                    avatar: finalAvatar
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Edit Profile Modal (Only for Owner) */}
            {isOwner && isEditModalOpen && (
                <EditProfileModal
                    onClose={() => setIsEditModalOpen(false)}
                    currentUsername={profileUsername}
                    currentAvatar={profileAvatar}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
}
