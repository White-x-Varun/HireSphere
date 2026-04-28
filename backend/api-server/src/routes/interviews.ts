import { Router } from "express";
import { Interview, Application, Notification } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { sendNotification } from "../lib/socket";
import { logger } from "../lib/logger";

const router = Router();

router.post("/interviews", requireAuth, async (req, res) => {
  try {
    const { applicationId, candidateId, scheduledAt, type, meetingLink, location, notes } = req.body;
    const recruiterId = req.user!.id;

    const interview = await Interview.create({
      applicationId,
      candidateId,
      recruiterId,
      scheduledAt,
      type,
      meetingLink,
      location,
      notes
    });

    // Create notification for candidate
    const notification = await Notification.create({
      userId: candidateId,
      title: "Interview Scheduled!",
      message: `You have a new interview scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
      type: "info"
    });

    sendNotification(candidateId, notification);

    res.status(201).json(interview);
  } catch (error) {
    logger.error({ error }, "Create Interview Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/interviews", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const query = role === "recruiter" ? { recruiterId: userId } : { candidateId: userId };
    
    const interviews = await Interview.find(query)
      .populate("candidateId", "name email")
      .populate("recruiterId", "name email")
      .populate({
        path: "applicationId",
        populate: {
          path: "jobId",
          select: "title company"
        }
      })
      .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (error) {
    logger.error({ error }, "Get Interviews Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
