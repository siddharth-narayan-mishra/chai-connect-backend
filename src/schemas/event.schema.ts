import { z } from "zod";

// ISO 8601 date strings (e.g., "2025-12-10T10:00:00Z")
export const createEventSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters")
    .trim(),
  description: z.string().max(2000, "Description too long").trim().optional(),
  location: z.string().max(200, "Location too long").trim().optional(),
  date: z.coerce.date({
    error: "Event date is required",
  }),
  endDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
