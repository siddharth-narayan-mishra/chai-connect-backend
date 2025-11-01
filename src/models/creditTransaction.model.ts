import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["exchange", "bonus", "refund", "penalty"],
      required: true,
    },
    relatedExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeSession",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "pending",
    },
    description: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
creditTransactionSchema.index({ from: 1, createdAt: -1 });
creditTransactionSchema.index({ to: 1, createdAt: -1 });
creditTransactionSchema.index({ status: 1 });

export const CreditTransaction = mongoose.model(
  "CreditTransaction",
  creditTransactionSchema
);