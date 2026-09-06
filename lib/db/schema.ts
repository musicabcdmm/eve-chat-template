import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ClientSessionState, MessageStreamEvent } from "eve/client";

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "banned"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "document"]);
export const eventStatusEnum = pgEnum("event_status", ["success", "failure"]);

// ============================================================================
// Core Auth Tables (Better Auth)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  bio: text("bio"),
  role: userRoleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("active"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// Chat & Messages
// ============================================================================

export const chat = pgTable(
  "chat",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New chat"),
    eveSession: jsonb("eve_session").$type<ClientSessionState | null>(),
    pendingUserMessage: text("pending_user_message"),
    pendingUserMessageCreatedAt: timestamp("pending_user_message_created_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_chat_user_updated").on(table.userId, table.updatedAt),
    index("idx_chat_user_created").on(table.userId, table.createdAt),
  ],
);

export const chatEvent = pgTable(
  "chat_event",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    eventIndex: integer("event_index").notNull(),
    event: jsonb("event").$type<MessageStreamEvent>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_chat_event_chat").on(table.chatId),
    uniqueIndex("idx_chat_event_chat_index").on(table.chatId, table.eventIndex),
  ],
);

// ============================================================================
// Media Files
// ============================================================================

export const mediaFile = pgTable(
  "media_file",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fileType: mediaTypeEnum("file_type").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    metadata: jsonb("metadata").$type<{
      width?: number;
      height?: number;
      duration?: number;
      [key: string]: unknown;
    }>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_media_chat").on(table.chatId),
    index("idx_media_user").on(table.userId),
    index("idx_media_created").on(table.createdAt),
  ],
);

// ============================================================================
// Activity Logs
// ============================================================================

export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    eventName: text("event_name").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    status: eventStatusEnum("status").notNull().default("success"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_activity_user").on(table.userId),
    index("idx_activity_type").on(table.eventType),
    index("idx_activity_created").on(table.createdAt),
  ],
);

// ============================================================================
// Audit Logs (Admin Actions)
// ============================================================================

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    targetId: text("target_id"),
    targetType: text("target_type"),
    changes: jsonb("changes").$type<Record<string, { before?: unknown; after?: unknown }>>(),
    reason: text("reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_admin").on(table.adminId),
    index("idx_audit_target").on(table.targetId),
    index("idx_audit_created").on(table.createdAt),
  ],
);

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof user.$inferSelect;
export type Chat = typeof chat.$inferSelect;
export type ChatEvent = typeof chatEvent.$inferSelect;
export type MediaFile = typeof mediaFile.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;

export type UserInsert = typeof user.$inferInsert;
export type MediaFileInsert = typeof mediaFile.$inferInsert;
export type ActivityLogInsert = typeof activityLog.$inferInsert;
export type AuditLogInsert = typeof auditLog.$inferInsert;
