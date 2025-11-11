const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://linkedin-page.onrender.com',
    'https://linked-65zsivqmt-nitin04kumars-projects.vercel.app',
    'https://linked-in-es3p-1ts0at5ai-nitin04kumars-projects.vercel.app',
    'https://linked-in-d55v-764jb3fw9-nitin04kumars-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const newsRoutes = require("./routes/news");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);

// Basic route for testing
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? error.message : {},
  });
});

// 404 handler - FIXED: Use proper Express 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at: http://localhost:${PORT}/api`);
});
