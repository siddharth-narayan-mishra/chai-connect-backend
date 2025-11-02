import mongoose from "mongoose";

const exchangeSessionSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillListing",
      required: true,
    },
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
    },
    requestor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exchangeDetails: {
      creditsAmount: {
        type: Number,
        default: 0,
      },
      creditsPayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled", "disputed"],
      default: "scheduled",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    requestorConfirmed: {
      type: Boolean,
      default: false,
    },
    responderConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeSessionSchema.index({ requestor: 1, status: 1 });
exchangeSessionSchema.index({ responder: 1, status: 1 });
exchangeSessionSchema.index({ status: 1 });

export const ExchangeSession = mongoose.model(
  "ExchangeSession",
  exchangeSessionSchema
);