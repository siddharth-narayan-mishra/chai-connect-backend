import { z } from "zod";

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

  mediaUrl: z.url("Invalid media URL").default(""),

  voteScore: z.number().default(0),

  commentCount: z.number().default(0),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
