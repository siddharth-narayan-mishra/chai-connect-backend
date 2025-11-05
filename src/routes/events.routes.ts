import { Router } from "express";
import { createEvent, getEvent } from "../controllers/events.controller.ts";

const eventsRouter = Router();

eventsRouter.get("/", getEvent);
eventsRouter.post("/create", createEvent);

export default eventsRouter;
