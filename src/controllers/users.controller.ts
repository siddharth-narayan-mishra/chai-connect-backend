import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import { createUserSchema } from "../schemas/index.ts";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { loginUserSchema } from "../schemas/user.schema.ts";
import type { AuthRequest } from "@/middleware/auth.ts";

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    const existing = await User.findOne({ username: data.username }).exec();
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User(data);
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1y" }
    );

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const parsed = loginUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { username } = parsed.data;

  try {
    const user = await User.findOne({ username }).exec();

    if (!user) return res.status(404).json({ message: "User not foundd" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1y" }
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
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

    const user = await User.findOne({ username }).exec();

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

export const getMe = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user.userId;
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).exec();

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
