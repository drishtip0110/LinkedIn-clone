import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password, profilePicture) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.post("/api/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (profileData, profilePicture) => {
    try {
      const formData = new FormData();
      
      // Add all profile fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });
      
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const incrementProfileView = async (userId) => {
    try {
      await axios.post(`/api/users/view/${userId}`);
    } catch (error) {
      console.error("Error incrementing profile view:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    incrementProfileView,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
