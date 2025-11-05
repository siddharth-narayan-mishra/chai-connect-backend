import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import { connectToDatabase } from "./db/index.ts";
import {
  userRouter,
  eventsRouter,
  exchangesRouter,
  postsRouter,
} from "./routes/index.ts";

connectToDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/user", userRouter);
app.use("/event", eventsRouter);
app.use("/exchange", exchangesRouter);
app.use("/post", postsRouter);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
