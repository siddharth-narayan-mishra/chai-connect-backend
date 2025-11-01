import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 300,
    },
    content: {
      type: String,
      maxlength: 40000,
    },
    mediaUrl: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorUsername: {
      type: String,
      required: true,
    },
    voteScore: { //upvotes-downvotes
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
); 

export const Post = mongoose.model("Post", postSchema);