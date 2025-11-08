import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const exchangeSessionSchema = z.object({

  exchangeRequest: objectId
    .describe("ExchangeRequest ObjectId")
    .refine(Boolean, { message: "Exchange request ID is required" }),

  requestor: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Requestor ID is required" }),

  responder: objectId
    .describe("User ObjectId")
    .refine(Boolean, { message: "Responder ID is required" }),

  exchangeDetails: z.object({
    creditsAmount: z
      .number()
      .min(0, "Credits amount cannot be negative")
      .default(0),

    creditsPayer: objectId.describe("User ObjectId").optional(),
  }),

  status: z
    .enum(["scheduled", "in_progress", "completed", "cancelled", "disputed"])
    .default("scheduled"),

  startDate: z.date().optional(),

  endDate: z.date().optional(),

  completedDate: z.date().optional(),

  requestorConfirmed: z.boolean().default(false),
  responderConfirmed: z.boolean().default(false),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeSessionInput = z.infer<typeof exchangeSessionSchema>;
