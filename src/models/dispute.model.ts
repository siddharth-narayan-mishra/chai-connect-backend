import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    exchangeSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeSession",
      required: true,
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "no_show",
        "incomplete_service",
        "quality_issue",
        "miscommunication",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    evidence: {
      type: [String],
      default: [],
    },
    respondentResponse: {
      type: String,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: [
        "open",
        "under_review",
        "resolved",
        "closed",
        "escalated",
      ],
      default: "open",
    },
    resolution: {
      type: String,
      maxlength: 1000,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
disputeSchema.index({ exchangeSession: 1 });
disputeSchema.index({ initiator: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });

export const Dispute = mongoose.model("Dispute", disputeSchema);