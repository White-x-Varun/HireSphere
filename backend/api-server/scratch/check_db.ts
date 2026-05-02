import "dotenv/config";
import mongoose from "mongoose";

async function check() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  console.log("Connecting to:", process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

check();
