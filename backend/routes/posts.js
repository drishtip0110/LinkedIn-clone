const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  "/",
  auth,
  upload.single("image"),
  handleUploadError,
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Post content is required",
        });
      }

      // Get image URL from Cloudinary upload result
      const imageUrl = req.file ? req.file.path : "";

      const post = new Post({
        content: content.trim(),
        image: imageUrl, // Store Cloudinary URL, not filename
        author: req.userId,
      });

      await post.save();
      await post.populate("author", "name profilePicture");

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        post,
      });

      console.log("Post created:", post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating post",
      });
    }
  }
);


// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "name profilePicture")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching posts",
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    post.content = content.trim();
    await post.save();
    await post.populate("author", "name profilePicture");

    res.json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating post",
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting post",
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      user: req.userId,
      text: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate("author", "name profilePicture");
    await post.populate("comments.user", "name profilePicture");

    res.json({
      success: true,
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding comment",
    });
  }
});

// @route   POST /api/posts/:id/repost
// @desc    Repost a post
// @access  Private
router.post("/:id/repost", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const originalPost = await Post.findById(req.params.id).populate("author", "name profilePicture");
    
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const repost = new Post({
      content: content?.trim() || "",
      author: req.userId,
      originalPost: req.params.id,
      isRepost: true
    });

    await repost.save();
    await repost.populate("author", "name profilePicture");
    await repost.populate("originalPost");
    await repost.populate("originalPost.author", "name profilePicture");

    res.status(201).json({
      success: true,
      message: "Post reposted successfully",
      post: repost,
    });
  } catch (error) {
    console.error("Repost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reposting",
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.userId);
    }

    await post.save();
    await post.populate("author", "name profilePicture");

    res.json({
      success: true,
      message: likeIndex > -1 ? "Post unliked" : "Post liked",
      post,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing like",
    });
  }
});

module.exports = router;
