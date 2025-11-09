import { User } from "../models/user.model.ts";
import type { AuthRequest } from "../middleware/auth.ts";
import { Event } from "../models/event.model.ts";
import { createEventSchema } from "../schemas/index.ts";
import type { Request, Response } from "express";

export const createEvent = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const parsed = createEventSchema.safeParse(authReq.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const data = parsed.data;

  try {
    const event = new Event({
      ...data,
      creator: authReq.user.userId,
    });

    await event.save();

    return res.status(201).json({
      message: "Event created successfully",
      event: event,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const joinEvent = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const eventId = req.params.eventId;

  try {
    // validate eventId
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // find event
    const event = await Event.findById(eventId).exec();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // find user
    const user = await User.findById(authReq.user.userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if already joined
    const alreadyJoined = event.participants.some(
      (p) => p.toString() === user._id.toString()
    );
    if (alreadyJoined) {
      return res
        .status(400)
        .json({ message: "You have already joined this event" });
    }

    // join event
    event.participants.push(user._id);
    await event.save();

    return res.status(200).json({
      message: "Event joined successfully",
      event,
    });
  } catch (err) {
    console.error("Error joining event:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().exec();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const event = await Event.findOne({ _id: eventId }).exec();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event fetched successfully",
      event,
    });
  } catch (err) {
    console.error("Error fetching event:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
