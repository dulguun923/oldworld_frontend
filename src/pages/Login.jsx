import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    api.post("/login", { email, password })
      .then(res => {
        // Use the email specifically typed by the user, as API might not return it
        login(email, res.data.token);
        navigate("/feed");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && (
          <div style={{
            padding: "12px",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <div className="auth-input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <br />

        <div className="auth-input">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </div>

      </form>
    </div>
  );
}
