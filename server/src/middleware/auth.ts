import { NextFunction, Request, Response } from "express";
import { verifyToken, createClerkClient } from "@clerk/backend";
import { PrismaClient, UserRole } from "@prisma/client";
import { getDefaultRole, mapClerkUser } from "../utils/clerkUser";

const prisma = new PrismaClient();
const getClerkClient = () =>
  createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Missing Authorization token" });
    return;
  }

  try {
    if (!process.env.CLERK_SECRET_KEY) {
      res.status(500).json({ error: "Missing CLERK_SECRET_KEY" });
      return;
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;
    if (!userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    let user = await prisma.users.findUnique({ where: { userId } });

    if (!user) {
      const clerkClient = getClerkClient();
      const clerkUser = await clerkClient.users.getUser(userId);
      const mapped = mapClerkUser(clerkUser);
      if (!mapped.email) {
        res.status(403).json({ error: "User record missing email" });
        return;
      }

      const existingByEmail = await prisma.users.findUnique({
        where: { email: mapped.email },
      });

      if (existingByEmail) {
        const shouldPromoteAdmin =
          getDefaultRole(userId) === UserRole.ADMIN &&
          existingByEmail.role !== UserRole.ADMIN;

        user = await prisma.users.update({
          where: { email: mapped.email },
          data: {
            userId,
            email: mapped.email,
            firstName: mapped.firstName,
            lastName: mapped.lastName,
            name: mapped.name,
            imageUrl: mapped.imageUrl,
            lastSignInAt: mapped.lastSignInAt,
            ...(shouldPromoteAdmin ? { role: UserRole.ADMIN } : {}),
          },
        });
      } else {
        user = await prisma.users.create({
          data: {
            userId,
            email: mapped.email,
            firstName: mapped.firstName,
            lastName: mapped.lastName,
            name: mapped.name,
            imageUrl: mapped.imageUrl,
            lastSignInAt: mapped.lastSignInAt,
            createdAt: mapped.createdAt,
            role: getDefaultRole(userId),
          },
        });
      }
    }

    const shouldPromoteAdmin =
      getDefaultRole(userId) === UserRole.ADMIN && user.role !== UserRole.ADMIN;
    if (shouldPromoteAdmin) {
      user = await prisma.users.update({
        where: { userId },
        data: { role: UserRole.ADMIN },
      });
    }

    req.auth = { userId, role: user.role };
    next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (allowed: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.role) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowed.includes(req.auth.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
};
