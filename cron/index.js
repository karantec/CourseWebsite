import cron from "node-cron";
import syncUsers from "./syncUsers.js";

export function startCronJobs() {
  // every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Running scheduled Google Sheet sync...");
    await syncUsers();
  });

  console.log("🕒 Cron jobs started");
}
