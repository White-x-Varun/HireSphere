import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function refineResume(resumeText: string, jobDescription: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert ATS (Applicant Tracking System) optimizer. 
    Analyze the following resume text against the job description.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Provide the following in JSON format:
    1. "score": a number from 0-100.
    2. "improvements": an array of strings suggesting specific wording changes or missing bullet points.
    3. "matchedKeywords": an array of keywords found in both.
    4. "missingKeywords": an array of important keywords from the job description missing in the resume.
    5. "optimizedSummary": a short, professional summary (2-3 sentences) tailored for this job.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (sometimes Gemini wraps it in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI Refine Error:", error);
    throw error;
  }
}

export async function generateCoverLetter(resumeText: string, jobDescription: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Write a professional, compelling cover letter based on the following resume and job description.
    Keep it concise (under 300 words).
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Cover Letter Error:", error);
    throw error;
  }
}

export async function matchJobs(resumeText: string, jobs: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const jobsData = jobs.map(j => ({
    id: j.id,
    title: j.title,
    description: j.description,
    skills: j.skills
  }));

  const prompt = `
    Rank the following jobs for a candidate based on their resume.
    Provide a "matchScore" (0-100) and a "reason" for each job.
    
    Resume:
    ${resumeText}
    
    Jobs:
    ${JSON.stringify(jobsData)}
    
    Return a JSON array of objects with "jobId", "matchScore", and "reason".
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI Match Error:", error);
    throw error;
  }
}
