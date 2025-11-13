const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  upload.single("profilePicture"),
  handleUploadError,
  async (req, res) => {
    try {
      const {
        name,
        bio,
        headline,
        location,
        experience,
        education,
        skills,
      } = req.body;

      const updateData = {
        name: name?.trim(),
        bio: bio?.trim(),
        headline: headline?.trim(),
        location: location?.trim(),
      };

      // 🧩 If new image uploaded — store the Cloudinary URL
      if (req.file) {
        updateData.profilePicture = req.file.path; // ✅ Cloudinary URL
        updateData.profilePicturePublicId = req.file.filename; // optional (useful for deletion)
      }

      // 🧠 Parse JSON fields if provided
      if (experience) {
        updateData.experience = JSON.parse(experience);
      }

      if (education) {
        updateData.education = JSON.parse(education);
      }

      if (skills) {
        updateData.skills = JSON.parse(skills);
      }

      const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture, // ✅ Cloudinary URL
          bio: updatedUser.bio,
          headline: updatedUser.headline,
          location: updatedUser.location,
          experience: updatedUser.experience,
          education: updatedUser.education,
          skills: updatedUser.skills,
          profileViews: updatedUser.profileViews,
          postImpressions: updatedUser.postImpressions,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating profile",
      });
    }
  }
);


// @route   POST /api/users/view/:userId
// @desc    Increment profile view count
// @access  Private
router.post("/view/:userId", auth, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      await User.findByIdAndUpdate(req.params.userId, {
        $inc: { profileViews: 1 }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get connection suggestions
// @access  Private
router.get("/suggestions", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const excludeIds = [req.userId, ...currentUser.connections, ...currentUser.connectionRequests];
    
    const suggestions = await User.find({
      _id: { $nin: excludeIds }
    })
    .select("name profilePicture headline location")
    .limit(5);

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name
// @access  Private
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.userId }
    })
    .select("name email profilePicture bio")
    .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("connections", "name profilePicture")
      .populate("connectionRequests", "name profilePicture");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/users/connect/:userId
// @desc    Send connection request
// @access  Private
router.post("/connect/:userId", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUser = await User.findById(req.userId);
    
    // Check if already connected or request pending
    if (currentUser.connections.includes(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Already connected" });
    }
    
    if (targetUser.connectionRequests.includes(req.userId)) {
      return res.status(400).json({ success: false, message: "Request already sent" });
    }

    targetUser.connectionRequests.push(req.userId);
    await targetUser.save();

    res.json({ success: true, message: "Connection request sent" });
  } catch (error) {
    console.error("Send connection error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/users/accept/:userId
// @desc    Accept connection request
// @access  Private
router.post("/accept/:userId", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const requestUser = await User.findById(req.params.userId);

    if (!currentUser.connectionRequests.includes(req.params.userId)) {
      return res.status(400).json({ success: false, message: "No request found" });
    }

    // Add to connections
    currentUser.connections.push(req.params.userId);
    requestUser.connections.push(req.userId);
    
    // Remove from requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      id => id.toString() !== req.params.userId
    );

    await currentUser.save();
    await requestUser.save();

    res.json({ success: true, message: "Connection accepted" });
  } catch (error) {
    console.error("Accept connection error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/users/posts
// @desc    Get posts by specific user
// @access  Private
router.get("/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user posts",
    });
  }
});

module.exports = router;
