import { Router } from "express";
import { createUser, getUser } from "../controllers/users.controller.ts";

const userRouter = Router();
userRouter.post("/create", createUser);
userRouter.get("/:username", getUser);

export default userRouter;
