import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use("/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Hello from Express + TypeScript + Bun!");
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));