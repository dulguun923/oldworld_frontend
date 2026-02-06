import { useState } from "react";

export default function CommentInput({ onSubmit }) {
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment);
            setComment("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="comment-input-wrapper">
            <input
                className="comment-input"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button
                className="comment-submit-btn"
                onClick={handleSubmit}
                disabled={!comment.trim()}
            >
                Post
            </button>
        </div>
    );
}
