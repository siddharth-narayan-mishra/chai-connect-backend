import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const exchangeRequestSchema = z.object({
  listing: objectId.describe("SkillListing ObjectId").refine(Boolean, {
    message: "Listing ID is required",
  }),

  requester: objectId.describe("User ObjectId").refine(Boolean, {
    message: "Requester ID is required",
  }),

  requesterUsername: z
    .string({
      error: "Requester username is required",
    })
    .min(1, "Requester username cannot be empty"),

  message: z
    .string({
      error: "Message is required",
    })
    .min(10, "Message must be at least 10 characters long")
    .max(1000, "Message cannot exceed 1000 characters"),

  proposedCredits: z
    .number()
    .min(0, "Proposed credits cannot be negative")
    .default(0),

  proposedSkills: z.array(z.string().trim()).default([]),

  status: z
    .enum(["pending", "accepted", "cancelled"])
    .default("pending"),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeRequestInput = z.infer<typeof exchangeRequestSchema>;
