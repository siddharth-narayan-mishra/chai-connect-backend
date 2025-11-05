import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEvent,
} from "../controllers/events.controller.ts";

const eventsRouter = Router();

eventsRouter.get("/all", getAllEvents);
eventsRouter.get("/:eventId", getEvent);
eventsRouter.post("/create", createEvent);

export default eventsRouter;
