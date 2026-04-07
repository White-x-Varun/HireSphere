import { Router, type IRouter } from "express";
import { db, applicationsTable, jobsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateApplicationBody,
  UpdateApplicationStatusBody,
  GetApplicationParams,
  UpdateApplicationStatusParams,
  ListApplicationsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/applications", requireAuth, async (req, res): Promise<void> => {
  const qp = ListApplicationsQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const apps = await db
    .select({
      id: applicationsTable.id,
      userId: applicationsTable.userId,
      jobId: applicationsTable.jobId,
      status: applicationsTable.status,
      coverLetter: applicationsTable.coverLetter,
      atsScore: applicationsTable.atsScore,
      jobTitle: jobsTable.title,
      company: jobsTable.company,
      applicantName: usersTable.name,
      applicantEmail: usersTable.email,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .leftJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .leftJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
    .where(
      params.jobId
        ? eq(applicationsTable.jobId, params.jobId)
        : params.userId
        ? eq(applicationsTable.userId, params.userId)
        : eq(applicationsTable.userId, req.user!.id)
    );

  res.json(apps.map((a) => ({
    ...a,
    coverLetter: a.coverLetter ?? null,
    atsScore: a.atsScore ?? null,
    jobTitle: a.jobTitle ?? null,
    company: a.company ?? null,
    applicantName: a.applicantName ?? null,
    applicantEmail: a.applicantEmail ?? null,
  })));
});

router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(applicationsTable)
    .where(and(eq(applicationsTable.userId, req.user!.id), eq(applicationsTable.jobId, parsed.data.jobId)));
  if (existing.length > 0) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }

  const [app] = await db
    .insert(applicationsTable)
    .values({ userId: req.user!.id, jobId: parsed.data.jobId, coverLetter: parsed.data.coverLetter ?? null })
    .returning();

  const [job] = await db.select({ title: jobsTable.title, company: jobsTable.company }).from(jobsTable).where(eq(jobsTable.id, app.jobId));
  const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, app.userId));

  res.status(201).json({
    ...app,
    coverLetter: app.coverLetter ?? null,
    atsScore: app.atsScore ?? null,
    jobTitle: job?.title ?? null,
    company: job?.company ?? null,
    applicantName: user?.name ?? null,
    applicantEmail: user?.email ?? null,
  });
});

router.get("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db
    .select({
      id: applicationsTable.id,
      userId: applicationsTable.userId,
      jobId: applicationsTable.jobId,
      status: applicationsTable.status,
      coverLetter: applicationsTable.coverLetter,
      atsScore: applicationsTable.atsScore,
      jobTitle: jobsTable.title,
      company: jobsTable.company,
      applicantName: usersTable.name,
      applicantEmail: usersTable.email,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .leftJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .leftJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
    .where(eq(applicationsTable.id, params.data.id));

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({
    ...app,
    coverLetter: app.coverLetter ?? null,
    atsScore: app.atsScore ?? null,
    jobTitle: app.jobTitle ?? null,
    company: app.company ?? null,
    applicantName: app.applicantName ?? null,
    applicantEmail: app.applicantEmail ?? null,
  });
});

router.patch("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateApplicationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const [job] = await db.select({ title: jobsTable.title, company: jobsTable.company }).from(jobsTable).where(eq(jobsTable.id, app.jobId));
  const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, app.userId));

  res.json({
    ...app,
    coverLetter: app.coverLetter ?? null,
    atsScore: app.atsScore ?? null,
    jobTitle: job?.title ?? null,
    company: job?.company ?? null,
    applicantName: user?.name ?? null,
    applicantEmail: user?.email ?? null,
  });
});

export default router;
