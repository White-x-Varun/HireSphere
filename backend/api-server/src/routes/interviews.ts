import { Router } from "express";
import { Interview, Application, Notification } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { sendNotification } from "../lib/socket";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";
import { User } from "@workspace/db";

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

    // Update application status to interviewing
    await Application.findByIdAndUpdate(applicationId, { status: "interviewing" });

    // Create notification for candidate
    const notification = await Notification.create({
      userId: candidateId,
      title: "Interview Scheduled!",
      message: `You have a new interview scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
      type: "info"
    });

    sendNotification(candidateId, notification);

    // Send Email notification
    const candidate = await User.findById(candidateId);
    if (candidate && candidate.email) {
      const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview: ${candidate.name}`)}&details=${encodeURIComponent(`Interview for application to HireSphere. ${meetingLink ? `Meeting: ${meetingLink}` : ""}`)}&location=${encodeURIComponent(location || "Online")}&dates=${new Date(scheduledAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")}`;

      await sendEmail({
        to: candidate.email,
        subject: "New Interview Scheduled - HireSphere",
        text: `Hi ${candidate.name},\n\nYou have a new interview scheduled for ${new Date(scheduledAt).toLocaleString()}.\n\nType: ${type}\n${meetingLink ? `Meeting Link: ${meetingLink}` : ""}\n${location ? `Location: ${location}` : ""}\n\nAdd to Calendar: ${gCalLink}\n\nGood luck!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #00FFFF;">Interview Scheduled!</h2>
            <p>Hi ${candidate.name},</p>
            <p>You have a new interview scheduled.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #00FFFF;">
              <p><strong>Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
              <p><strong>Type:</strong> ${type}</p>
              ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
            </div>
            <p style="margin-top: 20px;">
              <a href="${gCalLink}" style="background: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Add to Google Calendar</a>
            </p>
            <p>Good luck with your interview!</p>
            <p>Best regards,<br/>The HireSphere Team</p>
          </div>
        `
      }).catch(err => logger.error({ err }, "Email notification failed"));
    }

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
