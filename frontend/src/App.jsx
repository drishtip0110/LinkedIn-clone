import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/feed" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/feed" />}
        />
        <Route
          path="/feed"
          element={user ? <Feed /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:userId"
          element={user ? <UserProfile /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
