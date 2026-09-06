import { eq, desc, and, gte, lte, asc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./client";
import {
  user,
  chat,
  mediaFile,
  activityLog,
  auditLog,
  chatEvent,
} from "./schema";
import type {
  User,
  UserInsert,
  MediaFile,
  MediaFileInsert,
  ActivityLog,
  ActivityLogInsert,
  AuditLog,
  AuditLogInsert,
} from "./schema";

// ============================================================================
// User Queries
// ============================================================================

export async function getUserById(userId: string): Promise<User | undefined> {
  return db.query.user.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

export async function listUsers(limit = 50, offset = 0): Promise<User[]> {
  return db.query.user.findMany({
    where: (users, { isNull }) => isNull(users.deletedAt),
    orderBy: (users) => desc(users.createdAt),
    limit,
    offset,
  });
}

export async function createUser(data: UserInsert): Promise<User> {
  const newUser = {
    ...data,
    id: data.id || randomUUID(),
  };
  const result = await db.insert(user).values(newUser).returning();
  return result[0]!;
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<UserInsert, "id">>,
): Promise<User | undefined> {
  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();
  return result[0];
}

export async function deleteUser(userId: string): Promise<void> {
  await db
    .update(user)
    .set({ deletedAt: new Date() })
    .where(eq(user.id, userId));
}

export async function banUser(userId: string, reason: string): Promise<User | undefined> {
  const result = await db
    .update(user)
    .set({ status: "banned", updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();

  if (result[0]) {
    await logActivity(userId, "user.banned", "User account banned", { reason });
  }

  return result[0];
}

// ============================================================================
// Media File Queries
// ============================================================================

export async function createMediaFile(data: MediaFileInsert): Promise<MediaFile> {
  const newMedia = {
    ...data,
    id: data.id || randomUUID(),
  };
  const result = await db.insert(mediaFile).values(newMedia).returning();
  return result[0]!;
}

export async function getMediaById(mediaId: string): Promise<MediaFile | undefined> {
  return db.query.mediaFile.findFirst({
    where: (media, { eq }) => eq(media.id, mediaId),
  });
}

export async function listMediaByChat(chatId: string): Promise<MediaFile[]> {
  return db.query.mediaFile.findMany({
    where: (media, { eq, isNull }) =>
      and(eq(media.chatId, chatId), isNull(media.deletedAt)),
    orderBy: (media) => desc(media.createdAt),
  });
}

export async function listMediaByUser(userId: string): Promise<MediaFile[]> {
  return db.query.mediaFile.findMany({
    where: (media, { eq, isNull }) =>
      and(eq(media.userId, userId), isNull(media.deletedAt)),
    orderBy: (media) => desc(media.createdAt),
  });
}

export async function deleteMediaFile(mediaId: string): Promise<void> {
  await db
    .update(mediaFile)
    .set({ deletedAt: new Date() })
    .where(eq(mediaFile.id, mediaId));
}

// ============================================================================
// Activity Log Queries
// ============================================================================

export async function logActivity(
  userId: string,
  eventType: string,
  eventName: string,
  details?: Record<string, unknown>,
  options?: { ipAddress?: string; userAgent?: string },
): Promise<ActivityLog> {
  const log = {
    id: randomUUID(),
    userId,
    eventType,
    eventName,
    details: details || {},
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    status: "success" as const,
  };
  const result = await db.insert(activityLog).values(log).returning();
  return result[0]!;
}

export async function getActivityLogs(
  filters?: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  },
): Promise<ActivityLog[]> {
  const { userId, eventType, startDate, endDate, limit = 100, offset = 0 } = filters || {};

  const conditions = [];
  if (userId) conditions.push(eq(activityLog.userId, userId));
  if (eventType) conditions.push(eq(activityLog.eventType, eventType));
  if (startDate) conditions.push(gte(activityLog.createdAt, startDate));
  if (endDate) conditions.push(lte(activityLog.createdAt, endDate));

  return db.query.activityLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (logs) => desc(logs.createdAt),
    limit,
    offset,
  });
}

export async function getUserActivityLogs(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<ActivityLog[]> {
  return db.query.activityLog.findMany({
    where: (logs, { eq }) => eq(logs.userId, userId),
    orderBy: (logs) => desc(logs.createdAt),
    limit,
    offset,
  });
}

// ============================================================================
// Audit Log Queries
// ============================================================================

export async function logAudit(data: AuditLogInsert): Promise<AuditLog> {
  const log = {
    ...data,
    id: data.id || randomUUID(),
  };
  const result = await db.insert(auditLog).values(log).returning();
  return result[0]!;
}

export async function getAuditLogs(
  filters?: {
    adminId?: string;
    targetId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  },
): Promise<AuditLog[]> {
  const { adminId, targetId, action, startDate, endDate, limit = 100, offset = 0 } =
    filters || {};

  const conditions = [];
  if (adminId) conditions.push(eq(auditLog.adminId, adminId));
  if (targetId) conditions.push(eq(auditLog.targetId, targetId));
  if (action) conditions.push(eq(auditLog.action, action));
  if (startDate) conditions.push(gte(auditLog.createdAt, startDate));
  if (endDate) conditions.push(lte(auditLog.createdAt, endDate));

  return db.query.auditLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (logs) => desc(logs.createdAt),
    limit,
    offset,
  });
}
