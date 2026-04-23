import mongoose from "mongoose";
import "dotenv/config";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hiresphere";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    const collections = ["users", "jobs", "resumes", "atsscores"];
    for (const coll of collections) {
      await mongoose.connection.db.collection(coll).deleteMany({});
      console.log(`Cleared collection: ${coll}`);
    }

    // Helper to generate hash manually
    const salt = "00000000000000000000000000000000";
    const generateHash = (password) => {
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
      return `${salt}:${hash}`;
    };

    const passwordHash = generateHash("demo");

    // 1. Users
    const seekerId = new mongoose.Types.ObjectId();
    const recruiterId = new mongoose.Types.ObjectId();

    await mongoose.connection.db.collection("users").insertMany([
      {
        _id: seekerId,
        name: "John Seeker",
        email: "seeker@demo.com",
        passwordHash,
        role: "job_seeker",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: recruiterId,
        name: "Jane Recruiter",
        email: "recruiter@demo.com",
        passwordHash,
        role: "recruiter",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log("Inserted users");

    // 2. Jobs
    const jobs = [
      {
        title: "Senior Full Stack Engineer",
        company: "Nexus Tech India",
        location: "Bangalore, KA",
        type: "full_time",
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
        description: "We are looking for a Senior Full Stack Engineer to lead our core product development in Bangalore. Experience with React and Node.js is essential.",
        salaryMin: 1800000,
        salaryMax: 3500000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Frontend Developer",
        company: "Pixel Perfect Designs",
        location: "Mumbai, MH",
        type: "full_time",
        skills: ["React", "Tailwind CSS", "Framer Motion"],
        description: "Join our UI team in Mumbai to build stunning web interfaces. High proficiency in CSS and React required.",
        salaryMin: 800000,
        salaryMax: 1500000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Backend Specialist",
        company: "DataFlow India",
        location: "Gurgaon, HR",
        type: "contract",
        skills: ["Node.js", "PostgreSQL", "Docker", "Redis"],
        description: "Build scalable microservices for our data processing pipeline in Gurgaon.",
        salaryMin: 1200000,
        salaryMax: 2000000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedJobs = await mongoose.connection.db.collection("jobs").insertMany(jobs);
    const jobId = insertedJobs.insertedIds[0];
    console.log("Inserted jobs");

    // 3. Resumes
    const resumeId = new mongoose.Types.ObjectId();
    await mongoose.connection.db.collection("resumes").insertOne({
      _id: resumeId,
      userId: seekerId,
      fileName: "John_Doe_Developer.pdf",
      extractedText: "John Doe is a Senior Developer with 10 years of experience in React, Node.js, and Cloud Computing. Expert in AWS and TypeScript.",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Inserted resume");

    // 4. ATS Scores
    await mongoose.connection.db.collection("atsscores").insertOne({
      resumeId: resumeId,
      jobId: jobId,
      score: 85,
      matchedKeywords: ["React", "Node.js", "TypeScript", "AWS"],
      missingKeywords: ["MongoDB"],
      totalKeywords: 5,
      jobTitle: "Senior Full Stack Engineer",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Inserted ATS score");

    console.log("Comprehensive seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
