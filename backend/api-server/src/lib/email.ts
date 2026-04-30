import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "mock-user",
    pass: process.env.SMTP_PASS || "mock-pass",
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "mock-user") {
    logger.info({ to, subject }, "📧 [MOCK EMAIL] Content logged instead of sent");
    logger.info({ text }, "Email Text Content");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"HireSphere" <${process.env.SMTP_FROM || "noreply@hiresphere.com"}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info({ messageId: info.messageId }, "Email sent successfully");
    return info;
  } catch (error) {
    logger.error({ error }, "Failed to send email");
    throw error;
  }
}
