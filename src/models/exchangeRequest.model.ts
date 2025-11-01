import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillListing",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterUsername: {
      type: String,
      required: true,
    },
    listingCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    proposedExchangeType: {
      type: String,
      enum: ["credits_only", "skill_only", "credits_and_skill"],
      required: true,
    },
    proposedCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    proposedSkills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    responseMessage: {
      type: String,
      maxlength: 1000,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeRequestSchema.index({ listing: 1, status: 1 });
exchangeRequestSchema.index({ requester: 1 });
exchangeRequestSchema.index({ listingCreator: 1, status: 1 });

export const ExchangeRequest = mongoose.model(
  "ExchangeRequest",
  exchangeRequestSchema
);
