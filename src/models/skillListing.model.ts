import mongoose from "mongoose";

// Skill Listing Schema
const skillListingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
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
    listingType: {
      type: String,
      enum: ["offer", "request"],
      required: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one skill is required",
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "programming",
        "design",
        "writing",
        "marketing",
        "business",
        "languages",
        "music",
        "art",
        "fitness",
        "cooking",
        "photography",
        "videography",
        "teaching",
        "consulting",
        "other",
      ],
    },
    exchangeType: {
      type: String,
      enum: ["credits_only", "skill_only", "credits_and_skill", "flexible"],
      required: true,
    },
    creditAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    skillsWanted: {
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
      enum: ["active", "in_progress", "completed", "cancelled", "closed"],
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

// Indexes
skillListingSchema.index({ status: 1, createdAt: -1 });
skillListingSchema.index({ creator: 1 });
skillListingSchema.index({ category: 1, status: 1 });
skillListingSchema.index({ skills: 1 });

export const SkillListing = mongoose.model("SkillListing", skillListingSchema);
