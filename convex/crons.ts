import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Delete expired rooms",
  { minutes: 5 }, // Check every 5 minutes
  internal.chat.deleteExpiredRooms
);

export default crons;
