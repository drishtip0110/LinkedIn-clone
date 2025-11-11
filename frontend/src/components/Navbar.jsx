import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await axios.get(`/api/users/search?q=${query}`);
        setSearchResults(response.data.users || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h2>LinkedIn</h2>
          </div>

          <div className="search-container" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for people..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {showResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="search-result-item"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <img
                      src={
                        user.profilePicture
                          ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                          : "/default-avatar.png"
                      }
                      alt={user.name}
                      className="search-avatar"
                    />
                    <div className="search-user-info">
                      <span className="search-user-name">{user.name}</span>
                      <span className="search-user-bio">
                        {user.bio || "No bio"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="navbar-menu">
            <div className="navbar-user">
              <span>Welcome, {user?.name}</span>
              <img
                src={
                  user?.profilePicture
                    ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                    : "/default-avatar.png"
                }
                alt="Profile"
                className="user-avatar"
              />
            </div>
            <div className="navbar-links">
              <a href="/feed">Feed</a>
              <a href="/profile">Profile</a>
              <button onClick={logout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
