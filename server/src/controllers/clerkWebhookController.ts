import { Request, Response } from "express";
import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";
import { getDefaultRole, mapClerkUser } from "../utils/clerkUser";
import { postUserSync } from "../utils/awsSync";

const prisma = new PrismaClient();

export const handleClerkWebhook = async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Missing CLERK_WEBHOOK_SECRET" });
    return;
  }

  const svixId = req.header("svix-id");
  const svixTimestamp = req.header("svix-timestamp");
  const svixSignature = req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing Svix headers" });
    return;
  }

  const payload = req.body?.toString() || "";
  const wh = new Webhook(secret);

  let event: any;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  const eventType = event?.type;
  const data = event?.data;
  const userId = data?.id;

  if (!userId) {
    res.status(400).json({ error: "Missing user id" });
    return;
  }

  try {
    if (eventType === "user.deleted") {
      await prisma.users.deleteMany({ where: { userId } });
      await postUserSync({ eventType, userId });
      res.json({ status: "deleted" });
      return;
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const mapped = mapClerkUser(data);
      if (!mapped.email) {
        res.status(400).json({ error: "Missing email address" });
        return;
      }

      const upserted = await prisma.users.upsert({
        where: { userId },
        update: {
          email: mapped.email,
          firstName: mapped.firstName,
          lastName: mapped.lastName,
          name: mapped.name,
          imageUrl: mapped.imageUrl,
          lastSignInAt: mapped.lastSignInAt,
        },
        create: {
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

      await postUserSync({
        eventType,
        userId: upserted.userId,
        email: upserted.email,
        firstName: upserted.firstName,
        lastName: upserted.lastName,
        name: upserted.name,
        imageUrl: upserted.imageUrl,
        role: upserted.role,
        lastSignInAt: upserted.lastSignInAt,
        createdAt: upserted.createdAt,
      });

      res.json({ status: "ok" });
      return;
    }

    res.json({ status: "ignored" });
  } catch (error) {
    console.error("Failed to handle Clerk webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
