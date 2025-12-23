import { NextFunction, Request, Response } from "express";

export const requireSyncSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.AWS_USER_SYNC_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Missing AWS_USER_SYNC_SECRET" });
    return;
  }

  const header = req.header("x-sync-secret");
  if (!header || header !== secret) {
    res.status(401).json({ error: "Invalid sync secret" });
    return;
  }

  next();
};
