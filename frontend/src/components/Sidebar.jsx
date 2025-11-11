import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchSuggestions();
    fetchRecentActivity();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get("/api/users/suggestions");
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // This would be a real endpoint in production
      const activity = [
        { id: 1, type: "hashtag", name: "React Developers", icon: "#" },
        { id: 2, type: "hashtag", name: "JavaScript Community", icon: "#" },
        { id: 3, type: "group", name: "Tech Jobs", icon: "👥" },
        { id: 4, type: "hashtag", name: "Startup India", icon: "#" }
      ];
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  return (
    <div className="sidebar">
      {/* User Profile Card */}
      <div className="sidebar-card user-card">
        <div className="user-background"></div>
        <div className="user-info">
          <img
            src={user?.profilePicture ? `${API_BASE_URL}/uploads/${user.profilePicture}` : "/default-avatar.png"}
            alt={user?.name}
            className="user-avatar"
          />
          <h3>{user?.name}</h3>
          <p className="user-title">
            {user?.headline || "Add a headline to your profile"}
          </p>
          <p className="user-location">{user?.location || "Add your location"}</p>
        </div>

        <div className="profile-views">
          <div className="views-item">
            <span className="views-label">Profile viewers</span>
            <span className="views-count">{user?.profileViews || 0}</span>
          </div>
          <div className="views-item">
            <span className="views-label">Post impressions</span>
            <span className="views-count">{user?.postImpressions || 0}</span>
          </div>
        </div>

        <div className="premium-promo">
          <span className="premium-text">
            Access exclusive tools & insights
          </span>
          <span className="premium-try">Try Premium for ₹0</span>
        </div>

        <div className="saved-items">
          <div className="saved-icon">💼</div>
          <span>My items</span>
        </div>
      </div>

      {/* Recent Section */}
      <div className="sidebar-card recent-card">
        <div className="sidebar-section">
          <h4>Recent</h4>
          {recentActivity.map((item) => (
            <div key={item.id} className="recent-item">
              <span className="recent-icon">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* People You May Know */}
      {suggestions.length > 0 && (
        <div className="sidebar-card suggestions-card">
          <div className="sidebar-section">
            <div className="section-header">
              <h4>People you may know</h4>
              <button className="btn-text">See all</button>
            </div>
            {suggestions.slice(0, 3).map((person) => (
              <div key={person._id} className="suggestion-item">
                <img
                  src={person.profilePicture ? `${API_BASE_URL}/uploads/${person.profilePicture}` : "/default-avatar.png"}
                  alt={person.name}
                  className="suggestion-avatar"
                />
                <div className="suggestion-info">
                  <span className="suggestion-name">{person.name}</span>
                  <span className="suggestion-title">{person.headline || "LinkedIn Member"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default Sidebar;
