import mongoose from "mongoose";

const exchangeSessionSchema = new mongoose.Schema(
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
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
    },
    participant1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exchangeDetails: {
      type: {
        type: String,
        enum: ["credits_only", "skill_only", "credits_and_skill"],
        required: true,
      },
      creditsAmount: {
        type: Number,
        default: 0,
      },
      creditsPayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      skillsExchanged: [
        {
          provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          skills: [String],
        },
      ],
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
    milestones: [
      {
        description: String,
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],
    participant1Confirmed: {
      type: Boolean,
      default: false,
    },
    participant2Confirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeSessionSchema.index({ participant1: 1, status: 1 });
exchangeSessionSchema.index({ participant2: 1, status: 1 });
exchangeSessionSchema.index({ status: 1 });

export const ExchangeSession = mongoose.model(
  "ExchangeSession",
  exchangeSessionSchema
);