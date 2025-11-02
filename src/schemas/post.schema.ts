import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const postSchema = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .min(3, "Title must be at least 3 characters long")
    .max(300, "Title cannot exceed 300 characters"),

  content: z
    .string()
    .max(40000, "Content cannot exceed 40000 characters")
    .optional(),

  mediaUrl: z.url("Invalid media URL").optional(),

  author: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Author ID is required" }),

  authorUsername: z
    .string({
      error: "Author username is required",
    })
    .min(1, "Author username cannot be empty"),

  voteScore: z.number().default(0),

  commentCount: z.number().default(0),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
