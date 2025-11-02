import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const voteSchema = z.object({
  user: objectId.describe("User ObjectId"),

  targetType: z.enum(["post", "comment"], {
    error: "Target type is required",
  }),

  targetId: objectId.describe("Target document ObjectId"),

  voteType: z.enum(["upvote", "downvote"], {
    error: "Vote type is required",
  }),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type VoteInput = z.infer<typeof voteSchema>;
