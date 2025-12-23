import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getDashboardMetrics);

export default router;
