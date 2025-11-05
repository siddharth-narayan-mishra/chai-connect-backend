import dotenv from "dotenv";
dotenv.config();

import express, { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  getPostComments,
  createComment,
} from "../controllers/posts.controller.ts";
import { auth } from "../middleware/auth.ts";

const postsRouter: Router = express.Router();

// Post CRUD operations
postsRouter.post("/", auth, createPost);
postsRouter.get("/", getPosts);
postsRouter.get("/:id", getPostById);
postsRouter.put("/:id", auth, updatePost);
postsRouter.delete("/:id", auth, deletePost);

// Voting
postsRouter.post("/:id/vote", auth, votePost);

// Comments
postsRouter.get("/:id/comments", getPostComments);
postsRouter.post("/:id/comments", auth, createComment);

export default postsRouter;