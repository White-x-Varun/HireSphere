import { Router, type IRouter } from "express";
import { User, Job, Application, Resume, AtsScore } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

// Get all users with their stats
router.get("/admin/users", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    // Get stats for each user (jobs posted if recruiter, applications if seeker)
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        let stats: any = { type: u.role };
        if (u.role === "recruiter") {
          stats.jobsPosted = await Job.countDocuments({ recruiterId: u._id });
        } else if (u.role === "job_seeker") {
          stats.applications = await Application.countDocuments({ userId: u._id });
          stats.resumes = await Resume.countDocuments({ userId: u._id });
        }
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          ...stats
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user
router.delete("/admin/users/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting yourself
    if (userId === req.user!.id) {
      res.status(400).json({ error: "Cannot delete your own account" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Cleanup based on role
    if (user.role === "job_seeker") {
      await Application.deleteMany({ userId });
      const resumes = await Resume.find({ userId });
      const resumeIds = resumes.map(r => r._id);
      await AtsScore.deleteMany({ resumeId: { $in: resumeIds } });
      await Resume.deleteMany({ userId });
    } else if (user.role === "recruiter") {
      const jobs = await Job.find({ recruiterId: userId });
      const jobIds = jobs.map(j => j._id);
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ recruiterId: userId });
    }

    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
