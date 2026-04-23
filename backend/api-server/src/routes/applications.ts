import { Router, type IRouter } from "express";
import { Application, Job, User } from "@workspace/db";
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

  let query: any = {};
  if (params.jobId) {
    query.jobId = params.jobId;
  } else if (params.userId) {
    query.userId = params.userId;
  } else {
    query.userId = req.user!.id;
  }

  const apps = await Application.find(query)
    .populate("jobId", "title company")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(
    apps.map((a) => ({
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
    }))
  );
});

router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await Application.findOne({ userId: req.user!.id, jobId: parsed.data.jobId });
  if (existing) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }

  const app = await Application.create({
    userId: req.user!.id,
    jobId: parsed.data.jobId,
    coverLetter: parsed.data.coverLetter || null,
    resumeId: parsed.data.resumeId || null,
  });

  const job = await Job.findById(app.jobId).select("title company");
  const user = await User.findById(app.userId).select("name email");

  res.status(201).json({
    id: app.id,
    userId: app.userId.toString(),
    jobId: app.jobId.toString(),
    status: app.status,
    coverLetter: app.coverLetter || null,
    atsScore: null,
    jobTitle: job?.title || null,
    company: job?.company || null,
    applicantName: user?.name || null,
    applicantEmail: user?.email || null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  });
});

router.get("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const app = await Application.findById(params.data.id)
    .populate("jobId", "title company")
    .populate("userId", "name email");

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({
    id: app.id,
    userId: app.userId._id.toString(),
    jobId: app.jobId._id.toString(),
    status: app.status,
    coverLetter: app.coverLetter || null,
    atsScore: (app as any).atsScore || null,
    jobTitle: (app.jobId as any).title || null,
    company: (app.jobId as any).company || null,
    applicantName: (app.userId as any).name || null,
    applicantEmail: (app.userId as any).email || null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
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

  const app = await Application.findByIdAndUpdate(params.data.id, { status: parsed.data.status }, { new: true })
    .populate("jobId", "title company")
    .populate("userId", "name email");

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({
    id: app.id,
    userId: app.userId._id.toString(),
    jobId: app.jobId._id.toString(),
    status: app.status,
    coverLetter: app.coverLetter || null,
    atsScore: (app as any).atsScore || null,
    jobTitle: (app.jobId as any).title || null,
    company: (app.jobId as any).company || null,
    applicantName: (app.userId as any).name || null,
    applicantEmail: (app.userId as any).email || null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  });
});

export default router;
