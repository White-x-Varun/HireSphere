import { Router, type IRouter } from "express";
import { db, applicationsTable, jobsTable, usersTable, resumesTable, atsScoresTable } from "@workspace/db";
import { eq, count, avg, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/seeker", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

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
    .where(eq(applicationsTable.userId, userId));

  const normalizedApps = apps.map((a) => ({
    ...a,
    coverLetter: a.coverLetter ?? null,
    atsScore: a.atsScore ?? null,
    jobTitle: a.jobTitle ?? null,
    company: a.company ?? null,
    applicantName: a.applicantName ?? null,
    applicantEmail: a.applicantEmail ?? null,
  }));

  const statusCounts = normalizedApps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scoresWithData = normalizedApps.filter((a) => a.atsScore != null);
  const avgScore = scoresWithData.length > 0
    ? scoresWithData.reduce((sum, a) => sum + (a.atsScore ?? 0), 0) / scoresWithData.length
    : 0;

  const resumeIds = await db
    .select({ id: resumesTable.id })
    .from(resumesTable)
    .where(eq(resumesTable.userId, userId));

  const topAtsScores = resumeIds.length > 0
    ? await db
        .select()
        .from(atsScoresTable)
        .where(sql`${atsScoresTable.resumeId} = ANY(ARRAY[${sql.join(resumeIds.map((r) => sql`${r.id}`), sql`, `)}])`)
        .limit(5)
    : [];

  res.json({
    totalApplications: normalizedApps.length,
    pendingApplications: statusCounts["pending"] ?? 0,
    shortlisted: statusCounts["shortlisted"] ?? 0,
    rejected: statusCounts["rejected"] ?? 0,
    accepted: statusCounts["accepted"] ?? 0,
    avgAtsScore: Math.round(avgScore),
    recentApplications: normalizedApps.slice(-5).reverse(),
    topAtsScores: topAtsScores.map((s) => ({ ...s, jobId: s.jobId ?? null, jobTitle: s.jobTitle ?? null })),
  });
});

router.get("/dashboard/recruiter", requireAuth, async (req, res): Promise<void> => {
  const recruiterId = req.user!.id;

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.recruiterId, recruiterId));

  const jobIds = jobs.map((j) => j.id);

  const apps = jobIds.length > 0
    ? await db
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
        .where(sql`${applicationsTable.jobId} = ANY(ARRAY[${sql.join(jobIds.map((id) => sql`${id}`), sql`, `)}])`)
    : [];

  const normalizedApps = apps.map((a) => ({
    ...a,
    coverLetter: a.coverLetter ?? null,
    atsScore: a.atsScore ?? null,
    jobTitle: a.jobTitle ?? null,
    company: a.company ?? null,
    applicantName: a.applicantName ?? null,
    applicantEmail: a.applicantEmail ?? null,
  }));

  const appCounts = await db
    .select({ jobId: applicationsTable.jobId, cnt: count() })
    .from(applicationsTable)
    .groupBy(applicationsTable.jobId);
  const countMap = new Map(appCounts.map((r) => [r.jobId, Number(r.cnt)]));

  const statusCounts = normalizedApps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    totalJobs: jobs.length,
    activeJobs: jobs.length,
    totalApplications: normalizedApps.length,
    pendingReview: statusCounts["pending"] ?? 0,
    shortlisted: statusCounts["shortlisted"] ?? 0,
    recentApplications: normalizedApps.slice(-5).reverse(),
    jobsWithCounts: jobs.map((j) => ({
      ...j,
      recruiterName: null,
      applicationCount: countMap.get(j.id) ?? 0,
    })),
  });
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [jobCount] = await db.select({ cnt: count() }).from(jobsTable);
  const [userCount] = await db.select({ cnt: count() }).from(usersTable);
  const [appCount] = await db.select({ cnt: count() }).from(applicationsTable);
  const [resumeCount] = await db.select({ cnt: count() }).from(resumesTable);
  const [avgScore] = await db.select({ avg: avg(atsScoresTable.score) }).from(atsScoresTable);

  const jobTypes = await db
    .select({ type: jobsTable.type, cnt: count() })
    .from(jobsTable)
    .groupBy(jobsTable.type);

  const byType = { full_time: 0, part_time: 0, contract: 0, remote: 0 };
  for (const row of jobTypes) {
    if (row.type in byType) {
      byType[row.type as keyof typeof byType] = Number(row.cnt);
    }
  }

  res.json({
    totalJobs: Number(jobCount?.cnt ?? 0),
    totalUsers: Number(userCount?.cnt ?? 0),
    totalApplications: Number(appCount?.cnt ?? 0),
    totalResumes: Number(resumeCount?.cnt ?? 0),
    avgAtsScore: Math.round(Number(avgScore?.avg ?? 0)),
    jobsByType: byType,
  });
});

export default router;
