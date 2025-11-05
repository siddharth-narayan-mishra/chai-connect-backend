import type { Request, Response } from "express";
import { Post, Comment, Vote, User } from "../models/index.ts";
import { postSchema, commentSchema, voteSchema } from "../schemas/index.ts";
import { ZodError } from "zod";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/auth.ts";

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
export const createPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const validatedData = postSchema.parse(authReq.body);

    const user = await User.findById(authReq.user.userId).exec();
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
  res: Response,
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

    const posts = await Post.find(query).sort(sortOptions);

    const count = await Post.countDocuments(query).exec();

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
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(id)
      .populate("author", "username avatar")
      .lean()
      .exec();

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
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const validatedData = postSchema.partial().parse(authReq.body);

    const post = await Post.findById(authReq.params.id).exec();

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
    const allowedUpdates: Array<keyof typeof validatedData> = [
      "title",
      "content",
      "mediaUrl",
    ];
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
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = authReq.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(authReq.params.id).exec();

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
    await Comment.deleteMany({ post: authReq.params.id }).exec();
    await Vote.deleteMany({
      targetType: "post",
      targetId: authReq.params.id,
    }).exec();

    await Post.findByIdAndDelete(authReq.params.id).exec();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Vote on a post
export const votePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    
    console.log("Request Body : ", authReq.body);
    const { voteType } = voteSchema.parse(authReq.body);
    const postId = authReq.params.id;
    const userId = authReq.user.userId;

    const post = await Post.findById(postId).exec();
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check for existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetId: postId,
      targetType: "post",
    }).exec();

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking same button
        await Vote.deleteOne({ _id: existingVote._id }).exec();
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

// Get comments for a post
export const getPostComments = async (
  req: Request<{ id: string }, {}, {}, GetCommentsQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { sort = "createdAt", order = "desc", limit = "50" } = req.query;
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(postId).exec();
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const sortOrder = order === "asc" ? 1 : -1;

    // Get top-level comments only (depth 0)
    const comments = await Comment.find({
      post: postId,
      depth: 0,
    }).exec();

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
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const postId = authReq.params.id;
    const { content, parentComment } = authReq.body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const user = await User.findById(authReq.user.userId).exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const post = await Post.findById(postId).exec();
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ message: "Comment content is required" });
      return;
    }

    if (content.length > 10000) {
      res.status(400).json({ message: "Comment exceeds max length (10000 chars)" });
      return;
    }

    let depth = 0;
    if (parentComment) {
      const parent = await Comment.findById(parentComment).exec();
      if (!parent) {
        res.status(404).json({ message: "Parent comment not found" });
        return;
      }
      if (parent.depth >= 10) {
        res.status(400).json({ message: "Maximum nesting depth reached" });
        return;
      }
      depth = parent.depth + 1;
    }

    const comment = new Comment({
      content: content.trim(),
      author: authReq.user.userId,
      authorUsername: user.username,
      post: postId,
      parentComment: parentComment || null,
      depth,
    });

    await comment.save();

    post.commentCount += 1;
    await post.save();

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
