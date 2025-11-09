import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEvent,
  joinEvent,
} from "../controllers/events.controller.ts";
import { auth } from "../middleware/auth.ts";

const eventsRouter = Router();

eventsRouter.get("/all", getAllEvents);
eventsRouter.get("/:eventId", getEvent);
eventsRouter.post("/create",auth, createEvent);
eventsRouter.post("/:eventId/join", auth, joinEvent);

export default eventsRouter;
