import cron from "node-cron";
import { Interview, User } from "@workspace/db";
import { sendEmail } from "./email";
import { logger } from "./logger";

export function initCron() {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    logger.info("Running interview reminder cron job...");
    
    try {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const upcomingInterviews = await Interview.find({
        scheduledAt: { $gte: now, $lte: twoHoursLater },
        reminderSent: false,
        status: "scheduled"
      }).populate("candidateId", "name email");

      for (const interview of upcomingInterviews) {
        const candidate = interview.candidateId as any;
        if (candidate && candidate.email) {
          await sendEmail({
            to: candidate.email,
            subject: "Reminder: Upcoming Interview in 1 Hour - HireSphere",
            text: `Hi ${candidate.name},\n\nThis is a reminder that you have an interview scheduled for ${new Date(interview.scheduledAt).toLocaleString()}.\n\nGood luck!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #00FFFF;">Interview Reminder</h2>
                <p>Hi ${candidate.name},</p>
                <p>Your interview is starting soon.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
                  <p><strong>Time:</strong> ${new Date(interview.scheduledAt).toLocaleString()}</p>
                  <p><strong>Type:</strong> ${interview.type}</p>
                  ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ""}
                </div>
                <p>Good luck!</p>
              </div>
            `
          });

          interview.reminderSent = true;
          await interview.save();
          logger.info({ interviewId: interview.id }, "Reminder sent for interview");
        }
      }
    } catch (error) {
      logger.error({ error }, "Error in interview reminder cron job");
    }
  });
}
