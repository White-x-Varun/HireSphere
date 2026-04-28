import { Router } from "express";
import { Message, Notification } from "@workspace/db"; // Check if this works
import { sendNotification, sendMessage } from "../lib/socket";
import { logger } from "../lib/logger";

const router = Router();

// --- Messages ---
router.post("/messages", async (req, res) => {
  try {
    const { senderId, receiverId, content, jobId } = req.body;
    const message = await Message.create({ senderId, receiverId, content, jobId });
    
    // Send via socket
    sendMessage(receiverId, message);
    
    res.status(201).json(message);
  } catch (error) {
    logger.error({ error }, "Send Message Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/messages/:userId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.params.userId },
        { receiverId: req.params.userId }
      ]
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    logger.error({ error }, "Get Messages Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Notifications ---
router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    logger.error({ error }, "Get Notifications Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (error) {
    logger.error({ error }, "Mark Notification Read Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
