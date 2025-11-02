import { z } from "zod";

export const disputeSchema = z.object({
  exchangeSession: z.string({
    error: "Exchange session ID is required",
  }),

  initiator: z.string({
    error: "Initiator ID is required",
  }),

  respondent: z.string({
    error: "Respondent ID is required",
  }),

  reason: z.string({
    error: "Reason is required",
  }),

  description: z
    .string({
      error: "Description is required",
    })
    .min(20, "Description must be at least 20 characters long")
    .max(2000, "Description cannot exceed 2000 characters"),

  evidence: z
    .array(z.string().url("Each evidence must be a valid URL"))
    .default([]),

  respondentResponse: z
    .string()
    .max(2000, "Response cannot exceed 2000 characters")
    .optional(),

  status: z
    .enum(["open", "under_review", "resolved", "closed", "escalated"])
    .default("open"),

  resolution: z
    .string()
    .max(1000, "Resolution cannot exceed 1000 characters")
    .optional(),

  resolvedAt: z.date().optional(),

  // createdAt and updatedAt are usually set automatically by Mongoose timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ✅ Type inference for TypeScript
export type DisputeInput = z.infer<typeof disputeSchema>;
