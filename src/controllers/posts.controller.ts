import type { Request, Response } from "express";
import { Post, Comment, Vote, User } from "../models/index.ts";
import { postSchema, commentSchema, voteSchema } from "../schemas/index.ts";
import { ZodError } from "zod";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/auth.js";

// Query params interfaces
interface GetPostsQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
  author?: string;
  search?: string;
}

interface GetCommentsQuery {
  sort?: string;
  order?: "asc" | "desc";
  limit?: string;
}

// Create a new post
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const validatedData = postSchema.parse(authReq.body);
    
    const user = await User.findById(authReq.user.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const post = new Post({
      ...validatedData,
      author: authReq.user.userId,
      authorUsername: user.username,
    });

    await post.save();
    
    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
      return;
    }
    
    res.status(500).json({
      message: "Error creating post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all posts with pagination and filtering
export const getPosts = async (
  req: Request<{}, {}, {}, GetPostsQuery>,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      sort = "createdAt",
      order = "desc",
      author,
      search,
    } = req.query;

    const query: Record<string, any> = {};
    
    if (author) {
      query.author = author;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sort]: sortOrder };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const posts = await Post.find(query)
      .sort(sortOptions)
    
    const count = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalPosts: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a single post by ID
export const getPostById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update a post
export const updatePost = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!mongoose.Types.ObjectId.isValid(authReq.params.id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const validatedData = postSchema.partial().parse(authReq.body);
    
    const post = await Post.findById(authReq.params.id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== authReq.user.userId) {
      res.status(403).json({
        message: "You don't have permission to update this post",
      });
      return;
    }

    // Update allowed fields
    const allowedUpdates: Array<keyof typeof validatedData> = ["title", "content", "mediaUrl"];
    allowedUpdates.forEach((field) => {
      if (validatedData[field] !== undefined) {
        (post as any)[field] = validatedData[field];
      }
    });

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
      return;
    }
    
    res.status(500).json({
      message: "Error updating post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a post
export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!mongoose.Types.ObjectId.isValid(authReq.params.id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(authReq.params.id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== authReq.user.userId) {
      res.status(403).json({
        message: "You don't have permission to delete this post",
      });
      return;
    }

    // Delete associated comments and votes
    await Comment.deleteMany({ post: authReq.params.id });
    await Vote.deleteMany({ targetType: "post", targetId: authReq.params.id });

    await Post.findByIdAndDelete(authReq.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Vote on a post
export const votePost = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!mongoose.Types.ObjectId.isValid(authReq.params.id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const { voteType } = voteSchema.parse(authReq.body);
    const postId = authReq.params.id;
    const userId = authReq.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check for existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetId: postId,
      targetType: "post",
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking same button
        await Vote.deleteOne({ _id: existingVote._id });
        voteChange = voteType === "upvote" ? -1 : 1;
      } else {
        // Change vote
        existingVote.voteType = voteType;
        await existingVote.save();
        voteChange = voteType === "upvote" ? 2 : -2;
      }
    } else {
      // Create new vote
      await Vote.create({
        user: userId,
        targetType: "post",
        targetId: postId,
        voteType,
      });
      voteChange = voteType === "upvote" ? 1 : -1;
    }

    // Update post vote score
    post.voteScore += voteChange;
    await post.save();

    res.status(200).json({
      message: "Vote recorded successfully",
      voteScore: post.voteScore,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
      return;
    }
    
    res.status(500).json({
      message: "Error voting on post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user's vote status for a post
export const getPostVoteStatus = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!mongoose.Types.ObjectId.isValid(authReq.params.id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const vote = await Vote.findOne({
      user: authReq.user.userId,
      targetId: authReq.params.id,
      targetType: "post",
    }).lean();

    res.status(200).json({
      voteType: vote ? vote.voteType : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vote status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get comments for a post
export const getPostComments = async (
  req: Request<{ id: string }, {}, {}, GetCommentsQuery>,
  res: Response
): Promise<void> => {
  try {
    const { sort = "createdAt", order = "desc", limit = "50" } = req.query;
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sort]: sortOrder };
    const limitNum = parseInt(limit);

    // Get top-level comments only (depth 0)
    const comments = await Comment.find({
      post: postId,
      depth: 0,
    })
    
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching comments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create a comment on a post
export const createComment = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const validatedData = commentSchema.parse(authReq.body);
    const postId = authReq.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const user = await User.findById(authReq.user.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const comment = new Comment({
      ...validatedData,
      author: authReq.user.userId,
      authorUsername: user.username,
      post: postId,
    });

    await comment.save();

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
      return;
    }
    
    res.status(500).json({
      message: "Error creating comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};