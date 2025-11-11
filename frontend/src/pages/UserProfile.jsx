import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("none");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data.user);
      
      // Check connection status
      if (currentUser.connections?.includes(userId)) {
        setConnectionStatus("connected");
      } else if (response.data.user.connectionRequests?.includes(currentUser.id)) {
        setConnectionStatus("pending");
      }
      
      // Fetch posts if connected
      if (currentUser.connections?.includes(userId)) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get("/api/posts");
      const allPosts = response.data.posts || [];
      const userPosts = allPosts.filter(post => post.author._id === userId);
      setUserPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleConnect = async () => {
    try {
      await axios.post(`/api/users/connect/${userId}`);
      setConnectionStatus("pending");
      alert("Connection request sent!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send request");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="loading">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-header card">
          <div className="profile-info">
            <img
              src={user.profilePicture ? `/uploads/${user.profilePicture}` : "/default-avatar.png"}
              alt={user.name}
              className="profile-avatar"
            />
            <div className="profile-details">
              <h1>{user.name}</h1>
              <p className="profile-bio">{user.bio || "No bio yet"}</p>
              <p className="profile-email">{user.email}</p>
            </div>
            
            {connectionStatus === "none" && (
              <button onClick={handleConnect} className="btn btn-primary">
                Connect
              </button>
            )}
            {connectionStatus === "pending" && (
              <button className="btn btn-outline" disabled>
                Request Sent
              </button>
            )}
            {connectionStatus === "connected" && (
              <button className="btn btn-outline" disabled>
                Connected
              </button>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{userPosts.length || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{user.connections?.length || 0}</span>
              <span className="stat-label">Connections</span>
            </div>
          </div>
        </div>

        <div className="profile-posts">
          <h2>{user.name}'s Posts</h2>
          {connectionStatus !== "connected" ? (
            <div className="empty-state card">
              <h3>Connect to see posts</h3>
              <p>Send a connection request to view {user.name}'s posts</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="empty-state card">
              <h3>No posts yet</h3>
              <p>{user.name} hasn't shared anything yet</p>
            </div>
          ) : (
            <div className="posts-grid">
              {userPosts.map((post) => (
                <div key={post._id} className="post-preview card">
                  <p className="post-content-preview">{post.content}</p>
                  {post.image && (
                    <div className="post-image-preview">
                      <img src={`/uploads/${post.image}`} alt="Post" />
                    </div>
                  )}
                  <div className="post-meta">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.likes.length} likes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;