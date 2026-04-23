import { Router, type IRouter } from "express";
import { Application, Job, User, Resume, AtsScore } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/seeker", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

  const apps = await Application.find({ userId })
    .populate("jobId", "title company")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const normalizedApps = apps.map((a) => ({
    id: a.id,
    userId: a.userId._id.toString(),
    jobId: a.jobId._id.toString(),
    status: a.status,
    coverLetter: a.coverLetter || null,
    atsScore: (a as any).atsScore || null,
    jobTitle: (a.jobId as any).title || null,
    company: (a.jobId as any).company || null,
    applicantName: (a.userId as any).name || null,
    applicantEmail: (a.userId as any).email || null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  const statusCounts = normalizedApps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scoresWithData = normalizedApps.filter((a) => a.atsScore != null);
  const avgScore = scoresWithData.length > 0
    ? scoresWithData.reduce((sum, a) => sum + (a.atsScore ?? 0), 0) / scoresWithData.length
    : 0;

  const resumes = await Resume.find({ userId }).select("_id");
  const resumeIds = resumes.map(r => r._id);

  const topAtsScores = await AtsScore.find({ resumeId: { $in: resumeIds } })
    .sort({ score: -1 })
    .limit(5);

  res.json({
    totalApplications: normalizedApps.length,
    pendingApplications: statusCounts["pending"] ?? 0,
    shortlisted: statusCounts["shortlisted"] ?? 0,
    rejected: statusCounts["rejected"] ?? 0,
    accepted: statusCounts["accepted"] ?? 0,
    avgAtsScore: Math.round(avgScore),
    recentApplications: normalizedApps.slice(0, 5),
    topAtsScores: topAtsScores.map((s) => ({
      id: s.id,
      ...s.toObject(),
      jobId: s.jobId ? s.jobId.toString() : null,
      jobTitle: s.jobTitle || null,
    })),
  });
});

router.get("/dashboard/recruiter", requireAuth, async (req, res): Promise<void> => {
  const recruiterId = req.user!.id;

  const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 });
  const jobIds = jobs.map((j) => j._id);

  const apps = await Application.find({ jobId: { $in: jobIds } })
    .populate("jobId", "title company")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const normalizedApps = apps.map((a) => ({
    id: a.id,
    userId: a.userId._id.toString(),
    jobId: a.jobId._id.toString(),
    status: a.status,
    coverLetter: a.coverLetter || null,
    atsScore: (a as any).atsScore || null,
    jobTitle: (a.jobId as any).title || null,
    company: (a.jobId as any).company || null,
    applicantName: (a.userId as any).name || null,
    applicantEmail: (a.userId as any).email || null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  const statusCounts = normalizedApps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobsWithCounts = await Promise.all(
    jobs.map(async (j) => {
      const count = await Application.countDocuments({ jobId: j._id });
      return {
        id: j.id,
        ...j.toObject(),
        recruiterName: null,
        applicationCount: count,
      };
    })
  );

  res.json({
    totalJobs: jobs.length,
    activeJobs: jobs.length,
    totalApplications: normalizedApps.length,
    pendingReview: statusCounts["pending"] ?? 0,
    shortlisted: statusCounts["shortlisted"] ?? 0,
    recentApplications: normalizedApps.slice(0, 5),
    jobsWithCounts,
  });
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [jobCount, userCount, appCount, resumeCount] = await Promise.all([
    Job.countDocuments(),
    User.countDocuments(),
    Application.countDocuments(),
    Resume.countDocuments(),
  ]);

  const avgScoreResult = await AtsScore.aggregate([
    { $group: { _id: null, avgScore: { $avg: "$score" } } },
  ]);
  const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

  const jobTypes = await Job.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  const byType: any = { full_time: 0, part_time: 0, contract: 0, remote: 0 };
  for (const item of jobTypes) {
    if (item._id in byType) {
      byType[item._id] = item.count;
    }
  }

  res.json({
    totalJobs: jobCount,
    totalUsers: userCount,
    totalApplications: appCount,
    totalResumes: resumeCount,
    avgAtsScore: Math.round(avgScore),
    jobsByType: byType,
  });
});

export default router;
