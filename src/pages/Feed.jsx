import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import CreatePost from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import "./feed.css";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tabs: 'all' or 'following'
  const [activeTab, setActiveTab] = useState("all");
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchPosts();
    loadFollowing();
  }, []);

  const loadFollowing = () => {
    const list = JSON.parse(localStorage.getItem(`following_${user?.email}`) || "[]");
    setFollowing(list);
  };

  const fetchPosts = () => {
    setLoading(true);
    api.get("/posts")
      .then(res => {
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          setPosts([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handlePostSuccess = (newPost) => {
    if (newPost) {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    fetchPosts();
  };

  // Filter posts based on active tab
  const displayedPosts = activeTab === "following"
    ? posts.filter(p => following.includes(p.user_email) || p.user_email === user?.email) // Include my own posts too
    : posts;

  if (loading) return <div className="feed-loading">Loading feed...</div>;

  return (
    <div className="feed-wrapper">
      <div className="feed-container">

        {/* Feed Tabs */}
        <div className="feed-tabs">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Posts
          </button>
          <button
            className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>

        {/* Compact Input Trigger */}
        <div className="compact-post-input" onClick={() => setIsModalOpen(true)}>
          <img
            src={localStorage.getItem("userAvatar") || `https://ui-avatars.com/api/?name=Me&background=0ea5a4&color=fff`}
            alt="My Avatar"
            className="compact-avatar"
          />
          <div className="compact-input-fake">
            What's on your mind?
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <CreatePost
            onClose={() => setIsModalOpen(false)}
            onPostSuccess={handlePostSuccess}
          />
        )}

        {/* POSTS */}
        {displayedPosts.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 40 }}>
            {activeTab === "following"
              ? <p>You aren't following anyone yet (or they haven't posted).</p>
              : <p>No posts yet. Be the first to share something!</p>}
          </div>
        )}

        {displayedPosts.map(p => (
          <PostCard
            key={p.id}
            post={p}
          />
        ))}
      </div>
    </div>
  );
}
