import { Router, type IRouter } from "express";
import { Resume } from "@workspace/db";
import { UploadResumeBody, GetResumeParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import multer from "multer";
import { extractTextFromFile } from "../lib/extraction";

const upload = multer({ storage: multer.memoryStorage() });

const router: IRouter = Router();

router.get("/resumes", requireAuth, async (req, res): Promise<void> => {
  const resumes = await Resume.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json(resumes.map(r => ({ id: r.id, ...r.toObject() })));
});

router.post("/resumes", requireAuth, async (req, res): Promise<void> => {
  const parsed = UploadResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const resume = await Resume.create({ userId: req.user!.id, ...parsed.data });
  res.status(201).json({ id: resume.id, ...resume.toObject() });
});

router.get("/resumes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const resume = await Resume.findById(params.data.id);
  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  res.json({ id: resume.id, ...resume.toObject() });
});

router.delete("/resumes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const resume = await Resume.findOneAndDelete({ _id: params.data.id, userId: req.user!.id });
  if (!resume) {
    res.status(404).json({ error: "Resume not found or unauthorized" });
    return;
  }
  res.status(200).json({ message: "Resume deleted successfully" });
});

router.post("/resumes/extract", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    console.error("Extraction error: No file uploaded");
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    console.log(`Extracting text from: ${req.file.originalname} (${req.file.mimetype})`);
    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    console.log(`Extraction successful. Length: ${text.length}`);
    res.json({ text, fileName: req.file.originalname });
  } catch (err: any) {
    console.error("Extraction failed for file:", req.file.originalname, err);
    res.status(500).json({ error: err.message || "Failed to extract text from file" });
  }
});

export default router;
