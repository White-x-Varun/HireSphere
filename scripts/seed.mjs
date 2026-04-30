import mongoose from "mongoose";
import "dotenv/config";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hiresphere";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    const collections = ["users", "jobs", "resumes", "atsscores", "applications", "interviews", "notifications", "messages"];
    for (const coll of collections) {
      try {
        await mongoose.connection.db.collection(coll).deleteMany({});
        console.log(`Cleared collection: ${coll}`);
      } catch (e) {
        console.log(`Collection ${coll} might not exist yet, skipping clear.`);
      }
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
    const adminId = new mongoose.Types.ObjectId();

    await mongoose.connection.db.collection("users").insertMany([
      {
        _id: seekerId,
        name: "Arjun Sharma",
        email: "seeker@demo.com",
        passwordHash,
        role: "job_seeker",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: recruiterId,
        name: "Priya Iyer",
        email: "recruiter@demo.com",
        passwordHash,
        role: "recruiter",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: adminId,
        name: "HireSphere Admin",
        email: "admin@demo.com",
        passwordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log("Inserted Indian users (Arjun, Priya, Admin)");

    // 2. Jobs
    const jobs = [
      {
        title: "Senior SDE - Backend",
        company: "Zomato",
        location: "Gurgaon, HR",
        type: "full_time",
        skills: ["Node.js", "TypeScript", "Redis", "Kafka", "Go"],
        description: "Scale our delivery infrastructure to millions of requests. Looking for high-performance engineers.",
        salaryMin: 2500000,
        salaryMax: 4500000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Full Stack Developer",
        company: "Paytm",
        location: "Noida, UP",
        type: "full_time",
        skills: ["React", "Java", "Spring Boot", "Microservices"],
        description: "Join the core payments team to build the future of digital finance in India.",
        salaryMin: 1500000,
        salaryMax: 2800000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Frontend Engineer (React)",
        company: "Flipkart",
        location: "Bangalore, KA",
        type: "full_time",
        skills: ["React", "Next.js", "Tailwind CSS", "Redux"],
        description: "Build the most seamless e-commerce experience for over 100 million users.",
        salaryMin: 1800000,
        salaryMax: 3200000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "DevOps Architect",
        company: "TCS",
        location: "Pune, MH",
        type: "full_time",
        skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
        description: "Design enterprise-grade cloud infrastructure for global digital transformation.",
        salaryMin: 2000000,
        salaryMax: 3500000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "UI/UX Designer",
        company: "Swiggy",
        location: "Hyderabad, TS",
        type: "remote",
        skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        description: "Design delightful food ordering experiences for our hungry customers across India.",
        salaryMin: 1200000,
        salaryMax: 2200000,
        recruiterId: recruiterId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedJobs = await mongoose.connection.db.collection("jobs").insertMany(jobs);
    const jobId = insertedJobs.insertedIds[0];
    console.log("Inserted 5 Indian tech jobs");

    // 3. Resumes
    const resumeId = new mongoose.Types.ObjectId();
    await mongoose.connection.db.collection("resumes").insertOne({
      _id: resumeId,
      userId: seekerId,
      fileName: "Arjun_Sharma_SDE.pdf",
      extractedText: "Arjun Sharma is a Backend Specialist with 5 years of experience at top Indian startups. Expert in Node.js, TypeScript, and Redis. Previously at OLA and Swiggy.",
      skills: ["Node.js", "TypeScript", "Redis", "Kafka"],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Inserted Indian seeker resume");

    // 4. ATS Scores
    await mongoose.connection.db.collection("atsscores").insertOne({
      resumeId: resumeId,
      jobId: jobId,
      score: 92,
      matchedKeywords: ["Node.js", "TypeScript", "Redis", "Kafka"],
      missingKeywords: ["Go"],
      totalKeywords: 5,
      jobTitle: "Senior SDE - Backend",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Inserted ATS score");

    // 5. Sample Application
    await mongoose.connection.db.collection("applications").insertOne({
      userId: seekerId,
      jobId: jobId,
      status: "shortlisted",
      coverLetter: "I have extensive experience scaling backend systems at OLA and would love to bring my expertise to Zomato.",
      resumeId: resumeId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Inserted sample application");

    console.log("Comprehensive Indian-format seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
