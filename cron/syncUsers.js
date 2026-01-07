import mongoose from "mongoose";
import dotenv from "dotenv";
import { google } from "googleapis";
import User from "../models/User.js";

dotenv.config();

export default async function syncUsers() {
  try {
    console.log("🚀 Google Sheet sync started");

    if (mongoose.connection.readyState === 0) {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: `${process.cwd()}/credentials.json`,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log("📄 Fetching Google Sheet data...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2:D",
    });

    const rows = response.data.values || [];
    console.log(`📊 Rows found: ${rows.length}`);

    for (const row of rows) {
      const [name, email, month, role] = row;
      if (!email || !month) continue;

      await User.findOneAndUpdate(
        { email: email.toLowerCase(), month },
        {
          name,
          email: email.toLowerCase(),
          month,
          role: role || "student",
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Synced: ${email} (${month})`);
    }

    console.log("🎉 Sync completed");
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
}
