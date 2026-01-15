import { Schema, model, models } from "mongoose";

const WordHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Store lowercase for easier searching
    },
    meaning: {
      type: String,
      required: true,
    },
    universe: {
      type: String,
      required: true,
    },
    visual_prompt: {
      type: String,
    },
    imageUrl: {
      type: String, // The Cloudinary URL
    },
    synonyms: [String],
    antonyms: [String],
    conversation: [String],
    context: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user doesn't have duplicate entries for the same word
WordHistorySchema.index({ userId: 1, word: 1 }, { unique: true });

const WordHistory = models.WordHistory || model("WordHistory", WordHistorySchema);

export default WordHistory;
