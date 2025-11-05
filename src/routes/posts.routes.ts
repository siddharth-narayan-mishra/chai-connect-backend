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
  getPostVoteStatus,
} from "../controllers/posts.controller.ts";
import { auth } from "../middleware/auth.ts";

const router: Router = express.Router();

// Post CRUD operations
router.post("/", auth, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

// Voting
router.post("/:id/vote", auth, votePost);
router.get("/:id/vote-status", auth, getPostVoteStatus);

// Comments
router.get("/:id/comments", getPostComments);
router.post("/:id/comments", auth, createComment);

export default router;