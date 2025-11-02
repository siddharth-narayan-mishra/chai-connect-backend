import { Router, type Request, type Response } from "express";
import { Event } from "../models/index.ts";
import { createEventSchema } from "../schemas/index.ts";

const eventsRouter = Router();

eventsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

eventsRouter.post("/create", async (req: Request, res: Response) => {
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

export default eventsRouter;
