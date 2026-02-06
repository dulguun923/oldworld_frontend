import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../logo/logo.png";
import "./home.css";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        {/* LEFT SIDE: Text & Actions */}
        <div className="home-left">
          <h1 className="home-title">
            Welcome to <br />
            <span>OldWorld</span>
          </h1>
          <p className="home-subtitle">
            Experience the next generation of social connection.
            Minimalist, fast, and built for you. Join the community today.
          </p>

          <div className="home-actions">
            {!user ? (
              <>
                <button
                  className="home-btn primary"
                  onClick={() => navigate("/register")}
                >
                  Start Journey
                </button>
                <button
                  className="home-btn secondary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            ) : (
              <button
                className="home-btn primary"
                onClick={() => navigate("/feed")}
              >
                Go to Feed
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Glass Logo */}
        <div className="home-right">
          <div className="logo-glass">
            <img src={logo} alt="OldWorld Logo" />
          </div>
        </div>
      </div>
    </div>
  );
}
