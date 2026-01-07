import cron from "node-cron";
import syncUsers from "./syncUsers.js";

export function startCronJobs() {
  cron.schedule("*/2 * * * * *", async () => {
    console.log("⏰ Running Google Sheet sync (every 2 seconds)...");
    await syncUsers();
  });

  console.log("🕒 Cron job started (every 2 seconds)");
}
