import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import { connectToDatabase } from "./db/index.ts";
import {
  userRouter,
  eventsRouter,
  exchangesRouter,
  postsRouter,
} from "./routes/index.ts";
import cors from "cors";

connectToDatabase();
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/user", userRouter);
app.use("/event", eventsRouter);
app.use("/exchange", exchangesRouter);
app.use("/post", postsRouter);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
