import express from "express";
import type { Request, Response } from "express";
import { createUserSchema } from "./schemas/user.schema.ts";
import { connectToDatabase } from "./db/index.ts";
import { User } from "./models/user.model.ts";
import { Event } from "./models/event.model.ts";
import { createEventSchema } from "./schemas/event.schema.ts";

connectToDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/auth/signup", async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    const existing = await User.findOne({ username: data.username });

    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // Create new user document
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

app.post("/events/create", async (req: Request, res: Response) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    // Create new event document
    const newEvent = new Event({
      ...data,
    });

    await newEvent.save();

    return res.status(201).json({
      message: "User created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
