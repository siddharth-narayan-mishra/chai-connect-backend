import { Router } from "express";
import {
  createUser,
  getMe,
  getUser,
  loginUser,
} from "../controllers/users.controller.ts";
import { auth } from "../middleware/auth.ts";

const userRouter = Router();
userRouter.post("/create", createUser);
userRouter.get("/me", auth, getMe);
userRouter.post("/login", loginUser);
userRouter.get("/:username", getUser);

export default userRouter;
