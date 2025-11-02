import { z } from "zod";

// Zod schema for Comment
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(10000, "Content too long (max 10,000 characters)"),
  
  author: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid author ObjectId"), // MongoDB ObjectId
  
  authorUsername: z
    .string()
    .min(1, "Username required"),
  
  post: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid post ObjectId"),
  
  parentComment: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid parent comment ObjectId")
    .nullable()
    .optional(),
  
  depth: z
    .number()
    .int()
    .min(0)
    .max(10)
    .default(0),
  
  voteScore: z
    .number()
    .int()
    .default(0),
  
  replyCount: z
    .number()
    .int()
    .default(0),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ✅ Type inference (for TS)
export type CommentType = z.infer<typeof commentSchema>;
