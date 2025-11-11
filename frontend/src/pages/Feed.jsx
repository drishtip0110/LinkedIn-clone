import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts");
      setPosts(response.data.posts || response.data);
    } catch (error) {
      setError("Failed to load posts");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="container">
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="container">
        <div className="feed-layout">
          <div className="sidebar-left">
            <Sidebar />
          </div>

          <div className="main-feed">
            <CreatePost onPostCreated={handlePostCreated} />

            {error && <div className="alert alert-error">{error}</div>}

            {posts.length === 0 ? (
              <div className="empty-state card">
                <h3>No posts yet</h3>
                <p>Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <Post
                    key={post._id}
                    post={post}
                    onUpdate={handlePostUpdated}
                    onDelete={handlePostDeleted}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-right">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
