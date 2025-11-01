import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    skillRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reliabilityRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      minlength: 10,
      maxlength: 1000,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per exchange session
reviewSchema.index(
  { exchangeSession: 1, reviewer: 1 },
  { unique: true }
);
reviewSchema.index({ reviewee: 1 });

export const Review = mongoose.model("Review", reviewSchema);
