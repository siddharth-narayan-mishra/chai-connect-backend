import { z } from "zod";

// Regex for MongoDB ObjectId
const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

// Zod schema for CreditTransaction
export const creditTransactionSchema = z.object({
  from: objectId, // required ObjectId reference to User
  to: objectId,   // required ObjectId reference to User

  amount: z
    .number()
    .min(1, "Amount must be at least 1"),

  type: z.enum(["exchange", "bonus", "refund", "penalty"], {
    required_error: "Transaction type is required",
  }),

  relatedExchange: objectId.optional(),

  status: z
    .enum(["pending", "completed", "failed", "reversed"])
    .default("pending"),

  description: z
    .string()
    .max(500, "Description too long")
    .optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ✅ Type inference for TS
export type CreditTransactionType = z.infer<typeof creditTransactionSchema>;
