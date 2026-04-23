import { Router, type IRouter } from "express";
import { Job, User, Application } from "@workspace/db";
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

  let query: any = {};
  if (params.search) {
    const s = new RegExp(params.search, "i");
    query.$or = [{ title: s }, { company: s }, { description: s }];
  }
  if (params.location) {
    query.location = new RegExp(params.location, "i");
  }
  if (params.type) {
    query.type = params.type;
  }

  const jobs = await Job.find(query).populate("recruiterId", "name").sort({ createdAt: -1 });

  const result = await Promise.all(
    jobs.map(async (j) => {
      const appCount = await Application.countDocuments({ jobId: j._id });
      return {
        id: j.id,
        title: j.title,
        company: j.company,
        description: j.description,
        skills: j.skills,
        location: j.location,
        type: j.type,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        recruiterId: j.recruiterId._id.toString(),
        recruiterName: (j.recruiterId as any).name || null,
        applicationCount: appCount,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      };
    })
  );

  res.json(result);
});

router.post("/jobs", requireAuth, requireRole("recruiter", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const job = await Job.create({ ...parsed.data, recruiterId: req.user!.id });
  const recruiter = await User.findById(req.user!.id).select("name");

  res.status(201).json({
    id: job.id,
    ...job.toObject(),
    recruiterName: recruiter?.name || null,
    applicationCount: 0,
  });
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const job = await Job.findById(params.data.id).populate("recruiterId", "name");
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const appCount = await Application.countDocuments({ jobId: job._id });

  res.json({
    id: job.id,
    ...job.toObject(),
    recruiterName: (job.recruiterId as any).name || null,
    applicationCount: appCount,
  });
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

  const job = await Job.findByIdAndUpdate(params.data.id, parsed.data, { new: true }).populate("recruiterId", "name");
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const appCount = await Application.countDocuments({ jobId: job._id });
  res.json({
    id: job.id,
    ...job.toObject(),
    recruiterName: (job.recruiterId as any).name || null,
    applicationCount: appCount,
  });
});

router.delete("/jobs/:id", requireAuth, requireRole("recruiter", "admin"), async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const job = await Job.findByIdAndDelete(params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  // Also delete associated applications
  await Application.deleteMany({ jobId: job._id });

  res.sendStatus(204);
});

export default router;
