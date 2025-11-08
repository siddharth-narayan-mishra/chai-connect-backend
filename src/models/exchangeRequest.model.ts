import mongoose, { Model, type InferSchemaType } from "mongoose";

// each skill starts as a request
// then others can respond to it with offers
// offers can be accepted or rejected by the requestor
// after acceptance a session is started
// then review and finally a dispute can be raised if necessary

// Skill Listing Schema
const exchangeRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorUsername: {
      type: String,
      required: true,
    },
    creditsRequested: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditsOffered: {
      type: Number,
      default: 0,
      min: 0,
    },
    skillsRequested: {
      type: [String],
      default: [],
    },
    skillsOffered: {
      type: [String],
      default: [],
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["hours", "days", "weeks", "sessions"],
        required: true,
      },
    },
    availabilitySchedule: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: {
        type: String,
        enum: ["online", "in_person", "hybrid"],
        required: true,
      },
      city: String,
      country: String,
    },
    status: {
      type: String,
      enum: ["active", "in_progress", "completed", "cancelled"],
      default: "active",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    responseCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export type ExchangeRequestType = InferSchemaType<typeof exchangeRequestSchema>;

export const ExchangeRequest: Model<ExchangeRequestType> =
  mongoose.model<ExchangeRequestType>("ExchangeRequest", exchangeRequestSchema);
