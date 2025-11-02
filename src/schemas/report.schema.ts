import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const reportSchema = z.object({
  reporter: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Reporter ID is required" }),

  targetType: z.enum(["post", "comment", "user"], {
    error: "Target type is required",
  }),

  targetId: objectId
    .describe("Target ObjectId")
    .refine(Boolean, { message: "Target ID is required" }),

  reason: z.enum(
    [
      "spam",
      "harassment",
      "hate_speech",
      "misinformation",
      "violence",
      "sexual_content",
      "other",
    ],
    {
      error: "Reason is required",
    },
  ),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  status: z
    .enum(["pending", "reviewed", "resolved", "dismissed"])
    .default("pending"),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
