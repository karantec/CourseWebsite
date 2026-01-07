import { google } from "googleapis";
import User from "../models/User.js";
import path from "path";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function syncUsersFromSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve("credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:D", // skip header row
    });

    const rows = res.data.values || [];

    for (const row of rows) {
      const [name, email, month, role] = row;
      if (!email || !month) continue;

      const exists = await User.findOne({ email, month });

      if (!exists) {
        await User.create({
          name,
          email,
          month,
          role: role || "student",
        });
        console.log(`✅ Added user: ${email} (${month})`);
      }
    }

    console.log("🔄 Google Sheet sync completed");
  } catch (err) {
    console.error("❌ Sheet sync failed:", err.message);
  }
}
