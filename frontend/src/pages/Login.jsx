import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import linkedinLogo from "../assets/linkedin-logo.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);
    if (result.success) navigate("/feed");
    else setError(result.message);

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* LinkedIn Logo */}
      <div className="auth-page-logo">
        <img src={linkedinLogo} alt="LinkedIn Logo" />
      </div>

      {/* Login Card */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Sign in</h1>
            <p>Stay updated on your professional world</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email or phone"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group password-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              New to LinkedIn?{" "}
              <Link to="/register" className="auth-link">
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
