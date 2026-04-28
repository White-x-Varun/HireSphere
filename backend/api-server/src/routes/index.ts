import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import resumesRouter from "./resumes";
import atsRouter from "./ats";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";
import communicationRouter from "./communication";
import interviewsRouter from "./interviews";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(resumesRouter);
router.use(atsRouter);
router.use(dashboardRouter);
router.use(aiRouter);
router.use(communicationRouter);
router.use(interviewsRouter);
router.use(adminRouter);

export default router;
