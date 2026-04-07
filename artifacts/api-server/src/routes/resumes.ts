import { Router, type IRouter } from "express";
import { db, resumesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UploadResumeBody, GetResumeParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/resumes", requireAuth, async (req, res): Promise<void> => {
  const resumes = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.userId, req.user!.id));
  res.json(resumes);
});

router.post("/resumes", requireAuth, async (req, res): Promise<void> => {
  const parsed = UploadResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [resume] = await db
    .insert(resumesTable)
    .values({ userId: req.user!.id, ...parsed.data })
    .returning();
  res.status(201).json(resume);
});

router.get("/resumes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, params.data.id));
  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  res.json(resume);
});

export default router;
