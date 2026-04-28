import { Router } from "express";
import { refineResume, generateCoverLetter, matchJobs } from "../lib/ai";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/ai/refine", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await refineResume(resumeText, jobDescription);
    res.json(result);
  } catch (error) {
    logger.error({ error }, "AI Refine Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

import { Resume, Job } from "@workspace/db";

router.post("/ai/cover-letter", requireAuth, async (req, res): Promise<void> => {
  try {
    const { resumeId, jobId, resumeText: rawResumeText, jobDescription: rawJobDescription } = req.body;
    
    let resumeText = rawResumeText;
    let jobDescription = rawJobDescription;

    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) resumeText = resume.extractedText;
    }
    
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) jobDescription = job.description;
    }

    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "Missing required fields or invalid IDs" });
      return;
    }

    const result = await generateCoverLetter(resumeText, jobDescription);
    res.json({ coverLetter: result });
  } catch (error) {
    logger.error({ error }, "AI Cover Letter Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/ai/match-jobs", async (req, res) => {
  try {
    const { resumeText, jobs } = req.body;
    if (!resumeText || !jobs || !Array.isArray(jobs)) {
      return res.status(400).json({ error: "Missing required fields or invalid jobs array" });
    }

    const result = await matchJobs(resumeText, jobs);
    res.json(result);
  } catch (error) {
    logger.error({ error }, "AI Match Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
