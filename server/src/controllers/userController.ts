import { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { getDefaultRole } from "../utils/clerkUser";
import { postUserSync } from "../utils/awsSync";

const prisma = new PrismaClient();
const hasProp = (obj: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const normalizeString = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseDateValue = (value: unknown): Date | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { userId: req.auth.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user" });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role?: string };

    if (!userId || !role) {
      res.status(400).json({ error: "Missing userId or role" });
      return;
    }

    const normalizedRole = role.toUpperCase() as UserRole;
    if (!["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const updated = await prisma.users.update({
      where: { userId },
      data: { role: normalizedRole },
    });

    await postUserSync({
      eventType: "user.updated",
      userId: updated.userId,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      name: updated.name,
      imageUrl: updated.imageUrl,
      role: updated.role,
      lastSignInAt: updated.lastSignInAt,
      createdAt: updated.createdAt,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error updating user role" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }

    const result = await prisma.users.deleteMany({ where: { userId } });
    if (result.count === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ status: "deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
};

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const eventType = typeof body.eventType === "string" ? body.eventType : undefined;
    const payload =
      (body.user as Record<string, unknown> | undefined) ||
      (body.data as Record<string, unknown> | undefined) ||
      body;

    const userIdValue = payload.userId ?? payload.id;
    const userId = typeof userIdValue === "string" ? userIdValue : null;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }

    const normalizedEvent = (eventType || "").toLowerCase();
    const isDeleted =
      normalizedEvent === "user.deleted" ||
      normalizedEvent === "delete" ||
      normalizedEvent === "deleted" ||
      payload.deleted === true;
    if (isDeleted) {
      await prisma.users.deleteMany({ where: { userId } });
      res.json({ status: "deleted" });
      return;
    }

    const emailValue = hasProp(payload, "email") ? normalizeString(payload.email) : undefined;
    if (emailValue === null) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }

    const firstName = hasProp(payload, "firstName")
      ? normalizeString(payload.firstName)
      : undefined;
    const lastName = hasProp(payload, "lastName")
      ? normalizeString(payload.lastName)
      : undefined;
    const nameValue = hasProp(payload, "name") ? normalizeString(payload.name) : undefined;
    const derivedName =
      nameValue === undefined && (firstName !== undefined || lastName !== undefined)
        ? [firstName, lastName].filter(Boolean).join(" ") || null
        : nameValue;
    const imageUrl = hasProp(payload, "imageUrl")
      ? normalizeString(payload.imageUrl)
      : undefined;

    const roleValue = hasProp(payload, "role") ? payload.role : undefined;
    const normalizedRole =
      typeof roleValue === "string" ? (roleValue.toUpperCase() as UserRole) : undefined;
    if (normalizedRole && !["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const lastSignInAt = hasProp(payload, "lastSignInAt")
      ? parseDateValue(payload.lastSignInAt)
      : undefined;
    const createdAt = hasProp(payload, "createdAt")
      ? parseDateValue(payload.createdAt)
      : undefined;

    const existing = await prisma.users.findUnique({ where: { userId } });
    const updateData: Record<string, unknown> = {};

    if (emailValue !== undefined) updateData.email = emailValue;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (derivedName !== undefined) updateData.name = derivedName;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (normalizedRole !== undefined) updateData.role = normalizedRole;
    if (lastSignInAt !== undefined) updateData.lastSignInAt = lastSignInAt;

    if (existing) {
      if (Object.keys(updateData).length === 0) {
        res.json(existing);
        return;
      }
      const updated = await prisma.users.update({
        where: { userId },
        data: updateData,
      });
      res.json(updated);
      return;
    }

    if (!emailValue) {
      res.status(400).json({ error: "Email is required for new users" });
      return;
    }

    const created = await prisma.users.create({
      data: {
        userId,
        email: emailValue,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        name: derivedName ?? null,
        imageUrl: imageUrl ?? null,
        role: normalizedRole ?? getDefaultRole(userId),
        lastSignInAt: lastSignInAt ?? null,
        ...(createdAt instanceof Date ? { createdAt } : {}),
      },
    });

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: "Error syncing user" });
  }
};
