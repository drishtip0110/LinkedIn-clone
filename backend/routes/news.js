const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/news
// @desc    Get LinkedIn news
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // In a real app, this would come from a news API or database
    const news = [
      {
        id: 1,
        title: "Tech hiring rebounds in major cities",
        timeAgo: "2d ago",
        readers: 5256
      },
      {
        id: 2,
        title: "Remote work policies evolving",
        timeAgo: "3d ago", 
        readers: 3891
      },
      {
        id: 3,
        title: "AI skills in high demand",
        timeAgo: "4d ago",
        readers: 1700
      },
      {
        id: 4,
        title: "Startup funding trends 2024",
        timeAgo: "5d ago",
        readers: 2340
      }
    ];

    res.json({ success: true, news });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;