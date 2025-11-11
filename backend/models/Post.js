const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [1000, "Post cannot be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: [true, "Comment text is required"],
          trim: true,
          maxlength: [500, "Comment cannot be more than 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isRepost: {
      type: Boolean,
      default: false
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Ensure virtual fields are serialized
postSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
