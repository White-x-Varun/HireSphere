import { Router, type IRouter } from "express";
import { AtsScore, Resume } from "@workspace/db";
import { AnalyzeResumeBody, GetAtsScoreParams, ListAtsScoresQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { analyzeResume } from "../lib/ats";

const router: IRouter = Router();

router.post("/ats/analyze", requireAuth, async (req, res): Promise<void> => {
  const parsed = AnalyzeResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const resume = await Resume.findById(parsed.data.resumeId);
  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  const result = analyzeResume(resume.extractedText, parsed.data.jobDescription);

  const score = await AtsScore.create({
    resumeId: parsed.data.resumeId,
    jobId: parsed.data.jobId || null,
    score: result.score,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    totalKeywords: result.totalKeywords,
    jobTitle: parsed.data.jobTitle,
  });

  res.json({
    id: score.id,
    ...score.toObject(),
    jobTitle: score.jobTitle || null,
    jobId: score.jobId ? score.jobId.toString() : null,
  });
});

router.get("/ats/scores", requireAuth, async (req, res): Promise<void> => {
  const qp = ListAtsScoresQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  let query: any = {};
  if (params.resumeId) {
    query.resumeId = params.resumeId;
  }

  const scores = await AtsScore.find(query).sort({ createdAt: -1 });

  res.json(
    scores.map((s) => ({
      id: s.id,
      ...s.toObject(),
      jobId: s.jobId ? s.jobId.toString() : null,
      jobTitle: s.jobTitle || null,
    }))
  );
});

router.get("/ats/scores/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAtsScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const score = await AtsScore.findById(params.data.id);
  if (!score) {
    res.status(404).json({ error: "ATS score not found" });
    return;
  }
  res.json({
    id: score.id,
    ...score.toObject(),
    jobId: score.jobId ? score.jobId.toString() : null,
    jobTitle: score.jobTitle || null,
  });
});

export default router;
