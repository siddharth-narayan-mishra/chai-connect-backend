import mongoose, { Model, type InferSchemaType } from "mongoose";

// each skill starts as a request
// then others can respond to it with offers
// offers can be accepted or rejected by the requestor
// after acceptance a session is started
// then review and finally a dispute can be raised if necessary

// Skill Listing Schema
const skillListingSchema = new mongoose.Schema(
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
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: String[]) {
          return v && v.length > 0;
        },
        message: "At least one skill is required",
      },
    },
    category: {
      type: String,
      required: true,
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
  },
);

// Indexes
skillListingSchema.index({ status: 1, createdAt: -1 });
skillListingSchema.index({ creator: 1 });
skillListingSchema.index({ category: 1, status: 1 });
skillListingSchema.index({ skills: 1 });

export type SkillListingType = InferSchemaType<typeof skillListingSchema>;

export const SkillListing: Model<SkillListingType> =
  mongoose.model<SkillListingType>("SkillListing", skillListingSchema);
