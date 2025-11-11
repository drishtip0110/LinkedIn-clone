import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./CreatePost.css";
import { API_BASE_URL } from "../config/api";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write something to post");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onPostCreated(response.data.post || response.data);
      setContent("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowOptions(false);
    } catch (error) {
      setError("Failed to create post");
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextareaFocus = () => {
    setShowOptions(true);
  };

  const handleOptionClick = (type) => {
    if (type === "photo") {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="create-post card">
      <div className="create-post-header">
        <img
          src={
            user?.profilePicture
              ? `${API_BASE_URL}/uploads/${user.profilePicture}`
              : "/default-avatar.png"
          }
          alt={user?.name}
          className="user-avatar"
        />
        <button
          className="post-prompt"
          onClick={() => textareaRef.current?.focus()}
        >
          Start a post
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="post-textarea"
            rows={showOptions ? 3 : 1}
            onFocus={handleTextareaFocus}
          />
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
            >
              ✕
            </button>
          </div>
        )}

        {(showOptions || imagePreview) && (
          <div className="create-post-footer">
            <div className="post-options">
              <button
                type="button"
                className="post-option"
                onClick={() => handleOptionClick("photo")}
              >
                <span className="option-icon">🖼️</span>
                <span className="option-label">Photo</span>
              </button>
            </div>

            <div className="post-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                style={{ display: "none" }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !content.trim()}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
