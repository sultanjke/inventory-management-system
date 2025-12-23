import { Router } from "express";
import { UserRole } from "@prisma/client";
import { getCurrentUser, getUsers, syncUser, updateUserRole } from "../controllers/userController";
import { requireAuth, requireRole } from "../middleware/auth";
import { requireSyncSecret } from "../middleware/syncAuth";

const router = Router();

router.get("/", requireAuth, requireRole([UserRole.ADMIN]), getUsers);
router.post("/", requireSyncSecret, syncUser);
router.get("/me", requireAuth, getCurrentUser);
router.patch(
  "/:userId/role",
  requireAuth,
  requireRole([UserRole.ADMIN]),
  updateUserRole
);

export default router;
