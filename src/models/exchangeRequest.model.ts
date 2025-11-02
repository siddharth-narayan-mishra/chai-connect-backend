import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema(
  {
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
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    proposedCredits: {
      // if 0 then only skill exchange
      type: Number,
      default: 0,
      min: 0,
    },
    proposedSkills: {
      // if empty then only credits exchange
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
exchangeRequestSchema.index({ listing: 1, status: 1 });
exchangeRequestSchema.index({ requester: 1 });
exchangeRequestSchema.index({ listingCreator: 1, status: 1 });

export const ExchangeRequest = mongoose.model(
  "ExchangeRequest",
  exchangeRequestSchema,
);
