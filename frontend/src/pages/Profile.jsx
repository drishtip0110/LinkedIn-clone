import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import { API_BASE_URL } from "../config/api";
import "./Profile.css";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    headline: user?.headline || "",
    location: user?.location || "",
  });
  const [aboutText, setAboutText] = useState(user?.bio || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(fetchUserPosts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get("/api/posts");
      const allPosts = response.data.posts || response.data;
      const userId = user.id || user._id;
      const filtered = allPosts.filter(
        (post) =>
          post.author._id === userId ||
          post.author._id.toString() === userId.toString()
      );
      setUserPosts(filtered);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setUserPosts([newPost, ...userPosts]);
    setShowCreatePost(false);
    fetchUserPosts();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await updateProfile({}, file);
      if (result.success) {
        alert("Profile picture updated successfully!");
      } else {
        alert(result.message || "Failed to update profile picture");
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData, profilePicture);

    if (result.success) {
      setEditing(false);
      setProfilePicture(null);
      alert("Profile updated successfully!");
    } else {
      alert(result.message || "Failed to update profile");
    }
  };

  const handleUpdateAbout = async () => {
    try {
      const response = await axios.put("/api/users/profile", {
        bio: aboutText,
      });

      if (response.data.success) {
        setEditingAbout(false);
        const result = await updateProfile({ ...formData, bio: aboutText });
        if (result.success) {
          alert("About section updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating about:", error);
      alert("Failed to update about section");
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        headline: user.headline || "",
        location: user.location || "",
      });
      setAboutText(user.bio || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-layout">
          <div className="profile-main">
            <div className="profile-header card">
              <div className="profile-cover">
                <div className="cover-image"></div>
              </div>

              <div className="profile-info-main">
                <div className="profile-avatar-section">
                  <div className="avatar-wrapper" onClick={handlePhotoClick}>
                    <img
                      src={
                        user?.profilePicture
                          ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                          : "/default-avatar.png"
                      }
                      alt={user?.name}
                      className="profile-avatar-large"
                    />
                    <div className="avatar-overlay">
                      <span className="camera-icon">📷</span>
                      <span className="change-photo-text">Change photo</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                  <div className="profile-actions">
                    {!editing && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="profile-details-main">
                  {editing ? (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="profile-form"
                    >
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="form-control"
                        placeholder="Full name"
                      />
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) =>
                          setFormData({ ...formData, headline: e.target.value })
                        }
                        className="form-control"
                        placeholder="Professional headline"
                      />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="form-control"
                        placeholder="Location"
                      />
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="form-control"
                        placeholder="Bio"
                        rows="3"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePicture(e.target.files[0])}
                        className="file-input"
                      />
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h1>{user?.name || "Add your name"}</h1>
                      <p className="profile-headline">
                        {user?.headline || "Add your professional headline"}
                      </p>
                      <p className="profile-location">
                        {user?.location || "Add your location"} •{" "}
                        <a href="#contact" className="contact-link">
                          Contact info
                        </a>
                      </p>
                      <p className="profile-stats-main">
                        <strong>{user?.profileViews || 0} profile views</strong>{" "}
                        •{" "}
                        <strong>
                          {user?.connections?.length || 0} connections
                        </strong>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="open-to-work-banner">
                <div className="banner-content">
                  <span className="banner-icon">💼</span>
                  <div className="banner-text">
                    <strong>Open to</strong>
                    <span>
                      Tell non-profits you are interested in getting involved
                      with your time and skills
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-sm">Get started</button>
                </div>
              </div>
            </div>

            <div className="profile-section card">
              <div className="section-header">
                <h2>About</h2>
                <button
                  className="btn-text"
                  onClick={() => setEditingAbout(!editingAbout)}
                >
                  {editingAbout ? "Cancel" : "Edit"}
                </button>
              </div>
              {editingAbout ? (
                <div className="edit-about-form">
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="form-control about-textarea"
                    placeholder="Write a summary to highlight your personality or work experience."
                    rows="5"
                  />
                  <div className="form-actions">
                    <button
                      onClick={handleUpdateAbout}
                      className="btn btn-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingAbout(false);
                        setAboutText(user?.bio || "");
                      }}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="about-text">
                  {user?.bio ||
                    "Write a summary to highlight your personality or work experience."}
                </p>
              )}
            </div>

            <div className="profile-section card">
              <div className="section-header">
                <h2>Activity</h2>
              </div>

              {userPosts.length === 0 ? (
                <div className="empty-activity">
                  <p>You haven't posted anything yet.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreatePost(true)}
                  >
                    Create a post
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {userPosts.slice(0, 3).map((post) => (
                    <div key={post._id} className="activity-item">
                      <div className="activity-header">
                        <img
                          src={
                            user?.profilePicture
                              ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                              : "/default-avatar.png"
                          }
                          alt={user?.name}
                          className="activity-avatar"
                        />
                        <div className="activity-info">
                          <span className="activity-author">{user?.name}</span>
                          <span className="activity-time">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="activity-content">{post.content}</p>
                      {post.image && (
                        <div className="activity-image">
                          <img src={`${API_BASE_URL}/uploads/${post.image}`} alt="Post" />
                        </div>
                      )}
                      <div className="activity-stats">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  ))}
                  {userPosts.length > 3 && (
                    <button className="btn-text show-all-btn">
                      Show all {userPosts.length} posts ›
                    </button>
                  )}
                </div>
              )}
            </div>

            {user?.experience && user.experience.length > 0 && (
              <div className="profile-section card">
                <div className="section-header">
                  <h2>Experience</h2>
                </div>
                {user.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-header">
                      <div className="company-logo"></div>
                      <div className="experience-details">
                        <h3>{exp.title}</h3>
                        <p className="company-name">{exp.company}</p>
                        <p className="experience-period">
                          {new Date(exp.startDate).getFullYear()} -{" "}
                          {exp.current
                            ? "Present"
                            : new Date(exp.endDate).getFullYear()}
                        </p>
                        <p className="experience-location">{exp.location}</p>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user?.education && user.education.length > 0 && (
              <div className="profile-section card">
                <div className="section-header">
                  <h2>Education</h2>
                </div>
                {user.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-header">
                      <div className="school-logo"></div>
                      <div className="education-details">
                        <h3>{edu.school}</h3>
                        <p className="degree-name">
                          {edu.degree} {edu.field && `in ${edu.field}`}
                        </p>
                        <p className="education-period">
                          {new Date(edu.startDate).getFullYear()} -{" "}
                          {new Date(edu.endDate).getFullYear()}
                        </p>
                        {edu.description && <p>{edu.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user?.skills && user.skills.length > 0 && (
              <div className="profile-section card">
                <div className="section-header">
                  <h2>Skills</h2>
                </div>
                <div className="skills-section">
                  <div className="skills-grid">
                    {user.skills.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-endorsements">
                            {skill.endorsements || 0} endorsements
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile-sidebar">
            <div className="sidebar-card">
              <div className="section-header">
                <h3>Suggested for you</h3>
                <span className="privacy-badge">Private to you</span>
              </div>
              <p className="sidebar-text">
                Members who include a summary receive up to 3.9 times as many
                profile views.
              </p>
              <button className="btn btn-outline btn-block">
                Add a summary
              </button>
            </div>

            <div className="sidebar-card">
              <div className="section-header">
                <h3>Profile Statistics</h3>
              </div>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{userPosts.length || 0}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user?.profileViews || 0}</span>
                  <span className="stat-label">Profile Views</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {user?.connections?.length || 0}
                  </span>
                  <span className="stat-label">Connections</span>
                </div>
              </div>
            </div>

            <div className="profile-footer">
              <div className="footer-links">
                <div className="links-column">
                  <a href="/about">About</a>
                  <a href="/accessibility">Accessibility</a>
                  <a href="/talent">Talent Solutions</a>
                </div>
                <div className="links-column">
                  <a href="/guidelines">Community Guidelines</a>
                  <a href="/careers">Careers</a>
                  <a href="/marketing">Marketing Solutions</a>
                </div>
              </div>

              <div className="help-section">
                <p className="help-title">Questions?</p>
                <p className="help-text">Visit our Help Center.</p>
                <p className="help-text">Manage your account and privacy</p>
              </div>

              <div className="copyright">LinkedIn Corporation © 2023</div>
            </div>
          </div>
        </div>
      </div>

      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
