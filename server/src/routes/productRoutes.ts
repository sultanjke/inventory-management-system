import { Router } from "express";
import { UserRole } from "@prisma/client";
import { createProduct, getProducts } from "../controllers/productController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", getProducts);
router.post("/", requireAuth, requireRole([UserRole.ADMIN, UserRole.STAFF]), createProduct);

export default router;
