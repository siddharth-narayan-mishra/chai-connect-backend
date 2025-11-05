import { Event } from "../models/event.model.ts";
import { createEventSchema } from "../schemas/index.ts";
import type { Request, Response } from "express";

export const createEvent = async (req: Request, res: Response) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
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
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
