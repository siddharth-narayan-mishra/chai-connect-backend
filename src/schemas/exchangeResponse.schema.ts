import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const exchangeResponseSchema = z.object({
  status: z.enum(["accepted", "rejected", "pending"]).default("pending"),

  message: z
    .string({
      error: "Message is required",
    })
    .min(1, "Message must be at least 1 character long")
    .max(1000, "Message cannot exceed 1000 characters"),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeResponseInput = z.infer<typeof exchangeResponseSchema>;
