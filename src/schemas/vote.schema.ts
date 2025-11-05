import { z } from "zod";

export const voteSchema = z.object({
  voteType: z.enum(["upvote", "downvote"], {
    error: "Vote type is required",
  }),
});

export type VoteInput = z.infer<typeof voteSchema>;
