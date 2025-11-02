import { User } from "../models/index.ts";
import { createUserSchema } from "../schemas/index.ts";
import { Router, type Request, type Response } from "express";

const userRouter = Router();

userRouter.post("/create", async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    const existing = await User.findOne({ username: data.username });

    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      ...data,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default userRouter;
