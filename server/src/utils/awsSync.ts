import http from "http";
import https from "https";
import { URL } from "url";
import { UserRole } from "@prisma/client";

type SyncDate = Date | string | null | undefined;

export type UserSyncPayload = {
  eventType: string;
  userId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  role?: UserRole | string;
  createdAt?: SyncDate;
  lastSignInAt?: SyncDate;
};

const toIsoString = (value: SyncDate) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
};

export const postUserSync = async (payload: UserSyncPayload): Promise<boolean> => {
  const url = process.env.AWS_USER_SYNC_URL;
  if (!url) {
    return false;
  }

  const secret = process.env.AWS_USER_SYNC_SECRET;
  const target = new URL(url);

  const userPayload: Record<string, unknown> = {
    userId: payload.userId,
  };

  if (payload.email !== undefined) userPayload.email = payload.email;
  if (payload.firstName !== undefined) userPayload.firstName = payload.firstName;
  if (payload.lastName !== undefined) userPayload.lastName = payload.lastName;
  if (payload.name !== undefined) userPayload.name = payload.name;
  if (payload.imageUrl !== undefined) userPayload.imageUrl = payload.imageUrl;
  if (payload.role !== undefined) userPayload.role = payload.role;

  const createdAt = toIsoString(payload.createdAt);
  if (createdAt !== undefined) userPayload.createdAt = createdAt;

  const lastSignInAt = toIsoString(payload.lastSignInAt);
  if (lastSignInAt !== undefined) userPayload.lastSignInAt = lastSignInAt;

  const body = JSON.stringify({ eventType: payload.eventType, user: userPayload });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body).toString(),
  };

  if (secret) {
    headers["x-sync-secret"] = secret;
  }

  const requestOptions = {
    method: "POST",
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path: `${target.pathname}${target.search}`,
    headers,
  };

  const client = target.protocol === "https:" ? https : http;

  try {
    await new Promise<void>((resolve, reject) => {
      const req = client.request(requestOptions, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const status = res.statusCode || 0;
          if (status >= 200 && status < 300) {
            resolve();
            return;
          }
          const responseText = Buffer.concat(chunks).toString();
          reject(new Error(`AWS sync failed with status ${status}: ${responseText}`));
        });
      });

      req.on("error", reject);
      req.setTimeout(10000, () => {
        req.destroy(new Error("AWS sync timed out"));
      });
      req.write(body);
      req.end();
    });

    return true;
  } catch (error) {
    console.error("AWS user sync failed:", error);
    return false;
  }
};
