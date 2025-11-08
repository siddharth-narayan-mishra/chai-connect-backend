import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({
      error: "Overall rating is required",
    })
    .min(0, "Rating must be at least 0")
    .max(5, "Rating cannot exceed 5"),

  skillRating: z
    .number({
      error: "Skill rating is required",
    })
    .min(0, "Skill rating must be at least 0")
    .max(5, "Skill rating cannot exceed 5"),

  communicationRating: z
    .number({
      error: "Communication rating is required",
    })
    .min(0, "Communication rating must be at least 0")
    .max(5, "Communication rating cannot exceed 5"),

  reliabilityRating: z
    .number({
      error: "Reliability rating is required",
    })
    .min(0, "Reliability rating must be at least 0")
    .max(5, "Reliability rating cannot exceed 5"),

  comment: z
    .string()
    .min(1, "Comment must be at least 1 character long")
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),

  isPublic: z.boolean().default(true),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
