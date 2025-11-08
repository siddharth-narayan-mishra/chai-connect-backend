import mongoose from "mongoose";

const exchangeResponseSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responderUsername: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    creditsOffered: {
      type: Number,
    },
    skillsOffered: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeResponseSchema.index({ exchangeRequest: 1 });
exchangeResponseSchema.index({ responder: 1 });
exchangeResponseSchema.index({ status: 1, createdAt: -1 });

// Ensure only one response per exchange request
exchangeResponseSchema.index({ exchangeRequest: 1 }, { unique: true });

export const ExchangeResponse = mongoose.model(
  "ExchangeResponse",
  exchangeResponseSchema
);
