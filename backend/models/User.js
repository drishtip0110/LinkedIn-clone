const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    connections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    connectionRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    headline: {
      type: String,
      default: "",
      maxlength: [120, "Headline cannot be more than 120 characters"]
    },
    location: {
      type: String,
      default: ""
    },
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: { type: Boolean, default: false },
      description: String
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    skills: [{
      name: String,
      endorsements: { type: Number, default: 0 }
    }],
    profileViews: { type: Number, default: 0 },
    postImpressions: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
