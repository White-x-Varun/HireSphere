import "dotenv/config";
import mongoose from "mongoose";
import * as schema from "./schema";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a database?",
  );
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).catch((err) => {
  console.error("MongoDB connection error:", err);
});

export const db = mongoose.connection;

export * from "./schema";
