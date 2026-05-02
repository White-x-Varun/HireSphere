import "dotenv/config";
import mongoose from "mongoose";
import * as schema from "./schema";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a database?",
  );
}

// Connect to MongoDB with retries
const connectWithRetry = () => {
  console.log("Attempting MongoDB connection...");
  mongoose.connect(process.env.MONGODB_URI!).then(() => {
    console.log("Successfully connected to MongoDB");
  }).catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

export const db = mongoose.connection;

export * from "./schema";
