import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
const token = jwt.sign(
  { userId: "690f2376fd4b2d238b2c4783", username: "sid" },
  process.env.JWT_SECRET,
  { expiresIn: "1y" }
);
console.log(token);
