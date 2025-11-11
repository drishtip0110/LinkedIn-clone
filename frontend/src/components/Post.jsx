import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./Post.css";

const Post = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostContent, setRepostContent] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  const isAuthor = user?.id === post.author._id;
  const isLiked = post.likes.includes(user?.id);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`);
      onUpdate(response.data.post || response.data);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/posts/${post._id}/comment`, {
        content: newComment,
      });
      onUpdate(response.data.post);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleRepost = async (e) => {
    e.preventDefault();
    if (isReposting) return;

    setIsReposting(true);
    try {
      await axios.post(`/api/posts/${post._id}/repost`, {
        content: repostContent.trim(),
      });
      setShowRepostModal(false);
      setRepostContent("");
      alert("Post reposted successfully!");
    } catch (error) {
      console.error("Error reposting:", error);
      alert(error.response?.data?.message || "Failed to repost");
    } finally {
      setIsReposting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`/api/posts/${post._id}`, {
        content: editedContent,
      });
      onUpdate(response.data.post || response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`/api/posts/${post._id}`);
        onDelete(post._id);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="post card">
      {post.isRepost && (
        <div className="repost-indicator">
          <span className="repost-icon">🔄</span>
          <span className="repost-text">{post.author.name} reposted</span>
        </div>
      )}

      <div className="post-header">
        <div className="post-author">
          <img
            src={
              post.author.profilePicture
                ? `${API_BASE_URL}/uploads/${post.author.profilePicture}`
                : "/default-avatar.png"
            }
            alt={post.author.name}
            className="author-avatar"
          />
          <div className="author-info">
            <h4>{post.author.name}</h4>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {isAuthor && (
          <div className="post-actions">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-icon"
              title="Edit"
            >
              ⋮
            </button>
            {isEditing && (
              <div className="edit-dropdown">
                <button onClick={handleDelete} className="dropdown-item">
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="form-control"
              rows="3"
            />
            <div className="edit-actions">
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{post.content}</p>
        )}

        {post.isRepost && post.originalPost && (
          <div className="original-post-card">
            <div className="original-post-header">
              <img
                src={
                  post.originalPost.author?.profilePicture
                    ? `${API_BASE_URL}/uploads/${post.originalPost.author.profilePicture}`
                    : "/default-avatar.png"
                }
                alt={post.originalPost.author?.name}
                className="original-author-avatar"
              />
              <div className="original-author-info">
                <h5>{post.originalPost.author?.name}</h5>
                <span className="original-post-time">
                  {formatDate(post.originalPost.createdAt)}
                </span>
              </div>
            </div>
            <p className="original-post-content">{post.originalPost.content}</p>
            {post.originalPost.image && (
              <div className="original-post-image">
                <img
                  src={`${API_BASE_URL}/uploads/${post.originalPost.image}`}
                  alt="Original post"
                />
              </div>
            )}
          </div>
        )}

        {post.image && !post.isRepost && (
          <div className="post-image">
            <img src={`${API_BASE_URL}/uploads/${post.image}`} alt="Post" />
          </div>
        )}
      </div>

      <div className="post-stats">
        <span>{post.likes.length} likes</span>
        <span>{post.comments.length} comments</span>
      </div>

      <div className="post-actions-bar">
        <button
          onClick={handleLike}
          className={`action-btn ${isLiked ? "liked" : ""}`}
          disabled={isLiking}
        >
          {isLiked ? "❤️ Liked" : "🤍 Like"}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          💬 Comment
        </button>
        <button onClick={() => setShowRepostModal(true)} className="action-btn">
          🔄 Repost
        </button>
        <button className="action-btn">➤ Send</button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddComment} className="comment-form">
            <img
              src={
                user?.profilePicture
                  ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                  : "/default-avatar.png"
              }
              alt="Your avatar"
              className="comment-avatar"
            />
            <div className="comment-input-container">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Post
              </button>
            </div>
          </form>

          <div className="comments-list">
            {post.comments.map((comment, index) => (
              <div key={index} className="comment">
                <img
                  src={
                    comment.user.profilePicture
                      ? `${API_BASE_URL}/uploads/${comment.user.profilePicture}`
                      : "/default-avatar.png"
                  }
                  alt={comment.user.name}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user.name}</span>
                    <span className="comment-time">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {showRepostModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRepostModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Repost</h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRepost}>
              <textarea
                value={repostContent}
                onChange={(e) => setRepostContent(e.target.value)}
                placeholder="Add your thoughts (optional)..."
                className="repost-textarea"
                rows="3"
              />
              <div className="original-post-preview">
                <div className="preview-header">
                  <img
                    src={
                      post.author?.profilePicture
                        ? `${API_BASE_URL}/uploads/${post.author.profilePicture}`
                        : "/default-avatar.png"
                    }
                    alt={post.author?.name}
                    className="preview-avatar"
                  />
                  <span>{post.author?.name}</span>
                </div>
                <p>{post.content}</p>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowRepostModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReposting}
                  className="btn btn-primary"
                >
                  {isReposting ? "Reposting..." : "Repost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
