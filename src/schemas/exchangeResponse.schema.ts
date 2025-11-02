import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const exchangeResponseSchema = z.object({
  exchangeRequest: objectId
    .describe("ExchangeRequest ObjectId")
    .refine(Boolean, { message: "Exchange request ID is required" }),

  responder: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Responder ID is required" }),

  responderUsername: z
    .string({
      error: "Responder username is required",
    })
    .min(1, "Responder username cannot be empty"),

  status: z.enum(["accepted", "rejected"], {
    error: "Response status is required",
  }),

  message: z
    .string({
      error: "Message is required",
    })
    .min(10, "Message must be at least 10 characters long")
    .max(1000, "Message cannot exceed 1000 characters"),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeResponseInput = z.infer<typeof exchangeResponseSchema>;
