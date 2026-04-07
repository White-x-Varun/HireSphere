import { Router, type IRouter } from "express";
import { db, jobsTable, usersTable, applicationsTable } from "@workspace/db";
import { eq, ilike, or, count, sql } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobBody,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
  ListJobsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const qp = ListJobsQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  let query = db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      description: jobsTable.description,
      skills: jobsTable.skills,
      location: jobsTable.location,
      type: jobsTable.type,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      recruiterId: jobsTable.recruiterId,
      recruiterName: usersTable.name,
      createdAt: jobsTable.createdAt,
      updatedAt: jobsTable.updatedAt,
    })
    .from(jobsTable)
    .leftJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id));

  const jobs = await query;

  const appCounts = await db
    .select({ jobId: applicationsTable.jobId, cnt: count() })
    .from(applicationsTable)
    .groupBy(applicationsTable.jobId);
  const countMap = new Map(appCounts.map((r) => [r.jobId, Number(r.cnt)]));

  let result = jobs.map((j) => ({
    ...j,
    recruiterName: j.recruiterName ?? null,
    applicationCount: countMap.get(j.id) ?? 0,
  }));

  if (params.search) {
    const s = params.search.toLowerCase();
    result = result.filter(
      (j) => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description.toLowerCase().includes(s)
    );
  }
  if (params.location) {
    result = result.filter((j) => j.location.toLowerCase().includes(params.location!.toLowerCase()));
  }
  if (params.type) {
    result = result.filter((j) => j.type === params.type);
  }

  res.json(result);
});

router.post("/jobs", requireAuth, requireRole("recruiter", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db
    .insert(jobsTable)
    .values({ ...parsed.data, recruiterId: req.user!.id })
    .returning();

  const [recruiter] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(201).json({ ...job, recruiterName: recruiter?.name ?? null, applicationCount: 0 });
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      description: jobsTable.description,
      skills: jobsTable.skills,
      location: jobsTable.location,
      type: jobsTable.type,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      recruiterId: jobsTable.recruiterId,
      recruiterName: usersTable.name,
      createdAt: jobsTable.createdAt,
      updatedAt: jobsTable.updatedAt,
    })
    .from(jobsTable)
    .leftJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id))
    .where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [appCount] = await db
    .select({ cnt: count() })
    .from(applicationsTable)
    .where(eq(applicationsTable.jobId, params.data.id));

  res.json({ ...job, recruiterName: job.recruiterName ?? null, applicationCount: Number(appCount?.cnt ?? 0) });
});

router.patch("/jobs/:id", requireAuth, requireRole("recruiter", "admin"), async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  const [recruiter] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.recruiterId));
  const [appCount] = await db
    .select({ cnt: count() })
    .from(applicationsTable)
    .where(eq(applicationsTable.jobId, job.id));
  res.json({ ...job, recruiterName: recruiter?.name ?? null, applicationCount: Number(appCount?.cnt ?? 0) });
});

router.delete("/jobs/:id", requireAuth, requireRole("recruiter", "admin"), async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
