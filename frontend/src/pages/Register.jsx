import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import linkedinLogo from "../assets/linkedin-logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setError("");

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    // Register user
    const result = await register(
      formData.name.trim(),
      formData.email,
      formData.password,
      profilePicture
    );

    if (result.success) {
      navigate("/feed");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* LinkedIn Logo */}
      <div className="auth-page-logo">
        <img src={linkedinLogo} alt="LinkedIn Logo" />
      </div>

      {/* Register Card */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Join LinkedIn</h1>
            <p>Create your professional account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              {/* Enhanced Profile Picture Upload Section with Circular Display */}
              <div className="form-group">
                <div className="upload-container">
                  {/* Upload Area */}
                  <div
                    className={`upload-area ${
                      previewUrl ? "has-image circular-preview" : ""
                    }`}
                    onClick={handleUploadClick}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleUploadClick();
                      }
                    }}
                  >
                    {previewUrl ? (
                      <div className="circular-image-container">
                        <div className="circular-image-wrapper">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="circular-preview-image"
                          />
                          <div className="circular-image-overlay">
                            <div className="change-icon">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.5 2.5C18.7652 2.23478 19.0787 2.1246 19.5 2.1246C19.9213 2.1246 20.2348 2.23478 20.5 2.5C20.7652 2.76522 20.8754 3.07869 20.8754 3.5C20.8754 3.92131 20.7652 4.23478 20.5 4.5L11 14L8 15L9 12L18.5 2.5Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <span className="change-text">Change Photo</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 5V19M5 12H19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="upload-text">
                          <p className="upload-title">Upload Profile Photo</p>
                          <p className="upload-subtitle">
                            JPG, PNG or GIF • Max 5MB
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                  </div>

                  {/* File Info and Remove Button */}
                  {profilePicture && (
                    <div className="file-info">
                      <div className="file-details">
                        <span className="file-name">{profilePicture.name}</span>
                        <span className="file-size">
                          {Math.round(profilePicture.size / 1024)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={handleRemoveImage}
                        aria-label="Remove profile picture"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
                minLength="6"
              />
            </div>

            <div className="form-agreement">
              <p>
                By clicking Sign up, you agree to LinkedIn's{" "}
                <a href="#" className="auth-link">
                  User Agreement
                </a>
                ,{" "}
                <a href="#" className="auth-link">
                  Privacy Policy
                </a>
                , and{" "}
                <a href="#" className="auth-link">
                  Cookie Policy
                </a>
                .
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-text">
                  <span className="loading-spinner"></span>
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already on LinkedIn?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
