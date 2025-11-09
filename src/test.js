import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { userId: "690f23e1fd4b2d238b2c4789", username: "omnyn" },
  process.env.JWT_SECRET,
  { expiresIn: "1y" }
);
console.log(token);
