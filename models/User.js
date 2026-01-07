// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  month: {
    type: String,
    required: true,
  },
  allowedMonths: {
    type: [String], // MUST be array
    default: [],
  },
  role: {
    type: String,
    default: "student",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
