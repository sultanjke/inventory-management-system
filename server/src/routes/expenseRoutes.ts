import { Router } from "express";
import { UserRole } from "@prisma/client";
import { getExpensesByCategory } from "../controllers/expenseController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  getExpensesByCategory
);

export default router;
