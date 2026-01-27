import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    image: {
      type: String,
    },
    credits: {
      type: Number,
      default: 10, // Example: Give new users 10 free generations
    },
    preferences: {
      watchedShows: {
        type: [String], // Array of strings
        default: []     // Default to empty array
      }
    }
  },
  {
    timestamps: true,
  }
);

// Prevent overwriting the model if it already exists (Hot Reload fix)
const User = models.User || model("User", UserSchema);

export default User;
