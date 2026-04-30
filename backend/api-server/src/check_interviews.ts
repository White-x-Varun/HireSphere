import { Interview } from "@workspace/db";
import "dotenv/config";
import mongoose from "mongoose";

async function checkInterviews() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hiresphere");
  const interviews = await Interview.find({}).populate("candidateId", "name email");
  console.log("Total Interviews:", interviews.length);
  interviews.forEach(i => {
    console.log(`ID: ${i._id}, Candidate: ${i.candidateId?.name} (${i.candidateId?.email}), ScheduledAt: ${i.scheduledAt}`);
  });
  process.exit(0);
}

checkInterviews();
