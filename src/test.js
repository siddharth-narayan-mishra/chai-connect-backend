import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
const token = jwt.sign(
  { userId: "6905ede51a262f917b4b6265", username: "omnyn" },
  process.env.JWT_SECRET,
  { expiresIn: "1d" },
);
console.log(token);
