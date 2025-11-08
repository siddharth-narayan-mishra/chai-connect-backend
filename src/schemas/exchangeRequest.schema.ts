import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const exchangeRequestSchema = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string({
      error: "Description is required",
    })
    .min(1, "Description cannot be empty")
    .max(2000, "Description cannot exceed 2000 characters"),

  creator: objectId.describe("User ObjectId"),

  creatorUsername: z
    .string({
      error: "Creator username is required",
    })
    .min(1, "Creator username cannot be empty"),

  creditsRequested: z
    .number()
    .min(0, "Credit amount cannot be negative")
    .default(0),

  creditsOffered: z
    .number()
    .min(0, "Credit amount cannot be negative")
    .default(0),

  skillsRequested: z.array(z.string().min(1)).default([]),
  skillsOffered: z.array(z.string().min(1)).default([]),

  duration: z.object({
    value: z
      .number({
        error: "Duration value is required",
      })
      .positive("Duration must be a positive number"),

    unit: z.enum(["hours", "days", "weeks", "sessions"]),
  }),

  availabilitySchedule: z
    .string()
    .max(500, "Availability schedule cannot exceed 500 characters")
    .optional(),

  location: z.object({
    type: z.enum(["online", "in_person", "hybrid"]),
    city: z.string().optional(),
    country: z.string().optional(),
  }),

  status: z
    .enum(["active", "in_progress", "completed", "cancelled"])
    .default("active"),

  viewCount: z.number().int().min(0).default(0),

  responseCount: z.number().int().min(0).default(0),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeRequestSchemaType = z.infer<typeof exchangeRequestSchema>;
