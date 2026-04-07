import { Router, type IRouter } from "express";
import { db, atsScoresTable, resumesTable, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, parsed.data.resumeId));

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  const result = analyzeResume(resume.extractedText, parsed.data.jobDescription);

  const [score] = await db
    .insert(atsScoresTable)
    .values({
      resumeId: parsed.data.resumeId,
      jobId: parsed.data.jobId ?? null,
      score: result.score,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      totalKeywords: result.totalKeywords,
      jobTitle: parsed.data.jobTitle,
    })
    .returning();

  res.json({ ...score, jobTitle: score.jobTitle ?? null, jobId: score.jobId ?? null });
});

router.get("/ats/scores", requireAuth, async (req, res): Promise<void> => {
  const qp = ListAtsScoresQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const scores = await db
    .select()
    .from(atsScoresTable)
    .where(params.resumeId ? eq(atsScoresTable.resumeId, params.resumeId) : undefined);

  res.json(scores.map((s) => ({ ...s, jobId: s.jobId ?? null, jobTitle: s.jobTitle ?? null })));
});

router.get("/ats/scores/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAtsScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [score] = await db
    .select()
    .from(atsScoresTable)
    .where(eq(atsScoresTable.id, params.data.id));
  if (!score) {
    res.status(404).json({ error: "ATS score not found" });
    return;
  }
  res.json({ ...score, jobId: score.jobId ?? null, jobTitle: score.jobTitle ?? null });
});

export default router;
