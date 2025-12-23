import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  deleteUser,
  getCurrentUser,
  getUsers,
  syncUser,
  updateUserRole,
} from "../controllers/userController";
import { requireAuth, requireRole } from "../middleware/auth";
import { requireSyncSecret } from "../middleware/syncAuth";

const router = Router();

router.get("/", getUsers);
router.post("/", requireSyncSecret, syncUser);
router.get("/me", requireAuth, getCurrentUser);
router.delete("/:userId", deleteUser);
router.patch(
  "/:userId/role",
  requireAuth,
  requireRole([UserRole.ADMIN]),
  updateUserRole
);

export default router;
