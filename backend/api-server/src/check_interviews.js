const { Interview } = require("@workspace/db");
require("dotenv").config();
const mongoose = require("mongoose");

async function checkInterviews() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hiresphere");
  const interviews = await Interview.find({}).populate("candidateId", "name email");
  console.log("Total Interviews:", interviews.length);
  interviews.forEach(i => {
    console.log(`ID: ${i._id}, Candidate: ${i.candidateId ? i.candidateId.name : 'Unknown'} (${i.candidateId ? i.candidateId.email : 'N/A'}), ScheduledAt: ${i.scheduledAt}`);
  });
  process.exit(0);
}

checkInterviews();
