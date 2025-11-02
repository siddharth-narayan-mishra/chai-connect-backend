import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const reviewSchema = z.object({
  exchangeSession: objectId
    .describe("ExchangeSession ObjectId")
    .refine(Boolean, { message: "Exchange session ID is required" }),

  reviewer: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Reviewer ID is required" }),

  reviewee: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Reviewee ID is required" }),

  rating: z
    .number({
      error: "Overall rating is required",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  skillRating: z
    .number({
      error: "Skill rating is required",
    })
    .min(1, "Skill rating must be at least 1")
    .max(5, "Skill rating cannot exceed 5"),

  communicationRating: z
    .number({
      error: "Communication rating is required",
    })
    .min(1, "Communication rating must be at least 1")
    .max(5, "Communication rating cannot exceed 5"),

  reliabilityRating: z
    .number({
      error: "Reliability rating is required",
    })
    .min(1, "Reliability rating must be at least 1")
    .max(5, "Reliability rating cannot exceed 5"),

  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters long")
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),

  isPublic: z.boolean().default(true),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
