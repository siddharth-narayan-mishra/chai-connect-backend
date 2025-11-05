import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import { createUserSchema } from "../schemas/index.ts";

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    const existing = await User.findOne({ username: data.username });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User(data);
    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @route   GET /users/:username
 * @desc    Get a single user by username
 * @access  Public
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username }).select("-__v -password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
