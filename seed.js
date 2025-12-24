// seeds/seedUsers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = [
    {
      name: "Amit Kumar",
      email: "karanrana3095@gmail.com",
      month: "January",
      role: "student",
    },
    {
      name: "Priya Singh",
      email: "priya@example.com",
      month: "March",
      role: "student",
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log("Created", u.email);
    } else {
      console.log("Already exists", u.email);
    }
  }

  console.log("Seed done");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
