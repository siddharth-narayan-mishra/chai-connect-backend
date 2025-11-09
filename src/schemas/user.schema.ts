import type { password } from "bun";
import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/),
  password: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9]+$/),
  email: z.email(),
  bio: z.string().min(1).max(500).optional(),
  about: z.string().min(1).max(500).optional(),
  avatar: z.url().optional(),
  tags: z.array(z.string()).optional(),
  passingYear: z.number().nullable().optional(),
  skillsRequired: z.array(z.string()).optional(),
  skillsOffered: z.array(z.string()).optional(),
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});