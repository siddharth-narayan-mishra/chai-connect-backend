import { z } from "zod";

export const exchangeResponseSchema = z.object({
  status: z.enum(["accepted", "rejected", "pending"]).default("pending"),

  message: z
    .string({
      error: "Message is required",
    })
    .min(1, "Message must be at least 1 character long")
    .max(1000, "Message cannot exceed 1000 characters"),
  creditsOffered: z.number().default(0),
  skillsOffered: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeResponseInput = z.infer<typeof exchangeResponseSchema>;
