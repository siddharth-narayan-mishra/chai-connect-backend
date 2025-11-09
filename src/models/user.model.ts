import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 20,
    match: /^[a-zA-Z0-9]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    match: /^[a-zA-Z0-9]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
  },
  bio: {
    type: String,
    minlength: 1,
    maxlength: 500,
  },
  about: {
    type: String,
    minlength: 1,
    maxlength: 500,
  },
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public",
  },
  tags: {
    type: [String],
    default: [],
  },
  passingYear: {
    type: Number,
    default: null,
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  skillsOffered: {
    type: [String],
    default: [],
  },
  credits: {
    type: Number,
    default: 0,
  },
  trustScore: {
    type: Number,
    default: 0,
  },
});

export const User = mongoose.model("User", userSchema);
