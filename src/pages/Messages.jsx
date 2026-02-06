import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import "./messages.css";

export default function Messages() {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Initial load: Get people I follow (potential conversations)
    useEffect(() => {
        loadConversations();

        // Check if we navigated here with a specific user to chat with
        // passed via navigation state (from Profile page 'Message' button)
        if (location.state?.startChatWith) {
            const targetEmail = location.state.startChatWith;
            // Ensure this user is in our conversation list logic
            // For now, simpler: just select them directly if valid
            // Ideally we should look up their name/avatar too, but let's init basic
            handleSelectUser({
                email: targetEmail,
                name: targetEmail.split('@')[0], // Fallback name
                avatar: null // Will generated default
            });
        }
    }, [user, location.state]);

    // Load messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.email);
            // Polling for new messages sim
            const interval = setInterval(() => loadMessages(selectedUser.email), 2000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadConversations = () => {
        if (!user) return;
        // Logic: Get 'following' list. 
        // In a real app, this would be "people I have chats with".
        // For this demo: We populate the sidebar with people you FOLLOW.
        const following = JSON.parse(localStorage.getItem(`following_${user.email}`) || "[]");

        // Retrieve last message for each to show preview? Optional complexity.
        // Let's just map emails to objects
        const convos = following.map(email => ({
            email: email,
            name: email.split('@')[0], // Simple username derivation
            avatar: null // Default will be used
        }));

        // Add the user passed via nav if they aren't in following list?
        if (location.state?.startChatWith) {
            const target = location.state.startChatWith;
            if (!following.includes(target)) {
                convos.unshift({
                    email: target,
                    name: target.split('@')[0],
                    avatar: null
                });
            }
        }

        setConversations(convos);
    };

    const loadMessages = (otherEmail) => {
        if (!user) return;
        // Key needs to be consistent regardless of who is sender/receiver
        // Sort emails to generate unique chat ID
        const chatKey = [user.email, otherEmail].sort().join("_");
        const storageKey = `chat_${chatKey}`;
        const msgs = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setMessages(msgs);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const chatKey = [user.email, selectedUser.email].sort().join("_");
        const storageKey = `chat_${chatKey}`;

        const msgObj = {
            id: Date.now(),
            sender: user.email,
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, msgObj];
        setMessages(updatedMessages);
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        setNewMessage("");
    };

    const handleSelectUser = (conv) => {
        setSelectedUser(conv);
    };

    return (
        <div className="messages-container">
            {/* Sidebar */}
            <div className="messages-sidebar">
                <div className="messages-header">
                    <h2>Messages</h2>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Follow people to start chatting!
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.email}
                                className={`conversation-item ${selectedUser?.email === conv.email ? 'active' : ''}`}
                                onClick={() => handleSelectUser(conv)}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${conv.name}&background=random&color=fff`}
                                    alt={conv.name}
                                    className="conversation-avatar"
                                />
                                <div className="conversation-info">
                                    <div className="conversation-name">{conv.name}</div>
                                    <div className="conversation-preview">Click to chat</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedUser ? (
                <div className="chat-area">
                    <div className="chat-header">
                        <img
                            src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=random&color=fff`}
                            alt={selectedUser.name}
                            className="conversation-avatar"
                            style={{ width: 36, height: 36 }}
                        />
                        <h3>{selectedUser.name}</h3>
                    </div>

                    <div className="messages-list">
                        {messages.map(msg => {
                            const isMe = msg.sender === user.email;
                            return (
                                <div key={msg.id} className={`message ${isMe ? 'sent' : 'received'}`}>
                                    <div className="message-content">{msg.text}</div>
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <div className="no-chat-selected">
                    <svg className="no-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>Select a conversation</h3>
                    <p>Choose a friend from the sidebar to start chatting</p>
                </div>
            )}
        </div>
    );
}
