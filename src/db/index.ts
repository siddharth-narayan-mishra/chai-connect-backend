import mongoose from "mongoose";

const CONNECTION_STRING = process.env.MONGO_URI || "mongodb://localhost:27017/test";

export async function connectToDatabase() {
  try {
    await mongoose.connect(CONNECTION_STRING);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
