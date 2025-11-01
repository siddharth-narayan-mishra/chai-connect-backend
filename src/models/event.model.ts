import mongoose, { Schema } from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    location: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: Date,
    tags: {
      type: [String],
      default: [],
    },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

export const Event = mongoose.model("Event", eventSchema);
