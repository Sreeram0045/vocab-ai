import { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
    },
    content: {
      type: String, // Storing HTML/JSON from Tiptap
      default: "",
    },
    // Optional: If this note is strictly about one word
    linkedWordId: {
      type: Schema.Types.ObjectId,
      ref: "WordHistory",
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const Note = models.Note || model("Note", NoteSchema);

export default Note;
