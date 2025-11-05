import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
const token = jwt.sign({ userId: "123abc" }, process.env.JWT_SECRET, { expiresIn: "1h" });
console.log(token);